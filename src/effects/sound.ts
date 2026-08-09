let ctx: AudioContext | null = null;

// browsers only allow audio after a user gesture, so the first one arms it
const unlock = () => {
  ctx ??= new AudioContext();
  if (ctx.state === "suspended") {
    ctx.resume();
  }
};
window.addEventListener("pointerdown", unlock);
window.addEventListener("keydown", unlock);

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

/** a two-note ding-dong: B5 followed by E6 */
export function playReadyChime() {
  if (!ctx || ctx.state !== "running") {
    return;
  }
  const t = ctx.currentTime;
  ding(ctx, t, 987.77);
  ding(ctx, t + 0.22, 1318.51);
}
