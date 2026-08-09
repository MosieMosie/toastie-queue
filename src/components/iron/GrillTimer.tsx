import {Show} from "solid-js";

import {t} from "../../store/i18n";
import {now} from "../../store/store";
import {
  formatDuration,
  grillProgress,
  grillSecondsOf,
  secondsOnIron,
  statusOf,
  Tosti,
  TostiStatus,
} from "../../store/tosti";
import {openGrillModal} from "../modals/GrillModal";

const BAR: Record<TostiStatus, string> = {
  grilling: "bg-amber-400",
  ready: "bg-lime-400",
  burnt: "bg-red-500",
};

const LABEL: Record<TostiStatus, string> = {
  grilling: "text-amber-200/80",
  ready: "text-lime-300",
  burnt: "text-red-400",
};

export function GrillTimer(props: {tosti: Tosti}) {
  const status = () => statusOf(props.tosti, now());
  const percent = () => Math.min(100, grillProgress(props.tosti, now()) * 100);

  return (
    <div class="flex w-full flex-col items-center gap-0.5">
      <div class="h-1.5 w-[85%] overflow-hidden rounded-full bg-black/40">
        <div
          class={`h-full rounded-full transition-[width] duration-1000 ease-linear ${BAR[status()]}`}
          style={{width: `${percent()}%`}}
        />
      </div>

      <button
        type="button"
        onClick={() => openGrillModal(props.tosti.person)}
        title={t("iron.timeTitle", {name: props.tosti.person})}
        class={`flex items-baseline gap-1 rounded-full px-2 py-0.5 text-xs font-semibold transition active:scale-95 active:bg-white/10 ${LABEL[status()]}`}
      >
        <span class="tabular-nums">
          {formatDuration(secondsOnIron(props.tosti, now()))}
        </span>
        <Show
          when={status() === "grilling"}
          fallback={
            <span classList={{"ready-glow": status() === "ready"}}>
              {status() === "burnt" ? t("iron.burnt") : t("iron.ready")}
            </span>
          }
        >
          <span class="tabular-nums opacity-60">
            / {formatDuration(grillSecondsOf(props.tosti.person))}
          </span>
        </Show>
      </button>
    </div>
  );
}
