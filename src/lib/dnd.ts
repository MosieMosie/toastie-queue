import {createSignal} from "solid-js";

import {canDrop, DragRef, drop, DropTarget} from "../store/store";

const DRAG_THRESHOLD = 8;

const [dragging, setDragging] = createSignal<DragRef | null>(null);
const [dragLabel, setDragLabel] = createSignal("");
const [dragPos, setDragPos] = createSignal<{x: number; y: number} | null>(null);
const [hoverKey, setHoverKey] = createSignal<string | null>(null);

export {dragging, dragLabel, dragPos};

const keyOf = (target: DropTarget) => JSON.stringify(target);

function targetAt(x: number, y: number): DropTarget | null {
  const host = document
    .elementFromPoint(x, y)
    ?.closest<HTMLElement>("[data-drop]");
  if (!host?.dataset.drop) {
    return null;
  }
  try {
    return JSON.parse(host.dataset.drop) as DropTarget;
  } catch {
    return null;
  }
}

function reset() {
  setDragging(null);
  setDragPos(null);
  setHoverKey(null);
  setDragLabel("");
}

/**
 * Pointer-based dragging, so finger and mouse take the same code path. The
 * native HTML5 drag events are not usable here: they never fire for touch, and
 * this thing lives on a touchscreen in the kitchen.
 *
 * Callers must add `touch-none select-none` to the element, otherwise the
 * browser scrolls the page instead of handing us the move events.
 */
export function draggable(opts: {
  ref: () => DragRef;
  label: () => string;
  onTap?: () => void;
}) {
  const onPointerDown = (e: PointerEvent) => {
    if (e.pointerType === "mouse" && e.button !== 0) {
      return;
    }
    // a press on a button inside the card belongs to that button, not to us:
    // otherwise tapping ✕ would also fire the card's own onTap
    if ((e.target as HTMLElement | null)?.closest?.("button")) {
      return;
    }
    const startX = e.clientX;
    const startY = e.clientY;
    let started = false;

    const onMove = (ev: PointerEvent) => {
      if (ev.pointerId !== e.pointerId) {
        return;
      }
      if (!started) {
        if (
          Math.hypot(ev.clientX - startX, ev.clientY - startY) < DRAG_THRESHOLD
        ) {
          return;
        }
        started = true;
        setDragging(opts.ref());
        setDragLabel(opts.label());
      }
      setDragPos({x: ev.clientX, y: ev.clientY});
      const target = targetAt(ev.clientX, ev.clientY);
      const ref = dragging();
      setHoverKey(target && ref && canDrop(ref, target) ? keyOf(target) : null);
    };

    const onUp = (ev: PointerEvent) => {
      if (ev.pointerId !== e.pointerId) {
        return;
      }
      detach();
      if (!started) {
        opts.onTap?.();
      } else {
        const target = targetAt(ev.clientX, ev.clientY);
        const ref = dragging();
        if (target && ref && canDrop(ref, target)) {
          drop(ref, target);
        }
      }
      reset();
    };

    const onCancel = () => {
      detach();
      reset();
    };

    function detach() {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onCancel);
    }

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onCancel);
  };

  return {
    onPointerDown,
    // a long press on touch otherwise pops the context menu mid-drag
    onContextMenu: (e: MouseEvent) => e.preventDefault(),
  };
}

/**
 * A place a tosti can land. `key` goes on the element as `data-drop` so the
 * pointer hit-test can find it; `over` and `active` drive the highlighting.
 */
export function dropZone(target: () => DropTarget) {
  const key = () => keyOf(target());
  return {
    key,
    over: () => hoverKey() === key(),
    active: () => {
      const ref = dragging();
      return ref !== null && canDrop(ref, target());
    },
  };
}
