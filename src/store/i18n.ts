import {createSignal} from "solid-js";

// Dutch is the reference: every other language is typed against its keys, so a
// forgotten or misspelled translation is a compile error rather than a blank.
const nl = {
  "app.title": "Tosti Wachtrij",
  "app.subtitle": "wiens tosti is dit? nu weet je het",
  "app.served": "gebakken",
  "app.shiftUp": "Schuif door",
  "app.clear": "Leegmaken",
  "toast.shiftedOne": "1 tosti doorgeschoven 🔥",
  "toast.shiftedMany": "{n} tostis doorgeschoven 🔥",
  "toast.nothingToShift": "Niks om door te schuiven",
  "toast.cleared": "Ijzer en wachtrij leeggemaakt",
  "toast.onIron": "{name}'s tosti staat op het ijzer 🔥",
  "toast.queued": "{name} staat in de wachtrij (#{n}) ⏳",
  "toast.ironFull": "Het ijzer is vol, even wachten ⏳",
  "toast.dequeued": "{name} uit de wachtrij gehaald",
  "toast.cancelled": "{name}'s tosti geannuleerd",
  "toast.enjoy": "Eet smakelijk, {name}! 🧀",
  "toast.personAdded": "{name} doet mee 🎉",
  "toast.personRemoved": "{name} verwijderd",
  "toast.personRenamed": "{old} heet nu {name}",
  "toast.slotsChangedOne": "Het ijzer heeft nu 1 plekje",
  "toast.slotsChangedMany": "Het ijzer heeft nu {n} plekjes",
  "toast.slotsBumpedOne": "1 tosti terug de wachtrij in ⏳",
  "toast.slotsBumpedMany": "{n} tostis terug de wachtrij in ⏳",
  "roster.title": "Wie eet er mee?",
  "roster.hint":
    "Tik op een naam en je tosti gaat op het ijzer, of in de wachtrij. Slepen kan ook.",
  "roster.emptyHint":
    "Nog geen namen — tik op Bewerken en voeg je collega’s toe.",
  "roster.chipTitle": "Tik om {name} aan te melden, of sleep op een plekje",
  "people.edit": "Bewerken",
  "people.title": "Namen beheren",
  "people.namePlaceholder": "Nieuwe naam…",
  "people.add": "Voeg toe",
  "people.rename": "Hernoem",
  "people.cancel": "Annuleren",
  "people.removeTitle": "Verwijder {name}",
  "people.empty": "Nog niemand — voeg de eerste naam toe.",
  "people.rowTitle": "Tik om {name} te hernoemen, kleur of baktijd te kiezen",
  "grill.label": "Baktijd",
  "grill.soft": "zacht",
  "grill.crispy": "knapperig",
  "grill.modalTitle": "Baktijd instellen",
  "grill.modalHint":
    "Gaat meteen in, ook voor de tosti op het ijzer. {name} krijgt dit voortaan.",
  "scoreboard.button": "Scorebord",
  "scoreboard.title": "Wie at de meeste?",
  "scoreboard.empty": "Nog geen tostis gegeten — aan de bak!",
  "config.button": "Instellen",
  "config.title": "IJzer instellen",
  "config.slots": "Hoeveel tostis passen er op het ijzer?",
  "config.slotsHint":
    "Tostis die niet meer passen gaan terug naar de wachtrij.",
  "modal.close": "Sluiten",
  "plate.hint":
    "Sleep een tosti hierheen als hij klaar is — of gebruik de groene knop.",
  "iron.free": "vrij",
  "iron.slotTitle":
    "{name} — sleep naar het bord of de wachtrij, dubbeltik voor de baktijd",
  "iron.burnt": "· verbrand! 🔥",
  "iron.ready": "· klaar! 🎉",
  "iron.take": "Pakken ✓",
  "iron.cancelAria": "{name}'s tosti annuleren",
  "iron.timeTitle": "Tik om de baktijd van {name} aan te passen",
  "iron.grilling": "aan het bakken",
  "iron.idle": "klaar voor gebruik",
  "iron.occupied": "{n}/{total} bezet",
  "queue.title": "Wachtrij",
  "queue.countOne": "1 wachtende",
  "queue.countMany": "{n} wachtenden",
  "queue.empty": "leeg",
  "queue.tapHint": "tik → ijzer",
  "queue.cardTitle": "{name} — tik om op het ijzer te leggen",
  "error.invalid-name": "Naam moet 1 tot {max} tekens zijn",
  "error.invalid-color": "Ongeldige kleur",
  "error.duplicate": "Die naam staat er al bij",
  "error.save-failed": "Opslaan mislukt",
  "error.not-found": "Die naam bestaat niet meer",
  "error.offline": "Server niet bereikbaar",
};

export type TranslationKey = keyof typeof nl;

const en: Record<TranslationKey, string> = {
  "app.title": "Toastie Queue",
  "app.subtitle": "whose toastie is this? now you know",
  "app.served": "grilled",
  "app.shiftUp": "Shift up",
  "app.clear": "Clear all",
  "toast.shiftedOne": "1 toastie moved up 🔥",
  "toast.shiftedMany": "{n} toasties moved up 🔥",
  "toast.nothingToShift": "Nothing to shift up",
  "toast.cleared": "Iron and queue cleared",
  "toast.onIron": "{name}'s toastie is on the iron 🔥",
  "toast.queued": "{name} joined the queue (#{n}) ⏳",
  "toast.ironFull": "The iron is full, hang tight ⏳",
  "toast.dequeued": "{name} removed from the queue",
  "toast.cancelled": "{name}'s toastie cancelled",
  "toast.enjoy": "Enjoy, {name}! 🧀",
  "toast.personAdded": "{name} joined 🎉",
  "toast.personRemoved": "{name} removed",
  "toast.personRenamed": "{old} is now {name}",
  "toast.slotsChangedOne": "The iron now has 1 slot",
  "toast.slotsChangedMany": "The iron now has {n} slots",
  "toast.slotsBumpedOne": "1 toastie back to the queue ⏳",
  "toast.slotsBumpedMany": "{n} toasties back to the queue ⏳",
  "roster.title": "Who's eating?",
  "roster.hint":
    "Tap a name to put a toastie on the iron, or in the queue. Dragging works too.",
  "roster.emptyHint": "No names yet — hit Edit and add your crew.",
  "roster.chipTitle": "Tap to sign {name} up, or drag onto a slot",
  "people.edit": "Edit",
  "people.title": "Manage names",
  "people.namePlaceholder": "New name…",
  "people.add": "Add",
  "people.rename": "Rename",
  "people.cancel": "Cancel",
  "people.removeTitle": "Remove {name}",
  "people.empty": "Nobody yet — add the first name.",
  "people.rowTitle": "Tap to rename {name}, pick a color or grill time",
  "grill.label": "Grill time",
  "grill.soft": "soft",
  "grill.crispy": "crispy",
  "grill.modalTitle": "Set the grill time",
  "grill.modalHint":
    "Applies right away, also to the toastie on the iron. {name} keeps this from now on.",
  "scoreboard.button": "Scoreboard",
  "scoreboard.title": "Who ate the most?",
  "scoreboard.empty": "No toasties eaten yet — get grilling!",
  "config.button": "Set up",
  "config.title": "Iron setup",
  "config.slots": "How many toasties fit on the iron?",
  "config.slotsHint": "Toasties that no longer fit go back to the queue.",
  "modal.close": "Close",
  "plate.hint":
    "Drag a toastie here when it is done — or use the green button.",
  "iron.free": "free",
  "iron.slotTitle":
    "{name} — drag to the plate or the queue, double tap for the grill time",
  "iron.burnt": "· burnt! 🔥",
  "iron.ready": "· done! 🎉",
  "iron.take": "Take ✓",
  "iron.cancelAria": "Cancel {name}'s toastie",
  "iron.timeTitle": "Tap to change {name}'s grill time",
  "iron.grilling": "grilling",
  "iron.idle": "ready to go",
  "iron.occupied": "{n}/{total} in use",
  "queue.title": "Queue",
  "queue.countOne": "1 waiting",
  "queue.countMany": "{n} waiting",
  "queue.empty": "empty",
  "queue.tapHint": "tap → iron",
  "queue.cardTitle": "{name} — tap to put on the iron",
  "error.invalid-name": "Name must be 1 to {max} characters",
  "error.invalid-color": "Invalid color",
  "error.duplicate": "That name is already on the list",
  "error.save-failed": "Could not save",
  "error.not-found": "That name no longer exists",
  "error.offline": "Server unreachable",
};

const translations = {nl, en};

export type Lang = keyof typeof translations;

const LANG_KEY = "toastie-lang";

const stored = localStorage.getItem(LANG_KEY);
const [lang, setLangSignal] = createSignal<Lang>(
  stored && stored in translations ? (stored as Lang) : "en",
);
export {lang};

export function setLang(next: Lang) {
  setLangSignal(next);
  localStorage.setItem(LANG_KEY, next);
}

export function t(
  key: TranslationKey,
  params?: Record<string, string | number>,
): string {
  let text = translations[lang()][key];
  if (params) {
    for (const [name, value] of Object.entries(params)) {
      text = text.replaceAll(`{${name}}`, String(value));
    }
  }
  return text;
}
