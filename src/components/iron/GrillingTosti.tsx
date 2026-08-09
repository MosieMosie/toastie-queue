import {Show} from "solid-js";

import {draggable} from "../../effects/dnd";
import {toast} from "../../effects/toast";
import {t} from "../../store/i18n";
import {cancel, drop, now} from "../../store/store";
import {colorOf, grillProgress, statusOf, Tosti} from "../../store/tosti";
import {openGrillModal} from "../modals/GrillModal";
import {faceFor} from "../tosti/faces";
import {TostiSvg} from "../tosti/TostiSvg";

import {GrillTimer} from "./GrillTimer";

function Steam() {
  return (
    <div class="pointer-events-none absolute top-0.5 left-1/2 flex -translate-x-1/2 gap-1">
      <span class="steam" />
      <span class="steam" style={{"animation-delay": "0.5s"}} />
      <span class="steam" style={{"animation-delay": "1s"}} />
    </div>
  );
}

function NameTag(props: {person: string}) {
  return (
    <div
      class="max-w-full truncate rounded-full px-3 py-0.5 text-sm font-bold text-white shadow-sm"
      style={{"background-color": colorOf(props.person)}}
    >
      {props.person}
    </div>
  );
}

function TakeButton(props: {onTake: () => void}) {
  return (
    <button
      type="button"
      onClick={() => props.onTake()}
      class="h-9 w-[85%] shrink-0 rounded-xl bg-lime-500 text-sm font-bold text-white shadow-md transition active:scale-95 active:bg-lime-600"
    >
      {t("iron.take")}
    </button>
  );
}

function CancelButton(props: {person: string; onCancel: () => void}) {
  return (
    <button
      type="button"
      onClick={() => props.onCancel()}
      class="absolute top-0.5 right-0.5 grid h-8 w-8 place-items-center rounded-full text-base text-amber-100/40 transition active:bg-red-500/30 active:text-red-300"
      aria-label={t("iron.cancelAria", {name: props.person})}
    >
      ✕
    </button>
  );
}

export function GrillingTosti(props: {slot: number; tosti: Tosti}) {
  const status = () => statusOf(props.tosti, now());
  // slightly ahead of the timer, so it already looks golden when it is ready
  const browning = () => grillProgress(props.tosti, now()) * 1.15;

  const takeOff = () => {
    if (drop({from: "iron", slot: props.slot}, {kind: "plate"})) {
      toast(t("toast.enjoy", {name: props.tosti.person}));
    }
  };

  const cancelled = () => {
    const name = props.tosti.person;
    cancel({from: "iron", slot: props.slot});
    toast(t("toast.cancelled", {name}));
  };

  return (
    <div
      {...draggable({
        ref: () => ({from: "iron", slot: props.slot}),
        label: () => props.tosti.person,
        onDoubleTap: () => openGrillModal(props.tosti.person),
      })}
      class="pop-in relative flex h-full w-full touch-none flex-col items-center justify-center gap-1 p-1.5 select-none"
      title={t("iron.slotTitle", {name: props.tosti.person})}
    >
      <Show when={status() !== "burnt"}>
        <Steam />
      </Show>

      <TostiSvg
        doneness={browning()}
        face={status() === "burnt" ? "ko" : faceFor(props.tosti.id)}
        class="h-14 shrink-0 drop-shadow-[0_4px_6px_rgba(0,0,0,0.45)] sm:h-20"
      />

      <NameTag person={props.tosti.person} />
      <GrillTimer tosti={props.tosti} />
      <TakeButton onTake={takeOff} />
      <CancelButton person={props.tosti.person} onCancel={cancelled} />
    </div>
  );
}
