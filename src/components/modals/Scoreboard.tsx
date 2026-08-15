import {createMemo, createSignal, For, Show} from "solid-js";

import {t, TranslationKey} from "../../store/i18n";
import {setEatenCount, state} from "../../store/store";
import {colorOf, formatDuration, people} from "../../store/toastie";
import {Avatar} from "../Avatar";
import {ToastieSvg} from "../toastie/ToastieSvg";

import {Modal} from "./Modal";

export const [scoreboardOpen, setScoreboardOpen] = createSignal(false);

interface ScoreRowData {
  name: string;
  count: number;
}

function EmptyScoreboard() {
  return (
    <div class="flex flex-col items-center gap-3 py-8 text-center">
      <ToastieSvg doneness={0.1} class="h-14 opacity-60" />
      <p class="text-sm font-semibold text-amber-900/60">
        {t("scoreboard.empty")}
      </p>
    </div>
  );
}

function trollTitle(name: string): TranslationKey {
  const stats = state.grillStats[name];
  if (!stats || stats.samples <= 1) {
    return "scoreboard.trollRookie";
  }
  if (stats.burnt / stats.samples >= 0.25) {
    return "scoreboard.trollBurnt";
  }

  const average = stats.totalSeconds / stats.samples;
  if (average < 240) {
    return "scoreboard.trollSpeed";
  }
  if (average > 480) {
    return "scoreboard.trollSlow";
  }
  return "scoreboard.trollSteady";
}

function CountAdjuster(props: {name: string; count: number}) {
  return (
    <div class="flex items-center gap-1 rounded-full bg-white p-1 shadow-sm ring-1 ring-amber-900/10">
      <button
        type="button"
        onClick={() => setEatenCount(props.name, props.count - 1)}
        disabled={props.count === 0}
        class="grid h-10 w-10 place-items-center rounded-full bg-amber-900/5 text-lg font-black text-amber-900 transition active:scale-90 disabled:opacity-25"
        aria-label={t("scoreboard.decrease", {name: props.name})}
      >
        -
      </button>
      <div class="min-w-12 text-center">
        <div class="text-lg leading-none font-black tabular-nums">
          {props.count}
        </div>
        <div class="text-[8px] font-black tracking-wide text-amber-900/40 uppercase">
          {t("scoreboard.eaten")}
        </div>
      </div>
      <button
        type="button"
        onClick={() => setEatenCount(props.name, props.count + 1)}
        class="grid h-10 w-10 place-items-center rounded-full bg-amber-500 text-lg font-black text-white shadow-sm transition active:scale-90 active:bg-amber-600"
        aria-label={t("scoreboard.increase", {name: props.name})}
      >
        +
      </button>
    </div>
  );
}

function GrillDossier(props: {name: string}) {
  const stats = () => state.grillStats[props.name];
  const average = () => {
    const value = stats();
    return value ? formatDuration(value.totalSeconds / value.samples) : null;
  };

  return (
    <div class="min-w-0 rounded-xl bg-amber-950/[0.035] px-3 py-2">
      <div class="flex flex-wrap items-baseline gap-x-2">
        <span class="text-[9px] font-black tracking-wide text-amber-900/45 uppercase">
          {t("scoreboard.average")}
        </span>
        <span class="text-base font-black text-amber-950 tabular-nums">
          {average() ?? t("scoreboard.noAverage")}
        </span>
      </div>
      <Show when={stats()}>
        {(measured) => (
          <p class="mt-0.5 text-[10px] leading-snug font-bold text-amber-900/55">
            {t("scoreboard.samples", {n: measured().samples})}
            {" · "}
            {t("scoreboard.fastest", {
              time: formatDuration(measured().fastestSeconds),
            })}
            {" · "}
            {t("scoreboard.slowest", {
              time: formatDuration(measured().slowestSeconds),
            })}
            {" · "}
            {t("scoreboard.burnt", {n: measured().burnt})}
          </p>
        )}
      </Show>
    </div>
  );
}

function ScoreRow(props: {
  rank: number;
  name: string;
  count: number;
  leading: boolean;
}) {
  return (
    <li
      class="grid items-center gap-2 rounded-2xl p-2 sm:grid-cols-[2rem_2.5rem_minmax(8rem,1fr)_minmax(14rem,1.5fr)_auto]"
      classList={{
        "bg-amber-100 ring-1 ring-amber-300/70": props.leading,
        "bg-amber-50/60": !props.leading,
      }}
    >
      <span class="hidden text-center text-sm font-black text-amber-900/40 sm:block">
        {props.rank}
      </span>
      <div class="hidden sm:block">
        <Avatar name={props.name} color={colorOf(props.name)} />
      </div>
      <div class="min-w-0">
        <div class="flex items-center gap-1.5">
          <span class="truncate text-base font-black text-amber-950">
            {props.name}
          </span>
          <Show when={props.leading && props.count > 0}>
            <span aria-label="leader">👑</span>
          </Show>
        </div>
        <span class="inline-flex rounded-full bg-white/80 px-2 py-0.5 text-[9px] font-black tracking-wide text-amber-700 uppercase ring-1 ring-amber-900/10">
          {t(trollTitle(props.name))}
        </span>
      </div>
      <GrillDossier name={props.name} />
      <CountAdjuster name={props.name} count={props.count} />
    </li>
  );
}

export function Scoreboard() {
  const rows = createMemo<ScoreRowData[]>(() => {
    const names = new Set([
      ...people().map((person) => person.name),
      ...Object.keys(state.eaten),
      ...Object.keys(state.grillStats),
    ]);
    return [...names]
      .map((name) => ({name, count: state.eaten[name] ?? 0}))
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
  });
  const topScore = () => rows()[0]?.count ?? 0;

  return (
    <Modal
      open={scoreboardOpen()}
      onClose={() => setScoreboardOpen(false)}
      title={`🏆 ${t("scoreboard.title")}`}
      wide
    >
      <Show when={rows().length > 0} fallback={<EmptyScoreboard />}>
        <ol class="flex flex-col gap-1.5 overflow-y-auto">
          <For each={rows()}>
            {(row, i) => (
              <ScoreRow
                rank={i() + 1}
                name={row.name}
                count={row.count}
                leading={topScore() > 0 && row.count === topScore()}
              />
            )}
          </For>
        </ol>
      </Show>
    </Modal>
  );
}
