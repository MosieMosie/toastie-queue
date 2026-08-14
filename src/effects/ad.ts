import {createSignal} from "solid-js";

import {Toastie} from "../../shared/state";

export interface PendingAd {
  id: string;
  person: string;
  placedAt: number;
  takenAt: number;
}

export const [pendingAd, setPendingAd] = createSignal<PendingAd | null>(null);

export function openAdBreak(toastie: Toastie) {
  if (toastie.placedAt === null) {
    return false;
  }

  setPendingAd({
    id: toastie.id,
    person: toastie.person,
    placedAt: toastie.placedAt,
    takenAt: Date.now(),
  });
  return true;
}
