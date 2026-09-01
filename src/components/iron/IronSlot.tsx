import {Show} from "solid-js";

import {dropZone} from "../../effects/dnd";
import {t} from "../../store/i18n";
import {ironSlots, state} from "../../store/store";

import {GrillingToastie} from "./GrillingToastie";
import {lastColumnSlot, tallSlot, wideSlot} from "./ironLayout";

function EmptySlot(props: {slot: number}) {
  return (
    <div class="pointer-events-none text-center text-amber-100/35 select-none">
      <div class="text-3xl leading-none font-bold">{props.slot + 1}</div>
      <div class="mt-0.5 text-[10px] font-semibold tracking-wide uppercase">
        {t("iron.free")}
      </div>
    </div>
  );
}

export function IronSlot(props: {slot: number}) {
  const toastie = () => state.iron[props.slot];
  const zone = dropZone(() => ({kind: "iron", slot: props.slot}));

  return (
    <div
      data-drop={zone.key()}
      class="grill-ridges relative flex min-h-(--slot-min) items-center justify-center rounded-2xl shadow-[inset_0_2px_10px_rgba(0,0,0,0.55)] transition duration-150"
      classList={{
        "sm:row-span-2": tallSlot(props.slot, ironSlots()),
        "sm:col-[-2] sm:row-start-1": lastColumnSlot(props.slot, ironSlots()),
        "max-sm:col-span-2": wideSlot(props.slot, ironSlots()),
        "ring-2 ring-amber-300/40": Boolean(toastie()) && !zone.over(),
        "ring-1 ring-amber-200/20": !toastie() && !zone.active(),
        "ring-4 ring-lime-300 scale-[1.02]": zone.over(),
        "ring-2 ring-lime-300/50": zone.active() && !zone.over(),
      }}
    >
      <Show when={toastie()} fallback={<EmptySlot slot={props.slot} />}>
        {(item) => <GrillingToastie slot={props.slot} toastie={item()} />}
      </Show>
    </div>
  );
}
