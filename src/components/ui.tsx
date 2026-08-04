import {JSX, Show} from "solid-js";

import {t} from "../store/i18n";

/** the standard pill buttons used in the header and the modals */
const btn =
  "h-10 rounded-full px-4 text-sm font-bold shadow-sm transition active:scale-95";
export const btnPrimary = `${btn} bg-amber-900 text-amber-50 disabled:opacity-30`;
export const btnSecondary = `${btn} bg-white text-amber-900/70 ring-1 ring-amber-900/10`;

/** the colored initial circle used on chips, list rows and the scoreboard */
export function Avatar(props: {name: string; color: string}) {
  return (
    <span
      class="grid h-8 w-8 shrink-0 place-items-center rounded-full text-sm font-black text-white"
      style={{"background-color": props.color}}
    >
      {props.name.slice(0, 1).toUpperCase()}
    </span>
  );
}

/** centered dialog with title + close button; closes on backdrop tap too */
export function Modal(props: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: JSX.Element;
}) {
  return (
    <Show when={props.open}>
      <div
        class="fixed inset-0 z-50 flex items-center justify-center bg-amber-950/50 p-6"
        onClick={() => props.onClose()}
      >
        <div
          role="dialog"
          aria-modal="true"
          aria-label={props.title}
          class="pop-in flex max-h-[90vh] w-full max-w-md flex-col rounded-3xl bg-white p-5 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div class="mb-3 flex items-center justify-between">
            <h2 class="text-lg font-black text-amber-950">{props.title}</h2>
            <button
              type="button"
              onClick={() => props.onClose()}
              class="grid h-10 w-10 place-items-center rounded-full bg-amber-900/5 text-lg text-amber-900/60 transition active:scale-90 active:bg-amber-900/15"
              aria-label={t("modal.close")}
            >
              ✕
            </button>
          </div>
          {props.children}
        </div>
      </div>
    </Show>
  );
}
