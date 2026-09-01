/**
 * The queue every screen shares. Actions mutate the local store first so that
 * dragging stays instant, then push the whole state to the server, which
 * stamps a revision and broadcasts it over SSE to every screen, sender
 * included. Revisions order the writes: anything at or below what a screen
 * already holds is old news, so concurrent writers all converge on whichever
 * write the server accepted last.
 */
import {createSignal} from "solid-js";
import {createStore, produce, reconcile} from "solid-js/store";

import {
  BURNT_FACTOR,
  clampSlots,
  emptyState,
  sanitizeState,
  State,
} from "../../shared/state";

import {grillSecondsOf, Person, setPeople, Toastie} from "./toastie";

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

let lastRev = 0;
// While our own save is in flight, the local state is the newest intent there
// is: applying a remote update over it would flash the previous state onto the
// screen. Updates wait, and the newest one lands once the saves settle — by
// then our own revision is usually the higher one and it simply drops.
let pendingSaves = 0;
let deferred: {rev: number; state: unknown} | null = null;

function applyRemote(rev: number, value: unknown) {
  if (rev <= lastRev) {
    return;
  }
  if (pendingSaves > 0) {
    if (!deferred || rev > deferred.rev) {
      deferred = {rev, state: value};
    }
    return;
  }
  lastRev = rev;
  setState(reconcile(sanitize(value)));
}

function save() {
  pendingSaves++;
  fetch("/api/state", {
    method: "PUT",
    headers: {"content-type": "application/json"},
    body: JSON.stringify(state),
  })
    .then(async (res) => {
      const {rev} = (await res.json()) as {rev?: number};
      // our own echo comes back over SSE with this same revision and drops
      if (typeof rev === "number" && rev > lastRev) {
        lastRev = rev;
      }
    })
    .catch(() => {
      // offline: the next action resends the full state anyway
    })
    .finally(() => {
      pendingSaves--;
      if (pendingSaves === 0 && deferred) {
        const next = deferred;
        deferred = null;
        applyRemote(next.rev, next.state);
      }
    });
}

async function syncFromServer() {
  try {
    const res = await fetch("/api/sync");
    const data = (await res.json()) as {
      people: Person[];
      state: unknown;
      rev: number;
    };
    setPeople(data.people);
    applyRemote(data.rev, data.state);
  } catch {
    // server unreachable; the reconnecting EventSource keeps trying
  }
}

// The browser reconnects an EventSource only after an error it can see. A
// connection that dies silently (wifi drop, sleeping phone) stays "open"
// forever and just goes quiet, so we watch for silence ourselves: the server
// pings every 25s, and a minute without any event means the stream is dead.
const STALE_MS = 60_000;
let lastHeard = Date.now();
let events: EventSource;

function connect() {
  events = new EventSource("/api/events");
  // on every (re)connect: a dropped connection may have missed updates
  events.onopen = () => {
    lastHeard = Date.now();
    syncFromServer();
  };
  events.addEventListener("ping", () => {
    lastHeard = Date.now();
  });
  events.addEventListener("state", (e) => {
    lastHeard = Date.now();
    const update = JSON.parse(e.data) as {rev: number; state: unknown};
    applyRemote(update.rev, update.state);
  });
  events.addEventListener("people", (e) => {
    lastHeard = Date.now();
    setPeople(JSON.parse(e.data) as Person[]);
  });
}
connect();

setInterval(() => {
  if (Date.now() - lastHeard > STALE_MS) {
    lastHeard = Date.now();
    events.close();
    connect();
  }
}, 10_000);

// a phone waking from its pocket should not wait out the silence watchdog
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") {
    syncFromServer();
  }
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

/** the server carries the person's toasties, eaten tally and grill stats over */
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

const requeued = (t: Toastie): Toastie => ({...t, placedAt: null});

export function setIronSlots(n: number) {
  const count = clampSlots(n);
  if (count === state.iron.length) {
    return 0;
  }
  const grilling = state.iron.filter((t): t is Toastie => t !== null);
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
export const toastieCount = (person: string) =>
  state.iron.filter((t) => t?.person === person).length +
  state.queue.filter((t) => t.person === person).length;

const queueIndexOf = (id: string) => state.queue.findIndex((t) => t.id === id);

export function canDrop(ref: DragRef, target: DropTarget): boolean {
  switch (target.kind) {
    case "iron": {
      if (ref.from === "iron") {
        return ref.slot !== target.slot;
      }
      // an occupied slot swaps with the queue, but a fresh toastie needs room
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

/** each returns false when the toastie moved away underneath us mid-drag */
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

  // whatever is left comes from the roster: a brand new toastie
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
function dropOnPlate(
  ref: Exclude<DragRef, {from: "roster"}>,
  completedAt: number,
): boolean {
  const i = ref.from === "queue" ? queueIndexOf(ref.id) : -1;
  const moving = ref.from === "iron" ? state.iron[ref.slot] : state.queue[i];
  if (!moving) {
    return false;
  }

  const {person} = moving;
  const grillSeconds =
    moving.placedAt === null ?
      null
    : Math.max(0, Math.round((completedAt - moving.placedAt) / 1000));
  setState(
    produce((s) => {
      if (ref.from === "iron") {
        s.iron[ref.slot] = null;
      } else {
        s.queue.splice(i, 1);
      }
      s.served += 1;
      s.eaten[person] = (s.eaten[person] ?? 0) + 1;

      if (grillSeconds !== null) {
        const previous = s.grillStats[person];
        const burnt = grillSeconds >= grillSecondsOf(person) * BURNT_FACTOR;
        s.grillStats[person] = {
          samples: (previous?.samples ?? 0) + 1,
          totalSeconds: (previous?.totalSeconds ?? 0) + grillSeconds,
          fastestSeconds: Math.min(
            previous?.fastestSeconds ?? grillSeconds,
            grillSeconds,
          ),
          slowestSeconds: Math.max(
            previous?.slowestSeconds ?? grillSeconds,
            grillSeconds,
          ),
          burnt: (previous?.burnt ?? 0) + (burnt ? 1 : 0),
        };
      }
    }),
  );
  return true;
}

export function setEatenCount(person: string, count: number) {
  if (!Number.isFinite(count)) {
    return;
  }
  const next = Math.max(0, Math.min(9999, Math.floor(count)));
  const previous = state.eaten[person] ?? 0;
  if (next === previous) {
    return;
  }

  setState(
    produce((s) => {
      if (next === 0) {
        delete s.eaten[person];
      } else {
        s.eaten[person] = next;
      }
      s.served = Math.max(0, s.served + next - previous);
    }),
  );
  save();
}

export function drop(
  ref: DragRef,
  target: DropTarget,
  completedAt = Date.now(),
) {
  if (!canDrop(ref, target)) {
    return false;
  }

  const moved =
    target.kind === "iron" ? dropOnIron(ref, target.slot)
    : target.kind === "queue" ? dropInQueue(ref, target.index)
    : ref.from !== "roster" && dropOnPlate(ref, completedAt);

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
