import {For, Show} from "solid-js";
import {Portal} from "solid-js/web";

// A kiosk touchscreen has no OS keyboard, so forms bring this one instead, and
// set inputmode="none" to keep the browser from offering its own. The min-width
// excludes phones and tablets: their native keyboard beats this one.
//
// Sniffing pointers is not enough: under X11 the core pointer makes Chromium
// report any-pointer:fine even on a panel with no mouse attached, so the kiosk
// launcher says so outright with ?kiosk in the URL.
export const TOUCH_ONLY =
  new URLSearchParams(window.location.search).has("kiosk") ||
  window.matchMedia(
    "(any-pointer: coarse) and (not (any-pointer: fine)) and (min-width: 64rem)",
  ).matches;

// The bar is docked to the bottom of the viewport like an OS keyboard, so it
// covers whatever sits under it. Dialogs that raise it reserve this much room
// at the bottom to stay clear, as an inline style: the backdrop pads itself
// with the `p-*` shorthand, and a `pb-*` utility loses to it at sm and up.
// 4 rows of h-16 (16rem) + 3 gap-2 (1.5rem) + p-3 top and pb-4 bottom (1.75rem).
export const KEYBOARD_HEIGHT = "20rem";

const ROWS = ["qwertyuiop", "asdfghjkl", "zxcvbnm"];

/** keys act on pointerdown with preventDefault so they never steal focus from the input */
export function Keyboard(props: {
  onKey: (ch: string) => void;
  onBackspace: () => void;
}) {
  const press = (fn: () => void) => (e: PointerEvent) => {
    e.preventDefault();
    fn();
  };
  const keyClass =
    "h-16 min-w-0 flex-1 rounded-xl bg-white text-2xl font-bold text-amber-950 shadow-sm " +
    "ring-1 ring-amber-900/10 transition select-none active:scale-95 active:bg-amber-100";

  return (
    <Portal>
      <div class="fixed inset-x-0 bottom-0 z-[60] border-t border-amber-900/15 bg-amber-50/95 p-3 pb-4 shadow-[0_-8px_32px_rgba(69,26,3,0.18)] backdrop-blur">
        <div class="mx-auto flex w-full max-w-3xl touch-none flex-col gap-2">
          <For each={ROWS}>
            {(row, i) => (
              <div class="flex gap-2" classList={{"px-8": i() === 1}}>
                <For each={[...row]}>
                  {(ch) => (
                    <button
                      type="button"
                      onPointerDown={press(() => props.onKey(ch))}
                      class={keyClass}
                    >
                      {ch}
                    </button>
                  )}
                </For>
                <Show when={i() === 2}>
                  <button
                    type="button"
                    onPointerDown={press(() => props.onBackspace())}
                    class={`${keyClass} flex-[1.6]`}
                  >
                    ⌫
                  </button>
                </Show>
              </div>
            )}
          </For>
          <div class="flex gap-2 px-24">
            <button
              type="button"
              onPointerDown={press(() => props.onKey("-"))}
              class={keyClass}
            >
              -
            </button>
            <button
              type="button"
              onPointerDown={press(() => props.onKey(" "))}
              class={`${keyClass} flex-[6]`}
            >
              ␣
            </button>
          </div>
        </div>
      </div>
    </Portal>
  );
}
