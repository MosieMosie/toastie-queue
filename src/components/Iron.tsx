import {For} from "solid-js";

import {t} from "../store/i18n";
import {ironCount, ironSlots} from "../store/store";

import {IronSlot} from "./IronSlot";

export function Iron() {
  const anyGrilling = () => ironCount() > 0;

  return (
    <div class="relative w-full">
      <div class="mx-auto w-[88%]">
        <div class="flex h-8 items-center justify-center rounded-t-3xl border-t border-zinc-400/60 bg-zinc-600">
          <span class="pl-[0.3em] text-[10px] font-black tracking-[0.3em] text-zinc-200/80 uppercase">
            tosti&nbsp;3000
          </span>
        </div>
        <div class="h-2 rounded-sm bg-zinc-800" />
      </div>

      <div class="relative rounded-[1.75rem] bg-gradient-to-b from-zinc-600 via-zinc-800 to-zinc-900 p-3 shadow-2xl ring-1 ring-black/40">
        <div class="rounded-2xl bg-[#241a14] p-2.5 shadow-[inset_0_4px_16px_rgba(0,0,0,0.7)]">
          <div class="grid grid-cols-2 gap-2.5 [--slot-min:11rem] sm:grid-flow-col sm:grid-cols-none sm:auto-cols-fr sm:grid-rows-[repeat(2,minmax(var(--slot-min),1fr))]">
            <For each={Array.from({length: ironSlots()}, (_slot, i) => i)}>
              {(slot) => <IronSlot slot={slot} />}
            </For>
          </div>
        </div>

        <div class="mt-2 flex items-center justify-between px-1">
          <div class="flex items-center gap-2">
            <span
              class="h-2.5 w-2.5 rounded-full shadow-[0_0_8px_currentColor]"
              classList={{
                "bg-orange-400 text-orange-400 pulse-light": anyGrilling(),
                "bg-emerald-500 text-emerald-500": !anyGrilling(),
              }}
            />
            <span class="text-[10px] font-bold tracking-widest text-zinc-300 uppercase">
              {anyGrilling() ? t("iron.grilling") : t("iron.idle")}
            </span>
          </div>
          <span class="text-[10px] font-bold tracking-widest text-zinc-400 uppercase">
            {t("iron.occupied", {n: ironCount(), total: ironSlots()})}
          </span>
        </div>

        <div class="absolute -bottom-2.5 left-1/2 h-5 w-28 -translate-x-1/2 rounded-b-2xl bg-gradient-to-b from-zinc-700 to-zinc-900 shadow-lg" />
      </div>

      <div class="mx-auto flex w-[70%] justify-between">
        <div class="h-2.5 w-9 rounded-b-lg bg-zinc-950/80" />
        <div class="h-2.5 w-9 rounded-b-lg bg-zinc-950/80" />
      </div>
    </div>
  );
}
