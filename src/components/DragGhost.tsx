import {Show} from "solid-js";

import {dragging, dragLabel, dragPos} from "../effects/dnd";
import {colorOf} from "../store/tosti";

import {TostiSvg} from "./TostiSvg";

export function ToastiDragGhost() {
  return (
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
  );
}
