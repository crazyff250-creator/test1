// Short loading screen (about 0.75s) with the logo, shown when moving between pages.
// Leaving: cover the page, draw the logo, then navigate. Arriving: the cover is already up, then it fades away.

import { reducedMotion } from './utils.js';

const LEAVE_MS = 400;
const ARRIVE_MS = 100;

export function initTransition() {
  const loader = document.querySelector('.loader');
  if (!loader) return;
  const root = document.documentElement;

  if (root.classList.contains('is-arriving')) {
    try { sessionStorage.removeItem('fx-nav'); } catch { /* storage is optional */ }
    setTimeout(() => root.classList.remove('is-arriving'), ARRIVE_MS);
  }

  // Coming back with the browser's back button should not leave the cover up
  addEventListener('pageshow', (e) => {
    if (e.persisted) {
      loader.classList.remove('is-on');
      root.classList.remove('is-arriving');
    }
  });

  if (reducedMotion()) return;

  document.addEventListener('click', (e) => {
    const a = e.target.closest?.('a[href]');
    if (!a || e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || a.target === '_blank' || a.hasAttribute('download')) return;
    const url = new URL(a.href, location.href);
    if (url.origin !== location.origin || url.pathname === location.pathname) return;
    e.preventDefault();
    loader.classList.add('is-on');
    try { sessionStorage.setItem('fx-nav', '1'); } catch { /* storage is optional */ }
    setTimeout(() => { location.href = url.href; }, LEAVE_MS);
  });
}

// For a single-page setup: cover, swap the content, then reveal.
export function coverThen(fn) {
  const loader = document.querySelector('.loader');
  if (!loader || reducedMotion()) return fn();
  loader.classList.add('is-on');
  setTimeout(() => {
    fn();
    setTimeout(() => loader.classList.remove('is-on'), ARRIVE_MS);
  }, LEAVE_MS);
}
