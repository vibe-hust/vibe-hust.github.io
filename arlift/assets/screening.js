const controlsTemplate = document.getElementById('clip-controls');
const fullscreenElement = () => document.fullscreenElement || document.webkitFullscreenElement;

function labelButton(button, label) {
  button.setAttribute('aria-label', label);
  button.title = label;
}

function restoreInlineScroll(position) {
  // Some browsers exit fullscreen before the window has finished resizing.
  const deadline = performance.now() + 1500;
  function restore(now) {
    if (fullscreenElement()) return;
    const resized = window.innerWidth === position.width && window.innerHeight === position.height;
    if (!resized && now < deadline) {
      requestAnimationFrame(restore);
      return;
    }
    window.scrollTo({ left: position.left, top: position.top, behavior: 'instant' });
  }
  requestAnimationFrame(restore);
}

for (const player of document.querySelectorAll('.film-player')) {
  const video = player.querySelector('video');
  const filmTitle = player.closest('figure').querySelector('figcaption');
  video.id = filmTitle.id.replace('-title', '-video');
  const bar = controlsTemplate.content.firstElementChild.cloneNode(true);
  const play = bar.querySelector('.play-toggle');
  const seek = bar.querySelector('.seek');
  const full = bar.querySelector('.full-toggle');
  const name = filmTitle.textContent;
  bar.setAttribute('aria-label', name + ' controls');
  for (const element of [play, seek, full]) element.setAttribute('aria-controls', video.id);
  seek.setAttribute('aria-label', 'Seek in ' + name);
  player.append(bar);

  let notice;
  function report(text) {
    if (!notice && text) {
      notice = document.createElement('p');
      notice.className = 'media-error';
      notice.setAttribute('role', 'status');
      player.after(notice);
    }
    if (notice) {
      notice.textContent = text;
      notice.hidden = !text;
    }
  }

  function togglePlay() {
    if (video.paused) {
      video.play().catch(error => {
        if (error.name !== 'AbortError') report('This film could not be played.');
      });
    } else {
      video.pause();
    }
  }

  function updatePlay() {
    const playing = !video.paused && !video.ended;
    player.classList.toggle('is-playing', playing);
    labelButton(play, (playing ? 'Pause ' : 'Play ') + name);
  }

  function updateTime() {
    if (!Number.isFinite(video.duration) || video.duration <= 0) {
      seek.disabled = true;
      return;
    }
    seek.disabled = false;
    seek.max = String(video.duration);
    if (!dragging) seek.value = String(video.currentTime);
    const time = Number(seek.value);
    seek.style.setProperty('--played', (100 * time / video.duration) + '%');
    seek.setAttribute('aria-valuetext', time.toFixed(2) + ' of ' + video.duration.toFixed(2) + ' seconds');
  }

  let dragging = false;
  seek.addEventListener('pointerdown', () => { dragging = true; });
  for (const event of ['pointerup', 'pointercancel', 'lostpointercapture', 'blur']) {
    seek.addEventListener(event, () => { dragging = false; });
  }
  seek.addEventListener('input', () => {
    if (!Number.isFinite(video.duration)) return;
    video.currentTime = Math.min(Number(seek.value), video.duration);
    updateTime();
  });

  let returnView = null;
  function updateFullscreen() {
    const active = fullscreenElement();
    const inPlayer = active === player || active === video || Boolean(video.webkitDisplayingFullscreen);
    const leaving = player.classList.contains('in-fullscreen') && !inPlayer;
    player.classList.toggle('in-fullscreen', inPlayer);
    video.controlsList?.toggle('nofullscreen', active === player);
    video.controls = inPlayer;
    labelButton(full, (inPlayer ? 'Exit fullscreen for ' : 'Fullscreen for ') + name);
    if (leaving && returnView) {
      restoreInlineScroll(returnView);
      returnView = null;
    }
  }

  full.hidden = !(player.requestFullscreen || player.webkitRequestFullscreen || video.webkitEnterFullscreen);
  full.addEventListener('click', async () => {
    if (!fullscreenElement()) {
      returnView = {
        left: window.scrollX, top: window.scrollY,
        width: window.innerWidth, height: window.innerHeight
      };
    }
    try {
      if (fullscreenElement()) {
        if (document.exitFullscreen) await document.exitFullscreen();
        else document.webkitExitFullscreen();
      } else if (player.requestFullscreen) {
        await player.requestFullscreen();
      } else if (player.webkitRequestFullscreen) {
        player.webkitRequestFullscreen();
      } else if (video.webkitEnterFullscreen) {
        video.webkitEnterFullscreen();
      }
    } catch {
      returnView = null;
      report('Fullscreen is unavailable in this window.');
    }
  });

  play.addEventListener('click', togglePlay);
  video.addEventListener('click', () => { if (!video.controls) togglePlay(); });
  for (const event of ['play', 'pause', 'ended', 'emptied']) video.addEventListener(event, updatePlay);
  for (const event of ['timeupdate', 'loadedmetadata', 'durationchange', 'seeked']) video.addEventListener(event, updateTime);
  for (const event of ['fullscreenchange', 'webkitfullscreenchange']) document.addEventListener(event, updateFullscreen);
  for (const event of ['webkitbeginfullscreen', 'webkitendfullscreen']) video.addEventListener(event, updateFullscreen);
  video.addEventListener('playing', () => report(''));
  video.addEventListener('error', () => report('This film could not be opened.'));

  updatePlay();
  updateTime();
  updateFullscreen();
}
