// Custom video controls: play/pause, seek bar, time, mute, fullscreen.
// Used by the hero reel and the lightbox. Call enhancePlayer(el) on a
// <div class="player"> that contains a <video>.

import { fmtTime, clamp, safePlay } from './utils.js';

const ICON = {
  play: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l11-6.5z"/></svg>',
  pause: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 5h4v14H7zM13 5h4v14h-4z"/></svg>',
  volume:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9.5v5h3.5l4.5 4v-13l-4.5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M18 6a8.5 8.5 0 0 1 0 12" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
  muted:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9.5v5h3.5l4.5 4v-13l-4.5 4z"/><path d="M16 9.5l5 5M21 9.5l-5 5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
  full: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
};

export function enhancePlayer(root) {
  const video = root.querySelector('video');
  if (!video || root.dataset.enhanced) return null;
  root.dataset.enhanced = '1';

  const ui = document.createElement('div');
  ui.className = 'player-ui';
  ui.innerHTML = `
    <button type="button" class="p-btn p-play"></button>
    <div class="p-scrub" role="slider" tabindex="0" aria-label="Seek" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">
      <div class="p-fill"></div><div class="p-knob"></div>
    </div>
    <span class="p-time">0:00 / 0:00</span>
    <button type="button" class="p-btn p-mute"></button>
    <button type="button" class="p-btn p-full" aria-label="Fullscreen">${ICON.full}</button>`;
  root.append(ui);

  const playBtn = ui.querySelector('.p-play');
  const muteBtn = ui.querySelector('.p-mute');
  const fullBtn = ui.querySelector('.p-full');
  const scrub = ui.querySelector('.p-scrub');
  const fill = ui.querySelector('.p-fill');
  const knob = ui.querySelector('.p-knob');
  const time = ui.querySelector('.p-time');

  if (root.hasAttribute('data-unmute')) {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'p-unmute';
    chip.innerHTML = `${ICON.muted}<span>Sound off</span>`;
    chip.addEventListener('click', () => {
      video.muted = false;
    });
    root.append(chip);
  }

  function sync() {
    const playing = !video.paused && !video.ended;
    playBtn.innerHTML = playing ? ICON.pause : ICON.play;
    playBtn.setAttribute('aria-label', playing ? 'Pause' : 'Play');
    muteBtn.innerHTML = video.muted ? ICON.muted : ICON.volume;
    muteBtn.setAttribute('aria-label', video.muted ? 'Unmute' : 'Mute');
    root.classList.toggle('is-muted', video.muted);
    root.classList.toggle('is-paused', !playing);
  }

  function paint() {
    const duration = video.duration || 0;
    const t = video.currentTime || 0;
    const pct = duration ? (t / duration) * 100 : 0;
    fill.style.width = `${pct}%`;
    knob.style.left = `${pct}%`;
    time.textContent = `${fmtTime(t)} / ${fmtTime(duration)}`;
    scrub.setAttribute('aria-valuenow', String(Math.round(pct)));
  }

  // Smooth progress while playing
  let raf = 0;
  const loop = () => {
    paint();
    raf = requestAnimationFrame(loop);
  };
  video.addEventListener('play', () => {
    sync();
    cancelAnimationFrame(raf);
    loop();
  });
  video.addEventListener('pause', () => {
    sync();
    cancelAnimationFrame(raf);
    paint();
  });
  for (const ev of ['loadedmetadata', 'durationchange', 'seeked', 'volumechange', 'ended']) {
    video.addEventListener(ev, () => {
      sync();
      paint();
    });
  }

  function toggle() {
    if (video.paused) {
      delete root.dataset.userPaused;
      safePlay(video);
    } else {
      root.dataset.userPaused = '1';
      video.pause();
    }
  }

  playBtn.addEventListener('click', toggle);
  video.addEventListener('click', toggle);
  muteBtn.addEventListener('click', () => {
    video.muted = !video.muted;
  });

  fullBtn.addEventListener('click', () => {
    try {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else if (root.requestFullscreen) {
        root.requestFullscreen().catch(() => {});
      } else if (video.webkitEnterFullscreen) {
        video.webkitEnterFullscreen();
      }
    } catch {
      /* fullscreen is optional */
    }
  });

  // Seek by dragging or tapping the bar
  let dragging = false;
  const seekFrom = (e) => {
    const rect = scrub.getBoundingClientRect();
    const p = clamp((e.clientX - rect.left) / rect.width, 0, 1);
    if (video.duration) video.currentTime = p * video.duration;
    paint();
  };
  scrub.addEventListener('pointerdown', (e) => {
    dragging = true;
    scrub.setPointerCapture(e.pointerId);
    seekFrom(e);
  });
  scrub.addEventListener('pointermove', (e) => dragging && seekFrom(e));
  scrub.addEventListener('pointerup', () => (dragging = false));
  scrub.addEventListener('pointercancel', () => (dragging = false));
  scrub.addEventListener('keydown', (e) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    e.preventDefault();
    const step = e.key === 'ArrowRight' ? 5 : -5;
    video.currentTime = clamp(video.currentTime + step, 0, video.duration || 0);
  });

  // Show controls while the pointer moves, then hide them again
  let idle = 0;
  root.addEventListener('pointermove', () => {
    root.classList.add('show-ui');
    clearTimeout(idle);
    idle = setTimeout(() => root.classList.remove('show-ui'), 2200);
  });

  sync();
  paint();
  if (!video.paused) loop();

  return { root, video };
}
