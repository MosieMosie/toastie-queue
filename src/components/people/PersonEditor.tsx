import {Show} from "solid-js";

import {t} from "../../store/i18n";
import {NAME_MAX} from "../../store/toastie";
import {btnPrimary, btnSecondary} from "../buttons";
import {GrillSlider} from "../GrillSlider";

import {ColorPicker} from "./ColorPicker";
import {Keyboard, TOUCH_ONLY} from "./Keyboard";
import {PersonForm} from "./personForm";

export function PersonEditor(props: {form: PersonForm; class?: string}) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        props.form.submit();
      }}
      class={`flex shrink-0 flex-col gap-2.5 border-amber-900/10 ${props.class ?? ""}`}
    >
      <input
        value={props.form.name()}
        onInput={(e) => props.form.setName(e.currentTarget.value)}
        placeholder={t("people.namePlaceholder")}
        maxlength={NAME_MAX}
        inputmode={TOUCH_ONLY ? "none" : undefined}
        class="h-11 w-full rounded-full bg-white px-4 text-base font-bold text-amber-950 shadow-inner ring-1 ring-amber-900/15 outline-none placeholder:font-semibold placeholder:text-amber-900/40 focus:ring-2 focus:ring-amber-600"
      />
      <ColorPicker color={props.form.color()} onPick={props.form.setPicked} />
      <GrillSlider seconds={props.form.grill()} onInput={props.form.setGrill} />
      <div class="flex gap-2">
        <button
          type="submit"
          disabled={!props.form.name().trim()}
          class={`${btnPrimary} flex-1`}
        >
          {props.form.renaming() ? t("people.rename") : t("people.add")}
        </button>
        <Show when={props.form.renaming()}>
          <button
            type="button"
            onClick={() => props.form.reset()}
            class={`${btnSecondary} flex-1`}
          >
            {t("people.cancel")}
          </button>
        </Show>
      </div>
      <Show when={TOUCH_ONLY}>
        <Keyboard
          onKey={(ch) => props.form.append(ch)}
          onBackspace={() => props.form.backspace()}
        />
      </Show>
    </form>
  );
}
