(() => {
  'use strict';
  const root = document.getElementById('actionparty-comparison');
  if (!root) return;
  const cards = [...root.querySelectorAll('[data-ap-pair]')];
  const currentLabel = root.querySelector('[data-ap-current]');
  const counter = root.querySelector('[data-ap-counter]');
  const controllers = [];

  cards.forEach((card) => {
    const videos = [...card.querySelectorAll('video')];
    const otherVideos = [...document.querySelectorAll('video')].filter((video) => !card.contains(video));
    const guides = [...card.querySelectorAll('.ap-role-guide')];
    const fps = Number(card.dataset.fps);
    const lastTime = (Number(card.dataset.sourceFrames) - 1) / fps;
    const playButton = card.querySelector('[data-ap-play]');
    const range = card.querySelector('[data-ap-range]');
    const clock = card.querySelector('[data-ap-clock]');
    const playhead = card.querySelector('.ap-playhead');
    let time = 0, wanted = false, buffering = false, failed = false, generation = 0, raf = null;
    const clamp = (value) => Math.max(0, Math.min(lastTime, Number(value) || 0));

    function draw() {
      playButton.textContent = failed ? 'Retry both videos' : wanted ? 'Pause both' : 'Play both';
      playButton.setAttribute('aria-pressed', String(wanted));
      playButton.setAttribute('aria-busy', String(buffering));
      range.value = time;
      range.setAttribute('aria-valuetext', `${time.toFixed(2)} of ${lastTime.toFixed(2)} seconds`);
      clock.textContent = `${time.toFixed(2)} / ${lastTime.toFixed(2)} s`;
      playhead.style.left = `${time / lastTime * 100}%`;
      guides.forEach((guide) => guide.toggleAttribute('hidden', time >= 1 / fps));
    }

    function freeze() {
      if (raf !== null) cancelAnimationFrame(raf);
      raf = null;
      videos.forEach((video) => video.pause());
    }

    function align() {
      videos.forEach((video) => {
        if (video.readyState > 0 && Math.abs(video.currentTime - time) > 0.001) video.currentTime = time;
      });
    }

    function pause() {
      if (wanted && !buffering) time = clamp(videos[0].currentTime);
      generation++;
      wanted = false;
      buffering = false;
      freeze(); align(); draw();
    }

    function seek(value) {
      pause();
      time = clamp(Math.round(Number(value) * fps) / fps);
      videos.forEach((video) => {
        if (video.preload === 'none') video.preload = 'metadata';
        if (video.networkState === 0) video.load();
      });
      align(); draw();
    }

    function fail() {
      pause(); failed = true;
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

    function finish() {
      pause(); time = lastTime; align(); draw();
    }

    function tick() {
      if (!wanted || buffering) return;
      const master = videos[0];
      time = clamp(master.currentTime);
      if (master.ended) { finish(); return; }
      if (!videos[1].seeking && Math.abs(videos[1].currentTime - master.currentTime) > 1 / fps) videos[1].currentTime = master.currentTime;
      draw(); raf = requestAnimationFrame(tick);
    }

    async function play({ resume = false } = {}) {
      const ticket = ++generation;
      wanted = true; buffering = true; failed = false;
      playButton.removeAttribute('title');
      freeze();
      if (!resume && time >= lastTime) time = 0;
      document.dispatchEvent(new CustomEvent('reactivegwm:comparison-play', { detail: card.id }));
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
        buffering = false; draw(); raf = requestAnimationFrame(tick);
      } catch (_) {
        if (ticket === generation) fail();
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
    document.addEventListener('reactivegwm:comparison-play', (event) => { if (event.detail !== card.id && wanted) pause(); });
    document.addEventListener('visibilitychange', () => { if (document.hidden && wanted) pause(); });
    playButton.addEventListener('click', () => { if (wanted) pause(); else play(); });
    range.addEventListener('input', () => seek(range.value));
    card.querySelector('[data-ap-cue]').addEventListener('click', () => seek(card.dataset.actionStart));
    card.querySelectorAll('[data-ap-enhanced]').forEach((element) => { element.hidden = false; });
    card.classList.add('ap-ready');
    draw();
    controllers.push({ pause, reset() { pause(); time = 0; failed = false; playButton.removeAttribute('title'); align(); draw(); } });
  });

  let current = -1;
  function activate(index) {
    index = (index + cards.length) % cards.length;
    if (index === current) return;
    if (current >= 0) controllers[current].pause();
    cards.forEach((card, i) => { card.hidden = i !== index; });
    current = index;
    controllers[current].reset();
    currentLabel.textContent = cards[current].dataset.apLabel;
    counter.textContent = `${current + 1} / ${cards.length}`;
  }
  root.querySelector('[data-ap-previous]').addEventListener('click', () => activate(current - 1));
  root.querySelector('[data-ap-next]').addEventListener('click', () => activate(current + 1));
  root.querySelector('[data-ap-switcher]').hidden = false;
  root.classList.add('ap-js-ready');
  activate(0);
})();
