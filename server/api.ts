/**
 * The whole backend: SQLite (built into Node, zero dependencies) holding the
 * people and the iron/queue state, a few JSON endpoints, and an SSE stream so
 * every open screen stays in sync. Mounted as Vite middleware in dev
 * (vite.config.ts) and used by server/index.ts in production.
 */
import {mkdirSync} from "node:fs";
import type {IncomingMessage, ServerResponse} from "node:http";
import path from "node:path";
import {DatabaseSync} from "node:sqlite";

import {
  emptyState,
  NAME_MAX,
  type Person,
  renamePersonInState,
  sanitizeState,
  type State,
} from "../shared/state.ts";

const STATE_KEY = "state-v1";
const COLOR_RE = /^#[0-9a-f]{6}$/iu;

const dataDir = process.env.TOSTI_DATA_DIR ?? path.join(process.cwd(), "data");
mkdirSync(dataDir, {recursive: true});

const db = new DatabaseSync(path.join(dataDir, "tosti.db"));
db.exec(`
  CREATE TABLE IF NOT EXISTS people (
    name  TEXT PRIMARY KEY,
    color TEXT NOT NULL,
    pos   INTEGER NOT NULL
  ) STRICT;
  CREATE TABLE IF NOT EXISTS kv (
    key   TEXT PRIMARY KEY,
    value TEXT NOT NULL
  ) STRICT;
`);

const stmt = {
  listPeople: db.prepare("SELECT name, color FROM people ORDER BY pos"),
  getState: db.prepare("SELECT value FROM kv WHERE key = ?"),
  saveState: db.prepare(
    "INSERT INTO kv (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value",
  ),
  maxPos: db.prepare("SELECT COALESCE(MAX(pos), -1) AS m FROM people"),
  insertPerson: db.prepare(
    "INSERT INTO people (name, color, pos) VALUES (?, ?, ?)",
  ),
  updatePerson: db.prepare(
    "UPDATE people SET name = ?, color = ? WHERE name = ?",
  ),
  deletePerson: db.prepare("DELETE FROM people WHERE name = ?"),
};

const listPeople = (): Person[] => stmt.listPeople.all() as unknown as Person[];

function loadState(): State {
  const row = stmt.getState.get(STATE_KEY) as {value: string} | undefined;
  if (!row) {
    return emptyState();
  }
  try {
    return sanitizeState(JSON.parse(row.value)) ?? emptyState();
  } catch {
    return emptyState();
  }
}

function validatePerson(
  name: string,
  color: string,
  everyone: Person[],
  excludeName?: string,
): "invalid-name" | "invalid-color" | "duplicate" | null {
  if (!name || name.length > NAME_MAX) {
    return "invalid-name";
  }
  if (!COLOR_RE.test(color)) {
    return "invalid-color";
  }
  const taken = everyone.some(
    (p) =>
      p.name !== excludeName && p.name.toLowerCase() === name.toLowerCase(),
  );
  return taken ? "duplicate" : null;
}

interface Client {
  id: string;
  res: ServerResponse;
}
const clients = new Set<Client>();

function broadcast(event: string, data: string, exceptClientId?: string) {
  const frame = `event: ${event}\ndata: ${data}\n\n`;
  for (const c of clients) {
    if (c.id !== exceptClientId) {
      c.res.write(frame);
    }
  }
}

// keep idle SSE connections from being closed by proxies/browsers
setInterval(() => {
  for (const c of clients) {
    c.res.write(": ping\n\n");
  }
}, 25_000).unref();

function json(res: ServerResponse, status: number, body: unknown) {
  res.writeHead(status, {
    "content-type": "application/json",
    "cache-control": "no-store",
  });
  res.end(JSON.stringify(body));
}

async function readBody(req: IncomingMessage): Promise<unknown> {
  let raw = "";
  for await (const chunk of req) {
    raw += chunk;
    if (raw.length > 256 * 1024) {
      throw new Error("body too large");
    }
  }
  return JSON.parse(raw);
}

async function route(req: IncomingMessage, res: ServerResponse, url: URL) {
  if (req.method === "GET" && url.pathname === "/api/sync") {
    return json(res, 200, {people: listPeople(), state: loadState()});
  }

  if (req.method === "GET" && url.pathname === "/api/events") {
    const client: Client = {id: url.searchParams.get("client") ?? "", res};
    res.writeHead(200, {
      "content-type": "text/event-stream",
      "cache-control": "no-store",
      "connection": "keep-alive",
    });
    res.write(": hi\n\n");
    clients.add(client);
    req.on("close", () => clients.delete(client));
    return;
  }

  if (req.method === "PUT" && url.pathname === "/api/state") {
    const state = sanitizeState(await readBody(req));
    if (!state) {
      return json(res, 400, {error: "invalid-state"});
    }
    const payload = JSON.stringify(state);
    stmt.saveState.run(STATE_KEY, payload);
    // the sender already has this state applied locally
    broadcast(
      "state",
      payload,
      req.headers["x-client-id"] as string | undefined,
    );
    return json(res, 200, {ok: true});
  }

  if (req.method === "POST" && url.pathname === "/api/people") {
    const body = (await readBody(req)) as Record<string, unknown>;
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const color = typeof body.color === "string" ? body.color : "";
    const invalid = validatePerson(name, color, listPeople());
    if (invalid) {
      return json(res, invalid === "duplicate" ? 409 : 400, {error: invalid});
    }
    const maxPos = (stmt.maxPos.get() as {m: number}).m;
    stmt.insertPerson.run(name, color, maxPos + 1);
    broadcast("people", JSON.stringify(listPeople()));
    return json(res, 200, {ok: true});
  }

  if (req.method === "PATCH" && url.pathname.startsWith("/api/people/")) {
    const oldName = decodeURIComponent(
      url.pathname.slice("/api/people/".length),
    );
    const everyone = listPeople();
    const person = everyone.find((p) => p.name === oldName);
    if (!person) {
      return json(res, 404, {error: "not-found"});
    }
    const body = (await readBody(req)) as Record<string, unknown>;
    const name = typeof body.name === "string" ? body.name.trim() : person.name;
    const color = typeof body.color === "string" ? body.color : person.color;
    const invalid = validatePerson(name, color, everyone, oldName);
    if (invalid) {
      return json(res, invalid === "duplicate" ? 409 : 400, {error: invalid});
    }
    stmt.updatePerson.run(name, color, oldName);
    if (name !== oldName) {
      const state = loadState();
      renamePersonInState(state, oldName, name);
      const payload = JSON.stringify(state);
      stmt.saveState.run(STATE_KEY, payload);
      broadcast("state", payload);
    }
    broadcast("people", JSON.stringify(listPeople()));
    return json(res, 200, {ok: true});
  }

  if (req.method === "DELETE" && url.pathname.startsWith("/api/people/")) {
    const name = decodeURIComponent(url.pathname.slice("/api/people/".length));
    stmt.deletePerson.run(name);
    broadcast("people", JSON.stringify(listPeople()));
    return json(res, 200, {ok: true});
  }

  json(res, 404, {error: "not-found"});
}

export function handleApi(req: IncomingMessage, res: ServerResponse): boolean {
  if (!req.url?.startsWith("/api/")) {
    return false;
  }
  route(req, res, new URL(req.url, "http://local")).catch(() => {
    if (!res.headersSent) {
      json(res, 400, {error: "bad-request"});
    } else {
      res.end();
    }
  });
  return true;
}
