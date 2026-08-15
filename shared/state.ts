export interface Person {
  name: string;
  color: string;
  grillSeconds: number;
}

export interface Toastie {
  id: string;
  person: string;
  placedAt: number | null;
}

export interface GrillStats {
  samples: number;
  totalSeconds: number;
  fastestSeconds: number;
  slowestSeconds: number;
  burnt: number;
}

export interface State {
  iron: (Toastie | null)[];
  queue: Toastie[];
  served: number;
  eaten: Record<string, number>;
  grillStats: Record<string, GrillStats>;
}

export const MIN_IRON_SLOTS = 1;
export const MAX_IRON_SLOTS = 8;
export const DEFAULT_IRON_SLOTS = 4;
export const NAME_MAX = 20;

export const MIN_GRILL_SECONDS = 60;
export const MAX_GRILL_SECONDS = 900;
export const DEFAULT_GRILL_SECONDS = 300;
export const GRILL_STEP_SECONDS = 15;
export const BURNT_FACTOR = 1.4;

export const clampSlots = (n: number) =>
  Math.max(MIN_IRON_SLOTS, Math.min(MAX_IRON_SLOTS, Math.floor(n)));

export const clampGrill = (n: number) =>
  Math.max(
    MIN_GRILL_SECONDS,
    Math.min(
      MAX_GRILL_SECONDS,
      Math.round(n / GRILL_STEP_SECONDS) * GRILL_STEP_SECONDS,
    ),
  );

export const emptyState = (): State => ({
  iron: Array.from({length: DEFAULT_IRON_SLOTS}, () => null),
  queue: [],
  served: 0,
  eaten: {},
  grillStats: {},
});

export function renamePersonInState(
  state: State,
  oldName: string,
  newName: string,
) {
  for (const toastie of [...state.iron, ...state.queue]) {
    if (toastie?.person === oldName) {
      toastie.person = newName;
    }
  }

  if (state.eaten[oldName] !== undefined) {
    state.eaten[newName] = (state.eaten[newName] ?? 0) + state.eaten[oldName];
    delete state.eaten[oldName];
  }

  const oldStats = state.grillStats[oldName];
  if (oldStats) {
    const current = state.grillStats[newName];
    state.grillStats[newName] =
      current ?
        {
          samples: current.samples + oldStats.samples,
          totalSeconds: current.totalSeconds + oldStats.totalSeconds,
          fastestSeconds: Math.min(
            current.fastestSeconds,
            oldStats.fastestSeconds,
          ),
          slowestSeconds: Math.max(
            current.slowestSeconds,
            oldStats.slowestSeconds,
          ),
          burnt: current.burnt + oldStats.burnt,
        }
      : oldStats;
    delete state.grillStats[oldName];
  }
}

export function removePersonFromState(state: State, name: string) {
  state.iron = state.iron.map((toastie) =>
    toastie?.person === name ? null : toastie,
  );
  state.queue = state.queue.filter((toastie) => toastie.person !== name);
  delete state.eaten[name];
  delete state.grillStats[name];
}

function isToastie(value: unknown): value is Toastie {
  if (!value || typeof value !== "object") {
    return false;
  }
  const t = value as Record<string, unknown>;
  return (
    typeof t.id === "string" &&
    typeof t.person === "string" &&
    (t.placedAt === null ||
      (typeof t.placedAt === "number" &&
        Number.isFinite(t.placedAt) &&
        t.placedAt > 0))
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

function sanitizeGrillStats(value: unknown): Record<string, GrillStats> {
  if (!value || typeof value !== "object") {
    return {};
  }

  const result: Record<string, GrillStats> = {};
  for (const [name, raw] of Object.entries(value)) {
    if (raw && typeof raw === "object") {
      const stats = raw as Record<string, unknown>;
      const samples = finiteNonNegative(stats.samples);
      const totalSeconds = finiteNonNegative(stats.totalSeconds);
      const fastestSeconds = Math.min(
        finiteNonNegative(stats.fastestSeconds),
        finiteNonNegative(stats.slowestSeconds),
      );
      const slowestSeconds = Math.max(
        finiteNonNegative(stats.fastestSeconds),
        finiteNonNegative(stats.slowestSeconds),
      );
      const burnt = Math.min(samples, finiteNonNegative(stats.burnt));

      if (samples > 0) {
        result[name] = {
          samples,
          totalSeconds,
          fastestSeconds,
          slowestSeconds,
          burnt,
        };
      }
    }
  }

  return result;
}

function finiteNonNegative(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ?
      Math.max(0, Math.floor(value))
    : 0;
}

export function sanitizeState(value: unknown): State | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const s = value as Record<string, unknown>;
  // a missing iron falls back to the default size; a present one keeps its own,
  // so a screen configured for six slots stays at six
  const iron: unknown[] = Array.isArray(s.iron) ? s.iron : [];
  const slots =
    Array.isArray(s.iron) ? clampSlots(iron.length) : DEFAULT_IRON_SLOTS;

  return {
    iron: Array.from({length: slots}, (_slot, i) =>
      isToastie(iron[i]) ? iron[i] : null,
    ),
    queue: (Array.isArray(s.queue) ? s.queue : [])
      .filter(isToastie)
      .slice(0, 100),
    served:
      typeof s.served === "number" && Number.isFinite(s.served) ?
        Math.max(0, Math.floor(s.served))
      : 0,
    eaten: sanitizeEaten(s.eaten),
    grillStats: sanitizeGrillStats(s.grillStats),
  };
}
