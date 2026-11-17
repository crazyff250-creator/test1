// Scroll reveals. Blocks fade in (with a soft rise and de-blur) as they enter the viewport.
// Elements are tagged here, so new content gets the effect without extra markup.
// Nothing is hidden unless this script runs and motion is allowed (see the head script).

const TARGETS = [
  '.sec-head > *', '.reel', '.tile', '.service', '.step', '.brand', '.about-copy > *',
  '.faq-layout h2', '.faq details', '.contact-sub', '.contact-mail', '.contact-actions',
  '.footer-row',
].join(',');

export function initReveal() {
  if (!document.documentElement.classList.contains('reveal-on')) return;

  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('in');
        io.unobserve(entry.target);
      }
    },
    { threshold: 0.1, rootMargin: '0px 0px -8% 0px' },
  );

  // Stagger siblings that sit in the same row or list
  document.querySelectorAll(TARGETS).forEach((el) => {
    el.setAttribute('data-reveal', '');
    const i = [...el.parentElement.children].indexOf(el);
    const cols = el.classList.contains('tile') ? 2 : 6;
    el.style.setProperty('--d', `${(i % cols) * 0.1}s`);
  });

  document.querySelectorAll('[data-reveal], .reveal-lines').forEach((el) => io.observe(el));
}
