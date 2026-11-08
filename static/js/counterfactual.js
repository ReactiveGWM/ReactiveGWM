(() => {
  'use strict';
  const root = document.getElementById('counterfactuals');
  if (!root) return;
  const data = JSON.parse(root.querySelector('[data-cf-data]').textContent);
  const cases = [...root.querySelectorAll('.cf-case')];
  const picker = root.querySelector('[data-cf-picker]');
  const range = root.querySelector('[data-cf-range]');
  const playButton = root.querySelector('[data-cf-play]');
  const status = root.querySelector('[data-cf-status]');
  const clock = root.querySelector('[data-cf-clock]');
  const markers = root.querySelector('[data-cf-markers]');
  const oldVideos = [...document.querySelectorAll('.demo-carousel video')];
  let current = 0, time = 0, wanted = false, buffering = false, generation = 0, raf = null;
  const duration = data.duration_seconds;
  const activeVideos = () => [...cases[current].querySelectorAll('video')];
  const clamp = (value) => Math.max(0, Math.min(duration, Number(value) || 0));

  function draw() {
    range.value = time;
    range.setAttribute('aria-valuetext', `${time.toFixed(2)} of ${duration.toFixed(2)} seconds`);
    clock.textContent = `${time.toFixed(2)} / ${duration.toFixed(2)} s`;
    markers.querySelectorAll('.cf-playhead').forEach((line) => { line.style.left = `${time / duration * 100}%`; });
    playButton.textContent = wanted ? 'Pause all three' : 'Play all three';
    playButton.setAttribute('aria-pressed', String(wanted));
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
    freeze(); status.textContent = 'Paused · all three videos share the same clock.'; draw();
  }
  function seek(value) {
    pause(); time = clamp(value); align(); draw();
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
    const ticket = ++generation;
    const requestedCase = current, videos = activeVideos();
    wanted = true; buffering = true;
    freeze();
    if (time >= duration) time = 0;
    oldVideos.forEach((video) => video.pause());
    status.textContent = 'Loading all three videos…'; draw();
    try {
      await Promise.all(videos.map(ready));
      if (ticket !== generation || !wanted) return;
      align();
      await Promise.all(videos.map((video) => video.play()));
      if (ticket !== generation || !wanted) {
        if (requestedCase !== current || !wanted) videos.forEach((video) => video.pause());
        return;
      }
      buffering = false; status.textContent = 'Playing together · click a trigger band to inspect its observed onset.';
      draw(); raf = requestAnimationFrame(tick);
    } catch (_) {
      if (ticket !== generation) return;
      pause(); status.textContent = 'Playback could not start. Try Play again or use the individual video links.';
    }
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
  function activate(index) {
    pause();
    cases[current].hidden = true;
    current = (index + cases.length) % cases.length; time = 0;
    cases[current].hidden = false; picker.value = current;
    root.querySelector('[data-cf-counter]').textContent = `${current + 1} / ${cases.length}`;
    activeVideos().forEach((video) => { video.controls = false; video.preload = 'metadata'; if (video.networkState === 0) video.load(); });
    align(); timingRows(); draw();
    status.textContent = 'One triplet at a time · original, delayed and removed Player actions.';
  }
  cases.forEach((article, index) => {
    article.hidden = true;
    article.querySelectorAll('video').forEach((video) => {
      video.addEventListener('play', () => { if (index !== current || !wanted) video.pause(); });
      video.addEventListener('click', () => { if (wanted) pause(); else play(); });
      video.addEventListener('waiting', () => {
        if (index === current && wanted && !buffering) { freeze(); play(); }
      });
      video.addEventListener('loadedmetadata', () => {
        if (index === current && !wanted && video.readyState > 0) video.currentTime = Math.min(time, video.duration - 0.001);
      });
      video.addEventListener('error', () => { if (index === current) { pause(); status.textContent = 'A video could not load. Reload or open its individual link.'; } });
    });
  });
  oldVideos.forEach((video) => video.addEventListener('play', () => { if (wanted) pause(); }));
  picker.addEventListener('change', () => activate(Number(picker.value)));
  root.querySelector('[data-cf-previous]').onclick = () => activate(current - 1);
  root.querySelector('[data-cf-next]').onclick = () => activate(current + 1);
  playButton.onclick = () => { if (wanted) pause(); else play(); };
  root.querySelector('[data-cf-replay]').onclick = () => { seek(0); play(); };
  root.querySelector('[data-cf-back]').onclick = () => seek(Math.round(time * data.fps - 1) / data.fps);
  root.querySelector('[data-cf-forward]').onclick = () => seek(Math.round(time * data.fps + 1) / data.fps);
  range.addEventListener('input', () => seek(range.value));
  document.addEventListener('visibilitychange', () => { if (document.hidden && wanted) pause(); });
  root.classList.add('cf-js-ready');
  root.querySelectorAll('[data-cf-enhanced]').forEach((element) => { element.hidden = false; });
  activate(0);
})();
