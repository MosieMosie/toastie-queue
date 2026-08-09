import {t} from "../store/i18n";
import {
  formatDuration,
  GRILL_STEP_SECONDS,
  MAX_GRILL_SECONDS,
  MIN_GRILL_SECONDS,
} from "../store/tosti";

export function GrillSlider(props: {
  seconds: number;
  onInput: (seconds: number) => void;
}) {
  return (
    <label class="flex flex-col gap-0.5">
      <span class="flex items-baseline justify-between px-1">
        <span class="text-sm font-semibold text-amber-900/70">
          {t("grill.label")}
        </span>
        <span class="text-base font-black text-amber-950 tabular-nums">
          {formatDuration(props.seconds)}
        </span>
      </span>
      <input
        type="range"
        class="grill-range"
        min={MIN_GRILL_SECONDS}
        max={MAX_GRILL_SECONDS}
        step={GRILL_STEP_SECONDS}
        value={props.seconds}
        onInput={(e) => props.onInput(Number(e.currentTarget.value))}
      />
      <span class="flex justify-between px-1 text-[10px] font-semibold text-amber-900/40">
        <span>{t("grill.soft")}</span>
        <span>{t("grill.crispy")}</span>
      </span>
    </label>
  );
}
