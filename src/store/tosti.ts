import {createRoot, createSignal} from "solid-js";

import {Person} from "../../shared/state";

export {
  IRON_SLOTS,
  NAME_MAX,
  type Person,
  type Tosti,
} from "../../shared/state";

export const GRILL_SECONDS = 300;
export const BURNT_SECONDS = 480;

// populated from the server (see store.ts); empty until first sync
export const [people, setPeople] = createRoot(() => {
  const [get, set] = createSignal<Person[]>([]);
  return [get, set] as const;
});

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

export const colorOf = (person: string) =>
  people().find((p) => p.name === person)?.color ?? "#8a5a2b";

export function formatDuration(seconds: number) {
  const s = Math.max(0, Math.floor(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}
