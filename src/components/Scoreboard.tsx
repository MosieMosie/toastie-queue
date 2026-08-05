import {createMemo, createSignal, For, Show} from "solid-js";

import {t} from "../store/i18n";
import {state} from "../store/store";
import {colorOf} from "../store/tosti";

import {TostiSvg} from "./TostiSvg";
import {Avatar, Modal} from "./ui";

// module-level so the header button in App.tsx can drive it
export const [scoreboardOpen, setScoreboardOpen] = createSignal(false);

function EmptyScoreboard() {
  return (
    <div class="flex flex-col items-center gap-3 py-8 text-center">
      <TostiSvg doneness={0.1} class="h-14 opacity-60" />
      <p class="text-sm font-semibold text-amber-900/60">
        {t("scoreboard.empty")}
      </p>
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
    <tr
      class="rounded-xl"
      classList={{
        "bg-amber-100": props.leading,
        "bg-amber-50/60": !props.leading,
      }}
    >
      <td class="w-10 rounded-l-xl py-2 pl-3 text-sm font-black text-amber-900/40">
        {props.rank}
      </td>
      <td class="w-10 py-2">
        <Avatar name={props.name} color={colorOf(props.name)} />
      </td>
      <td class="py-2 text-base font-bold text-amber-950">
        {props.name}
        <Show when={props.leading}>
          <span class="ml-1.5">👑</span>
        </Show>
      </td>
      <td class="rounded-r-xl py-2 pr-4 text-right text-base font-black text-amber-950 tabular-nums">
        {props.count}
      </td>
    </tr>
  );
}

export function Scoreboard() {
  const rows = createMemo(() =>
    Object.entries(state.eaten).sort(
      ([nameA, countA], [nameB, countB]) =>
        countB - countA || nameA.localeCompare(nameB),
    ),
  );
  const topScore = () => rows()[0]?.[1] ?? 0;

  return (
    <Modal
      open={scoreboardOpen()}
      onClose={() => setScoreboardOpen(false)}
      title={`🏆 ${t("scoreboard.title")}`}
    >
      <Show when={rows().length > 0} fallback={<EmptyScoreboard />}>
        <div class="overflow-y-auto">
          <table class="w-full border-separate border-spacing-y-1">
            <tbody>
              <For each={rows()}>
                {([name, count], i) => (
                  <ScoreRow
                    rank={i() + 1}
                    name={name}
                    count={count}
                    leading={count === topScore()}
                  />
                )}
              </For>
            </tbody>
          </table>
        </div>
      </Show>
    </Modal>
  );
}
