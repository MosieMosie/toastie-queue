import {createEffect, createRoot} from "solid-js";

import {now, state} from "../store/store";
import {GRILL_SECONDS} from "../store/tosti";

import {playReadyChime} from "./sound";

/**
 * Rings the chime the moment a tosti crosses GRILL_SECONDS on the iron.
 * Each tosti chimes once; a page load with an already-ready tosti stays
 * silent instead of re-announcing old news.
 */
createRoot(() => {
  const announced = new Set<string>();
  let firstRun = true;

  createEffect(() => {
    const t = now();
    const ready = state.iron.filter(
      (tosti) =>
        tosti !== null &&
        tosti.placedAt !== null &&
        (t - tosti.placedAt) / 1000 >= GRILL_SECONDS,
    ) as {id: string}[];

    // forget tostis that left the iron so the set cannot grow forever
    const readyIds = new Set(ready.map((r) => r.id));
    for (const id of announced) {
      if (!readyIds.has(id)) {
        announced.delete(id);
      }
    }

    for (const {id} of ready) {
      if (!announced.has(id)) {
        announced.add(id);
        if (!firstRun) {
          playReadyChime();
        }
      }
    }
    firstRun = false;
  });
});
