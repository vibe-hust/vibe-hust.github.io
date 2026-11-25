// Self-contained interactivity for Evolving Loop Programs (ELP) project page.

const LONGLIVE_SCENES = [
  {
    id: 'grill',
    label: 'BBQ Grill',
    title: 'BBQ Grill & Charred Sausages',
    baseVideo: 'assets/videos/longlive/grill_base.mp4',
    oursVideo: 'assets/videos/longlive/grill_ours.mp4',
    clipBase: '0.5455',
    clipOurs: '0.9751',
    lpipsBase: '0.7005',
    lpipsOurs: '0.1713',
    ssimBase: '0.8998',
    ssimOurs: '0.9399',
    note: 'Baseline drifts & morphs into distorted red clutter at revisit; ELP seals the grill and recovers the charred sausages.',
    stripPrefix: 'grill'
  },
  {
    id: 'bread',
    label: 'Bread Maker',
    title: 'Bread Maker & Brown Loaf',
    baseVideo: 'assets/videos/longlive/bread_base.mp4',
    oursVideo: 'assets/videos/longlive/bread_ours.mp4',
    clipBase: '0.7901',
    clipOurs: '0.9641',
    lpipsBase: '0.6359',
    lpipsOurs: '0.2496',
    ssimBase: '0.9002',
    ssimOurs: '0.9575',
    note: 'Baseline melts the hinged lid into a deformed slab; ELP restores the lid and golden loaf.',
    stripPrefix: 'bread'
  },
  {
    id: 'crate',
    label: 'Milk Crate',
    title: 'Milk Crate & Folded Newspapers',
    baseVideo: 'assets/videos/longlive/crate_base.mp4',
    oursVideo: 'assets/videos/longlive/crate_ours.mp4',
    clipBase: '0.7854',
    clipOurs: '0.9569',
    lpipsBase: '0.4864',
    lpipsOurs: '0.2860',
    ssimBase: '0.9351',
    ssimOurs: '0.9723',
    note: 'Baseline hallucinates a reflective display inside the crate; ELP preserves crate structure and recovers newspapers.',
    stripPrefix: 'crate'
  },
  {
    id: 'barrel',
    label: 'Cracker Barrel',
    title: 'Cracker Barrel & Square Crackers',
    baseVideo: 'assets/videos/longlive/barrel_base.mp4',
    oursVideo: 'assets/videos/longlive/barrel_ours.mp4',
    clipBase: '0.9229',
    clipOurs: '0.9832',
    lpipsBase: '0.2850',
    lpipsOurs: '0.0729',
    ssimBase: '0.9362',
    ssimOurs: '0.9602',
    note: 'Baseline embeds dark arc artifacts and shifts camera framing; ELP seals cleanly and restores the original crackers.',
    stripPrefix: 'barrel'
  }
];

const QUAL_SCENES = [
  {
    id: 'sr_dpg_372',
    label: 'Scale-RAE: Text Rendering',
    backbone: 'Scale-RAE (Main Paper Fig. 3a)',
    prompt: '"...vibrant red heavy truck ... stop sign..."',
    methods: [
      { name: '25-step Base', flops: '31.58 TFLOPs', file: 'sr_dpg_372_base_full.jpg', verdict: '"SOOR" (DPG 0.80)', crop: [96, 12, 208, 100] },
      { name: '10-step Base', flops: '12.63 TFLOPs', file: 'sr_dpg_372_base_s10.jpg', verdict: 'Garbled (DPG 0.80)', crop: [96, 12, 208, 100] },
      { name: 'Loop w/o LG', flops: '56.04 TFLOPs', file: 'sr_dpg_372_loop_nolg.jpg', verdict: '"SJOR" (DPG 0.90)', crop: [96, 12, 208, 100] },
      { name: 'Loop + LG', flops: '72.46 TFLOPs', file: 'sr_dpg_372_loop_lg.jpg', verdict: '"SLOP" (DPG 0.80)', crop: [96, 12, 208, 100] },
      { name: 'ELP (Ours, 10-step)', flops: '19.56 TFLOPs', file: 'sr_dpg_372_ours.jpg', verdict: '"STOP" (DPG 1.00)', crop: [96, 12, 208, 100], ours: true }
    ]
  },
  {
    id: 'rv_ge_453',
    label: 'RAE: Color Attribution',
    backbone: 'RAE SigLIP2-B/DDT (Main Paper Fig. 3b)',
    prompt: '"a photo of a purple wine glass and a black apple"',
    methods: [
      { name: '50-step Base', flops: '29.07 TFLOPs', file: 'rv_ge_453_base_full.jpg', verdict: 'Fail (Blob)', crop: [0, 92, 168, 224] },
      { name: '10-step Base', flops: '5.81 TFLOPs', file: 'rv_ge_453_base_s10.jpg', verdict: 'Fail (Blob)', crop: [0, 92, 168, 224] },
      { name: 'Loop w/o LG', flops: '39.67 TFLOPs', file: 'rv_ge_453_loop_nolg.jpg', verdict: 'Fail (Plum)', crop: [0, 92, 168, 224] },
      { name: 'Loop + LG', flops: '54.20 TFLOPs', file: 'rv_ge_453_loop_lg.jpg', verdict: 'Fail (2 apples)', crop: [42, 92, 210, 224] },
      { name: 'ELP (Ours, 10-step)', flops: '9.33 TFLOPs', file: 'rv_ge_453_ours.jpg', verdict: 'Pass (Black apple)', crop: [56, 92, 224, 224], ours: true }
    ]
  },
  {
    id: 'sr_dpg_378',
    label: 'Scale-RAE: Attribute Binding',
    backbone: 'Scale-RAE (Appendix Fig. S1a)',
    prompt: '"...yellow rabbit ... red-framed glasses..."',
    methods: [
      { name: '25-step Base', flops: '31.58 TFLOPs', file: 'sr_dpg_378_base_full.jpg', verdict: 'Dark lens (0.90)', crop: [56, 32, 168, 120] },
      { name: '10-step Base', flops: '12.63 TFLOPs', file: 'sr_dpg_378_base_s10.jpg', verdict: 'Blob (0.70)', crop: [56, 32, 168, 120] },
      { name: 'Loop w/o LG', flops: '56.04 TFLOPs', file: 'sr_dpg_378_loop_nolg.jpg', verdict: 'Dark lens (0.90)', crop: [56, 32, 168, 120] },
      { name: 'Loop + LG', flops: '72.46 TFLOPs', file: 'sr_dpg_378_loop_lg.jpg', verdict: 'Warped (0.90)', crop: [56, 32, 168, 120] },
      { name: 'ELP (Ours, 10-step)', flops: '19.56 TFLOPs', file: 'sr_dpg_378_ours.jpg', verdict: 'Red rim (1.00)', crop: [56, 32, 168, 120], ours: true }
    ]
  },
  {
    id: 'rv_dpg_802',
    label: 'RAE: Object Composition',
    backbone: 'RAE SigLIP2-B/DDT (Appendix Fig. S1b)',
    prompt: '"...yellow school bus ... white van..."',
    methods: [
      { name: '50-step Base', flops: '29.07 TFLOPs', file: 'rv_dpg_802_base_full.jpg', verdict: 'Blocks (0.10)', crop: [70, 60, 210, 170] },
      { name: '10-step Base', flops: '5.81 TFLOPs', file: 'rv_dpg_802_base_s10.jpg', verdict: 'Blocks (0.30)', crop: [70, 60, 210, 170] },
      { name: 'Loop w/o LG', flops: '39.67 TFLOPs', file: 'rv_dpg_802_loop_nolg.jpg', verdict: 'Toy cart (0.40)', crop: [70, 60, 210, 170] },
      { name: 'Loop + LG', flops: '54.20 TFLOPs', file: 'rv_dpg_802_loop_lg.jpg', verdict: 'Pickup (0.20)', crop: [70, 60, 210, 170] },
      { name: 'ELP (Ours, 10-step)', flops: '9.33 TFLOPs', file: 'rv_dpg_802_ours.jpg', verdict: 'Bus + van (1.00)', crop: [70, 60, 210, 170], ours: true }
    ]
  }
];

function createSyncController(containerEl) {
  const videos = Array.from(containerEl.querySelectorAll('video'));
  const playBtn = containerEl.querySelector('[data-action="toggle-play"]');
  const restartBtn = containerEl.querySelector('[data-action="restart"]');
  const jumpBtns = Array.from(containerEl.querySelectorAll('[data-action="jump"]'));
  const rateSelect = containerEl.querySelector('[data-action="rate"]');
  const scrubber = containerEl.querySelector('.scrubber');
  const readout = containerEl.querySelector('.time-readout');

  const master = () => videos[0];
  let userScrubbing = false;
  let pendingSeek = null;
  let suppressSyncUntil = 0;

  const updateReadout = () => {
    const v = master();
    if (!v) return;
    const dur = Number.isFinite(v.duration) && v.duration > 0 ? v.duration : Number(scrubber.max) || 0;
    const cur = pendingSeek !== null ? pendingSeek : (v.currentTime || 0);
    if (!userScrubbing && scrubber) {
      scrubber.max = dur.toFixed(2);
      scrubber.value = cur.toFixed(2);
    }
    if (readout) {
      readout.textContent = `${cur.toFixed(1).padStart(4, '0')}s / ${dur.toFixed(1)}s`;
    }
    if (playBtn) {
      playBtn.textContent = v.paused ? 'Play' : 'Pause';
    }
  };

  const applyVideoTime = (v, t) => {
    if (!Number.isFinite(v.duration) || v.duration <= 0) return false;
    const target = Math.min(Math.max(0, t), Math.max(0, v.duration - 0.06));
    try {
      if (typeof v.fastSeek === 'function') {
        v.currentTime = target;
      } else {
        v.currentTime = target;
      }
      return true;
    } catch {
      return false;
    }
  };

  const syncTime = (t, shouldPlay = null) => {
    suppressSyncUntil = Date.now() + 450;
    pendingSeek = t;
    let appliedAll = true;
    videos.forEach((v) => {
      if (shouldPlay === false) {
        v.pause();
      }
      if (v.readyState >= 1) {
        if (!applyVideoTime(v, t)) appliedAll = false;
      } else {
        appliedAll = false;
      }
      if (shouldPlay === true) {
        v.play().catch(() => {});
      }
    });
    if (appliedAll) pendingSeek = null;
    updateReadout();
  };

  if (playBtn) {
    playBtn.addEventListener('click', () => {
      const paused = master().paused;
      videos.forEach((v) => {
        if (paused) {
          v.play().catch(() => {});
        } else {
          v.pause();
        }
      });
      updateReadout();
    });
  }

  if (restartBtn) {
    restartBtn.addEventListener('click', () => syncTime(0, true));
  }

  jumpBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const t = parseFloat(btn.dataset.time || '0');
      syncTime(t, false);
    });
  });

  if (rateSelect) {
    rateSelect.addEventListener('change', () => {
      const r = parseFloat(rateSelect.value || '1');
      videos.forEach((v) => {
        v.playbackRate = r;
      });
    });
  }

  if (scrubber) {
    scrubber.addEventListener('input', () => {
      userScrubbing = true;
      syncTime(parseFloat(scrubber.value || '0'), null);
    });
    scrubber.addEventListener('change', () => {
      userScrubbing = false;
      syncTime(parseFloat(scrubber.value || '0'), null);
    });
  }

  videos.forEach((v, idx) => {
    v.addEventListener('loadedmetadata', () => {
      if (pendingSeek !== null) {
        applyVideoTime(v, pendingSeek);
        if (videos.every((vv) => vv.readyState >= 1)) {
          pendingSeek = null;
        }
      }
      updateReadout();
    });
    v.addEventListener('seeked', updateReadout);
    v.addEventListener('play', updateReadout);
    v.addEventListener('pause', updateReadout);
    if (idx === 0) {
      v.addEventListener('timeupdate', () => {
        updateReadout();
        if (Date.now() < suppressSyncUntil || v.seeking) return;
        const t = v.currentTime;
        for (let i = 1; i < videos.length; i++) {
          if (!videos[i].seeking && Math.abs(videos[i].currentTime - t) > 0.16) {
            videos[i].currentTime = t;
          }
        }
      });
    }
  });

  return {
    loadSources(sources, autoPlay = false) {
      pendingSeek = null;
      videos.forEach((v, idx) => {
        v.pause();
        v.src = sources[idx];
        v.load();
      });
      if (autoPlay) {
        Promise.all(videos.map((v) => v.play().catch(() => {}))).then(updateReadout);
      } else {
        updateReadout();
      }
    },
    jumpTo(t) {
      syncTime(t, false);
    }
  };
}

function setupTabs() {
  document.querySelectorAll('.tabs[data-tab-group]').forEach((groupEl) => {
    const groupName = groupEl.dataset.tabGroup;
    const buttons = Array.from(groupEl.querySelectorAll('.tab-btn'));
    const panels = Array.from(document.querySelectorAll(`.tab-panel[data-panel-group="${groupName}"]`));
    buttons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const target = btn.dataset.tab;
        buttons.forEach((b) => b.classList.toggle('active', b === btn));
        panels.forEach((p) => p.classList.toggle('active', p.dataset.panel === target));
      });
    });
  });

  document.addEventListener('click', (e) => {
    const trigger = e.target.closest('[data-open-tab]');
    if (!trigger) return;
    const spec = trigger.dataset.openTab || '';
    const sep = spec.indexOf(':');
    if (sep <= 0) return;
    const groupName = spec.slice(0, sep);
    const tabName = spec.slice(sep + 1);
    const tabBtn = document.querySelector(`.tabs[data-tab-group="${groupName}"] .tab-btn[data-tab="${tabName}"]`);
    if (tabBtn) tabBtn.click();
  });
}

function buildCropHTML(srcPath, crop) {
  const [x1, y1, x2, y2] = crop;
  const w = x2 - x1;
  const h = y2 - y1;
  const imgW = (224 / w) * 100;
  const imgH = (224 / h) * 100;
  const left = -(x1 / w) * 100;
  const top = -(y1 / h) * 100;
  return `<div style="position:relative;width:100%;aspect-ratio:${w}/${h};overflow:hidden;border-top:1px solid var(--border);border-bottom:1px solid var(--border);background:#f1f5f9;">
    <img src="${srcPath}" alt="" style="position:absolute;max-width:none;width:${imgW}%;height:${imgH}%;left:${left}%;top:${top}%;" />
  </div>`;
}

function setupQualGallery() {
  const tabsEl = document.getElementById('qualSceneTabs');
  const promptBox = document.getElementById('qualPromptBox');
  const gridEl = document.getElementById('qualGrid');
  const baseSelect = document.getElementById('compareBaseSelect');
  const modeSelect = document.getElementById('compareModeSelect');
  const imgLeft = document.getElementById('compareImgLeft');
  const imgRight = document.getElementById('compareImgRight');
  const tagLeft = document.getElementById('compareTagLeft');
  const tagRight = document.getElementById('compareTagRight');
  const rangeEl = document.getElementById('compareRange');
  const overlayEl = document.getElementById('compareOverlay');
  const dividerEl = document.getElementById('compareDivider');

  let activeIdx = 0;

  const updateSliderView = () => {
    const scene = QUAL_SCENES[activeIdx];
    const bIdx = parseInt(baseSelect.value || '0', 10);
    const baseMethod = scene.methods[bIdx];
    const oursMethod = scene.methods[4];
    const zoom = modeSelect.value === 'crop';

    imgLeft.src = `assets/images/${baseMethod.file}`;
    imgRight.src = `assets/images/${oursMethod.file}`;
    tagLeft.textContent = `${baseMethod.name} (${baseMethod.flops})`;
    tagRight.textContent = `${oursMethod.name} (${oursMethod.flops})`;

    const applyCropOrReset = (imgEl, crop) => {
      if (!zoom) {
        imgEl.style.width = '100%';
        imgEl.style.height = '100%';
        imgEl.style.left = '0';
        imgEl.style.top = '0';
        imgEl.style.maxWidth = '100%';
        return;
      }
      const [x1, y1, x2, y2] = crop;
      const w = x2 - x1;
      const h = y2 - y1;
      imgEl.style.maxWidth = 'none';
      imgEl.style.width = `${(224 / w) * 100}%`;
      imgEl.style.height = `${(224 / h) * 100}%`;
      imgEl.style.left = `${-(x1 / w) * 100}%`;
      imgEl.style.top = `${-(y1 / h) * 100}%`;
    };

    applyCropOrReset(imgLeft, baseMethod.crop);
    applyCropOrReset(imgRight, oursMethod.crop);
  };

  const renderScene = (idx) => {
    activeIdx = idx;
    const scene = QUAL_SCENES[idx];
    tabsEl.querySelectorAll('.tab-btn').forEach((b, i) => b.classList.toggle('active', i === idx));
    promptBox.innerHTML = `<strong>${scene.backbone}</strong> &mdash; Prompt: <em>${scene.prompt}</em>`;

    Array.from(baseSelect.options).forEach((opt, i) => {
      if (scene.methods[i]) {
        opt.textContent = `${scene.methods[i].name} (${scene.methods[i].flops})`;
      }
    });

    gridEl.innerHTML = scene.methods.map((m) => {
      const [x1, y1, x2, y2] = m.crop;
      const boxLeft = (x1 / 224) * 100;
      const boxTop = (y1 / 224) * 100;
      const boxW = ((x2 - x1) / 224) * 100;
      const boxH = ((y2 - y1) / 224) * 100;
      const imgPath = `assets/images/${m.file}`;
      return `<div class="qual-card${m.ours ? ' ours' : ''}">
        <div class="qual-head">
          <div class="qual-method">${m.name}</div>
          <div class="qual-flops">${m.flops}</div>
        </div>
        <div class="qual-img-wrap">
          <img class="full-img zoomable" src="${imgPath}" alt="${m.name}: ${m.verdict}" data-caption="${scene.label} &mdash; ${m.name} (${m.flops}): ${m.verdict}" />
          <div class="qual-crop-box" style="left:${boxLeft}%;top:${boxTop}%;width:${boxW}%;height:${boxH}%;"></div>
        </div>
        ${buildCropHTML(imgPath, m.crop)}
        <div class="qual-verdict">${m.verdict}</div>
      </div>`;
    }).join('');

    updateSliderView();
  };

  tabsEl.innerHTML = QUAL_SCENES.map((s, i) =>
    `<button type="button" class="tab-btn ours-accent${i === 0 ? ' active' : ''}" data-qidx="${i}">${s.label}</button>`
  ).join('');
  tabsEl.querySelectorAll('.tab-btn').forEach((btn) => {
    btn.addEventListener('click', () => renderScene(parseInt(btn.dataset.qidx, 10)));
  });

  baseSelect.addEventListener('change', updateSliderView);
  modeSelect.addEventListener('change', updateSliderView);

  const updateDivider = () => {
    const pct = parseFloat(rangeEl.value || '50');
    overlayEl.style.clipPath = `inset(0 ${100 - pct}% 0 0)`;
    dividerEl.style.left = `${pct}%`;
  };
  rangeEl.addEventListener('input', updateDivider);
  updateDivider();

  renderScene(0);
}

function setupLongLiveGallery() {
  const containerEl = document.getElementById('longliveGallery');
  const controller = createSyncController(containerEl);
  const tabsEl = document.getElementById('llSceneTabs');
  const metricsEl = document.getElementById('llMetrics');
  const stripEl = document.getElementById('llStripContainer');

  const times = [
    { suf: '00', label: '0s', seek: 0, cls: '' },
    { suf: '03', label: '3.6s (Depart)', seek: 3.6, cls: 'depart' },
    { suf: '06', label: '6.5s', seek: 6.5, cls: '' },
    { suf: '09', label: '9.5s', seek: 9.5, cls: '' },
    { suf: '12', label: '12.5s', seek: 12.5, cls: '' },
    { suf: '15', label: '15.8s (Revisit)', seek: 15.7, cls: 'revisit' }
  ];

  const renderScene = (idx) => {
    const s = LONGLIVE_SCENES[idx];
    tabsEl.querySelectorAll('.tab-btn').forEach((b, i) => b.classList.toggle('active', i === idx));
    metricsEl.innerHTML = `
      <span class="metric-chip">CLIP: ${s.clipBase} &rarr; <strong>${s.clipOurs}</strong></span>
      <span class="metric-chip">LPIPS: ${s.lpipsBase} &rarr; <strong>${s.lpipsOurs}</strong></span>
      <span class="metric-chip">TempSSIM: ${s.ssimBase} &rarr; <strong>${s.ssimOurs}</strong></span>
    `;
    controller.loadSources([s.baseVideo, s.oursVideo], false);

    if (!s.stripPrefix) {
      stripEl.innerHTML = `<div class="prompt-banner" style="margin:0;"><strong>${s.title}:</strong> ${s.note}</div>`;
      return;
    }

    const headerCells = times.map((t) => `<div class="strip-time ${t.cls}">${t.label}</div>`).join('');
    const baseImgs = times.map((t) => {
      const c = t.suf === '03' ? 'depart' : (t.suf === '15' ? 'revisit-base' : '');
      return `<img class="strip-thumb ${c}" data-seek="${t.seek}" style="cursor:pointer;" src="assets/images/longlive_frames/${s.stripPrefix}_base_${t.suf}.jpg" alt="Baseline ${t.label}" />`;
    }).join('');
    const oursImgs = times.map((t) => {
      const c = t.suf === '03' ? 'depart' : (t.suf === '15' ? 'revisit-ours' : '');
      return `<img class="strip-thumb ${c}" data-seek="${t.seek}" style="cursor:pointer;" src="assets/images/longlive_frames/${s.stripPrefix}_ours_${t.suf}.jpg" alt="ELP ${t.label}" />`;
    }).join('');

    stripEl.innerHTML = `
      <div class="prompt-banner" style="margin:0 0 12px;"><strong>${s.title}:</strong> ${s.note} <em>(Click any frame below to seek both videos.)</em></div>
      <div class="strip-grid">
        <div></div>${headerCells}
        <div class="strip-row-label">Baseline</div>${baseImgs}
        <div class="strip-row-label ours">ELP (Ours)</div>${oursImgs}
      </div>
    `;
    stripEl.querySelectorAll('[data-seek]').forEach((img) => {
      img.addEventListener('click', () => controller.jumpTo(parseFloat(img.dataset.seek)));
    });
  };

  tabsEl.innerHTML = LONGLIVE_SCENES.map((s, i) =>
    `<button type="button" class="tab-btn ours-accent${i === 0 ? ' active' : ''}" data-ll="${i}">${s.label}</button>`
  ).join('');
  tabsEl.querySelectorAll('.tab-btn').forEach((b) => {
    b.addEventListener('click', () => renderScene(parseInt(b.dataset.ll, 10)));
  });

  renderScene(0);
}

function setupLightbox() {
  const modal = document.getElementById('lightbox');
  const modalImg = document.getElementById('lightboxImg');
  const modalCap = document.getElementById('lightboxCaption');
  const closeBtn = document.getElementById('lightboxClose');

  const close = () => modal.classList.remove('open');
  closeBtn.addEventListener('click', close);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) close();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') close();
  });

  document.body.addEventListener('click', (e) => {
    const img = e.target.closest('img.zoomable');
    if (!img) return;
    modalImg.src = img.src;
    modalCap.textContent = img.dataset.caption || img.alt || '';
    modal.classList.add('open');
  });
}

function setupBibCopy() {
  const btn = document.getElementById('copyBibBtn');
  const textEl = document.getElementById('bibText');
  if (!btn || !textEl) return;
  btn.addEventListener('click', async () => {
    const raw = textEl.textContent || '';
    try {
      await navigator.clipboard.writeText(raw);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = raw;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
    }
    btn.textContent = 'Copied!';
    btn.classList.add('copied');
    setTimeout(() => {
      btn.textContent = 'Copy BibTeX';
      btn.classList.remove('copied');
    }, 1800);
  });
}

function setupPvPlayer() {
  const video = document.getElementById('pvVideo');
  const stage = document.getElementById('pvStage');
  const overlay = document.getElementById('pvPlayOverlay');
  const chaptersEl = document.getElementById('pvChapters');
  if (!video || !stage) return;

  const buttons = chaptersEl ? Array.from(chaptersEl.querySelectorAll('.pv-chap-btn[data-seek]')) : [];
  const syncOverlay = () => {
    stage.classList.toggle('is-playing', !video.paused && !video.ended);
  };
  const updateActiveChapter = (curTime) => {
    if (!buttons.length) return;
    let activeIdx = 0;
    for (let i = 0; i < buttons.length; i++) {
      const start = parseFloat(buttons[i].dataset.seek || '0');
      if (curTime + 0.15 >= start) activeIdx = i;
    }
    buttons.forEach((b, i) => b.classList.toggle('active', i === activeIdx));
  };

  if (overlay) {
    overlay.addEventListener('click', () => {
      video.play().catch(() => {});
    });
  }

  let queuedSeek = null;
  video.addEventListener('loadedmetadata', () => {
    if (queuedSeek !== null) {
      video.currentTime = queuedSeek;
      queuedSeek = null;
    }
  });
  video.addEventListener('play', syncOverlay);
  video.addEventListener('pause', syncOverlay);
  video.addEventListener('ended', syncOverlay);
  video.addEventListener('timeupdate', () => updateActiveChapter(video.currentTime || 0));

  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const target = parseFloat(btn.dataset.seek || '0');
      updateActiveChapter(target);
      if (video.readyState >= 1) {
        video.currentTime = target;
      } else {
        queuedSeek = target;
      }
      video.play().catch(() => {});
    });
  });

  const ctaBtn = document.getElementById('heroWatchPvBtn');
  if (ctaBtn) {
    ctaBtn.addEventListener('click', () => {
      setTimeout(() => {
        if (video.paused) video.play().catch(() => {});
      }, 250);
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  if (window.ELPCharts) window.ELPCharts.renderAll();
  setupPvPlayer();
  createSyncController(document.getElementById('heroVideoGroup'));
  setupTabs();
  setupLongLiveGallery();
  setupQualGallery();
  setupLightbox();
  setupBibCopy();
});
