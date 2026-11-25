const methods = [
  ['original', 'Original'], ['autocache', 'Ours'], ['teacache', 'TeaCache'],
  ['dicache', 'DiCache'], ['seacache', 'SeaCache'],
];

const paperCases = [
  {
    id: 'astronaut', kind: 'video', title: 'Astronaut near Earth',
    prompt: 'An astronaut flying in space, zoom in', model: 'Wan2.1-T2V-1.3B · VBench',
    time: '5 s', icon: 'helmet',
  },
  {
    id: 'skier', kind: 'video', title: 'Skier on the slope',
    prompt: 'skis on the bottom of a snowboard, front view', model: 'Wan2.1-T2V-1.3B · VBench',
    time: '3.25 s', icon: 'skier',
  },
  {
    id: 'guitars', kind: 'image', title: 'Guitars and suitcases',
    prompt: 'three guitars and two brown suitcases', model: 'Qwen-Image-2.1 · GenEval 2',
    icon: 'guitar',
    hotspot: { label: 'Guitar body and hardware', box: [4.3, 57.62, 30.47, 22.85] },
  },
  {
    id: 'zebra', kind: 'image', title: 'Violin and zebra',
    prompt: 'a sparkling violin on top of a zebra, and a truck', model: 'Qwen-Image-2.1 · GenEval 2',
    icon: 'violin',
    hotspot: { label: 'Violin outline and zebra stripes', box: [7.42, 49.22, 28.12, 28.12] },
  },
];

const tileTemplate = document.querySelector('#tile-template');

function paperSources(scene) {
  return Object.fromEntries(methods.map(([key]) => {
    const path = `assets/paper/${scene.id}/${key}`;
    return [key, {
      image: `${path}.webp`,
      detail: scene.hotspot ? `${path}-detail.webp` : undefined,
    }];
  }));
}

function makeHotspot(hotspot, source, method) {
  const marker = document.createElement('button');
  marker.className = 'hotspot';
  marker.type = 'button';
  const [left, top, width, height] = hotspot.box;
  const centerX = left + width / 2;
  const centerY = top + height / 2;
  marker.style.setProperty('--spot-x', `${centerX}%`);
  marker.style.setProperty('--spot-y', `${centerY}%`);

  const crop = new Image();
  crop.alt = '';
  if (!source.detail) {
    crop.style.transformOrigin = `${centerX}% ${centerY}%`;
    crop.style.transform = `translate(${50 - centerX}%, ${50 - centerY}%) scale(${100 / Math.min(width, height)})`;
  }
  const icon = document.createElement('span');
  icon.setAttribute('aria-hidden', 'true');
  marker.append(crop, icon);

  function setExpanded(expanded) {
    marker.setAttribute('aria-expanded', String(expanded));
    const action = expanded ? 'Restore full image' : `Magnify ${hotspot.label.toLowerCase()}`;
    marker.setAttribute('aria-label', `${action} · ${method}`);
    icon.textContent = expanded ? '×' : '';
    crop.hidden = !expanded;
    if (expanded && !crop.hasAttribute('src')) crop.src = source.detail ?? source.image;
  }

  setExpanded(false);
  marker.addEventListener('click', () => setExpanded(crop.hidden));
  marker.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !crop.hidden) setExpanded(false);
  });
  return marker;
}

function makeTile(name, source, scene) {
  const tile = tileTemplate.content.firstElementChild.cloneNode(true);
  const visual = tile.querySelector('.visual');
  const label = source.label ?? name;
  tile.querySelector('.method-name').textContent = label;

  if (source.video) {
    const video = document.createElement('video');
    video.src = source.video;
    if (source.image) video.poster = source.image;
    video.preload = 'metadata';
    video.controls = true;
    video.muted = true;
    video.playsInline = true;
    video.setAttribute('aria-label', `${scene.title} · ${label}`);
    visual.append(video);
  } else {
    const image = new Image();
    image.src = source.image;
    image.alt = `${scene.title} · ${label}`;
    image.loading = 'lazy';
    visual.append(image);
    if (scene.hotspot) visual.append(makeHotspot(scene.hotspot, source, label));
  }
  return tile;
}

function bindPlayback(article) {
  const videos = [...article.querySelectorAll('video')];
  const button = article.querySelector('.play');
  const status = article.querySelector('.video-status');
  button.hidden = videos.length < 2;
  button.onclick = null;
  status.hidden = true;
  if (videos.length < 2) return;

  const updateButton = () => {
    if (!article.contains(videos[0])) return;
    const playing = videos.some(video => !video.paused && !video.ended);
    button.textContent = playing ? 'Pause all' : 'Play together';
  };
  updateButton();
  for (const video of videos) {
    for (const event of ['play', 'pause', 'ended']) video.addEventListener(event, updateButton);
  }
  button.onclick = async () => {
    status.hidden = true;
    if (videos.some(video => !video.paused && !video.ended)) {
      videos.forEach(video => video.pause());
      return;
    }
    const first = videos[0];
    const start = first.ended ? 0 : first.currentTime;
    const results = await Promise.allSettled(videos.map(video => {
      video.currentTime = start;
      return video.play();
    }));
    if (article.contains(first) && results.some(result => result.status === 'rejected')) {
      videos.forEach(video => video.pause());
      status.textContent = 'A clip could not be played. Check the media file or try the individual controls.';
      status.hidden = false;
    }
  };
}

function renderShowcase(scenes) {
  const hero = document.querySelector('#hero-comparison');
  const panels = hero.querySelector('.hero-panels');
  const pair = methods.filter(([key]) => key === 'original' || key === 'autocache');
  const slides = scenes.filter(scene => scene.kind === 'video' && pair.every(([key]) => {
    const source = scene.methods[key];
    return source?.video || source?.image;
  }));
  bindSceneSwitcher(hero, hero, slides, scene => {
    for (const video of panels.querySelectorAll('video')) video.pause();
    panels.replaceChildren(...pair.map(([key, name]) => makeTile(name, scene.methods[key], scene)));
    hero.querySelector('.prompt').textContent = scene.prompt;
    bindPlayback(hero);
  });
}

function comparisonEntries(scene) {
  return methods.map(([key, name]) => [key, name, scene.methods[key]])
    .filter(([, , source]) => source?.image || source?.video);
}

function formatVideoTime(seconds) {
  const ticks = Math.round(seconds * 100);
  return `${Math.floor(ticks / 6000)}:${((ticks % 6000) / 100).toFixed(2).padStart(5, '0')}`;
}

function bindComparisonTimeline(panel, videos, keyframe) {
  const controls = panel.querySelector('.video-controls');
  const status = panel.querySelector('.video-status');
  const keyframeJump = panel.querySelector('.keyframe-jump');
  const keyframeHint = panel.querySelector('.video-keyframe-hint');
  const [leader] = videos;
  controls.hidden = !leader;
  status.hidden = true;
  keyframeJump.hidden = keyframeHint.hidden = true;
  if (!leader) return undefined;

  const button = panel.querySelector('.play');
  const slider = panel.querySelector('.video-seek');
  const timeReadout = panel.querySelector('.video-time');
  const events = new AbortController();
  const options = { signal: events.signal };
  const groupSeekTargets = new WeakMap();
  let duration = 0;
  let playing = false;
  let request = 0;

  if (keyframe) {
    const timestamp = `${keyframe.time.toFixed(2)} s`;
    keyframeJump.setAttribute('aria-label', `Jump all comparison videos to ${timestamp}`);
    keyframeHint.textContent = `Click the dot to jump to ${timestamp}.`;
    keyframeJump.addEventListener('click', () => seekTogether(keyframe.time), options);
  }

  function updateTime() {
    const current = Math.min(leader.currentTime, duration);
    const label = `${formatVideoTime(current)} / ${formatVideoTime(duration)}`;
    slider.value = String(current);
    slider.setAttribute('aria-valuetext', label);
    timeReadout.textContent = label;
  }

  function updateDuration() {
    const durations = videos.map(video => video.duration);
    duration = durations.every(value => Number.isFinite(value) && value > 0) ? Math.min(...durations) : 0;
    slider.max = String(duration || 1);
    button.disabled = slider.disabled = duration === 0;
    keyframeJump.hidden = keyframeHint.hidden = !keyframe || duration === 0 || keyframe.time >= duration;
    if (!keyframeJump.hidden) keyframeJump.style.left = `${(keyframe.time / duration) * 100}%`;
    updateTime();
  }

  function leaveGroupPlayback() {
    request += 1;
    playing = false;
    button.textContent = 'Play all';
  }

  function pauseAll() {
    leaveGroupPlayback();
    videos.forEach(video => video.pause());
  }

  function seekVideo(video, time) {
    if (video.currentTime === time) return;
    groupSeekTargets.set(video, time);
    video.currentTime = time;
  }

  function seekAll(time) {
    videos.forEach(video => seekVideo(video, time));
    updateTime();
  }

  function seekTogether(time) {
    pauseAll();
    seekAll(time);
  }

  function showPlaybackError() {
    if (playing) pauseAll();
    status.textContent = 'One or more comparison clips could not be played.';
    status.hidden = false;
  }

  button.addEventListener('click', async () => {
    if (playing) {
      pauseAll();
      return;
    }
    status.hidden = true;
    const currentRequest = ++request;
    seekAll(leader.ended || leader.currentTime >= duration ? 0 : leader.currentTime);
    playing = true;
    button.textContent = 'Pause all';
    const results = await Promise.allSettled(videos.map(video => video.play()));
    if (currentRequest === request && results.some(result => result.status === 'rejected')) showPlaybackError();
  }, options);

  slider.addEventListener('input', () => seekTogether(slider.valueAsNumber), options);

  leader.addEventListener('timeupdate', () => {
    const time = leader.currentTime;
    if (playing && !leader.seeking && time >= duration) {
      pauseAll();
      seekAll(duration);
      return;
    }
    if (playing && !leader.seeking) {
      for (const video of videos.slice(1)) {
        if (!video.seeking && Math.abs(video.currentTime - time) > 0.08) seekVideo(video, time);
      }
    }
    updateTime();
  }, options);
  leader.addEventListener('ended', () => {
    if (playing) pauseAll();
  }, options);
  for (const video of videos) {
    video.addEventListener('pause', () => {
      if (playing && video.paused && !video.ended) leaveGroupPlayback();
    }, options);
    video.addEventListener('seeking', () => {
      if (playing && video.currentTime !== groupSeekTargets.get(video)) leaveGroupPlayback();
    }, options);
    video.addEventListener('seeked', () => groupSeekTargets.delete(video), options);
    video.addEventListener('loadedmetadata', updateDuration, options);
    video.addEventListener('error', showPlaybackError, options);
  }
  pauseAll();
  updateDuration();

  return () => {
    events.abort();
    pauseAll();
  };
}

function bindSceneSwitcher(gallery, panel, examples, renderScene) {
  gallery.hidden = examples.length === 0;
  if (gallery.hidden) return;

  const switcher = gallery.querySelector('.scene-switcher');
  const previous = panel.querySelector('.carousel-prev');
  const next = panel.querySelector('.carousel-next');
  const svgNamespace = 'http://www.w3.org/2000/svg';
  let selected = -1;
  const buttons = examples.map((scene, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.title = scene.title;
    button.setAttribute('aria-label', scene.title);
    button.setAttribute('aria-controls', panel.id);
    const icon = document.createElementNS(svgNamespace, 'svg');
    icon.setAttribute('viewBox', '0 0 24 24');
    icon.setAttribute('aria-hidden', 'true');
    const drawing = document.createElementNS(svgNamespace, 'use');
    drawing.setAttribute('href', `#scene-icon-${scene.icon || scene.kind}`);
    icon.append(drawing);
    button.append(icon);
    button.addEventListener('click', () => showScene(index));
    return button;
  });
  switcher.append(...buttons);
  previous.hidden = next.hidden = examples.length < 2;
  previous.addEventListener('click', () => showScene((selected + examples.length - 1) % examples.length));
  next.addEventListener('click', () => showScene((selected + 1) % examples.length));

  function showScene(index) {
    if (index === selected) return;
    selected = index;
    buttons.forEach((button, position) => button.setAttribute('aria-pressed', String(position === index)));
    renderScene(examples[index]);
  }

  showScene(0);
}

function renderVideoGallery(scenes) {
  const gallery = document.querySelector('#video-gallery');
  const examples = scenes.filter(scene => scene.kind === 'video' && comparisonEntries(scene).length);
  const skierIndex = examples.findIndex(scene => scene.id === 'vbench_0938' || scene.id === 'skier');
  if (skierIndex > 0) examples.unshift(examples.splice(skierIndex, 1)[0]);

  const panel = gallery.querySelector('#video-comparison');
  const primary = panel.querySelector('.video-primary');
  const baselines = panel.querySelector('.video-baselines');
  let stopPlayback;

  bindSceneSwitcher(gallery, panel, examples, scene => {
    stopPlayback?.();
    panel.querySelector('.prompt').textContent = `“${scene.prompt}”`;
    const entries = comparisonEntries(scene);
    const primaryTiles = [];
    const baselineTiles = [];
    for (const [key, name, source] of entries) {
      const tiles = key === 'original' || key === 'autocache' ? primaryTiles : baselineTiles;
      tiles.push(makeTile(name, source, scene));
    }
    primary.replaceChildren(...primaryTiles);
    baselines.replaceChildren(...baselineTiles);
    stopPlayback = bindComparisonTimeline(panel, [...panel.querySelectorAll('video')], scene.keyframe);
  });
}

function renderImageGallery(scenes) {
  const gallery = document.querySelector('#image-gallery');
  const examples = scenes.filter(scene => scene.kind === 'image' && comparisonEntries(scene).length);
  const panel = gallery.querySelector('#image-comparison');
  const row = panel.querySelector('.comparison');

  bindSceneSwitcher(gallery, panel, examples, scene => {
    panel.querySelector('.prompt').textContent = `“${scene.prompt}”`;
    const entries = comparisonEntries(scene);
    row.replaceChildren(...entries.map(([, name, source]) => makeTile(name, source, scene)));
    row.scrollLeft = 0;
    const [model, benchmark] = scene.model?.split(' · ', 2) ?? [];
    panel.querySelector('.case-note').textContent =
      [model, benchmark?.replace(/ (evaluation|exploration)$/, '')].filter(Boolean).join(' · ');
  });
}

const incoming = new Map(window.autoCacheMedia.map(scene => [scene.id, scene]));
const scenes = paperCases.map(scene => {
  const replacement = incoming.get(scene.id);
  const sources = paperSources(scene);
  for (const [key, source] of Object.entries(replacement?.methods ?? {})) {
    sources[key] = { ...sources[key], ...source };
  }
  incoming.delete(scene.id);
  return { ...scene, ...replacement, methods: sources };
});
scenes.push(...incoming.values());
const selectedVideos = window.autoCacheMedia
  .map(({ id }) => scenes.find(scene => scene.id === id))
  .filter(scene => scene?.kind === 'video');
const videoScenes = selectedVideos.length ? selectedVideos : scenes;
renderShowcase(window.autoCacheShowcase ?? []);
renderVideoGallery(videoScenes);
renderImageGallery(scenes);
