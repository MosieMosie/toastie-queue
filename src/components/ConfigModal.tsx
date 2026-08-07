import {createSignal, For} from "solid-js";

import {toast} from "../effects/toast";
import {t} from "../store/i18n";
import {ironSlots, setIronSlots} from "../store/store";
import {MAX_IRON_SLOTS, MIN_IRON_SLOTS} from "../store/tosti";

import {tallSlot} from "./ironLayout";
import {Modal} from "./ui";

export const [configOpen, setConfigOpen] = createSignal(false);

const SIZES = Array.from(
  {length: MAX_IRON_SLOTS - MIN_IRON_SLOTS + 1},
  (_size, i) => MIN_IRON_SLOTS + i,
);

function LayoutPreview(props: {count: number; active: boolean}) {
  return (
    <div class="grid h-9 w-full grid-flow-col grid-rows-2 gap-0.5">
      <For each={Array.from({length: props.count}, (_slot, i) => i)}>
        {(i) => (
          <div
            class="rounded-[3px]"
            classList={{
              "row-span-2": tallSlot(i, props.count),
              "bg-amber-50/80": props.active,
              "bg-amber-900/25": !props.active,
            }}
          />
        )}
      </For>
    </div>
  );
}

export function ConfigModal() {
  const pick = (count: number) => {
    if (count === ironSlots()) {
      return;
    }
    const bumped = setIronSlots(count);
    const sized =
      count === 1 ?
        t("toast.slotsChangedOne")
      : t("toast.slotsChangedMany", {n: count});
    const suffix =
      bumped === 0 ? ""
      : bumped === 1 ? ` — ${t("toast.slotsBumpedOne")}`
      : ` — ${t("toast.slotsBumpedMany", {n: bumped})}`;
    toast(sized + suffix);
  };

  return (
    <Modal
      open={configOpen()}
      onClose={() => setConfigOpen(false)}
      title={t("config.title")}
    >
      <div class="flex flex-col gap-2.5">
        <p class="text-sm font-semibold text-amber-900/70">
          {t("config.slots")}
        </p>
        <div class="grid grid-cols-4 gap-2">
          <For each={SIZES}>
            {(count) => {
              const active = () => ironSlots() === count;
              return (
                <button
                  type="button"
                  onClick={() => pick(count)}
                  class="flex flex-col items-center gap-1.5 rounded-2xl p-2 pt-2.5 transition active:scale-95"
                  classList={{
                    "bg-amber-900 text-amber-50 shadow-md": active(),
                    "bg-amber-50/60 text-amber-950 ring-1 ring-amber-900/10":
                      !active(),
                  }}
                >
                  <span class="text-lg leading-none font-black">{count}</span>
                  <LayoutPreview count={count} active={active()} />
                </button>
              );
            }}
          </For>
        </div>
        <p class="text-xs font-semibold text-amber-900/50">
          {t("config.slotsHint")}
        </p>
      </div>
    </Modal>
  );
}
