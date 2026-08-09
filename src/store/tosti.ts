import {createSignal} from "solid-js";

import {
  BURNT_FACTOR,
  DEFAULT_GRILL_SECONDS,
  Person,
  Tosti,
} from "../../shared/state";

export {
  DEFAULT_GRILL_SECONDS,
  GRILL_STEP_SECONDS,
  MAX_GRILL_SECONDS,
  MAX_IRON_SLOTS,
  MIN_GRILL_SECONDS,
  MIN_IRON_SLOTS,
  NAME_MAX,
  type Person,
  type Tosti,
} from "../../shared/state";

export const [people, setPeople] = createSignal<Person[]>([]);

export const PALETTE = [
  "#e4572e",
  "#2e86ab",
  "#6a4c93",
  "#1b998b",
  "#d81159",
  "#e08e00",
  "#3d5a80",
  "#5f9e12",
  "#ef476f",
  "#0f7173",
  "#b5446e",
  "#7768ae",
];

export const personOf = (name: string) => people().find((p) => p.name === name);

export const colorOf = (person: string) => personOf(person)?.color ?? "#8a5a2b";

/**
 * The timer runs on the eater's own setting, so changing it also moves the
 * finish line for a tosti already on the iron. That is intended: it is how you
 * give a tosti another minute.
 */
export const grillSecondsOf = (person: string) =>
  personOf(person)?.grillSeconds ?? DEFAULT_GRILL_SECONDS;

export const secondsOnIron = (tosti: Tosti, now: number) =>
  tosti.placedAt ? (now - tosti.placedAt) / 1000 : 0;

/** 0 when it goes on, 1 at the eater's grill time, and it keeps climbing */
export const grillProgress = (tosti: Tosti, now: number) =>
  secondsOnIron(tosti, now) / grillSecondsOf(tosti.person);

export type TostiStatus = "grilling" | "ready" | "burnt";

/** the iron badge and the ready chime must agree on when a tosti is done */
export function statusOf(tosti: Tosti, now: number): TostiStatus {
  const seconds = secondsOnIron(tosti, now);
  const grill = grillSecondsOf(tosti.person);
  if (seconds >= grill * BURNT_FACTOR) {
    return "burnt";
  }

  return seconds >= grill ? "ready" : "grilling";
}

export function formatDuration(seconds: number) {
  const s = Math.max(0, Math.floor(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}
