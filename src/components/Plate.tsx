import {Show} from "solid-js";

import {dropZone} from "../effects/dnd";
import {t} from "../store/i18n";

import {TostiSvg} from "./tosti/TostiSvg";

export function Plate() {
  const zone = dropZone(() => ({kind: "plate"}));

  return (
    <div
      data-drop={zone.key()}
      class="hidden items-center gap-3 rounded-3xl border-2 border-dashed p-3 transition sm:flex"
      classList={{
        "border-amber-900/30 bg-white/70": !zone.active(),
        "border-lime-600 bg-lime-100 scale-[1.02] shadow-lg": zone.over(),
        "border-lime-500 bg-lime-50": zone.active() && !zone.over(),
      }}
    >
      <div class="relative grid h-16 w-16 shrink-0 place-items-center rounded-full bg-white shadow-md ring-4 ring-amber-300/70">
        <div class="h-11 w-11 rounded-full bg-amber-100 shadow-inner ring-1 ring-amber-900/15" />
        <Show when={zone.over()}>
          <div class="pointer-events-none absolute inset-0 grid place-items-center">
            <TostiSvg doneness={1} class="w-10" />
          </div>
        </Show>
      </div>
      <p class="text-xs font-bold text-amber-900/70">{t("plate.hint")}</p>
    </div>
  );
}
