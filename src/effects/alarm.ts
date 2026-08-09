import {createEffect, createRoot} from "solid-js";

import {now, state} from "../store/store";
import {statusOf} from "../store/tosti";

import {playReadyChime} from "./sound";

/**
 * Rings the chime the moment a tosti reaches its eater's grill time. Each tosti
 * chimes once; a page load with an already-ready tosti stays silent instead of
 * re-announcing old news.
 */
createRoot(() => {
  const announced = new Set<string>();
  let firstRun = true;

  createEffect(() => {
    const at = now();
    const ready = new Set(
      state.iron.flatMap((tosti) =>
        tosti && statusOf(tosti, at) !== "grilling" ? [tosti.id] : [],
      ),
    );

    // a tosti taken off the iron is forgotten, so a reused id can chime again
    for (const id of announced) {
      if (!ready.has(id)) {
        announced.delete(id);
      }
    }

    for (const id of ready) {
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
