import {JSX, Show} from "solid-js";

import {t} from "../../store/i18n";
import {KEYBOARD_HEIGHT} from "../people/Keyboard";

export function Modal(props: {
  open: boolean;
  onClose: () => void;
  title: string;
  /** reserve room for the docked on-screen keyboard so it cannot cover the dialog */
  keyboard?: boolean;
  /** widen past the usual reading width, for dialogs laid out in columns */
  wide?: boolean;
  children: JSX.Element;
}) {
  return (
    <Show when={props.open}>
      <div
        class="fixed inset-0 z-50 flex items-center justify-center bg-amber-950/50 p-3 sm:p-6"
        style={props.keyboard ? {"padding-bottom": KEYBOARD_HEIGHT} : undefined}
        onClick={() => props.onClose()}
      >
        <div
          role="dialog"
          aria-modal="true"
          aria-label={props.title}
          class="pop-in flex max-h-[90%] w-full flex-col rounded-3xl bg-white p-4 shadow-2xl sm:p-5"
          classList={{"max-w-md": !props.wide, "max-w-4xl": props.wide}}
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
