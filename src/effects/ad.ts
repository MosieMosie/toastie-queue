import {createSignal} from "solid-js";

import {Toastie} from "../../shared/state";

export interface PendingAd {
  id: string;
  person: string;
  placedAt: number;
  takenAt: number;
}

export const [pendingAd, setPendingAd] = createSignal<PendingAd | null>(null);

const ADS_KEY = "toastie-ads";

const urlOverride = new URLSearchParams(location.search).get("ads");
if (urlOverride === "on" || urlOverride === "off") {
  localStorage.setItem(ADS_KEY, urlOverride);
}

const [adsEnabled, setAdsEnabledSignal] = createSignal(
  localStorage.getItem(ADS_KEY) !== "off",
);
export {adsEnabled};

export function setAdsEnabled(next: boolean) {
  setAdsEnabledSignal(next);
  localStorage.setItem(ADS_KEY, next ? "on" : "off");
}

export function openAdBreak(toastie: Toastie) {
  if (!adsEnabled() || toastie.placedAt === null) {
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
