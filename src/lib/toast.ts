import {createSignal} from "solid-js";

const [message, setMessage] = createSignal<{text: string; key: number} | null>(
  null,
);

let timer: ReturnType<typeof setTimeout> | undefined;
let key = 0;

export function toast(text: string) {
  clearTimeout(timer);
  setMessage({text, key: key++});
  timer = setTimeout(() => setMessage(null), 2800);
}

export {message as toastMessage};
