import {For, Show} from "solid-js";

import {draggable} from "../effects/dnd";
import {toast} from "../effects/toast";
import {t} from "../store/i18n";
import {drop, freeSlot, state, toastieCount} from "../store/store";
import {people, Person} from "../store/toastie";

import {Avatar} from "./Avatar";

function PersonChip(props: {person: Person}) {
  const name = () => props.person.name;
  const mine = () => toastieCount(name());

  const quickAdd = () => {
    const slot = freeSlot();
    if (slot >= 0) {
      drop({from: "roster", person: name()}, {kind: "iron", slot});
      toast(t("toast.onIron", {name: name()}));
      return;
    }
    drop(
      {from: "roster", person: name()},
      {kind: "queue", index: state.queue.length},
    );
    toast(t("toast.queued", {name: name(), n: state.queue.length}));
  };

  return (
    <div
      {...draggable({
        ref: () => ({from: "roster", person: name()}),
        label: () => name(),
        onTap: quickAdd,
      })}
      role="button"
      tabindex="0"
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && quickAdd()}
      class="flex h-11 touch-none items-center gap-2 rounded-full bg-white pr-4 pl-1.5 shadow-sm ring-1 ring-amber-900/10 transition select-none active:scale-95 active:bg-amber-50"
      title={t("roster.chipTitle", {name: name()})}
    >
      <Avatar name={name()} color={props.person.color} />
      <span class="text-base font-bold text-amber-950">{name()}</span>
      <Show when={mine() > 0}>
        <span class="grid h-5 min-w-5 place-items-center rounded-full bg-amber-900/10 px-1 text-xs font-black text-amber-900/70">
          {mine()}
        </span>
      </Show>
    </div>
  );
}

export function Roster() {
  return (
    <section>
      <h2 class="mb-1.5 text-xs font-black tracking-widest text-amber-900/70 uppercase">
        {t("roster.title")}
      </h2>
      <p class="mb-2 text-xs text-amber-900/60">
        {people().length === 0 ? t("roster.emptyHint") : t("roster.hint")}
      </p>
      <div class="flex flex-wrap gap-2">
        <For each={people()}>{(person) => <PersonChip person={person} />}</For>
      </div>
    </section>
  );
}
