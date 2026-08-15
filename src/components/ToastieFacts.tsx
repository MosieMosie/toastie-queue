import {createSignal, onCleanup, onMount} from "solid-js";

import {TOASTIE_FACTS} from "../content/toastieFacts";
import {lang} from "../store/i18n";

import {FaceKind} from "./toastie/faces";
import {ToastieSvg} from "./toastie/ToastieSvg";

const FACT_FACES: readonly FaceKind[] = [
  "happy",
  "content",
  "shocked",
  "smug",
  "woozy",
];

const LABELS = {
  en: {
    title: "Toastie fact of the day",
    refresh: "New at midnight",
  },
  nl: {
    title: "Tosti-feit van de dag",
    refresh: "Nieuw om middernacht",
  },
} as const;

function localDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function hash(value: string) {
  let result = 2166136261;
  for (let i = 0; i < value.length; i++) {
    result ^= value.charCodeAt(i);
    result = Math.imul(result, 16777619);
  }
  return result >>> 0;
}

export function ToastieFacts() {
  const [dateKey, setDateKey] = createSignal(localDateKey(new Date()));

  onMount(() => {
    let timer: number;

    function scheduleNextDay() {
      const now = new Date();
      const nextMidnight = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + 1,
      );

      timer = window.setTimeout(
        () => {
          setDateKey(localDateKey(new Date()));
          scheduleNextDay();
        },
        nextMidnight.getTime() - now.getTime() + 100,
      );
    }

    scheduleNextDay();
    onCleanup(() => window.clearTimeout(timer));
  });

  const factIndex = () => hash(`${dateKey()}:fact`) % TOASTIE_FACTS.en.length;
  const face = () => FACT_FACES[hash(`${dateKey()}:face`) % FACT_FACES.length];
  const copy = () => LABELS[lang()];

  return (
    <section
      class="mt-2 flex max-w-2xl flex-none items-center gap-2.5 self-start"
      aria-labelledby="toastie-fact-title"
    >
      <ToastieSvg
        doneness={0.9}
        face={face()}
        class="h-16 w-16 flex-none -rotate-3 drop-shadow-md"
      />
      <div class="relative rounded-2xl border border-amber-900/10 bg-white/90 px-3.5 py-2 shadow-sm">
        <span
          aria-hidden="true"
          class="absolute top-1/2 -left-2 h-4 w-4 -translate-y-1/2 rotate-45 border-b border-l border-amber-900/10 bg-white"
        />
        <div class="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
          <h2
            id="toastie-fact-title"
            class="text-[10px] leading-tight font-black tracking-[0.12em] text-amber-700 uppercase"
          >
            {copy().title}
          </h2>
          <span class="text-[9px] leading-tight font-bold text-amber-900/40">
            {copy().refresh}
          </span>
        </div>
        <p class="mt-0.5 text-xs leading-snug font-semibold text-amber-950/80 sm:text-[13px]">
          {TOASTIE_FACTS[lang()][factIndex()]}
        </p>
      </div>
    </section>
  );
}
