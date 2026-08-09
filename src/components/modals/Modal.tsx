import {JSX, Show} from "solid-js";

import {t} from "../../store/i18n";

export function Modal(props: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: JSX.Element;
}) {
  return (
    <Show when={props.open}>
      <div
        class="fixed inset-0 z-50 flex items-center justify-center bg-amber-950/50 p-3 sm:p-6"
        onClick={() => props.onClose()}
      >
        <div
          role="dialog"
          aria-modal="true"
          aria-label={props.title}
          class="pop-in flex max-h-[90dvh] w-full max-w-md flex-col rounded-3xl bg-white p-4 shadow-2xl sm:p-5"
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
