import {createMemo, createSignal, For, Show} from "solid-js";

import {toast} from "../lib/toast";
import {t} from "../store/i18n";
import {addPerson, removePerson, renamePerson} from "../store/store";
import {NAME_MAX, PALETTE, people} from "../store/tosti";

import {Keyboard, TOUCH_ONLY} from "./Keyboard";
import {Avatar, btnPrimary, btnSecondary, Modal} from "./ui";

// module-level so the header button in App.tsx can drive it
export const [peopleOpen, setPeopleOpen] = createSignal(false);

export function PeopleModal() {
  /** name currently loaded into the form for renaming, null = adding */
  const [renaming, setRenaming] = createSignal<string | null>(null);
  const [name, setName] = createSignal("");
  const [picked, setPicked] = createSignal<string | null>(null);

  // title-case as you type: names start uppercase, also after space or dash
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

  const startRename = (person: {name: string; color: string}) => {
    setRenaming(person.name);
    setName(person.name);
    setPicked(person.color);
  };

  const reset = () => {
    setRenaming(null);
    setName("");
    setPicked(null);
  };

  // closing abandons any rename in progress
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
      : await addPerson(trimmed, color());
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
                <div
                  role="button"
                  tabindex="0"
                  onClick={() => startRename(person)}
                  onKeyDown={(e) =>
                    (e.key === "Enter" || e.key === " ") && startRename(person)
                  }
                  class="flex items-center gap-3 rounded-xl px-2 py-1.5 transition select-none active:bg-amber-100"
                  classList={{
                    "bg-amber-100 ring-2 ring-amber-600":
                      renaming() === person.name,
                    "bg-amber-50/60": renaming() !== person.name,
                  }}
                  title={t("people.rowTitle", {name: person.name})}
                >
                  <Avatar name={person.name} color={person.color} />
                  <span class="flex-1 truncate text-base font-bold text-amber-950">
                    {person.name}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (renaming() === person.name) {
                        reset();
                      }
                      removePerson(person.name);
                      toast(t("toast.personRemoved", {name: person.name}));
                    }}
                    class="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-red-100 text-base font-black text-red-700 transition active:scale-90"
                    title={t("people.removeTitle", {name: person.name})}
                  >
                    ✕
                  </button>
                </div>
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
        <div class="flex flex-wrap items-center gap-2 px-1 py-0.5">
          <For each={PALETTE}>
            {(c) => (
              <button
                type="button"
                onClick={() => setPicked(c)}
                class="h-7 w-7 rounded-full transition active:scale-90"
                classList={{
                  "ring-2 ring-offset-2 ring-amber-950": color() === c,
                }}
                style={{"background-color": c}}
                title={c}
              />
            )}
          </For>
        </div>
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
