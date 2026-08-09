/**
 * The queue every screen shares. Actions mutate the local store first so that
 * dragging stays instant, then push the whole state to the server, which
 * broadcasts it over SSE to the other screens. Our own clientId travels with
 * the request so the server can leave us out of that broadcast.
 */
import {createSignal} from "solid-js";
import {createStore, produce, reconcile} from "solid-js/store";

import {clampSlots, emptyState, sanitizeState, State} from "../../shared/state";

import {Person, setPeople, Tosti} from "./tosti";

export type DragRef =
  | {from: "roster"; person: string}
  | {from: "queue"; id: string}
  | {from: "iron"; slot: number};

export type DropTarget =
  | {kind: "iron"; slot: number}
  | {kind: "queue"; index: number}
  | {kind: "plate"};

const sanitize = (value: unknown): State =>
  sanitizeState(value) ?? emptyState();

export const [state, setState] = createStore<State>(emptyState());

// not crypto.randomUUID: that needs a secure context, and the kiosk is on http://<ip>
const clientId = Math.random().toString(36).slice(2) + Date.now().toString(36);

function save() {
  fetch("/api/state", {
    method: "PUT",
    headers: {"content-type": "application/json", "x-client-id": clientId},
    body: JSON.stringify(state),
  }).catch(() => {
    // offline: the next action resends the full state anyway
  });
}

async function syncFromServer() {
  try {
    const res = await fetch("/api/sync");
    const data = (await res.json()) as {people: Person[]; state: unknown};
    setPeople(data.people);
    setState(reconcile(sanitize(data.state)));
  } catch {
    // server unreachable; the EventSource keeps retrying
  }
}

const events = new EventSource(`/api/events?client=${clientId}`);
// on every (re)connect: a dropped connection may have missed updates
events.onopen = () => {
  syncFromServer();
};
events.addEventListener("state", (e) => {
  setState(reconcile(sanitize(JSON.parse(e.data))));
});
events.addEventListener("people", (e) => {
  setPeople(JSON.parse(e.data) as Person[]);
});

const PERSON_ERRORS = [
  "invalid-name",
  "invalid-color",
  "duplicate",
  "not-found",
  "save-failed",
  "offline",
] as const;
export type PersonError = (typeof PERSON_ERRORS)[number];

async function personRequest(
  url: string,
  method: string,
  body: unknown,
): Promise<PersonError | null> {
  try {
    const res = await fetch(url, {
      method,
      headers: {"content-type": "application/json"},
      body: JSON.stringify(body),
    });
    if (res.ok) {
      return null;
    }
    const {error} = (await res.json()) as {error?: string};
    return PERSON_ERRORS.find((code) => code === error) ?? "save-failed";
  } catch {
    return "offline";
  }
}

export const addPerson = (name: string, color: string, grillSeconds: number) =>
  personRequest("/api/people", "POST", {name, color, grillSeconds});

/** the server carries the person's tostis and eaten tally over */
export function renamePerson(oldName: string, name: string, color: string) {
  // an unsaved slider change still belongs to the old name
  flushGrill(oldName);
  return personRequest(`/api/people/${encodeURIComponent(oldName)}`, "PATCH", {
    name,
    color,
  });
}

// the slider fires on every step of a drag; save once the thumb settles
const GRILL_SAVE_DELAY = 250;
const pendingGrill = new Map<
  string,
  {timer: ReturnType<typeof setTimeout>; grillSeconds: number}
>();

function flushGrill(name: string) {
  const pending = pendingGrill.get(name);
  if (!pending) {
    return;
  }
  clearTimeout(pending.timer);
  pendingGrill.delete(name);
  personRequest(`/api/people/${encodeURIComponent(name)}`, "PATCH", {
    grillSeconds: pending.grillSeconds,
  });
}

export function setPersonGrill(name: string, grillSeconds: number) {
  setPeople((all) =>
    all.map((p) => (p.name === name ? {...p, grillSeconds} : p)),
  );
  clearTimeout(pendingGrill.get(name)?.timer);
  pendingGrill.set(name, {
    grillSeconds,
    timer: setTimeout(() => flushGrill(name), GRILL_SAVE_DELAY),
  });
}

export async function removePerson(name: string) {
  try {
    await fetch(`/api/people/${encodeURIComponent(name)}`, {method: "DELETE"});
  } catch {
    // server unreachable; the list simply stays as it is
  }
}

/** one shared clock, so every timer on screen ticks in step */
const [now, setNow] = createSignal(Date.now());
setInterval(() => setNow(Date.now()), 1000);
export {now};

let seq = 0;
const newId = () => `t${Date.now().toString(36)}-${(seq++).toString(36)}`;

export const freeSlot = () => state.iron.findIndex((t) => t === null);
export const ironCount = () => state.iron.filter(Boolean).length;
export const ironSlots = () => state.iron.length;

const requeued = (t: Tosti): Tosti => ({...t, placedAt: null});

export function setIronSlots(n: number) {
  const count = clampSlots(n);
  if (count === state.iron.length) {
    return 0;
  }
  const grilling = state.iron.filter((t): t is Tosti => t !== null);
  const overflow = grilling.slice(count);
  setState(
    produce((s) => {
      s.iron = Array.from({length: count}, (_slot, i) => grilling[i] ?? null);
      s.queue.unshift(...overflow.map(requeued));
    }),
  );
  save();
  return overflow.length;
}
export const tostiCount = (person: string) =>
  state.iron.filter((t) => t?.person === person).length +
  state.queue.filter((t) => t.person === person).length;

const queueIndexOf = (id: string) => state.queue.findIndex((t) => t.id === id);

export function canDrop(ref: DragRef, target: DropTarget): boolean {
  switch (target.kind) {
    case "iron": {
      if (ref.from === "iron") {
        return ref.slot !== target.slot;
      }
      // an occupied slot swaps with the queue, but a fresh tosti needs room
      if (ref.from === "roster") {
        return state.iron[target.slot] === null;
      }
      return true;
    }
    case "queue":
      return true;
    case "plate":
      return ref.from !== "roster";
  }
}

/** each returns false when the tosti moved away underneath us mid-drag */
function dropOnIron(ref: DragRef, slot: number): boolean {
  if (ref.from === "iron") {
    setState(
      produce((s) => {
        const moving = s.iron[ref.slot];
        s.iron[ref.slot] = s.iron[slot];
        s.iron[slot] = moving;
      }),
    );
    return true;
  }

  if (ref.from === "queue") {
    const i = queueIndexOf(ref.id);
    if (i < 0) {
      return false;
    }
    setState(
      produce((s) => {
        const moving = s.queue[i];
        const occupant = s.iron[slot];
        if (occupant) {
          s.queue[i] = requeued(occupant);
        } else {
          s.queue.splice(i, 1);
        }
        s.iron[slot] = {...moving, placedAt: Date.now()};
      }),
    );
    return true;
  }

  // whatever is left comes from the roster: a brand new tosti
  setState(
    produce((s) => {
      s.iron[slot] = {id: newId(), person: ref.person, placedAt: Date.now()};
    }),
  );
  return true;
}

function dropInQueue(ref: DragRef, at: number): boolean {
  const index = Math.min(at, state.queue.length);

  if (ref.from === "queue") {
    const i = queueIndexOf(ref.id);
    if (i < 0) {
      return false;
    }
    setState(
      produce((s) => {
        const [moving] = s.queue.splice(i, 1);
        s.queue.splice(i < index ? index - 1 : index, 0, moving);
      }),
    );
    return true;
  }

  if (ref.from === "iron") {
    const moving = state.iron[ref.slot];
    if (!moving) {
      return false;
    }
    setState(
      produce((s) => {
        s.iron[ref.slot] = null;
        s.queue.splice(index, 0, requeued(moving));
      }),
    );
    return true;
  }

  setState(
    produce((s) => {
      s.queue.splice(index, 0, {
        id: newId(),
        person: ref.person,
        placedAt: null,
      });
    }),
  );
  return true;
}

/** a roster drag never reaches the plate: there is nothing to eat yet */
function dropOnPlate(ref: Exclude<DragRef, {from: "roster"}>): boolean {
  const i = ref.from === "queue" ? queueIndexOf(ref.id) : -1;
  const moving = ref.from === "iron" ? state.iron[ref.slot] : state.queue[i];
  if (!moving) {
    return false;
  }

  const {person} = moving;
  setState(
    produce((s) => {
      if (ref.from === "iron") {
        s.iron[ref.slot] = null;
      } else {
        s.queue.splice(i, 1);
      }
      s.served += 1;
      s.eaten[person] = (s.eaten[person] ?? 0) + 1;
    }),
  );
  return true;
}

export function drop(ref: DragRef, target: DropTarget) {
  if (!canDrop(ref, target)) {
    return false;
  }

  const moved =
    target.kind === "iron" ? dropOnIron(ref, target.slot)
    : target.kind === "queue" ? dropInQueue(ref, target.index)
    : ref.from !== "roster" && dropOnPlate(ref);

  if (!moved) {
    return false;
  }
  save();
  return true;
}

export function cancel(ref: DragRef) {
  if (ref.from === "iron") {
    setState(
      produce((s) => {
        s.iron[ref.slot] = null;
      }),
    );
  } else if (ref.from === "queue") {
    const i = queueIndexOf(ref.id);
    if (i < 0) {
      return;
    }
    setState(
      produce((s) => {
        s.queue.splice(i, 1);
      }),
    );
  }
  save();
}

export function fillIron() {
  let moved = 0;
  setState(
    produce((s) => {
      for (let slot = 0; slot < s.iron.length; slot++) {
        if (!s.iron[slot] && s.queue.length > 0) {
          const next = s.queue.shift()!;
          s.iron[slot] = {...next, placedAt: Date.now()};
          moved++;
        }
      }
    }),
  );
  save();
  return moved;
}

export function clearAll() {
  setState(
    produce((s) => {
      s.iron = s.iron.map(() => null);
      s.queue = [];
    }),
  );
  save();
}
