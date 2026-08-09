import {For, Show} from "solid-js";

import {t} from "../../store/i18n";
import {people} from "../../store/toastie";

import {PersonForm} from "./personForm";
import {PersonRow} from "./PersonRow";

export function PeopleList(props: {form: PersonForm}) {
  return (
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
                active={props.form.renaming() === person.name}
                onSelect={() => props.form.startRename(person)}
                onRemove={() => props.form.remove(person)}
              />
            )}
          </For>
        </div>
      </Show>
    </div>
  );
}
