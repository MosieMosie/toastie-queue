import {For, Show} from "solid-js";

// a touchscreen kiosk has no OS keyboard, so forms bring this one instead;
// also drives inputmode="none" so a phone's native keyboard doesn't fight it
export const TOUCH_ONLY = window.matchMedia(
  "(any-pointer: coarse) and (not (any-pointer: fine))",
).matches;

const ROWS = ["qwertyuiop", "asdfghjkl", "zxcvbnm"];

/**
 * In-app keyboard for touchscreens that have no OS keyboard (the kitchen
 * kiosk). Keys act on pointerdown with preventDefault so they never steal
 * focus from the input.
 */
export function Keyboard(props: {
  onKey: (ch: string) => void;
  onBackspace: () => void;
}) {
  const press = (fn: () => void) => (e: PointerEvent) => {
    e.preventDefault();
    fn();
  };
  const keyClass =
    "h-11 min-w-0 flex-1 rounded-lg bg-white text-base font-bold text-amber-950 shadow-sm " +
    "ring-1 ring-amber-900/10 transition select-none active:scale-95 active:bg-amber-100";

  return (
    <div class="flex w-full max-w-md touch-none flex-col gap-1">
      <For each={ROWS}>
        {(row, i) => (
          <div class="flex gap-1" classList={{"px-4": i() === 1}}>
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
      <div class="flex gap-1 px-12">
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
          class={`${keyClass} flex-[4]`}
        >
          ␣
        </button>
      </div>
    </div>
  );
}
