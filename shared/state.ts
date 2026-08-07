export interface Person {
  name: string;
  color: string;
}

export interface Tosti {
  id: string;
  person: string;
  placedAt: number | null;
}

export interface State {
  iron: (Tosti | null)[];
  queue: Tosti[];
  served: number;
  eaten: Record<string, number>;
}

export const MIN_IRON_SLOTS = 1;
export const MAX_IRON_SLOTS = 8;
export const DEFAULT_IRON_SLOTS = 4;
export const NAME_MAX = 20;

export const clampSlots = (n: number) =>
  Math.max(MIN_IRON_SLOTS, Math.min(MAX_IRON_SLOTS, Math.floor(n)));

export const emptyState = (): State => ({
  iron: Array.from({length: DEFAULT_IRON_SLOTS}, () => null),
  queue: [],
  served: 0,
  eaten: {},
});

export function renamePersonInState(
  state: State,
  oldName: string,
  newName: string,
) {
  for (const tosti of [...state.iron, ...state.queue]) {
    if (tosti?.person === oldName) {
      tosti.person = newName;
    }
  }
  if (state.eaten[oldName] !== undefined) {
    state.eaten[newName] = (state.eaten[newName] ?? 0) + state.eaten[oldName];
    delete state.eaten[oldName];
  }
}

export function isTosti(value: unknown): value is Tosti {
  if (!value || typeof value !== "object") {
    return false;
  }
  const t = value as Record<string, unknown>;
  return (
    typeof t.id === "string" &&
    typeof t.person === "string" &&
    (t.placedAt === null || typeof t.placedAt === "number")
  );
}

function sanitizeEaten(value: unknown): Record<string, number> {
  if (!value || typeof value !== "object") {
    return {};
  }
  const eaten: Record<string, number> = {};
  for (const [name, count] of Object.entries(value)) {
    if (typeof count === "number" && Number.isFinite(count) && count > 0) {
      eaten[name] = Math.floor(count);
    }
  }
  return eaten;
}

export function sanitizeState(value: unknown): State | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const s = value as Record<string, unknown>;
  const iron: unknown[] =
    Array.isArray(s.iron) ? s.iron : Array(DEFAULT_IRON_SLOTS).fill(null);

  return {
    iron: Array.from({length: clampSlots(iron.length)}, (_slot, i) =>
      isTosti(iron[i]) ? iron[i] : null,
    ),
    queue: (Array.isArray(s.queue) ? s.queue : [])
      .filter(isTosti)
      .slice(0, 100),
    served:
      typeof s.served === "number" && Number.isFinite(s.served) ?
        Math.max(0, Math.floor(s.served))
      : 0,
    eaten: sanitizeEaten(s.eaten),
  };
}
