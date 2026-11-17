// Nav: highlights the link for the section in view and adds a quiet backdrop once you scroll.

import { rafThrottle } from './utils.js';

export function initNav() {
  const nav = document.getElementById('nav');
  const links = [...document.querySelectorAll('.nav-link')];
  const sections = [...document.querySelectorAll('[data-chapter]')];

  function update() {
    nav?.classList.toggle('is-scrolled', scrollY > 40);

    const line = scrollY + innerHeight * 0.4;
    const atBottom = scrollY >= document.documentElement.scrollHeight - innerHeight - 4;
    if (!sections.length) return;
    let current = sections[0];
    for (const s of sections) {
      if (s.getBoundingClientRect().top + scrollY <= line) current = s;
    }
    if (atBottom) current = sections[sections.length - 1];

    for (const a of links) {
      if (!a.hash) continue;
      if (a.hash && a.hash === `#${current.id}`) a.setAttribute('aria-current', 'true');
      else a.removeAttribute('aria-current');
    }
  }

  addEventListener('scroll', rafThrottle(update), { passive: true });
  addEventListener('resize', rafThrottle(update));
  update();
}
