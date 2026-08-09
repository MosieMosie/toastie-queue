import {createSignal} from "solid-js";

import {t} from "../store/i18n";
import {canDrop, DragRef, drop, DropTarget} from "../store/store";

import {toast} from "./toast";

const DRAG_THRESHOLD = 8;
const DOUBLE_TAP_MS = 350;
// two taps of a finger land further apart than two clicks of a mouse
const DOUBLE_TAP_SLOP = 24;

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
 * native HTML5 drag events are not an option: they never fire for touch, and
 * the primary device is a touchscreen.
 *
 * Callers must add `touch-none select-none` to the element, otherwise the
 * browser scrolls the page instead of handing us the move events.
 *
 * A single tap fires straight away rather than waiting out the double-tap
 * window, so an element passing both onTap and onDoubleTap gets onTap twice.
 */
export function draggable(opts: {
  ref: () => DragRef;
  label: () => string;
  onTap?: () => void;
  onDoubleTap?: () => void;
}) {
  let lastTap = {at: 0, x: 0, y: 0};

  function tapped(ev: PointerEvent) {
    const at = Date.now();
    const quick = at - lastTap.at < DOUBLE_TAP_MS;
    const close =
      Math.hypot(ev.clientX - lastTap.x, ev.clientY - lastTap.y) <
      DOUBLE_TAP_SLOP;

    if (opts.onDoubleTap && quick && close) {
      // a third tap starts a fresh pair instead of firing again
      lastTap = {at: 0, x: 0, y: 0};
      opts.onDoubleTap();
      return;
    }
    lastTap = {at, x: ev.clientX, y: ev.clientY};
    opts.onTap?.();
  }

  const onPointerDown = (e: PointerEvent) => {
    if (e.pointerType === "mouse" && e.button !== 0) {
      return;
    }
    // a press on a button inside the card belongs to that button
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
        tapped(ev);
      } else {
        const target = targetAt(ev.clientX, ev.clientY);
        const ref = dragging();
        if (target && ref && canDrop(ref, target) && drop(ref, target)) {
          const name = dragLabel();
          if (target.kind === "plate") {
            toast(t("toast.enjoy", {name}));
          } else if (target.kind === "iron" && ref.from !== "iron") {
            toast(t("toast.onIron", {name}));
          }
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
    onContextMenu: (e: MouseEvent) => e.preventDefault(),
  };
}

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
