import {Show} from "solid-js";

import {draggable, dropZone} from "../effects/dnd";
import {toast} from "../effects/toast";
import {t} from "../store/i18n";
import {cancel, drop, now, state} from "../store/store";
import {
  BURNT_SECONDS,
  colorOf,
  formatDuration,
  GRILL_SECONDS,
  Tosti,
} from "../store/tosti";

import {faceFor} from "./faces";
import {TostiSvg} from "./TostiSvg";

function GrillingTosti(props: {slot: number; tosti: Tosti}) {
  const seconds = () =>
    props.tosti.placedAt ? (now() - props.tosti.placedAt) / 1000 : 0;
  const progress = () => seconds() / GRILL_SECONDS;
  const status = () =>
    seconds() >= BURNT_SECONDS ? "burnt"
    : seconds() >= GRILL_SECONDS ? "ready"
    : "grilling";

  const takeOff = () => {
    if (drop({from: "iron", slot: props.slot}, {kind: "plate"})) {
      toast(t("toast.enjoy", {name: props.tosti.person}));
    }
  };

  return (
    <div
      {...draggable({
        ref: () => ({from: "iron", slot: props.slot}),
        label: () => props.tosti.person,
      })}
      class="pop-in relative flex h-full w-full touch-none flex-col items-center justify-center gap-1 p-1.5 select-none"
      title={t("iron.slotTitle", {name: props.tosti.person})}
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
        face={status() === "burnt" ? "ko" : faceFor(props.tosti.id)}
        class="h-14 shrink-0 drop-shadow-[0_4px_6px_rgba(0,0,0,0.45)]"
      />

      <div
        class="max-w-full truncate rounded-full px-3 py-0.5 text-sm font-bold text-white shadow-sm"
        style={{"background-color": colorOf(props.tosti.person)}}
      >
        {props.tosti.person}
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
          const name = props.tosti.person;
          cancel({from: "iron", slot: props.slot});
          toast(t("toast.cancelled", {name}));
        }}
        class="absolute top-0.5 right-0.5 grid h-8 w-8 place-items-center rounded-full text-base text-amber-100/40 transition active:bg-red-500/30 active:text-red-300"
        aria-label={t("iron.cancelAria", {name: props.tosti.person})}
      >
        ✕
      </button>
    </div>
  );
}

export function IronSlot(props: {slot: number}) {
  const tosti = () => state.iron[props.slot];
  const zone = dropZone(() => ({kind: "iron", slot: props.slot}));

  return (
    <div
      data-drop={zone.key()}
      class="grill-ridges relative flex min-h-44 items-center justify-center rounded-2xl shadow-[inset_0_2px_10px_rgba(0,0,0,0.55)] transition duration-150"
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
        {(item) => <GrillingTosti slot={props.slot} tosti={item()} />}
      </Show>
    </div>
  );
}
