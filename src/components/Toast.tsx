import {Show} from "solid-js";

import {toastMessage} from "../effects/toast";

import {TostiSvg} from "./TostiSvg";

export function Toast() {
  return (
    <Show when={toastMessage()} keyed>
      {(msg) => (
        <div class="pointer-events-none fixed inset-x-0 bottom-4 flex justify-center px-3 sm:bottom-6 sm:px-6">
          <div class="toast-in flex items-center gap-3 rounded-full bg-amber-950 px-5 py-3 text-base font-black text-amber-50 shadow-2xl ring-4 ring-amber-950/15 sm:px-8 sm:py-4 sm:text-xl">
            <TostiSvg doneness={1} class="h-7 shrink-0 sm:h-9" />
            {msg.text}
          </div>
        </div>
      )}
    </Show>
  );
}
