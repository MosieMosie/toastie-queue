import {FaceKind, faceMarkup} from "./faces";

let uid = 0;

const hexToRgb = (hex: string) => [
  parseInt(hex.slice(1, 3), 16),
  parseInt(hex.slice(3, 5), 16),
  parseInt(hex.slice(5, 7), 16),
];

function mix(a: string, b: string, t: number) {
  const [r1, g1, b1] = hexToRgb(a);
  const [r2, g2, b2] = hexToRgb(b);
  const k = Math.max(0, Math.min(1, t));
  const c = (x: number, y: number) => Math.round(x + (y - x) * k);
  return `rgb(${c(r1, r2)} ${c(g1, g2)} ${c(b1, b2)})`;
}

const GOLDEN = 0.85;

interface Props {
  /** how brown to draw it: 0 raw dough-pale, 1 golden, 2 charcoal */
  doneness?: number;
  /** false = blank sandwich */
  face?: FaceKind | false;
  class?: string;
}

export function ToastieSvg(props: Props) {
  const id = `toastie${uid++}`;
  const done = () => {
    const value = props.doneness ?? GOLDEN;
    return Number.isNaN(value) ? 0 : Math.max(0, Math.min(2, value));
  };

  const bread = () =>
    done() <= 1 ?
      mix("#f9e8c0", "#e2a54c", done())
    : mix("#e2a54c", "#6d431f", done() - 1);
  const crust = () =>
    done() <= 1 ?
      mix("#e8cd92", "#c07f2c", done())
    : mix("#c07f2c", "#4b2c12", done() - 1);
  const marks = () => mix("#a9682a", "#241505", Math.min(1, done() / 1.6));

  const faceNode = () => {
    const kind = props.face ?? "happy";
    return kind === false ? null : faceMarkup(kind);
  };

  return (
    <svg viewBox="0 0 64 64" class={props.class} aria-hidden="true">
      <defs>
        <clipPath id={`${id}-clip`}>
          <polygon points="32,9 56,52 8,52" />
        </clipPath>
      </defs>

      {/* melted cheese oozing out from under the bottom crust */}
      <path
        d="M14 44c2 6-1 9 2 10 3 1 4-3 6-2s1 6 4 6 3-5 5-5 2 5 5 4 1-5 3-6 3 2 5 0V44z"
        fill="#ffc93c"
      />
      <path
        d="M16 46c1 4-1 6 1 7 2 1 3-2 5-1s1 4 3 4"
        fill="none"
        stroke="#f0ad20"
        stroke-width="1.5"
        stroke-linecap="round"
        opacity="0.7"
      />

      {/* the sandwich itself: thick round-joined stroke doubles as the crust */}
      <polygon
        points="32,9 56,52 8,52"
        fill={bread()}
        stroke={crust()}
        stroke-width="6"
        stroke-linejoin="round"
      />

      <g clip-path={`url(#${id}-clip)`}>
        {/* grill ridges from the iron */}
        <g
          stroke={marks()}
          stroke-width="3.4"
          stroke-linecap="round"
          opacity="0.75"
        >
          <line x1="8" y1="44" x2="30" y2="22" />
          <line x1="22" y1="54" x2="46" y2="30" />
          <line x1="38" y1="58" x2="58" y2="38" />
        </g>
        {/* highlight along the top so it does not read flat */}
        <path
          d="M32 14 46 40"
          stroke="rgba(255,255,255,0.35)"
          stroke-width="2"
          stroke-linecap="round"
          fill="none"
        />
      </g>

      {faceNode()}
    </svg>
  );
}
