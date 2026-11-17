// The background light leans very slightly toward the cursor. The slow drift itself is pure CSS (base.css).

import { canHover, reducedMotion, lerp } from './utils.js';

export function initGlow() {
  const layer = document.querySelector('.glow-layer');
  if (!layer || reducedMotion() || !canHover()) return;

  let targetX = 0;
  let targetY = 0;
  let x = 0;
  let y = 0;
  let raf = 0;

  function step() {
    x = lerp(x, targetX, 0.05);
    y = lerp(y, targetY, 0.05);
    layer.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
    const settled = Math.abs(targetX - x) < 0.1 && Math.abs(targetY - y) < 0.1;
    raf = settled ? 0 : requestAnimationFrame(step);
  }

  addEventListener(
    'pointermove',
    (e) => {
      targetX = (e.clientX / innerWidth - 0.5) * -44;
      targetY = (e.clientY / innerHeight - 0.5) * -28;
      if (!raf) raf = requestAnimationFrame(step);
    },
    { passive: true },
  );
}
