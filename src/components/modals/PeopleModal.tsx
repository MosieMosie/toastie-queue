import {createSignal} from "solid-js";

import {t} from "../../store/i18n";
import {TOUCH_ONLY} from "../people/Keyboard";
import {PeopleList} from "../people/PeopleList";
import {PersonEditor} from "../people/PersonEditor";
import {createPersonForm} from "../people/personForm";

import {Modal} from "./Modal";

export const [peopleOpen, setPeopleOpen] = createSignal(false);

const LAYOUT =
  TOUCH_ONLY ?
    {body: "flex-row gap-5", editor: "w-80 border-l pl-5"}
  : {body: "flex-col", editor: "mt-3 border-t pt-3"};

export function PeopleModal() {
  const form = createPersonForm();

  const close = () => {
    setPeopleOpen(false);
    form.reset();
  };

  return (
    <Modal
      open={peopleOpen()}
      onClose={close}
      title={t("people.title")}
      keyboard={TOUCH_ONLY}
      wide={TOUCH_ONLY}
    >
      <div class={`flex min-h-0 flex-1 ${LAYOUT.body}`}>
        <PeopleList form={form} />
        <PersonEditor form={form} class={LAYOUT.editor} />
      </div>
    </Modal>
  );
}
