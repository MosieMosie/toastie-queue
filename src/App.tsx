import {Component, Show} from "solid-js";

import {Iron} from "./components/Iron";
import {PeopleModal, setPeopleOpen} from "./components/PeopleModal";
import {Queue} from "./components/Queue";
import {Plate, Roster} from "./components/Roster";
import {Scoreboard, setScoreboardOpen} from "./components/Scoreboard";
import {TostiSvg} from "./components/TostiSvg";
import {btnPrimary, btnSecondary} from "./components/ui";
import {dragging, dragLabel, dragPos} from "./lib/dnd";
import {toast, toastMessage} from "./lib/toast";
import {lang, setLang, t} from "./store/i18n";
import {clearAll, fillIron, freeSlot, state} from "./store/store";
import {colorOf} from "./store/tosti";

const App: Component = () => {
  const canShiftUp = () => freeSlot() >= 0 && state.queue.length > 0;

  return (
    <div class="flex min-h-screen flex-col bg-[radial-gradient(circle_at_top,#fff9ec,#f6e6c8)] text-amber-950 lg:h-screen lg:overflow-hidden">
      <header class="flex flex-none flex-wrap items-center justify-between gap-3 px-5 py-3">
        <div class="flex items-center gap-2.5">
          <TostiSvg doneness={0.95} class="h-9 drop-shadow-sm" />
          <div>
            <h1 class="text-xl leading-none font-black tracking-tight">
              {t("app.title")}
            </h1>
            <p class="text-[11px] font-semibold text-amber-900/60">
              {t("app.subtitle")}
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <div class="rounded-2xl bg-white px-3 py-1 text-center shadow-sm ring-1 ring-amber-900/10">
            <div class="text-base leading-none font-black">{state.served}</div>
            <div class="text-[9px] font-bold tracking-wide text-amber-900/50 uppercase">
              {t("app.served")}
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              const moved = fillIron();
              toast(
                moved === 0 ? t("toast.nothingToShift")
                : moved === 1 ? t("toast.shiftedOne")
                : t("toast.shiftedMany", {n: moved}),
              );
            }}
            disabled={!canShiftUp()}
            class={btnPrimary}
          >
            {t("app.shiftUp")}
          </button>
          <button
            type="button"
            onClick={() => {
              clearAll();
              toast(t("toast.cleared"));
            }}
            class={btnSecondary}
          >
            {t("app.clear")}
          </button>
          <button
            type="button"
            onClick={() => setPeopleOpen(true)}
            class={btnSecondary}
          >
            {t("people.edit")}
          </button>
          <button
            type="button"
            onClick={() => setScoreboardOpen(true)}
            class={btnSecondary}
          >
            🏆 {t("scoreboard.button")}
          </button>
          <button
            type="button"
            onClick={() => setLang(lang() === "nl" ? "en" : "nl")}
            class={`${btnSecondary} uppercase`}
            title={
              lang() === "nl" ? "Switch to English" : "Wissel naar Nederlands"
            }
          >
            {lang() === "nl" ? "EN" : "NL"}
          </button>
        </div>
      </header>

      {/* the queue scrolls internally; the page itself never scrolls on the big screen */}
      <main class="grid min-h-0 flex-1 gap-5 px-5 pb-5 lg:grid-cols-[minmax(0,44rem)_minmax(0,1fr)]">
        <Iron />
        <aside class="flex min-h-0 flex-col gap-4">
          <Roster />
          <Plate />
          <Queue />
        </aside>
      </main>

      <Show when={dragging() && dragPos()}>
        <div
          class="pointer-events-none fixed z-50 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1"
          style={{left: `${dragPos()!.x}px`, top: `${dragPos()!.y}px`}}
        >
          <TostiSvg doneness={0.55} class="h-16 drop-shadow-2xl" />
          <span
            class="rounded-full px-3 py-0.5 text-sm font-bold text-white shadow-lg"
            style={{"background-color": colorOf(dragLabel())}}
          >
            {dragLabel()}
          </span>
        </div>
      </Show>

      <PeopleModal />
      <Scoreboard />

      <Show when={toastMessage()} keyed>
        {(msg) => (
          <div class="pointer-events-none fixed inset-x-0 bottom-6 flex justify-center px-6">
            <div class="toast-in flex items-center gap-3 rounded-full bg-amber-950 px-8 py-4 text-xl font-black text-amber-50 shadow-2xl ring-4 ring-amber-950/15">
              <TostiSvg doneness={1} class="h-9 shrink-0" />
              {msg.text}
            </div>
          </div>
        )}
      </Show>
    </div>
  );
};

export default App;
