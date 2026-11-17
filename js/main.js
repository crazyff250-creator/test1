// Entry point: wires every module together.

import { site } from '../data/projects.js';
import { enhancePlayer } from './player.js';
import { initGlow } from './glow.js';
import { initWork } from './work.js';
import { initReveal } from './reveal.js';
import { initHero } from './hero.js';
import { initTransition } from './transition.js';
import { initNav } from './nav.js';
import { reducedMotion, safePlay } from './utils.js';

// Hero reel: autoplays muted, pauses when scrolled away, stays paused if the visitor paused it.
function initReel() {
  const root = document.querySelector('.reel');
  if (!root) return;
  enhancePlayer(root);
  const video = root.querySelector('video');

  if (reducedMotion()) {
    video.autoplay = false;
    video.pause();
    return;
  }

  new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        if (!root.dataset.userPaused) safePlay(video);
      } else {
        video.pause();
      }
    },
    { threshold: 0.25 },
  ).observe(root);
}

// Contact details come from data/projects.js so they live in one place.
function initContact() {
  const emailEl = document.getElementById('email');
  const copyBtn = document.getElementById('copy-email');
  const mailLink = document.getElementById('mail-link');
  const igLink = document.getElementById('ig-link');
  const year = document.getElementById('year');

  if (emailEl) {
    emailEl.textContent = site.email;
    emailEl.href = `mailto:${site.email}`;
  }
  if (mailLink) mailLink.href = `mailto:${site.email}`;
  if (igLink) {
    igLink.href = site.instagram;
    igLink.textContent = `Instagram ${site.instagramHandle}`;
  }
  if (year) year.textContent = new Date().getFullYear();

  if (copyBtn && emailEl) {
    copyBtn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(site.email);
        copyBtn.textContent = 'Copied';
      } catch {
        const range = document.createRange();
        range.selectNodeContents(emailEl);
        const sel = getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
        copyBtn.textContent = 'Press Ctrl+C';
      }
      setTimeout(() => (copyBtn.textContent = 'Copy email'), 1800);
    });
  }
}

// Smooth scrolling for same-page links and the back-to-top button. Done in JS so it works
// everywhere, including embedded previews where plain #hash links are blocked.
function initScrolling() {
  const behavior = reducedMotion() ? 'auto' : 'smooth';
  const toTop = () => scrollTo({ top: 0, behavior });

  document.getElementById('to-top')?.addEventListener('click', toTop);

  document.addEventListener('click', (e) => {
    const a = e.target.closest?.('a[href*="#"]');
    if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey) return;
    const url = new URL(a.href, location.href);
    if (url.pathname !== location.pathname || !url.hash) return;
    e.preventDefault();
    if (url.hash === '#top') return toTop();
    document.querySelector(url.hash)?.scrollIntoView({ behavior, block: 'start' });
    history.replaceState(null, '', url.hash);
  });
}

initGlow();
initReel();
initHero();
initWork();
initContact();
initReveal(); // after initWork so the work tiles exist
initNav();
initTransition();
initScrolling();
