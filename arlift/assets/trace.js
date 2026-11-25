(() => {
  const figure = document.querySelector('#method .sailing-study');
  if (!figure) return;
  const svg = figure.querySelector('.sail-story');
  const el = Object.fromEntries([...svg.querySelectorAll('[id]')].map(node => [node.id, node]));
  const caption = figure.querySelector('.sail-caption');
  const controls = figure.querySelector('.sail-controls');
  const toggle = controls.querySelector('.sail-toggle');
  const replay = controls.querySelector('.sail-replay');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const seek = controls.querySelector('.sail-seek');
  const currentTime = controls.querySelector('.sail-current');
  const phaseName = controls.querySelector('.sail-phase');
  let scrubPointer = null;
  let resumeAfterScrub = false;

  const weights = [1, 1 / 3, 1 / 9, 0, 0];
  const frameWidth = el['study-live-bounds'].firstElementChild.width.baseVal.value;
  const axis = svg.viewBox.baseVal.width / 2;
  const frameLeft = scale => axis - frameWidth * scale / 2;
  const bookendScale = 1.15;
  const thumbnails = [...el['draft-frames'].children];
  const thumbScale = thumbnails[0].width.baseVal.value / frameWidth;
  const anchors = [...el['draft-frames'].querySelectorAll('use[x]')].map(use => Number(use.getAttribute('x')));
  const firstAppearance = { paint: '#964b36', stitching: '#sail-seams' };
  let elapsed = 0;
  let start = null;
  let frame = 0;
  let mode = 'ready';

  function ramp(t, from, to) {
    if (to === from) return t < from ? 0 : 1;
    const x = Math.max(0, Math.min(1, (t - from) / (to - from)));
    return x * x * (3 - 2 * x);
  }
  function mix(a, b, amount) { return a + (b - a) * amount; }
  function alpha(id, value) { el[id].style.opacity = value; }
  function set(id, attr, value) { el[id].setAttribute(attr, value); }
  function place(id, x, y, scale = 1) { set(id, 'transform', 'translate(' + x + ' ' + y + ') scale(' + scale + ')'); }
  function text(node, value) { if (node.textContent !== value) node.textContent = value; }

  // Each row schedules a new clean prediction, its comparison, application and hold.
  // Displacements visualize changes in coarse geometry, not actual latent coordinates.
  function segment(reference, offset, rows) {
    let preceding = reference + offset;
    return rows.map(([begin, compare, apply, done, end, drift], i) => {
      const estimate = preceding + drift;
      const corrected = estimate + weights[i] * .86 * (reference - estimate);
      const stage = {begin, compare, apply, done, end, preceding, estimate, corrected, weight: weights[i]};
      preceding = corrected;
      return stage;
    });
  }
  const first = segment(anchors[0], 50, [
    [5.15, 8.50, 12.25, 13.42, 14.90, 0],
    [14.90, 15.27, 15.77, 16.37, 16.77, 14],
    [16.77, 17.10, 17.42, 17.87, 18.85, -6],
    [18.85, 19.20, 19.20, 19.20, 20.85, 0],
    [20.85, 21.20, 21.20, 21.20, 22.85, 0]
  ]);
  // Segment two starts its own prediction clock only after the sailing transition.
  const second = segment(anchors[1], 27, [
    [0, 1.38, 1.95, 2.68, 4.33, 0],
    [4.33, 4.54, 4.78, 5.02, 5.25, 7],
    [5.25, 5.43, 5.59, 5.83, 6.75, -3],
    [6.75, 7.00, 7.00, 7.00, 8.75, 0],
    [8.75, 8.96, 8.96, 8.96, 10.75, 0]
  ]);
  const closeHold = .50;
  const closeExit = closeHold + .74;
  const firstComplete = first[4].end;
  const writeTime = firstComplete + closeExit;
  const advanceTime = writeTime + 1.55;
  const nextSegment = advanceTime + 1.65;
  const secondComplete = nextSegment + second[4].end;
  const screening = secondComplete + closeExit;
  const lightsDown = screening + .32;
  const filmStart = lightsDown + .45;
  const filmEnd = filmStart + 4.25;
  const duration = Math.round(filmEnd * 1000);
  const savedSegment = {x: first[4].corrected, ...firstAppearance};
  place('stored-boat', savedSegment.x, 0);
  set('stored-hull', 'fill', savedSegment.paint);
  set('stored-cloth', 'href', savedSegment.stitching);

  const earlyGuidance = 'The draft guides the broad shapes early. Its influence fades as finer details emerge.';
  const fineDetails = 'With draft guidance off, the model finishes the fine details.';
  const cues = [
    [0, 'Video draft', 'The model first drafts the whole video at its usual resolution.'],
    [first[0].begin, 'Initial prediction', 'Starting from fresh noise, the same model compares its prediction with the matching draft.'],
    [first[0].compare, 'Gaussian correction', 'Smoothing the difference keeps the correction focused on the boat’s overall shape.'],
    [first[1].begin, 'Draft guidance', earlyGuidance],
    [first[2].done + .14, 'Fine details', fineDetails],
    [firstComplete, 'Segment 1 complete', 'Segment 1 complete'],
    [writeTime, 'Memory', 'Segment 1 complete'],
    [advanceTime, 'Next segment', 'Segment 1 complete'],
    [nextSegment, 'Memory', 'The next segment follows its own draft and carries forward the boat’s appearance.'],
    [nextSegment + second[1].begin, 'Draft guidance', earlyGuidance],
    [nextSegment + second[2].done + .14, 'Fine details', fineDetails],
    [secondComplete, 'Segment 2 complete', 'Segment 2 complete'],
    [screening, 'Finished video', 'The two finished segments play in sequence.'],
    [duration / 1000, 'Demo complete', 'Demo complete']
  ].reverse();
  function clockText(ms) {
    const tenths = Math.round(ms / 100);
    const seconds = String(Math.floor(tenths / 10) % 60).padStart(2, '0');
    return Math.floor(tenths / 600) + ':' + seconds + '.' + (tenths % 10);
  }
  const totalText = clockText(duration);
  controls.querySelector('.sail-total').textContent = totalText;
  seek.max = String(duration);

  // Freeze a second instance of the live vector artwork at the third clean estimate.
  // It shares its layers and rendering function with the main scene, but has its own state.
  const frozenScene = el['live-scene'].cloneNode(true);
  const frozen = Object.fromEntries([...frozenScene.querySelectorAll('[id]')].map(node => [node.id, node]));
  frozenScene.removeAttribute('id');
  Object.values(frozen).forEach(node => node.removeAttribute('id'));
  el['step-three-scene'].append(frozenScene);
  let frozenSegment = null;

  function paintScene(nodes, x, y, appearance, retrieved, fabric, water, highlight) {
    nodes['predicted-boat'].setAttribute('transform', 'translate(' + x + ' ' + y + ')');
    nodes['painted-hull'].setAttribute('fill', appearance.paint);
    nodes['cloth-detail'].setAttribute('href', appearance.stitching);
    nodes['painted-hull'].style.opacity = retrieved;
    nodes['neutral-hull'].style.opacity = 1 - retrieved;
    nodes['cloth-detail'].style.opacity = retrieved * (.4 + .6 * fabric);
    nodes['fabric-detail'].style.opacity = fabric;
    nodes['hull-stripe'].style.opacity = retrieved * (.26 + .74 * fabric);
    nodes['rail-detail'].style.opacity = .10 + .90 * fabric;
    nodes['sea-finish'].style.opacity = .08 + .92 * water;
    nodes['reflections'].style.opacity = .08 + .92 * water;
    nodes['water-breaks'].style.opacity = water * water;
    nodes['boat-line-cue'].style.opacity = highlight;
  }

  const filterCrop = {x: anchors[0] - 84, y: 12, width: 225, height: 225 * 200 / 264};
  const filterBox = [filterCrop.x, filterCrop.y, filterCrop.width, filterCrop.height].join(' ');
  for (const id of ['before-panel', 'after-panel']) el[id].querySelector('svg').setAttribute('viewBox', filterBox);
  for (const [attr, value] of Object.entries(filterCrop)) set('filter-region', attr, value);

  function compareFiltering(t, stage) {
    const open = ramp(t, stage.compare, 9.25);
    const close = ramp(t, 11.49, stage.apply);
    const spread = open * (1 - close);
    const visible = ramp(t, stage.compare, stage.compare + .18) * (1 - ramp(t, stage.apply - .14, stage.apply));
    alpha('filter-region', ramp(t, 7.90, 8.22) * (1 - ramp(t, stage.compare, stage.compare + .32)));
    alpha('filter-comparison', visible);
    alpha('comparison-paper', spread);
    alpha('filter-labels', ramp(open, .68, 1) * (1 - ramp(close, 0, .32)));
    alpha('before-panel', 1 - ramp(close, 0, .66));
    const scale = mix(filterCrop.width / 264, 1, spread);
    const y = mix(filterCrop.y, 28, spread);
    place('before-panel', mix(filterCrop.x, 0, spread), y, scale);
    place('after-panel', mix(filterCrop.x, 276, spread), y, scale);
  }

  function frameGunwale(clock, stages, appearance) {
    const end = stages[4].end;
    const push = ramp(clock, stages[2].done + .14, stages[3].begin);
    const pull = ramp(clock, end + closeHold, end + closeExit);
    const zoom = push * (1 - pull);
    const width = 174;
    const height = width * 228 / frameWidth;
    const x = stages[2].corrected - width / 2;
    const y = 117;
    if (frozenSegment !== stages) {
      paintScene(frozen, stages[2].corrected, 0, appearance, 1, 0, 0, 0);
      const crop = [x, y, width, height].join(' ');
      set('small-detail', 'viewBox', crop);
      frozenSegment = stages;
    }
    set('scene-camera', 'viewBox', [x * zoom, y * zoom, mix(frameWidth,width,zoom), mix(228,height,zoom)].join(' '));
    alpha('detail-reference', push * (1 - ramp(clock, end, end + .18)));
  }

  function render(ms) {
    const t = ms / 1000;
    const next = t >= nextSegment;
    const clock = next ? t - nextSegment : t;
    const anchor = anchors[next ? 1 : 0];
    const stages = next ? second : first;
    const index = stages.findIndex(stage => clock < stage.end);
    const k = index < 0 ? 4 : index;
    const s = stages[k];
    const firstComparison = !next && k === 0;
    const fade = ramp(t, screening, lightsDown);

    // The opening contracts on the same centerline while the completed strip appears above it.
    const travel = ramp(t, .25, 3.78);
    const fold = ramp(t, 4.0, 4.95);
    const draftX = travel < .5 ? mix(anchors[0], anchors[1], travel * 2)
      : mix(anchors[1], anchors[2], travel * 2 - 1);
    set('moving-boat', 'x', draftX);
    const openingScale = mix(bookendScale, thumbScale, fold);
    place('draft-movie', frameLeft(openingScale), mix(101,96,fold), openingScale);
    alpha('draft-movie', 1-ramp(t,4.86,5.10));
    alpha('moving-draft-label',1-ramp(t,4.0,4.3));
    alpha('filmstrip', ramp(t,4.1,4.94) * (1 - fade));
    alpha('draft-history', ramp(t,1.15,1.75) * (1 - fade));
    set('lr-stored-boat','x',t < 2.6 ? anchors[0] : t < 3.9 ? anchors[1] : anchors[2]);
    alpha('hr-label', ramp(t,5.0,5.35) * (1 - fade));
    alpha('draft-cursor', ramp(t,4.95,5.35) * (1 - fade));
    const thumbX = frameLeft(1) + thumbnails[next ? 1 : 0].x.baseVal.value;
    place('draft-cursor', thumbX, 32);
    // The first cell stays selected while the second previews the elapsed video time.
    const advancing = t >= advanceTime && !next;
    const travelStart = advanceTime + .22;
    const advance = ramp(t, travelStart + .12, nextSegment - .14);
    set('handoff-boat', 'x', advancing && t >= travelStart ? mix(anchors[0], anchors[1], advance) : anchors[1]);
    const previewOpacity = t < travelStart ? 1-ramp(t,advanceTime,travelStart) : ramp(t,travelStart,travelStart+.12);
    alpha('handoff-boat', advancing ? previewOpacity : 1);
    alpha('sailing-forward', ramp(t,advanceTime,travelStart) * (1-ramp(t,nextSegment-.12,nextSegment)));

    // The sampler advances from the corrected result to a fresh clean estimate.
    const predictedX = mix(s.preceding, s.estimate, ramp(clock, s.begin, s.compare));
    const generatedX = mix(predictedX, s.corrected, ramp(clock, s.apply, s.done));
    const noise = next ? 1-ramp(clock,.38,1.27) : 1-ramp(t,5.55,6.55);
    alpha('hr-noise',noise);
    const seed = next ? '73' : '17';
    if (el['noise-grain'].getAttribute('seed') !== seed) set('noise-grain','seed',seed);

    let stepLabel = 'Prediction ' + (k + 1) + ' of 5';
    if (noise > .60) stepLabel = 'Independent noise';
    if (k === 3) stepLabel = 'Step 4 of 5 · Refining details';
    if (k === 4) stepLabel = 'Step 5 of 5 · Finishing this segment';
    text(el['prediction-label'], index < 0 ? '' : stepLabel);

    const enlarge = next ? ramp(clock,.84,1.32) : ramp(t,7.13,7.62);
    place('reference-zoom', mix(thumbX, frameLeft(1), enlarge), mix(32,187,enlarge), mix(thumbScale,1,enlarge));
    set('reference-boat','x',anchor);
    const reference = (next ? ramp(clock,.80,1.0):ramp(t,7.08,7.35)) *
      (1-ramp(clock,stages[2].done,stages[2].done+.14));
    text(el['reference-label'], next ? 'Matching draft · position' : 'Fixed draft reference');
    const lineStrength = next ? 1 - .65 * ramp(clock, 2.20, 2.70) : 1;

    // Signed silhouettes exclude their common area. Both views use the same signed
    // residual and spatial Gaussian filter; the ribbon belongs to this prediction.
    for (const id of ['positive-difference','reference-cutout']) set(id,'x',anchor);
    for (const id of ['negative-difference','estimate-cutout']) set(id,'x',s.estimate);
    const correction = s.weight * ramp(clock,s.compare,s.apply) * (1-ramp(clock,s.done,s.end));
    const residualOpacity = firstComparison
      ? ramp(t,s.apply-.14,s.apply) * (1-ramp(t,s.done-.30,s.done+.43))
      : correction * (1-ramp(clock,stages[2].done,stages[2].done+.14));
    alpha('applied-difference', residualOpacity);
    compareFiltering(t, first[0]);
    const inspecting = firstComparison ? ramp(t,s.compare,s.compare+.2) * (1-ramp(t,s.apply-.2,s.apply)) : 0;
    alpha('reference-zoom', reference * lineStrength * (1-inspecting));
    alpha('reference-label', reference * enlarge * (1-inspecting));

    // Light the corrected hull only where its edge meets the fixed reference edge.
    set('reference-hull-mask', 'x', anchor);
    place('corrected-hull-edge', generatedX, 0);
    const alignment = firstComparison ? ramp(t,s.done-.37,s.done) * (1-ramp(t,s.done+.68,s.end-.15)) : 0;
    alpha('aligned-contour', alignment);

    // Only the completed clean HR result can be written. The next segment reads
    // that appearance, while its location always comes from its own draft anchor.
    const appearance = next ? savedSegment : firstAppearance;
    const retrieved = next ? ramp(clock, .38, 1.25) : 1;
    const fabric = ramp(clock, stages[3].begin, stages[3].end - .12);
    const water = ramp(clock, stages[4].begin, stages[4].end);
    frameGunwale(clock, stages, appearance);

    const showMemory = ramp(t, writeTime, writeTime + .4) * (next ? 1-ramp(clock,3.75,4.33) : 1);
    alpha('hr-history', showMemory);
    alpha('memory-picture', ramp(t, writeTime, writeTime + .9));
    const reading = next && clock >= .38;
    text(el['memory-action'], reading ? 'Used in segment 2' : 'Saved from segment 1');
    set('memory-flow','transform', next ? 'translate(0 342) scale(1 -1)' : 'translate(0 0)');
    alpha('memory-flow', next ? ramp(clock,.85,1.25) * (1-ramp(clock,3.60,4.15))
      : ramp(t,writeTime,writeTime+.4) * (1-ramp(t,writeTime+1.12,advanceTime)));
    const glint = next ? ramp(clock, 1.25, 1.8) * (1 - ramp(clock, 3.05, 3.65)) : 0;
    alpha('memory-line-cue', glint);

    const screeningOpacity = ramp(t, lightsDown, filmStart);
    alpha('hr-panel', ramp(t, 5.0, 5.35) * (1 - fade) + screeningOpacity);
    alpha('finished-video-label', screeningOpacity);
    if (t < lightsDown) {
      place('hr-panel', frameLeft(1), 187);
      paintScene(el, generatedX, 0, appearance, retrieved, fabric, water, glint);
    } else {
      // Play from the finished bow-at-buoy pose to the finished mast-at-buoy pose.
      const progress = Math.max(0, Math.min(1, (t - filmStart) / (filmEnd - filmStart)));
      const x = mix(first[4].corrected, second[4].corrected, progress);
      const bob = Math.sin(4 * Math.PI * progress) * Math.sin(Math.PI * progress);
      place('hr-panel', frameLeft(bookendScale), 101, bookendScale);
      paintScene(el, x, bob, appearance, 1, 1, 1, 0);
    }

    const [, phase, line] = cues.find(([at]) => t >= at);
    text(caption, line);
    text(phaseName, phase);
    const time = clockText(ms);
    text(currentTime, time);
    seek.value = String(Math.round(ms));
    seek.style.setProperty('--seek-fill', (ms / duration * 100) + '%');
    const spoken = time + ' of ' + totalText + ', ' + phase;
    if (seek.getAttribute('aria-valuetext') !== spoken) seek.setAttribute('aria-valuetext', spoken);
  }
  function setMode(next) {
    mode = next;
    toggle.toggleAttribute('data-playing', mode === 'playing');
    toggle.querySelector('span').textContent = mode === 'playing' ? 'Pause' : mode === 'paused' ? 'Resume' : 'Play';
  }

  function hold() {
    cancelAnimationFrame(frame);
    if (start !== null) elapsed = Math.min(duration, elapsed + performance.now() - start);
    start = null;
    render(elapsed);
  }

  function tick(now) {
    const position = Math.min(duration, elapsed + Math.max(0, now - start));
    render(position);
    if (position >= duration) {
      elapsed = duration;
      start = null;
      setMode('finished');
    } else {
      frame = requestAnimationFrame(tick);
    }
  }

  function sync() {
    if (mode === 'playing' && !document.hidden) {
      if (start === null) {
        start = performance.now();
        frame = requestAnimationFrame(tick);
      }
    } else if (start !== null) {
      hold();
    }
  }

  function seekTo(ms, play) {
    cancelAnimationFrame(frame);
    start = null;
    elapsed = Math.max(0, Math.min(duration, ms));
    setMode(elapsed === duration ? 'finished' : play ? 'playing' : 'paused');
    render(elapsed);
    sync();
  }

  toggle.addEventListener('click', () => {
    if (mode === 'playing') {
      hold();
      setMode('paused');
    } else {
      seekTo(elapsed === duration ? 0 : elapsed, true);
    }
  });
  replay.addEventListener('click', () => seekTo(0, true));

  // Native range input supplies live mouse, pen, touch and assistive-technology seeks.
  // Keep the playback intent from pointer-down until release, even outside the track.
  seek.addEventListener('pointerdown', event => {
    if (!event.isPrimary || event.button !== 0 || scrubPointer !== null) return;
    scrubPointer = event.pointerId;
    resumeAfterScrub = mode === 'playing';
    hold();
    setMode('paused');
    controls.setAttribute('data-seeking', '');
  });
  seek.addEventListener('input', () => {
    seekTo(seek.valueAsNumber, scrubPointer === null && mode === 'playing');
  });
  function finishScrub(event) {
    if (scrubPointer === null || (event.pointerId != null && event.pointerId !== scrubPointer)) return;
    scrubPointer = null;
    controls.removeAttribute('data-seeking');
    seekTo(seek.valueAsNumber, resumeAfterScrub);
    resumeAfterScrub = false;
  }
  window.addEventListener('pointerup', finishScrub);
  window.addEventListener('pointercancel', finishScrub);
  window.addEventListener('blur', finishScrub);
  seek.addEventListener('keydown', event => {
    const now = seek.valueAsNumber;
    const keys = {ArrowRight: now + 1000, ArrowLeft: now - 1000, ArrowUp: now + 1000,
      ArrowDown: now - 1000, PageUp: now + 5000, PageDown: now - 5000, Home: 0, End: duration};
    if (!(event.key in keys)) return;
    event.preventDefault();
    seekTo(keys[event.key], mode === 'playing');
  });
  function showFinished() {
    scrubPointer = null;
    controls.removeAttribute('data-seeking');
    seekTo(duration, false);
  }
  motion.addEventListener('change', () => { if (motion.matches) showFinished(); });
  document.addEventListener('visibilitychange', sync);
  controls.hidden = false;
  if (motion.matches) showFinished();
  else render(0);

  // Wait until the reader can see both rows before starting the first pass.
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      const entry = entries[entries.length - 1];
      const available = Math.min(entry.boundingClientRect.height, entry.rootBounds?.height || innerHeight);
      if (!entry.isIntersecting || entry.intersectionRect.height < available * .78) return;
      observer.disconnect();
      if (mode === 'ready') {
        setMode('playing');
        sync();
      }
    }, {rootMargin: '-48px 0px 0px', threshold: Array.from({length: 21}, (_, i) => i / 20)});
    observer.observe(figure);
  }
})();
