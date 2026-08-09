export function Avatar(props: {name: string; color: string}) {
  return (
    <span
      class="grid h-8 w-8 shrink-0 place-items-center rounded-full text-sm font-black text-white"
      style={{"background-color": props.color}}
    >
      {props.name.slice(0, 1).toUpperCase()}
    </span>
  );
}
