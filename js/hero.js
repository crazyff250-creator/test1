// Hero: work cards joined by a web of straight lines.
// Hover a card and it travels to the centre and plays, while the headline, the other
// cards and the lines shrink and blur. Cards also drift slightly with the pointer.

import { projects, site } from '../data/projects.js';
import { canHover, reducedMotion, lerp, safePlay } from './utils.js';

const NS = 'http://www.w3.org/2000/svg';

export function initHero() {
  const box = document.getElementById('hero-cards');
  const svg = document.getElementById('hero-lines');
  if (!box) return;
  const art = box.parentElement;
  const hero = art.closest('.hero');
  const still = reducedMotion();
  const hoverable = canHover() && !still;
  let hot = -1;
  let pmx = 0, pmy = 0, mx = 0, my = 0;

  function setHot(i) {
    if (hot === i) return;
    hot = i;
    hero.classList.toggle('has-hot', hot >= 0);
    cards.forEach((c, k) => {
      c.el.classList.toggle('is-hot', k === hot);
      c.el.classList.toggle('is-dim', hot >= 0 && k !== hot);
      if (!c.video) return;
      if (k === hot) {
        if (!c.video.getAttribute('src')) c.video.src = c.video.dataset.src;
        safePlay(c.video);
        c.video.classList.add('is-on');
      } else {
        c.video.pause();
        c.video.classList.remove('is-on');
      }
    });
  }

  const cards = projects.slice(0, 6).map((p, i) => {
    const el = document.createElement('div');
    el.className = `hcard c${i + 1}`;
    const media = p.poster ? `<img src="${p.poster}" alt="" decoding="async">` : '<i class="hcard-blank"></i>';
    const vid = p.preview ? `<video muted loop playsinline preload="none" data-src="${p.preview}" aria-hidden="true"></video>` : '';
    el.innerHTML = `<span class="hcard-in"><span class="hcard-media">${media}${vid}</span>${site.showNames ? `<b class="hcard-label">${p.title}</b>` : ''}</span>`;
    box.append(el);

    // Fixed hit area at the card's home position (the card itself moves on hover)
    const spot = document.createElement('a');
    spot.className = 'hspot';
    spot.href = `work.html#${p.id}`;
    spot.setAttribute('aria-label', site.showNames ? `${p.title}, ${p.category}` : `Edit ${i + 1}`);
    box.append(spot);
    if (hoverable) {
      let t = 0;
      spot.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') { clearTimeout(t); t = setTimeout(() => setHot(i), 120); } });
      spot.addEventListener('pointerleave', () => { clearTimeout(t); if (hot === i) setHot(-1); });
    }
    spot.addEventListener('focus', () => { if (spot.matches(':focus-visible')) setHot(i); });
    spot.addEventListener('blur', () => { if (hot === i) setHot(-1); });

    return { el, spot, video: el.querySelector('video'), depth: [18, 26, 34, 34, 22, 30][i], s: 1, ex: 0, ey: 0, x: 0, y: 0, vis: false };
  });

  // Every card joined to every other: a straight-line web
  const pairs = [];
  for (let a = 0; a < cards.length; a++) for (let b = a + 1; b < cards.length; b++) pairs.push([a, b]);
  setTimeout(() => cards.forEach((c) => {
    if (c.video && !c.video.getAttribute('src')) { c.video.preload = 'auto'; c.video.src = c.video.dataset.src; }
  }), 600);

  const links = svg
    ? pairs.map(() => {
        const base = document.createElementNS(NS, 'line');
        const flow = document.createElementNS(NS, 'line');
        base.setAttribute('class', 'hl-base');
        flow.setAttribute('class', 'hl-flow');
        svg.append(base, flow);
        return { base, flow };
      })
    : [];

  function frame() {
    const ar = art.getBoundingClientRect();
    if (!ar.width) return;
    const cx = ar.width / 2;
    const cy = ar.height / 2;
    mx = lerp(mx, pmx, 0.07);
    my = lerp(my, pmy, 0.07);
    const targetW = Math.min(560, ar.width * 0.46);

    cards.forEach((c, i) => {
      c.vis = !!c.el.offsetParent;
      c.spot.style.display = c.vis ? '' : 'none';
      if (!c.vis) return;
      const w = c.el.offsetWidth;
      const bx = c.el.offsetLeft + w / 2;
      const by = c.el.offsetTop + c.el.offsetHeight / 2;
      c.spot.style.left = `${c.el.offsetLeft}px`;
      c.spot.style.top = `${c.el.offsetTop}px`;
      c.spot.style.width = `${w}px`;
      c.spot.style.height = `${c.el.offsetHeight}px`;

      const isHot = hot === i;
      const k = hot < 0 ? 0.05 : 0.04;
      c.s = lerp(c.s, hot < 0 ? 1 : isHot ? Math.max(1, targetW / w) : 0.8, k);
      c.ex = lerp(c.ex, isHot ? cx - bx : 0, k);
      c.ey = lerp(c.ey, isHot ? cy - by : 0, k);
      const par = isHot ? 0 : 1;
      c.el.style.setProperty('--s', c.s.toFixed(3));
      c.el.style.setProperty('--px', `${(mx * c.depth * par + c.ex).toFixed(1)}px`);
      c.el.style.setProperty('--py', `${(my * c.depth * par + c.ey).toFixed(1)}px`);
      const r = c.el.getBoundingClientRect();
      c.x = r.left + r.width / 2 - ar.left;
      c.y = r.top + r.height / 2 - ar.top;
    });

    if (!svg) return;
    svg.setAttribute('viewBox', `0 0 ${ar.width} ${ar.height}`);
    pairs.forEach(([a, b], k) => {
      const A = cards[a], B = cards[b], l = links[k];
      const show = A.vis && B.vis;
      for (const n of [l.base, l.flow]) {
        if (!show) { n.setAttribute('x1', 0); n.setAttribute('x2', 0); n.setAttribute('y1', 0); n.setAttribute('y2', 0); continue; }
        n.setAttribute('x1', A.x.toFixed(1));
        n.setAttribute('y1', A.y.toFixed(1));
        n.setAttribute('x2', B.x.toFixed(1));
        n.setAttribute('y2', B.y.toFixed(1));
      }
      const touchesHot = hot >= 0 && (hot === a || hot === b);
      l.base.classList.toggle('is-hot', touchesHot);
      l.flow.classList.toggle('is-hot', touchesHot);
    });
  }

  if (hoverable) {
    addEventListener('pointermove', (e) => {
      pmx = e.clientX / innerWidth - 0.5;
      pmy = e.clientY / innerHeight - 0.5;
    }, { passive: true });
  }

  if (still) {
    frame();
    addEventListener('resize', frame);
    return;
  }
  let raf = 0;
  const loop = () => { frame(); raf = requestAnimationFrame(loop); };
  new IntersectionObserver(([en]) => {
    cancelAnimationFrame(raf);
    if (en.isIntersecting) loop();
    else setHot(-1);
  }).observe(art);
}
