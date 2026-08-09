import {t} from "../../store/i18n";
import {formatDuration, Person} from "../../store/toastie";
import {Avatar} from "../Avatar";

export function PersonRow(props: {
  person: Person;
  active: boolean;
  onSelect: () => void;
  onRemove: () => void;
}) {
  return (
    <div
      role="button"
      tabindex="0"
      onClick={() => props.onSelect()}
      onKeyDown={(e) =>
        (e.key === "Enter" || e.key === " ") && props.onSelect()
      }
      class="flex items-center gap-3 rounded-xl px-2 py-1.5 transition select-none active:bg-amber-100"
      classList={{
        "bg-amber-100 ring-2 ring-amber-600": props.active,
        "bg-amber-50/60": !props.active,
      }}
      title={t("people.rowTitle", {name: props.person.name})}
    >
      <Avatar name={props.person.name} color={props.person.color} />
      <span class="flex-1 truncate text-base font-bold text-amber-950">
        {props.person.name}
      </span>
      <span class="shrink-0 rounded-full bg-amber-900/10 px-2 py-0.5 text-xs font-black text-amber-900/70 tabular-nums">
        {formatDuration(props.person.grillSeconds)}
      </span>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          props.onRemove();
        }}
        class="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-red-100 text-base font-black text-red-700 transition active:scale-90"
        title={t("people.removeTitle", {name: props.person.name})}
      >
        ✕
      </button>
    </div>
  );
}
