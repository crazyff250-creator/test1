// Work grid: every clip in one even grid.
// Desktop: a tile plays while you hover it. Touch: the tile nearest the middle of the screen
// plays as you scroll. Click opens the lightbox player.

import { projects, site } from '../data/projects.js';
import { enhancePlayer } from './player.js';
import { canHover, rafThrottle, safePlay } from './utils.js';

const tiles = [];

function buildTile(project, index) {
  const el = document.createElement('article');
  el.className = 'tile';
  el.id = project.id;
  if (!project.full && !project.preview) el.classList.add('is-empty');
  if (project.ratio) el.style.setProperty('--ratio', project.ratio);

  el.innerHTML = `
    <button type="button" class="tile-media" aria-label="${site.showNames ? `Open ${project.title}` : `Open edit ${index + 1}`}">
      <video muted loop playsinline preload="none" data-src="${project.preview || ''}" tabindex="-1" aria-hidden="true"></video>
      ${project.poster ? `<img class="tile-poster" src="${project.poster}" alt="" loading="lazy" decoding="async">` : ''}
    </button>
    ${site.showNames ? `<div class="tile-meta">
      <h3 class="tile-title">${project.title}</h3>
      <p class="tile-info"><span>${project.category}</span><span>${project.duration}</span></p>
    </div>` : ''}`;

  const tile = {
    project,
    el,
    media: el.querySelector('.tile-media'),
    video: el.querySelector('video'),
  };

  // The poster stays up until the video is really playing, so there is never a black flash.
  tile.video.addEventListener('playing', () => el.classList.add('is-playing'));
  tile.media.addEventListener('click', () => (project.full || project.preview) && openLightbox(project));
  return tile;
}

// Videos only get a src when they are close to the viewport.
function ensureSrc(tile) {
  if (tile.video.dataset.loaded || !tile.video.dataset.src) return;
  tile.video.dataset.loaded = '1';
  tile.video.preload = 'auto';
  tile.video.src = tile.video.dataset.src;
}

function start(tile) {
  ensureSrc(tile);
  safePlay(tile.video);
}

function stop(tile) {
  tile.video.pause();
  tile.el.classList.remove('is-playing');
  if (tile.video.readyState > 0) tile.video.currentTime = 0;
}

function wireHover(tile) {
  tile.media.addEventListener('pointerenter', (e) => {
    if (e.pointerType === 'mouse' || e.pointerType === 'pen') start(tile);
  });
  tile.media.addEventListener('pointerleave', () => stop(tile));
  tile.media.addEventListener('focus', () => {
    if (tile.media.matches(':focus-visible')) start(tile);
  });
  tile.media.addEventListener('blur', () => stop(tile));
}

function wireTouch() {
  const pick = rafThrottle(() => {
    const vh = innerHeight;
    let best = null;
    let bestDist = Infinity;
    for (const t of tiles) {
      const r = t.media.getBoundingClientRect();
      const visible = Math.min(r.bottom, vh) - Math.max(r.top, 0);
      if (visible < r.height * 0.6) continue;
      const dist = Math.abs((r.top + r.bottom) / 2 - vh / 2);
      if (dist < bestDist) {
        best = t;
        bestDist = dist;
      }
    }
    for (const t of tiles) {
      const playing = !t.video.paused;
      if (t === best && !playing) start(t);
      else if (t !== best && (playing || t.el.classList.contains('is-playing'))) stop(t);
    }
  });
  addEventListener('scroll', pick, { passive: true });
  addEventListener('resize', pick);
  pick();
}

/* ---------- Lightbox ---------- */
// YouTube links (youtu.be, watch?v=, shorts, embed) play in an embedded player instead of the built-in one.
function youtubeId(url = '') {
  const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/|live\/))([\w-]{11})/);
  return m ? m[1] : null;
}

let lightbox = null;
let lightboxPlayer = null;

function buildLightbox() {
  lightbox = document.createElement('dialog');
  lightbox.className = 'lightbox';
  lightbox.innerHTML = `
    <div class="lightbox-bar">
      <div><h3 class="lb-title"></h3><p class="lb-cat"></p></div>
      <button type="button" class="btn btn-quiet lb-close">Close</button>
    </div>
    <div class="player"><video playsinline loop></video></div>
    <div class="embed" hidden><iframe title="Video player" allow="autoplay; fullscreen; picture-in-picture; encrypted-media" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe></div>`;
  document.body.append(lightbox);

  lightboxPlayer = enhancePlayer(lightbox.querySelector('.player'));
  lightbox.querySelector('.lb-close').addEventListener('click', () => lightbox.close());
  // A click on the dimmed backdrop lands on the dialog itself
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) lightbox.close();
  });
  lightbox.addEventListener('close', () => {
    const v = lightboxPlayer.video;
    v.pause();
    v.removeAttribute('src');
    v.load();
    lightbox.querySelector('iframe').removeAttribute('src');
  });
}

function openLightbox(project) {
  if (!lightbox) buildLightbox();
  const v = lightboxPlayer.video;
  lightbox.querySelector('.lb-title').textContent = site.showNames ? project.title : '';
  lightbox.querySelector('.lb-cat').textContent = site.showNames ? `${project.category}, ${project.duration}` : '';
  const yt = youtubeId(project.full);
  const player = lightbox.querySelector('.player');
  const embed = lightbox.querySelector('.embed');
  player.hidden = !!yt;
  embed.hidden = !yt;
  if (yt) {
    lightbox.querySelector('iframe').src = `https://www.youtube-nocookie.com/embed/${yt}?autoplay=1&rel=0&modestbranding=1&playsinline=1`;
  } else {
    v.poster = project.poster;
    v.preload = 'auto';
    v.src = project.full || project.preview;
    v.muted = false;
  }
  if (lightbox.showModal) lightbox.showModal();
  else lightbox.setAttribute('open', '');
  if (!yt) safePlay(v);
}

export function initWork() {
  const grid = document.getElementById('work-grid');
  if (!grid) return;

  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        ensureSrc(tiles.find((t) => t.el === entry.target));
        io.unobserve(entry.target);
      }
    },
    { rootMargin: '600px 0px' },
  );

  projects.forEach((project, i) => {
    const tile = buildTile(project, i);
    tiles.push(tile);
    grid.append(tile.el);
    io.observe(tile.el);
    if (canHover()) wireHover(tile);
  });

  // The hover clips are tiny (about 2 MB in total): fetch them quietly once the page has loaded,
  // so hovering or scrolling plays instantly instead of waiting on the network.
  setTimeout(() => tiles.forEach(ensureSrc), 400);

  if (!canHover()) wireTouch();

  // Links like work.html#velocity open that clip straight away
  const hit = projects.find((p) => p.id === location.hash.slice(1));
  if (hit && (hit.full || hit.preview)) openLightbox(hit);
}
