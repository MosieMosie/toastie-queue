import {createEffect, createRoot} from "solid-js";

import {now, state} from "../store/store";
import {statusOf} from "../store/toastie";

import {playReadyChime} from "./sound";

/**
 * Rings the chime the moment a toastie reaches its eater's grill time. Each toastie
 * chimes once; a page load with an already-ready toastie stays silent instead of
 * re-announcing old news.
 */
createRoot(() => {
  const announced = new Set<string>();
  let firstRun = true;

  createEffect(() => {
    const at = now();
    const ready = new Set(
      state.iron.flatMap((toastie) =>
        toastie && statusOf(toastie, at) !== "grilling" ? [toastie.id] : [],
      ),
    );

    // a toastie taken off the iron is forgotten, so a reused id can chime again
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
