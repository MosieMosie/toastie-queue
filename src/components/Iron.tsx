import {For, Show} from "solid-js";

import {draggable, dropZone} from "../lib/dnd";
import {toast} from "../lib/toast";
import {t} from "../store/i18n";
import {cancel, drop, ironCount, now, state} from "../store/store";
import {
  BURNT_SECONDS,
  colorOf,
  formatDuration,
  GRILL_SECONDS,
  IRON_SLOTS,
} from "../store/tosti";

import {faceFor} from "./faces";
import {TostiSvg} from "./TostiSvg";

function IronSlot(props: {slot: number}) {
  const tosti = () => state.iron[props.slot];
  const zone = dropZone(() => ({kind: "iron", slot: props.slot}));

  const seconds = () => {
    const cur = tosti();
    return cur?.placedAt ? (now() - cur.placedAt) / 1000 : 0;
  };
  const progress = () => seconds() / GRILL_SECONDS;
  const status = () =>
    seconds() >= BURNT_SECONDS ? "burnt"
    : seconds() >= GRILL_SECONDS ? "ready"
    : "grilling";

  const takeOff = () => {
    const name = tosti()?.person;
    if (drop({from: "iron", slot: props.slot}, {kind: "plate"})) {
      toast(t("toast.enjoy", {name: name ?? ""}));
    }
  };

  return (
    <div
      data-drop={zone.key()}
      class="grill-ridges relative flex aspect-[3/2] items-center justify-center rounded-2xl shadow-[inset_0_2px_10px_rgba(0,0,0,0.55)] transition duration-150"
      classList={{
        "ring-2 ring-amber-300/40": Boolean(tosti()) && !zone.over(),
        "ring-1 ring-amber-200/20": !tosti() && !zone.active(),
        "ring-4 ring-lime-300 scale-[1.02]": zone.over(),
        "ring-2 ring-lime-300/50": zone.active() && !zone.over(),
      }}
    >
      <Show
        when={tosti()}
        fallback={
          <div class="pointer-events-none text-center text-amber-100/35 select-none">
            <div class="text-3xl leading-none font-bold">{props.slot + 1}</div>
            <div class="mt-0.5 text-[10px] font-semibold tracking-wide uppercase">
              {t("iron.free")}
            </div>
          </div>
        }
      >
        {(item) => (
          <div
            {...draggable({
              ref: () => ({from: "iron", slot: props.slot}),
              label: () => item().person,
            })}
            class="pop-in relative flex h-full w-full touch-none flex-col items-center justify-center gap-1 p-1.5 select-none"
            title={t("iron.slotTitle", {name: item().person})}
          >
            <Show when={status() !== "burnt"}>
              <div class="pointer-events-none absolute top-0.5 left-1/2 flex -translate-x-1/2 gap-1">
                <span class="steam" />
                <span class="steam" style={{"animation-delay": "0.5s"}} />
                <span class="steam" style={{"animation-delay": "1s"}} />
              </div>
            </Show>

            <TostiSvg
              doneness={Math.min(2, progress() * 1.15)}
              face={status() === "burnt" ? "ko" : faceFor(item().id)}
              class="h-14 shrink-0 drop-shadow-[0_4px_6px_rgba(0,0,0,0.45)]"
            />

            <div
              class="max-w-full truncate rounded-full px-3 py-0.5 text-sm font-bold text-white shadow-sm"
              style={{"background-color": colorOf(item().person)}}
            >
              {item().person}
            </div>

            <div class="flex w-full flex-col items-center gap-0.5">
              <div class="h-1.5 w-[85%] overflow-hidden rounded-full bg-black/40">
                <div
                  class="h-full rounded-full transition-[width] duration-1000 ease-linear"
                  classList={{
                    "bg-amber-400": status() === "grilling",
                    "bg-lime-400": status() === "ready",
                    "bg-red-500": status() === "burnt",
                  }}
                  style={{width: `${Math.min(100, progress() * 100)}%`}}
                />
              </div>
              <div
                class="flex items-baseline gap-1 text-xs font-semibold"
                classList={{
                  "text-amber-200/80": status() === "grilling",
                  "text-lime-300": status() === "ready",
                  "text-red-400": status() === "burnt",
                }}
              >
                <span class="tabular-nums">{formatDuration(seconds())}</span>
                <Show when={status() !== "grilling"}>
                  <span classList={{"ready-glow": status() === "ready"}}>
                    {status() === "burnt" ? t("iron.burnt") : t("iron.ready")}
                  </span>
                </Show>
              </div>
            </div>

            <button
              type="button"
              onClick={takeOff}
              class="h-9 w-[85%] shrink-0 rounded-xl bg-lime-500 text-sm font-bold text-white shadow-md transition active:scale-95 active:bg-lime-600"
            >
              {t("iron.take")}
            </button>

            <button
              type="button"
              onClick={() => {
                const name = item().person;
                cancel({from: "iron", slot: props.slot});
                toast(t("toast.cancelled", {name}));
              }}
              class="absolute top-0.5 right-0.5 grid h-8 w-8 place-items-center rounded-full text-base text-amber-100/40 transition active:bg-red-500/30 active:text-red-300"
              aria-label={t("iron.cancelAria", {name: item().person})}
            >
              ✕
            </button>
          </div>
        )}
      </Show>
    </div>
  );
}

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
          <div class="grid grid-cols-2 gap-2.5">
            <For each={Array.from({length: IRON_SLOTS}, (_slot, i) => i)}>
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
            {t("iron.occupied", {n: ironCount(), total: IRON_SLOTS})}
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
