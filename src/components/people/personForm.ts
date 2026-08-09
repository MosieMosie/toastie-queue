import {createMemo, createSignal} from "solid-js";

import {toast} from "../../effects/toast";
import {t} from "../../store/i18n";
import {
  addPerson,
  removePerson,
  renamePerson,
  setPersonGrill,
} from "../../store/store";
import {
  DEFAULT_GRILL_SECONDS,
  NAME_MAX,
  PALETTE,
  people,
  Person,
  personOf,
} from "../../store/toastie";

export type PersonForm = ReturnType<typeof createPersonForm>;

/**
 * The editing state behind the people dialog: which person is being renamed and
 * the values typed so far. The list and the form both act on it.
 */
export function createPersonForm() {
  const [renaming, setRenaming] = createSignal<string | null>(null);
  const [name, setName] = createSignal("");
  const [picked, setPicked] = createSignal<string | null>(null);
  const [freshGrill, setFreshGrill] = createSignal(DEFAULT_GRILL_SECONDS);

  const suggested = createMemo(
    () =>
      PALETTE.find((c) => !people().some((p) => p.color === c)) ??
      PALETTE[people().length % PALETTE.length],
  );
  const color = () => picked() ?? suggested();

  // an existing person saves the grill time on the spot; a new one has nothing
  // to save against yet, so it is held until the form is submitted
  const selected = () => personOf(renaming() ?? "");
  const grill = () => selected()?.grillSeconds ?? freshGrill();

  const reset = () => {
    setRenaming(null);
    setName("");
    setPicked(null);
    setFreshGrill(DEFAULT_GRILL_SECONDS);
  };

  return {
    name,
    setName,
    renaming,
    color,
    setPicked,
    grill,
    reset,

    setGrill(seconds: number) {
      const person = selected();
      if (person) {
        setPersonGrill(person.name, seconds);
      } else {
        setFreshGrill(seconds);
      }
    },

    append(ch: string) {
      setName((n) => {
        if (n.length >= NAME_MAX) {
          return n;
        }
        const cap = n.length === 0 || n.endsWith(" ") || n.endsWith("-");
        return n + (cap ? ch.toUpperCase() : ch);
      });
    },

    backspace() {
      setName((n) => n.slice(0, -1));
    },

    startRename(person: Person) {
      setRenaming(person.name);
      setName(person.name);
      setPicked(person.color);
    },

    remove(person: Person) {
      if (renaming() === person.name) {
        reset();
      }
      removePerson(person.name);
      toast(t("toast.personRemoved", {name: person.name}));
    },

    async submit() {
      const trimmed = name().trim();
      if (!trimmed) {
        return;
      }
      const target = renaming();
      const error =
        target ?
          await renamePerson(target, trimmed, color())
        : await addPerson(trimmed, color(), freshGrill());
      if (error) {
        toast(t(`error.${error}`, {max: NAME_MAX}));
        return;
      }
      toast(
        target ?
          t("toast.personRenamed", {old: target, name: trimmed})
        : t("toast.personAdded", {name: trimmed}),
      );
      reset();
    },
  };
}
