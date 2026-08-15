import {createEffect, createMemo, createSignal, onCleanup} from "solid-js";

import {pendingAd, setPendingAd} from "../../effects/ad";
import {toast} from "../../effects/toast";
import {lang, t} from "../../store/i18n";
import {drop, state} from "../../store/store";
import {btnPrimary} from "../buttons";
import {ToastieSvg} from "../toastie/ToastieSvg";

import {Modal} from "./Modal";

const ADS = {
  en: [
    {
      brand: "ToastVPN",
      headline: "Hide your browsing history. Reveal your sandwich filling.",
      body: "Now with military-grade crumb encryption and absolutely no useful features.",
      action: "Protect my crumbs",
      color: "from-sky-500 to-indigo-600",
    },
    {
      brand: "CrumbCloud Pro",
      headline: "Your crumbs. On every device.",
      body: "Seamlessly sync desk crumbs, keyboard crumbs and mysterious pocket crumbs.",
      action: "Start crumbing",
      color: "from-fuchsia-500 to-rose-500",
    },
    {
      brand: "CheeseCoin",
      headline: "The future of finance is suspiciously melty.",
      body: "One hundred percent dairy-backed. Zero percent financially responsible.",
      action: "Invest irresponsibly",
      color: "from-amber-400 to-orange-600",
    },
    {
      brand: "BreadIn Premium",
      headline: "Network with ambitious slices near you.",
      body: "Add Open to Toastie to your profile and endorse coworkers for Advanced Buttering.",
      action: "Grow my crustwork",
      color: "from-blue-600 to-cyan-500",
    },
    {
      brand: "Tosti+ Ultra",
      headline: "Upgrade now to remove fake ads like this one.",
      body: "Premium users also receive priority cheese pulls and a completely imaginary badge.",
      action: "Waste company money",
      color: "from-lime-500 to-emerald-600",
    },
  ],
  nl: [
    {
      brand: "TostiVPN",
      headline: "Verberg je browsegeschiedenis. Toon je tosti-vulling.",
      body: "Nu met militaire kruimelversleuteling en absoluut geen nuttige functies.",
      action: "Bescherm mijn kruimels",
      color: "from-sky-500 to-indigo-600",
    },
    {
      brand: "KruimelCloud Pro",
      headline: "Jouw kruimels. Op ieder apparaat.",
      body: "Synchroniseer bureaukruimels, toetsenbordkruimels en mysterieuze zakkruimels.",
      action: "Begin met kruimelen",
      color: "from-fuchsia-500 to-rose-500",
    },
    {
      brand: "KaasCoin",
      headline: "De toekomst van geld is verdacht gesmolten.",
      body: "Honderd procent gedekt door zuivel. Nul procent financieel verantwoord.",
      action: "Investeer onverstandig",
      color: "from-amber-400 to-orange-600",
    },
    {
      brand: "BroodIn Premium",
      headline: "Netwerk met ambitieuze boterhammen bij jou in de buurt.",
      body: "Zet Open voor Tosti op je profiel en onderschrijf collega's voor Gevorderd Boteren.",
      action: "Vergroot mijn korstwerk",
      color: "from-blue-600 to-cyan-500",
    },
    {
      brand: "Tosti+ Ultra",
      headline: "Upgrade nu om nep-advertenties zoals deze te verwijderen.",
      body: "Premiumleden krijgen ook voorrang op cheese pulls en een compleet denkbeeldige badge.",
      action: "Verspil bedrijfsgeld",
      color: "from-lime-500 to-emerald-600",
    },
  ],
} as const;

function hash(value: string) {
  let result = 0;
  for (let i = 0; i < value.length; i++) {
    result = (result * 31 + value.charCodeAt(i)) | 0;
  }
  return Math.abs(result);
}

export function AdBreak() {
  const [remaining, setRemaining] = createSignal(3);
  const adIndex = () => hash(pendingAd()?.id ?? "") % ADS[lang()].length;
  const ad = createMemo(() => ADS[lang()][adIndex()]);

  createEffect(() => {
    if (!pendingAd()) {
      return;
    }

    setRemaining(3);
    const timer = window.setInterval(() => {
      setRemaining((seconds) => {
        if (seconds <= 1) {
          window.clearInterval(timer);
          return 0;
        }
        return seconds - 1;
      });
    }, 1000);
    onCleanup(() => window.clearInterval(timer));
  });

  function releaseToastie() {
    const waiting = pendingAd();
    if (!waiting || remaining() > 0) {
      return;
    }

    const slot = state.iron.findIndex((item) => item?.id === waiting.id);
    const current = slot >= 0 ? state.iron[slot] : null;
    if (!current || current.placedAt !== waiting.placedAt) {
      toast(t("ad.unavailable"));
      setPendingAd(null);
      return;
    }

    if (drop({from: "iron", slot}, {kind: "plate"}, waiting.takenAt)) {
      toast(t("toast.enjoy", {name: current.person}));
    }
    setPendingAd(null);
  }

  return (
    <Modal
      open={pendingAd() !== null}
      onClose={() => setPendingAd(null)}
      title={t("ad.title")}
    >
      <div class="overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-50 shadow-inner">
        <div class={`bg-gradient-to-br ${ad().color} p-4 text-white`}>
          <div class="flex items-start justify-between gap-3">
            <div>
              <p class="text-[9px] font-black tracking-[0.14em] text-white/70 uppercase">
                {t("ad.sponsored")}
              </p>
              <p class="mt-2 text-xl font-black">{ad().brand}</p>
              <p class="mt-1 text-base leading-tight font-black">
                {ad().headline}
              </p>
            </div>
            <ToastieSvg
              doneness={1.1}
              face="smug"
              class="h-20 w-20 flex-none rotate-6 drop-shadow-lg"
            />
          </div>
          <p class="mt-3 text-xs leading-relaxed font-semibold text-white/85">
            {ad().body}
          </p>
          <span class="mt-3 inline-flex rounded-full bg-white/20 px-3 py-1.5 text-[10px] font-black ring-1 ring-white/30">
            {ad().action} →
          </span>
        </div>
      </div>

      <button
        type="button"
        onClick={releaseToastie}
        disabled={remaining() > 0}
        class={`${btnPrimary} mt-3 w-full disabled:cursor-wait`}
      >
        {remaining() > 0 ?
          t("ad.wait", {n: remaining()})
        : t("ad.claim", {name: pendingAd()?.person ?? ""})}
      </button>
    </Modal>
  );
}
