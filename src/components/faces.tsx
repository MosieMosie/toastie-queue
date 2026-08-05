import {JSX} from "solid-js";

/** every face stays inside the same patch of the triangle (x 20-45, y 31-47) */
export const FACES = [
  "happy",
  "content",
  "angry",
  "woozy",
  "shocked",
  "smug",
  "ahegao",
] as const;

export type FaceKind = (typeof FACES)[number] | "ko";

/** deterministic per id: the timer re-renders every second, a random face would twitch */
export function faceFor(seed: string): (typeof FACES)[number] {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (h * 31 + seed.charCodeAt(i)) | 0;
  }
  return FACES[Math.abs(h) % FACES.length];
}

const INK = "#4a2a10";
const BLUSH = "#ef8f8f";

const ink = {
  "fill": "none",
  "stroke": INK,
  "stroke-width": "1.9",
  "stroke-linecap": "round",
} as const;

const glint = (cx: number, cy: number) => (
  <circle cx={cx} cy={cy} r="0.8" fill="rgba(255,255,255,0.85)" />
);

const blush = (r = 2.4, opacity = 0.45, spread = 12) => (
  <>
    <circle cx={32 - spread} cy="41" r={r} fill={BLUSH} opacity={opacity} />
    <circle cx={32 + spread} cy="41" r={r} fill={BLUSH} opacity={opacity} />
  </>
);

const dotEyes = (cy: number, r: number, shiny = true) => (
  <>
    <circle cx="26" cy={cy} r={r} fill={INK} />
    <circle cx="38" cy={cy} r={r} fill={INK} />
    {shiny ? glint(26 - r * 0.38, cy - r * 0.38) : null}
    {shiny ? glint(38 - r * 0.38, cy - r * 0.38) : null}
  </>
);

/** one eye as an arc: bend < 0 squeezes it shut, bend > 0 droops it half-lidded */
const arcEye = (cx: number, y: number, bend: number) => (
  <path d={`M${cx - 2.5} ${y}q2.5 ${bend} 5 0`} />
);

/** quadratic mouth from x, width w: depth > 0 smiles, depth < 0 frowns */
const mouth = (x: number, y: number, w: number, depth: number) => (
  <path d={`M${x} ${y}q${w / 2} ${depth} ${w} 0`} />
);

const happy = () => (
  <g>
    {dotEyes(36, 2.3)}
    <g {...ink}>{mouth(28, 42, 8, 3.5)}</g>
    {blush()}
  </g>
);

const content = () => (
  <g {...ink}>
    {arcEye(26, 37, -3)}
    {arcEye(38, 37, -3)}
    {mouth(29, 41.8, 6, 3.2)}
    <g stroke="none">{blush()}</g>
  </g>
);

const angry = () => (
  <g>
    <g {...ink}>
      <path d="M22.5 31.5 28.5 34" />
      <path d="M41.5 31.5 35.5 34" />
      {mouth(28, 44.2, 8, -3.6)}
    </g>
    {dotEyes(37.2, 2.2, false)}
  </g>
);

const woozy = () => (
  <g>
    <g {...ink}>{arcEye(26, 35.4, 2.6)}</g>
    <circle cx="38" cy="36" r="2.3" fill={INK} />
    {glint(37.2, 35.2)}
    {/* open mouth first, tongue over it so it hangs past the lower lip */}
    <path d="M27.5 40.6q4.5 5.6 9 0z" fill={INK} />
    <path d="M29.6 43q3.4 6.8 6.8 0z" fill="#f4788f" />
    <path
      d="M33 44v3.2"
      stroke="#d9536e"
      stroke-width="0.9"
      stroke-linecap="round"
      opacity="0.7"
    />
    {blush(3.4, 0.6, 11)}
  </g>
);

const ahegao = () => (
  <g>
    <g {...ink} stroke-width="1.5">
      <path d="M22.8 31.2q2.6-1.8 5.2 0.4" />
      <path d="M41.2 31.2q-2.6-1.8-5.2 0.4" />
    </g>
    <ellipse
      cx="26"
      cy="36.4"
      rx="2.9"
      ry="3.2"
      fill="#fffaf2"
      stroke={INK}
      stroke-width="1"
    />
    <ellipse
      cx="38"
      cy="36.4"
      rx="2.9"
      ry="3.2"
      fill="#fffaf2"
      stroke={INK}
      stroke-width="1"
    />
    <circle cx="26" cy="34.6" r="1.5" fill={INK} />
    <circle cx="38" cy="34.6" r="1.5" fill={INK} />
    <path d="M28 41.4q4 4.6 8 0z" fill={INK} />
    <ellipse
      cx="34.4"
      cy="45.4"
      rx="2.3"
      ry="3"
      transform="rotate(24 34.4 45.4)"
      fill="#f4788f"
    />
    <path
      d="M34.8 43.6q0.3 2-0.7 3.3"
      fill="none"
      stroke="#d9536e"
      stroke-width="0.8"
      stroke-linecap="round"
      opacity="0.75"
    />
    {blush(3.6, 0.7, 11)}
  </g>
);

const shocked = () => (
  <g>
    {dotEyes(35.6, 2.9)}
    <ellipse cx="32" cy="43.2" rx="1.9" ry="2.4" fill={INK} />
  </g>
);

const smug = () => (
  <g {...ink}>
    <path d="M22.6 31.4q2.8-1.6 5.4-0.2" stroke-width="1.6" />
    {arcEye(26, 35.4, 2.6)}
    {arcEye(38, 35.4, 2.6)}
    <path d="M27.4 42.8q4.2 2.4 8.8-2.6" />
  </g>
);

const ko = () => (
  <g {...ink} stroke-width="1.8">
    <path d="M23.8 34 28.2 38.4M28.2 34 23.8 38.4" />
    <path d="M35.8 34 40.2 38.4M40.2 34 35.8 38.4" />
    <path d="M27.5 43.6q2-2.4 4.2 0t4.2 0" />
  </g>
);

const MARKUP: Record<FaceKind, () => JSX.Element> = {
  happy,
  content,
  angry,
  woozy,
  ahegao,
  shocked,
  smug,
  ko,
};

export const faceMarkup = (kind: FaceKind): JSX.Element => MARKUP[kind]();
