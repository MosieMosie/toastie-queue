import {createSignal} from "solid-js";

const [message, setMessage] = createSignal<{text: string; key: number} | null>(
  null,
);

const VISIBLE_MS = 2800;

let timer: ReturnType<typeof setTimeout> | undefined;
// a fresh key restarts the slide-in animation when two toasts follow each other
let key = 0;

export function toast(text: string) {
  clearTimeout(timer);
  setMessage({text, key: key++});
  timer = setTimeout(() => setMessage(null), VISIBLE_MS);
}

export {message as toastMessage};
