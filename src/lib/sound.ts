/**
 * Synthesized chime for when a tosti is done — no audio assets to ship.
 *
 * Browsers refuse to start audio before a user gesture, so the context is
 * unlocked by the first tap/keypress. On the kiosk someone always taps to add
 * a tosti before one can possibly be ready, so in practice this never blocks.
 */
let ctx: AudioContext | null = null;

const unlock = () => {
  ctx ??= new AudioContext();
  if (ctx.state === "suspended") {
    ctx.resume();
  }
};
window.addEventListener("pointerdown", unlock);
window.addEventListener("keydown", unlock);

/** one bell strike: a sine with a fast attack, long ring-out, and a faint octave overtone */
function ding(c: AudioContext, at: number, freq: number, gain = 0.35) {
  for (const [mult, level] of [
    [1, gain],
    [2, gain * 0.25],
  ] as const) {
    const osc = c.createOscillator();
    const env = c.createGain();
    osc.type = "sine";
    osc.frequency.value = freq * mult;
    env.gain.setValueAtTime(0, at);
    env.gain.linearRampToValueAtTime(level, at + 0.012);
    env.gain.exponentialRampToValueAtTime(0.0005, at + 1.1);
    osc.connect(env).connect(c.destination);
    osc.start(at);
    osc.stop(at + 1.2);
  }
}

/** ding-dong: B5 then E6, like a kitchen timer with better manners */
export function playReadyChime() {
  if (!ctx || ctx.state !== "running") {
    return;
  }
  const t = ctx.currentTime;
  ding(ctx, t, 987.77);
  ding(ctx, t + 0.22, 1318.51);
}
