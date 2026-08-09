import {toast} from "../effects/toast";
import {lang, setLang, t} from "../store/i18n";
import {clearAll, fillIron, freeSlot, state} from "../store/store";

import {btnPrimary, btnSecondary} from "./buttons";
import {setConfigOpen} from "./modals/ConfigModal";
import {setPeopleOpen} from "./modals/PeopleModal";
import {setScoreboardOpen} from "./modals/Scoreboard";
import {ToastieSvg} from "./toastie/ToastieSvg";

function shiftUp() {
  const moved = fillIron();
  toast(
    moved === 0 ? t("toast.nothingToShift")
    : moved === 1 ? t("toast.shiftedOne")
    : t("toast.shiftedMany", {n: moved}),
  );
}

export function Header() {
  const canShiftUp = () => freeSlot() >= 0 && state.queue.length > 0;

  return (
    <header class="flex flex-none flex-wrap items-center justify-between gap-2 px-3 py-2.5 sm:gap-3 sm:px-5 sm:py-3">
      <div class="flex items-center gap-2.5">
        <ToastieSvg doneness={0.95} class="h-9 drop-shadow-sm" />
        <div>
          <h1 class="text-xl leading-none font-black tracking-tight">
            {t("app.title")}
          </h1>
          <p class="text-[11px] font-semibold text-amber-900/60">
            {t("app.subtitle")}
          </p>
        </div>
      </div>

      <div class="flex flex-wrap items-center gap-1.5 sm:gap-2">
        <div class="rounded-2xl bg-white px-3 py-1 text-center shadow-sm ring-1 ring-amber-900/10">
          <div class="text-base leading-none font-black">{state.served}</div>
          <div class="text-[9px] font-bold tracking-wide text-amber-900/50 uppercase">
            {t("app.served")}
          </div>
        </div>
        <button
          type="button"
          onClick={shiftUp}
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
          onClick={() => setConfigOpen(true)}
          class={btnSecondary}
          title={t("config.title")}
        >
          ⚙️ {t("config.button")}
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
  );
}
