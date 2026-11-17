// Small shared helpers.

export const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

// True on devices with a real hover (mouse / trackpad). Phones and tablets are false.
export const canHover = () => matchMedia('(hover: hover) and (pointer: fine)').matches;

export const clamp = (n, min, max) => Math.min(max, Math.max(min, n));

export const lerp = (a, b, t) => a + (b - a) * t;

export const pad2 = (n) => String(n).padStart(2, '0');

// 83 -> "1:23"
export function fmtTime(seconds) {
  const s = Math.max(0, Math.floor(seconds || 0));
  return `${Math.floor(s / 60)}:${pad2(s % 60)}`;
}

// Run fn at most once per animation frame.
export function rafThrottle(fn) {
  let queued = false;
  return (...args) => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      fn(...args);
    });
  };
}

// video.play() rejects when a play is interrupted by a quick pause (mouse flicked across tiles).
// That is harmless, so swallow it.
export function safePlay(video) {
  const result = video.play();
  if (result && typeof result.catch === 'function') result.catch(() => {});
  return result;
}
