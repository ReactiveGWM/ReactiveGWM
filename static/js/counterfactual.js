(() => {
  'use strict';
  const root = document.getElementById('counterfactuals');
  if (!root) return;
  const data = JSON.parse(root.querySelector('[data-cf-data]').textContent);
  const cases = [...root.querySelectorAll('.cf-case')];
  const picker = root.querySelector('[data-cf-picker]');
  const playButton = root.querySelector('[data-cf-play]');
  const range = root.querySelector('[data-cf-range]');
  const clock = root.querySelector('[data-cf-clock]');
  const markers = root.querySelector('[data-cf-markers]');
  const oldVideos = [...document.querySelectorAll('.demo-carousel video')];
  let current = 0, time = 0, wanted = false, buffering = false, failed = false, generation = 0, raf = null;
  const duration = data.duration_seconds;
  const activeVideos = () => [...cases[current].querySelectorAll('video')];
  const clamp = (value) => Math.max(0, Math.min(duration, Number(value) || 0));

  function draw() {
    range.value = time;
    range.setAttribute('aria-valuetext', `${time.toFixed(2)} of ${duration.toFixed(2)} seconds`);
    clock.textContent = `${time.toFixed(2)} / ${duration.toFixed(2)} s`;
    markers.querySelectorAll('.cf-playhead').forEach((line) => { line.style.left = `${time / duration * 100}%`; });
    playButton.textContent = failed ? 'Retry synchronized playback' : wanted ? 'Pause all three' : 'Play all three';
    playButton.setAttribute('aria-pressed', String(wanted));
    playButton.setAttribute('aria-busy', String(buffering));
  }
  function freeze() {
    if (raf !== null) cancelAnimationFrame(raf);
    raf = null;
    activeVideos().forEach((video) => video.pause());
  }
  function align() {
    activeVideos().forEach((video) => { if (video.readyState > 0) video.currentTime = Math.min(time, video.duration - 0.001); });
  }
  function pause() {
    wanted = false; buffering = false; generation++;
    freeze(); draw();
  }
  function fail() {
    pause(); failed = true;
    playButton.title = 'A video could not load. Retry or use the individual video links.';
    draw();
  }
  function seek(value) {
    pause(); time = clamp(value); align(); draw();
  }
  function timingRows() {
    markers.replaceChildren();
    data.groups[current].branches.forEach((branch) => {
      const row = document.createElement('div'); row.className = 'cf-trigger-row'; row.style.setProperty('--cf-color', branch.color);
      const label = document.createElement('span'); label.textContent = branch.label;
      const small = document.createElement('small');
      const event = branch.trigger;
      small.textContent = event.status === 'observed' ? `${(event.low_frame / data.fps).toFixed(2)}–${(event.high_frame / data.fps).toFixed(2)} s` : 'No trigger observed';
      label.append(small);
      const track = document.createElement('div'); track.className = 'cf-track';
      if (event.status === 'observed') {
        const start = event.low_frame / data.fps, end = event.high_frame / data.fps;
        const mark = document.createElement('button'); mark.type = 'button'; mark.className = 'cf-event';
        mark.style.left = `${start / duration * 100}%`; mark.style.width = `${(end - start) / duration * 100}%`;
        mark.title = `${branch.label}: ${event.label}, ${start.toFixed(2)}–${end.toFixed(2)} s`;
        mark.setAttribute('aria-label', `${mark.title}. Seek all three videos to this event.`);
        mark.onclick = () => seek(start); track.append(mark);
      } else {
        const note = document.createElement('span'); note.className = 'cf-no-event'; note.textContent = 'No visible Player trigger'; track.append(note);
      }
      const line = document.createElement('span'); line.className = 'cf-playhead'; track.append(line);
      row.append(label, track); markers.append(row);
    });
  }
  function ready(video) {
    if (video.readyState >= 3) return Promise.resolve();
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
    const videos = activeVideos(), master = videos[0];
    time = clamp(master.currentTime);
    if (master.ended || time >= duration) { pause(); time = duration; align(); draw(); return; }
    videos.slice(1).forEach((video) => {
      if (!video.seeking && Math.abs(video.currentTime - master.currentTime) > 0.075) video.currentTime = master.currentTime;
    });
    draw(); raf = requestAnimationFrame(tick);
  }
  async function play() {
    document.dispatchEvent(new CustomEvent('reactivegwm:comparison-play', { detail: root.id }));
    const ticket = ++generation;
    const requestedCase = current, videos = activeVideos();
    wanted = true; buffering = true;
    failed = false; playButton.removeAttribute('title');
    freeze();
    if (time >= duration) time = 0;
    oldVideos.forEach((video) => video.pause());
    draw();
    try {
      await Promise.all(videos.map(ready));
      if (ticket !== generation || !wanted) return;
      align();
      await Promise.all(videos.map((video) => video.play()));
      if (ticket !== generation || !wanted) {
        if (requestedCase !== current || !wanted) videos.forEach((video) => video.pause());
        return;
      }
      buffering = false;
      draw(); raf = requestAnimationFrame(tick);
    } catch (_) {
      if (ticket !== generation) return;
      fail();
    }
  }
  function activate(index) {
    pause();
    cases[current].hidden = true;
    current = (index + cases.length) % cases.length; time = 0;
    cases[current].hidden = false; picker.value = current;
    cases[current].querySelector('.cf-case-heading').append(playButton);
    root.querySelector('[data-cf-counter]').textContent = `${current + 1} / ${cases.length}`;
    activeVideos().forEach((video) => { video.controls = false; video.preload = 'metadata'; if (video.networkState === 0) video.load(); });
    failed = false; playButton.removeAttribute('title');
    align(); timingRows(); draw();
  }
  cases.forEach((article, index) => {
    article.hidden = true;
    article.querySelectorAll('video').forEach((video) => {
      video.addEventListener('play', () => { if (index !== current || !wanted) video.pause(); });
      video.addEventListener('waiting', () => {
        if (index === current && wanted && !buffering) { freeze(); play(); }
      });
      video.addEventListener('loadedmetadata', () => {
        if (index === current && !wanted && video.readyState > 0) video.currentTime = Math.min(time, video.duration - 0.001);
      });
      video.addEventListener('error', () => { if (index === current) fail(); });
    });
  });
  oldVideos.forEach((video) => video.addEventListener('play', () => { if (wanted) pause(); }));
  document.addEventListener('reactivegwm:comparison-play', (event) => { if (event.detail !== root.id && wanted) pause(); });
  picker.addEventListener('change', () => activate(Number(picker.value)));
  root.querySelector('[data-cf-previous]').onclick = () => activate(current - 1);
  root.querySelector('[data-cf-next]').onclick = () => activate(current + 1);
  playButton.onclick = () => { if (wanted) pause(); else play(); };
  range.addEventListener('input', () => seek(range.value));
  document.addEventListener('visibilitychange', () => { if (document.hidden && wanted) pause(); });
  root.classList.add('cf-js-ready');
  root.querySelectorAll('[data-cf-enhanced]').forEach((element) => { element.hidden = false; });
  activate(0);
})();
