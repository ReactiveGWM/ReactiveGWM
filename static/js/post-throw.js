(() => {
  'use strict';
  const root = document.getElementById('post-throw-control');
  if (!root) return;
  const videos = [...root.querySelectorAll('video')];
  const otherVideos = [...document.querySelectorAll('video')].filter((video) => !root.contains(video));
  const cards = [...root.querySelectorAll('.pt-card')];
  const fps = Number(root.dataset.fps);
  const sourceFrames = Number(root.dataset.sourceFrames);
  const lastTime = (sourceFrames - 1) / fps;
  const playButton = root.querySelector('[data-pt-play]');
  const inputRows = cards.map((card) => ({
    element: card.querySelector('[data-pt-actions]'),
    value: card.querySelector('.pt-input strong'),
    actions: JSON.parse(card.querySelector('[data-pt-actions]').dataset.ptActions),
    guide: card.querySelector('.pt-role-guide'),
  }));
  let time = 0, wanted = false, buffering = false, failed = false, generation = 0, raf = null;
  const clamp = (value) => Math.max(0, Math.min(lastTime, Number(value) || 0));

  function draw() {
    playButton.textContent = failed ? 'Retry synchronized playback' : wanted ? 'Pause all three' : 'Play all three';
    playButton.setAttribute('aria-pressed', String(wanted));
    playButton.setAttribute('aria-busy', String(buffering));
    const index = controlIndexAtTime(time, fps, 0, sourceFrames, inputRows[0].actions.length);
    inputRows.forEach(({ element, value, actions, guide }) => {
      const action = index < 0 ? null : actions[index];
      value.textContent = action === null ? 'Initial frame' : actionLabel(action);
      element.classList.toggle('is-active', action !== null && action !== 'no_op');
      guide.toggleAttribute('hidden', time >= 1 / fps);
    });
  }

  function freeze() {
    if (raf !== null) cancelAnimationFrame(raf);
    raf = null;
    videos.forEach((video) => video.pause());
  }

  function pause() {
    if (wanted && !buffering) time = clamp(videos[0].currentTime);
    generation++;
    wanted = false;
    buffering = false;
    freeze();
    align();
    draw();
  }

  function align() {
    videos.forEach((video) => {
      if (video.readyState > 0 && Math.abs(video.currentTime - time) > 0.001) video.currentTime = time;
    });
  }

  function fail() {
    pause();
    failed = true;
    playButton.title = 'A video could not load. Retry or use the individual video links.';
    draw();
  }

  function ready(video) {
    if (video.readyState >= 3 && !video.seeking) return Promise.resolve();
    return new Promise((resolve, reject) => {
      const clean = () => { video.removeEventListener('canplay', ok); video.removeEventListener('error', bad); };
      const ok = () => { clean(); resolve(); };
      const bad = () => { clean(); reject(new Error('Video unavailable')); };
      video.addEventListener('canplay', ok, { once: true });
      video.addEventListener('error', bad, { once: true });
      video.preload = 'auto';
      if (video.networkState === 0 || video.networkState === 3) video.load();
    });
  }

  function tick() {
    if (!wanted || buffering) return;
    const master = videos[0];
    time = clamp(master.currentTime);
    if (master.ended) { finish(); return; }
    videos.slice(1).forEach((video) => {
      if (!video.seeking && Math.abs(video.currentTime - master.currentTime) > 1 / fps) video.currentTime = master.currentTime;
    });
    draw();
    raf = requestAnimationFrame(tick);
  }

  function finish() {
    pause();
    time = lastTime;
    align();
    draw();
  }

  async function play({ resume = false } = {}) {
    const ticket = ++generation;
    wanted = true;
    buffering = true;
    failed = false;
    playButton.removeAttribute('title');
    freeze();
    if (!resume && time >= lastTime) time = 0;
    document.dispatchEvent(new CustomEvent('reactivegwm:comparison-play', { detail: root.id }));
    otherVideos.forEach((video) => video.pause());
    draw();
    try {
      await Promise.all(videos.map(ready));
      if (ticket !== generation || !wanted) return;
      align();
      await Promise.all(videos.map(ready));
      if (ticket !== generation || !wanted) return;
      await Promise.all(videos.map((video) => video.play()));
      if (ticket !== generation || !wanted) { if (!wanted) freeze(); return; }
      buffering = false;
      draw();
      raf = requestAnimationFrame(tick);
    } catch (_) {
      if (ticket !== generation) return;
      fail();
    }
  }

  videos.forEach((video) => {
    video.controls = false;
    video.addEventListener('waiting', () => {
      if (wanted && !buffering) { time = clamp(videos[0].currentTime); play({ resume: true }); }
    });
    video.addEventListener('loadedmetadata', () => { if (!wanted) align(); });
    video.addEventListener('error', fail);
  });
  videos[0].addEventListener('ended', () => { if (wanted) finish(); });
  otherVideos.forEach((video) => video.addEventListener('play', () => { if (wanted) pause(); }));
  document.addEventListener('reactivegwm:comparison-play', (event) => { if (event.detail !== root.id && wanted) pause(); });
  document.addEventListener('visibilitychange', () => { if (document.hidden && wanted) pause(); });
  playButton.addEventListener('click', () => { if (wanted) pause(); else play(); });
  root.querySelector('[data-pt-enhanced]').hidden = false;
  inputRows.forEach(({ element }) => { element.hidden = false; });
  root.classList.add('pt-js-ready');
  draw();
})();
