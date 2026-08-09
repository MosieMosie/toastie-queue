import {For} from "solid-js";

import {PALETTE} from "../../store/tosti";

export function ColorPicker(props: {
  color: string;
  onPick: (color: string) => void;
}) {
  return (
    <div class="flex flex-wrap items-center gap-2 px-1 py-0.5">
      <For each={PALETTE}>
        {(c) => (
          <button
            type="button"
            onClick={() => props.onPick(c)}
            class="h-7 w-7 rounded-full transition active:scale-90"
            classList={{
              "ring-2 ring-offset-2 ring-amber-950": props.color === c,
            }}
            style={{"background-color": c}}
            title={c}
          />
        )}
      </For>
    </div>
  );
}
