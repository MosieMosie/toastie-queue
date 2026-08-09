import {createSignal, Show} from "solid-js";

import {t} from "../../store/i18n";
import {setPersonGrill} from "../../store/store";
import {personOf} from "../../store/tosti";
import {Avatar} from "../Avatar";
import {GrillSlider} from "../GrillSlider";

import {Modal} from "./Modal";

const [editing, setEditing] = createSignal<string | null>(null);
export const openGrillModal = (name: string) => setEditing(name);

export function GrillModal() {
  const person = () => personOf(editing() ?? "");

  return (
    <Modal
      open={Boolean(person())}
      onClose={() => setEditing(null)}
      title={t("grill.modalTitle")}
    >
      <Show when={person()}>
        {(who) => (
          <div class="flex flex-col gap-3">
            <div class="flex items-center gap-3">
              <Avatar name={who().name} color={who().color} />
              <span class="truncate text-base font-bold text-amber-950">
                {who().name}
              </span>
            </div>

            <GrillSlider
              seconds={who().grillSeconds}
              onInput={(seconds) => setPersonGrill(who().name, seconds)}
            />

            <p class="text-xs font-semibold text-amber-900/50">
              {t("grill.modalHint", {name: who().name})}
            </p>
          </div>
        )}
      </Show>
    </Modal>
  );
}
