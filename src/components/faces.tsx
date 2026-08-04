import {JSX} from "solid-js";

/**
 * Expressions a tosti can wear. All of them live in the same patch of the
 * triangle (roughly x 20-45, y 31-47) so they stay put across faces.
 */
export const FACES = [
  "happy",
  "content",
  "angry",
  "woozy",
  "shocked",
  "smug",
  "ahegao",
] as const;

/** 'ko' is not in the random pool — a burnt tosti earns it */
export type FaceKind = (typeof FACES)[number] | "ko";

/**
 * Pick a face from a tosti's id. Deterministic on purpose: the slot re-renders
 * every second for the timer, and a fresh random each render would make the
 * poor thing twitch. Same id, same face, also after a reload.
 */
export function faceFor(seed: string): (typeof FACES)[number] {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (h * 31 + seed.charCodeAt(i)) | 0;
  }
  return FACES[Math.abs(h) % FACES.length];
}

const INK = "#4a2a10";
const BLUSH = "#ef8f8f";

const glint = (cx: number, cy: number) => (
  <circle cx={cx} cy={cy} r="0.8" fill="rgba(255,255,255,0.85)" />
);

/** `spread` pulls the cheeks in a bit for the bigger blushes, so they stay off the crust */
const blush = (r = 2.4, opacity = 0.45, spread = 12) => (
  <>
    <circle cx={32 - spread} cy="41" r={r} fill={BLUSH} opacity={opacity} />
    <circle cx={32 + spread} cy="41" r={r} fill={BLUSH} opacity={opacity} />
  </>
);

export function faceMarkup(kind: FaceKind): JSX.Element {
  switch (kind) {
    case "content":
      // eyes squeezed shut, thoroughly pleased with itself
      return (
        <g fill="none" stroke={INK} stroke-width="1.9" stroke-linecap="round">
          <path d="M23.5 37q2.5-3 5 0" />
          <path d="M35.5 37q2.5-3 5 0" />
          <path d="M29 41.8q3 3.2 6 0" />
          <g stroke="none">{blush()}</g>
        </g>
      );

    case "angry":
      // brows down toward the middle, mouth pulled flat
      return (
        <g>
          <g stroke={INK} stroke-width="1.9" stroke-linecap="round" fill="none">
            <path d="M22.5 31.5 28.5 34" />
            <path d="M41.5 31.5 35.5 34" />
            <path d="M28 44.2q4-3.6 8 0" />
          </g>
          <circle cx="26" cy="37.2" r="2.2" fill={INK} />
          <circle cx="38" cy="37.2" r="2.2" fill={INK} />
        </g>
      );

    case "woozy":
      // melted, tongue out, faintly overwhelmed by its own cheese
      return (
        <g>
          <path
            d="M23.5 35.4q2.5 2.6 5 0"
            fill="none"
            stroke={INK}
            stroke-width="1.9"
            stroke-linecap="round"
          />
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

    case "ahegao":
      // rolled-back eyes, lolling tongue, furious blushing. you asked for it.
      return (
        <g>
          <g stroke={INK} stroke-width="1.5" stroke-linecap="round" fill="none">
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
          {/* iris shoved to the top of the eye is what reads as "rolled back" */}
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

    case "shocked":
      // just noticed how long it has been in there
      return (
        <g>
          <circle cx="26" cy="35.6" r="2.9" fill={INK} />
          <circle cx="38" cy="35.6" r="2.9" fill={INK} />
          {glint(24.9, 34.5)}
          {glint(36.9, 34.5)}
          <ellipse cx="32" cy="43.2" rx="1.9" ry="2.4" fill={INK} />
        </g>
      );

    case "smug":
      // half-lidded, knows something you do not
      return (
        <g fill="none" stroke={INK} stroke-width="1.9" stroke-linecap="round">
          {/* one brow up and a lopsided mouth, or it just looks sleepy */}
          <path d="M22.6 31.4q2.8-1.6 5.4-0.2" stroke-width="1.6" />
          <path d="M23.5 35.4q2.5 2.6 5 0" />
          <path d="M35.5 35.4q2.5 2.6 5 0" />
          <path d="M27.4 42.8q4.2 2.4 8.8-2.6" />
        </g>
      );

    case "ko":
      // burnt beyond saving
      return (
        <g stroke={INK} stroke-width="1.8" stroke-linecap="round" fill="none">
          <path d="M23.8 34 28.2 38.4M28.2 34 23.8 38.4" />
          <path d="M35.8 34 40.2 38.4M40.2 34 35.8 38.4" />
          <path d="M27.5 43.6q2-2.4 4.2 0t4.2 0" />
        </g>
      );

    case "happy":
      return (
        <g>
          <circle cx="26" cy="36" r="2.3" fill={INK} />
          <circle cx="38" cy="36" r="2.3" fill={INK} />
          {glint(25.2, 35.2)}
          {glint(37.2, 35.2)}
          <path
            d="M28 42q4 3.5 8 0"
            fill="none"
            stroke={INK}
            stroke-width="1.9"
            stroke-linecap="round"
          />
          {blush()}
        </g>
      );
  }
}
