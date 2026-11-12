(() => {
  const section = document.querySelector('#long-horizon-streaming');
  if (!section) return;
  const label = action => action === 'no_op' ? 'No input' : action.split(' + ').map(x => x.replaceAll('_', ' ')).map(x => x[0].toUpperCase() + x.slice(1)).join(' + ');
  section.querySelectorAll('.streaming-card').forEach(card => {
    const video = card.querySelector('video');
    const panel = card.querySelector('.streaming-live');
    const clock = panel.querySelector('[data-streaming-clock]');
    const tracks = [...panel.querySelectorAll('[data-streaming-track]')].map(row => ({row, value:row.querySelector('[data-streaming-value]'), ...JSON.parse(row.dataset.streamingTrack)}));
    let callback = null;
    const frameCallback = typeof video.requestVideoFrameCallback === 'function';
    function update(time = video.currentTime) {
      const frame = Math.max(0, Math.min(600, Math.floor(time * 20 + 1e-4)));
      const block = frame === 0 ? -1 : Math.min(149, Math.floor((frame - 1) / 4));
      clock.textContent = `${Math.min(time, 30).toFixed(2)} / 30.00 s`;
      tracks.forEach(track => {
        let text = 'Initial frame', active = false;
        if (block >= 0 && track.actions) {
          const action = track.actions[block]; text = label(action); active = action !== 'no_op';
        } else if (block >= 0 && track.observed) {
          text = track.observed.findLast(([start]) => time >= start)?.[1] || 'Initial frame';
          active = text.includes('Approaches') || text.includes('Follows');
        }
        track.value.textContent = text;
        track.row.classList.toggle('is-active', active);
      });
    }
    function stop() {
      if (callback === null) return;
      if (frameCallback) video.cancelVideoFrameCallback(callback); else cancelAnimationFrame(callback);
      callback = null;
    }
    function schedule() {
      if (video.paused || video.ended || callback !== null) return;
      if (frameCallback) callback = video.requestVideoFrameCallback((_, metadata) => {callback = null; update(metadata.mediaTime); schedule();});
      else callback = requestAnimationFrame(() => {callback = null; update(); schedule();});
    }
    ['loadedmetadata', 'loadeddata', 'timeupdate', 'seeking', 'seeked', 'emptied'].forEach(event => video.addEventListener(event, () => update()));
    video.addEventListener('play', () => {
      document.querySelectorAll('video').forEach(other => {if (other !== video) other.pause();});
      update(); schedule();
    });
    ['pause', 'ended'].forEach(event => video.addEventListener(event, () => {stop(); update();}));
    update(); panel.hidden = false;
  });
  document.addEventListener('play', event => {
    if (event.target.tagName === 'VIDEO' && !section.contains(event.target)) section.querySelectorAll('video').forEach(v => v.pause());
  }, true);
})();
