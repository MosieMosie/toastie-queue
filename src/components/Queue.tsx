import {For} from "solid-js";

import {draggable, dropZone} from "../effects/dnd";
import {toast} from "../effects/toast";
import {t} from "../store/i18n";
import {cancel, drop, freeSlot, state} from "../store/store";
import {colorOf} from "../store/tosti";

import {TostiSvg} from "./TostiSvg";

const card =
  "flex min-h-[5.5rem] w-[6.75rem] flex-none flex-col items-center justify-center rounded-2xl p-2 transition";

function QueueCard(props: {id: string; person: string; index: number}) {
  const zone = dropZone(() => ({kind: "queue", index: props.index}));

  const toIron = () => {
    const slot = freeSlot();
    if (slot < 0) {
      toast(t("toast.ironFull"));
      return;
    }
    if (drop({from: "queue", id: props.id}, {kind: "iron", slot})) {
      toast(t("toast.onIron", {name: props.person}));
    }
  };

  return (
    <div
      data-drop={zone.key()}
      {...draggable({
        ref: () => ({from: "queue", id: props.id}),
        label: () => props.person,
        onTap: toIron,
      })}
      class={`${card} pop-in relative touch-none gap-1 bg-white shadow-md ring-1 ring-amber-900/10 select-none active:scale-95`}
      classList={{"ring-4 ring-lime-400 scale-[1.03]": zone.over()}}
      title={t("queue.cardTitle", {name: props.person})}
    >
      <span class="absolute top-1 left-2 text-[10px] font-black text-amber-900/25">
        #{props.index + 1}
      </span>
      <button
        type="button"
        onClick={() => {
          cancel({from: "queue", id: props.id});
          toast(t("toast.dequeued", {name: props.person}));
        }}
        class="absolute top-0 right-0 grid h-8 w-8 place-items-center rounded-full text-sm text-amber-900/30 transition active:bg-red-100 active:text-red-500"
        aria-label={t("toast.dequeued", {name: props.person})}
      >
        ✕
      </button>

      <TostiSvg doneness={0.1} face={false} class="h-9 opacity-90" />
      <div
        class="max-w-full truncate rounded-full px-2.5 py-0.5 text-xs font-bold text-white"
        style={{"background-color": colorOf(props.person)}}
      >
        {props.person}
      </div>
      <span class="text-[10px] font-bold text-amber-900/45">
        {t("queue.tapHint")}
      </span>
    </div>
  );
}

function EmptySlot(props: {index: number}) {
  const zone = dropZone(() => ({kind: "queue", index: props.index}));
  return (
    <div
      data-drop={zone.key()}
      class={`${card} gap-0.5 border-2 border-dashed`}
      classList={{
        "border-amber-900/15 text-amber-900/25": !zone.active(),
        "border-lime-500 bg-lime-50 text-lime-700 scale-[1.03]": zone.over(),
        "border-lime-400/60 text-lime-600/60": zone.active() && !zone.over(),
      }}
    >
      <span class="text-base leading-none font-black">#{props.index + 1}</span>
      <span class="text-[10px] font-semibold tracking-wide uppercase">
        {t("queue.empty")}
      </span>
    </div>
  );
}

export function Queue() {
  return (
    <section class="flex min-h-0 w-full flex-1 flex-col">
      <header class="mb-1.5 flex flex-none items-baseline justify-between">
        <h2 class="text-xs font-black tracking-widest text-amber-900/70 uppercase">
          {t("queue.title")}
        </h2>
        <span class="text-xs font-bold text-amber-900/50">
          {state.queue.length === 1 ?
            t("queue.countOne")
          : t("queue.countMany", {n: state.queue.length})}
        </span>
      </header>

      <div class="flex min-h-[6.5rem] flex-1 flex-wrap content-start items-stretch gap-2 overflow-y-auto rounded-3xl bg-amber-50/80 p-2 ring-1 ring-amber-900/10">
        <For each={state.queue}>
          {(item, i) => (
            <QueueCard id={item.id} person={item.person} index={i()} />
          )}
        </For>
        <EmptySlot index={state.queue.length} />
      </div>
    </section>
  );
}
