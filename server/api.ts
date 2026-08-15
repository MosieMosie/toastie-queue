/**
 * The JSON API. Reads and writes go through db.ts; every change is published
 * on the SSE stream (events.ts) so the other screens follow along. Mounted as
 * Vite middleware in dev (vite.config.ts) and by server/index.ts in production.
 */
import type {IncomingMessage, ServerResponse} from "node:http";

import {
  clampGrill,
  DEFAULT_GRILL_SECONDS,
  NAME_MAX,
  type Person,
  removePersonFromState,
  renamePersonInState,
  sanitizeState,
} from "../shared/state.ts";

import * as db from "./db.ts";
import {publish, subscribe} from "./events.ts";

const COLOR_RE = /^#[0-9a-f]{6}$/iu;

type PersonError = "invalid-name" | "invalid-color" | "duplicate";

/**
 * Every field is optional in a request: on a PATCH whatever is missing stays as
 * it was, on a POST it falls back to a blank person that validate() rejects.
 */
function personFrom(body: Record<string, unknown>, current?: Person): Person {
  return {
    name:
      typeof body.name === "string" ? body.name.trim() : (current?.name ?? ""),
    color: typeof body.color === "string" ? body.color : (current?.color ?? ""),
    grillSeconds:
      (
        typeof body.grillSeconds === "number" &&
        Number.isFinite(body.grillSeconds)
      ) ?
        clampGrill(body.grillSeconds)
      : (current?.grillSeconds ?? DEFAULT_GRILL_SECONDS),
  };
}

function validate(person: Person, replacing?: string): PersonError | null {
  if (!person.name || person.name.length > NAME_MAX) {
    return "invalid-name";
  }

  if (!COLOR_RE.test(person.color)) {
    return "invalid-color";
  }

  const taken = db
    .listPeople()
    .some(
      (p) =>
        p.name !== replacing &&
        p.name.toLowerCase() === person.name.toLowerCase(),
    );

  return taken ? "duplicate" : null;
}

function json(res: ServerResponse, status: number, body: unknown) {
  res.writeHead(status, {
    "content-type": "application/json",
    "cache-control": "no-store",
  });
  res.end(JSON.stringify(body));
}

const ok = (res: ServerResponse) => json(res, 200, {ok: true});

const fail = (res: ServerResponse, error: PersonError | "invalid-state") =>
  json(res, error === "duplicate" ? 409 : 400, {error});

async function readBody(
  req: IncomingMessage,
): Promise<Record<string, unknown>> {
  let raw = "";
  for await (const chunk of req) {
    raw += chunk;
    if (raw.length > 256 * 1024) {
      throw new Error("body too large");
    }
  }
  return JSON.parse(raw) as Record<string, unknown>;
}

interface Request {
  req: IncomingMessage;
  res: ServerResponse;
  url: URL;
  /** the `:name` segment, already decoded; empty for routes without one */
  param: string;
}

type Handler = (request: Request) => Promise<void> | void;

const getSync: Handler = ({res}) =>
  json(res, 200, {people: db.listPeople(), state: db.loadState()});

const getEvents: Handler = ({req, res, url}) => {
  const unsubscribe = subscribe(url.searchParams.get("client") ?? "", res);
  req.on("close", unsubscribe);
};

const putState: Handler = async ({req, res}) => {
  const state = sanitizeState(await readBody(req));
  if (!state) {
    return fail(res, "invalid-state");
  }

  db.saveState(state);
  // the sender already has this state applied locally
  publish("state", state, req.headers["x-client-id"] as string | undefined);
  ok(res);
};

const postPerson: Handler = async ({req, res}) => {
  const person = personFrom(await readBody(req));
  const invalid = validate(person);
  if (invalid) {
    return fail(res, invalid);
  }

  db.insertPerson(person);
  publish("people", db.listPeople());
  ok(res);
};

const patchPerson: Handler = async ({req, res, param}) => {
  const current = db.findPerson(param);
  if (!current) {
    return json(res, 404, {error: "not-found"});
  }

  const person = personFrom(await readBody(req), current);
  const invalid = validate(person, param);
  if (invalid) {
    return fail(res, invalid);
  }

  db.updatePerson(param, person);
  if (person.name !== param) {
    // active toasties, the eaten tally and grill stats are keyed by name
    const state = db.loadState();
    renamePersonInState(state, param, person.name);
    db.saveState(state);
    publish("state", state);
  }

  publish("people", db.listPeople());
  ok(res);
};

const deletePerson: Handler = ({res, param}) => {
  db.deletePerson(param);

  const state = db.loadState();
  removePersonFromState(state, param);
  db.saveState(state);
  publish("state", state);

  publish("people", db.listPeople());
  ok(res);
};

const ROUTES: [method: string, path: string, handle: Handler][] = [
  ["GET", "/api/sync", getSync],
  ["GET", "/api/events", getEvents],
  ["PUT", "/api/state", putState],
  ["POST", "/api/people", postPerson],
  ["PATCH", "/api/people/:name", patchPerson],
  ["DELETE", "/api/people/:name", deletePerson],
];

/**
 * Matches one route path against a request path: returns the decoded `:name`
 * segment, "" for a path without one, or null when it is not this route.
 */
function paramOf(path: string, pathname: string): string | null {
  const [base, param] = path.split("/:");
  if (param === undefined) {
    return path === pathname ? "" : null;
  }
  const prefix = `${base}/`;
  if (!pathname.startsWith(prefix)) {
    return null;
  }
  return decodeURIComponent(pathname.slice(prefix.length)) || null;
}

/** returns false for anything that is not an API request, so the caller serves it */
export function handleApi(req: IncomingMessage, res: ServerResponse): boolean {
  if (!req.url?.startsWith("/api/")) {
    return false;
  }

  const url = new URL(req.url, "http://local");
  for (const [method, path, handle] of ROUTES) {
    const param = method === req.method ? paramOf(path, url.pathname) : null;
    if (param !== null) {
      Promise.resolve(handle({req, res, url, param})).catch(() => {
        if (!res.headersSent) {
          json(res, 400, {error: "bad-request"});
        } else {
          res.end();
        }
      });
      return true;
    }
  }

  json(res, 404, {error: "not-found"});
  return true;
}
