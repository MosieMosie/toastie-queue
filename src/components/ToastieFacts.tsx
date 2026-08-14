import {createSignal, onCleanup, onMount} from "solid-js";

import {lang} from "../store/i18n";

import {FaceKind} from "./toastie/faces";
import {ToastieSvg} from "./toastie/ToastieSvg";

const FACTS = {
  en: [
    "Grated cheese melts more evenly because the smaller pieces have more surface area.",
    "That golden-brown crunch comes from the Maillard reaction between heat, sugars and proteins.",
    "Letting a toastie rest for one minute helps the cheese settle before the first bite.",
    "A preheated iron crisps the bread quickly, before the middle has time to dry out.",
    "Steam softens toast, so leave a finished toastie uncovered if you want it to stay crisp.",
    "A thin, even layer of butter helps the whole surface brown instead of only a few patches.",
    "Cheese melts from the outside in, which is why thin slices beat one big chunk.",
    "Pickles taste great in a toastie because their acidity balances the richness of melted cheese.",
    "Cutting a toastie diagonally exposes more of its glorious melted-cheese cross-section.",
    "Mixing a bold cheese with a mild melty one gives you both flavour and a better cheese pull.",
    "Bread stays crispest when the filling is not too wet and reaches right to the edges.",
    "The smell of a hot toastie travels easily because warmth releases more aroma molecules.",
  ],
  nl: [
    "Geraspte kaas smelt gelijkmatiger doordat de kleine stukjes samen meer oppervlak hebben.",
    "Dat goudbruine korstje ontstaat door de Maillardreactie tussen hitte, suikers en eiwitten.",
    "Laat een tosti een minuut rusten, dan kan de kaas even tot bedaren komen voor de eerste hap.",
    "Een voorverwarmd ijzer maakt het brood snel krokant voordat de binnenkant uitdroogt.",
    "Stoom maakt toast zacht, dus laat een verse tosti onbedekt als hij krokant moet blijven.",
    "Een dun, gelijkmatig laagje boter laat de hele buitenkant bruinen in plaats van losse plekjes.",
    "Kaas smelt van buiten naar binnen; dunne plakjes werken daarom beter dan een groot blok.",
    "Augurk past goed in een tosti omdat het zuur de volle smaak van gesmolten kaas in balans brengt.",
    "Een diagonale snede laat extra veel van die glorieuze gesmolten-kaasdoorsnede zien.",
    "Combineer een pittige kaas met een milde smeltkaas voor veel smaak en een betere cheese pull.",
    "Brood blijft het krokantst als de vulling niet te nat is en netjes tot aan de randen komt.",
    "De geur van een hete tosti verspreidt zich snel doordat warmte meer aromamoleculen vrijlaat.",
  ],
} as const;

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

  const factIndex = () => hash(`${dateKey()}:fact`) % FACTS.en.length;
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
          {FACTS[lang()][factIndex()]}
        </p>
      </div>
    </section>
  );
}
