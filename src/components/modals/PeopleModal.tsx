import {createMemo, createSignal, For, Show} from "solid-js";

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
import {btnPrimary, btnSecondary} from "../buttons";
import {GrillSlider} from "../GrillSlider";
import {ColorPicker} from "../people/ColorPicker";
import {Keyboard, TOUCH_ONLY} from "../people/Keyboard";
import {PersonRow} from "../people/PersonRow";

import {Modal} from "./Modal";

export const [peopleOpen, setPeopleOpen] = createSignal(false);

export function PeopleModal() {
  const [renaming, setRenaming] = createSignal<string | null>(null);
  const [name, setName] = createSignal("");
  const [picked, setPicked] = createSignal<string | null>(null);
  const [freshGrill, setFreshGrill] = createSignal(DEFAULT_GRILL_SECONDS);

  const append = (ch: string) =>
    setName((n) => {
      if (n.length >= NAME_MAX) {
        return n;
      }
      const cap = n.length === 0 || n.endsWith(" ") || n.endsWith("-");
      return n + (cap ? ch.toUpperCase() : ch);
    });
  const backspace = () => setName((n) => n.slice(0, -1));
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
  const setGrill = (seconds: number) => {
    const person = selected();
    if (person) {
      setPersonGrill(person.name, seconds);
    } else {
      setFreshGrill(seconds);
    }
  };

  const startRename = (person: Person) => {
    setRenaming(person.name);
    setName(person.name);
    setPicked(person.color);
  };

  const reset = () => {
    setRenaming(null);
    setName("");
    setPicked(null);
    setFreshGrill(DEFAULT_GRILL_SECONDS);
  };

  const remove = (person: Person) => {
    if (renaming() === person.name) {
      reset();
    }
    removePerson(person.name);
    toast(t("toast.personRemoved", {name: person.name}));
  };

  const close = () => {
    setPeopleOpen(false);
    reset();
  };

  const submit = async () => {
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
  };

  return (
    <Modal open={peopleOpen()} onClose={close} title={t("people.title")}>
      <div class="min-h-0 flex-1 overflow-y-auto">
        <Show
          when={people().length > 0}
          fallback={
            <p class="py-6 text-center text-sm font-semibold text-amber-900/60">
              {t("people.empty")}
            </p>
          }
        >
          <div class="flex flex-col gap-1">
            <For each={people()}>
              {(person) => (
                <PersonRow
                  person={person}
                  active={renaming() === person.name}
                  onSelect={() => startRename(person)}
                  onRemove={() => remove(person)}
                />
              )}
            </For>
          </div>
        </Show>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
        class="mt-3 flex flex-col gap-2.5 border-t border-amber-900/10 pt-3"
      >
        <input
          value={name()}
          onInput={(e) => setName(e.currentTarget.value)}
          placeholder={t("people.namePlaceholder")}
          maxlength={NAME_MAX}
          inputmode={TOUCH_ONLY ? "none" : undefined}
          class="h-11 w-full rounded-full bg-white px-4 text-base font-bold text-amber-950 shadow-inner ring-1 ring-amber-900/15 outline-none placeholder:font-semibold placeholder:text-amber-900/40 focus:ring-2 focus:ring-amber-600"
        />
        <ColorPicker color={color()} onPick={setPicked} />
        <GrillSlider seconds={grill()} onInput={setGrill} />
        <div class="flex gap-2">
          <button
            type="submit"
            disabled={!name().trim()}
            class={`${btnPrimary} flex-1`}
          >
            {renaming() ? t("people.rename") : t("people.add")}
          </button>
          <Show when={renaming()}>
            <button
              type="button"
              onClick={reset}
              class={`${btnSecondary} flex-1`}
            >
              {t("people.cancel")}
            </button>
          </Show>
        </div>
        <Show when={TOUCH_ONLY}>
          <Keyboard onKey={append} onBackspace={backspace} />
        </Show>
      </form>
    </Modal>
  );
}
