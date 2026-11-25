(function () {
  "use strict";

  const NS = "http://www.w3.org/2000/svg";

  const COLORS = {
    ours: "#D81B60",
    oursDark: "#A7144A",
    oursLight: "#F9D5E3",
    oursFill: "rgba(216, 27, 96, 0.085)",
    oursGap: "rgba(216, 27, 96, 0.12)",
    teal: "#0F766E",
    tealDark: "#0D5C56",
    tealFill: "rgba(15, 118, 110, 0.10)",
    blue: "#0284C7",
    ref: "#64748B",
    refDark: "#475569",
    refLight: "#CBD5E1",
    base: "#1E293B",
    grid: "#E2E8F0",
    axis: "#475569",
    text: "#0F172A",
    muted: "#475569",
    white: "#FFFFFF",
  };

  // --- Exact Manuscript Coordinates ---

  const PA = {
    cloudRef: [
      [0.659, 60.66], [0.72, 61.96], [0.794, 60.8], [0.929, 60.28],
      [1.044, 60.28], [1.09, 61.75], [1.139, 64.93], [1.193, 62.24],
      [1.252, 65.42], [1.252, 61.39], [1.252, 62.89], [1.475, 60.2],
    ],
    cloudOurs: [
      [0.911, 61.79], [0.894, 64.62], [1.021, 66.06], [1.021, 67.58],
      [1.021, 67.81], [1.164, 67.7], [1.164, 66.65], [1.221, 63.31],
      [1.192, 62.72], [1.391, 63.31], [1.391, 64.14], [1.391, 63.35],
      [1.43, 63.23], [1.615, 63.23], [1.788, 59.99],
    ],
    cfgFront: [
      [0.72, 61.96], [1.139, 64.93], [1.335, 66.06],
      [1.567, 61.96], [1.671, 61.08], [1.822, 60.04],
    ],
    prgFront: [
      [0.894, 64.62], [1.021, 68.69], [1.164, 69.33],
      [1.615, 64.99], [2.086, 61.04], [2.086, 60.37],
    ],
    anchors: [
      { name: "Scale-RAE (25s Base)", x: 1.0, y: 53.8, shape: "square" },
      { name: "Loop w/o LG", x: 0.5635, y: 59.88, shape: "pentagon" },
      { name: "Loop + LG", x: 0.4358, y: 60.42, shape: "triangle" },
    ],
    stars: [
      { label: "Quality (14s, 1.16\u00d7)", x: 1.164, y: 69.33, desc: "GenEval 69.33%, 1.16\u00d7 TFLOPs speedup" },
      { label: "Speed (10s, 1.61\u00d7)", x: 1.615, y: 64.99, desc: "GenEval 64.99%, 1.61\u00d7 TFLOPs speedup" },
    ],
  };

  const PB = {
    cloudOurs: [
      [1.575, 84.67], [2.012, 84.48], [2.0, 84.74], [2.374, 85.05], [2.5, 84.84],
      [3.125, 85.08], [3.526, 84.02], [4.0, 83.82], [4.0, 85.49], [4.0, 85.68],
      [4.49, 82.88], [5.501, 85.51], [7.821, 83.77], [7.368, 83.98], [6.905, 82.42],
      [6.21, 83.52], [5.501, 85.51], [4.43, 84.87], [4.0, 85.48], [3.261, 85.54],
      [7.766, 83.24], [7.207, 83.07], [6.299, 83.69], [5.501, 83.23], [5.272, 84.11],
      [4.616, 84.59], [4.0, 85.56], [2.926, 84.67], [7.821, 82.62], [7.766, 83.58],
      [6.421, 84.14], [5.594, 84.63], [5.031, 84.39], [4.43, 84.41], [4.0, 84.87],
      [3.261, 84.91], [4.0, 84.71], [4.0, 86.34], [4.258, 86.12], [4.616, 84.15],
      [4.552, 83.99], [5.272, 83.96], [5.691, 85.42], [5.501, 85.29],
      [7.821, 83.33], [7.207, 81.82], [6.299, 82.71], [5.691, 82.93], [5.358, 83.77],
      [5.031, 83.36], [4.371, 85.77], [4.0, 85.77], [8.011, 82.56], [7.368, 83.7],
      [7.207, 85.17], [6.549, 84.23], [5.79, 84.07], [5.272, 82.93], [4.49, 83.81],
      [4.552, 82.34], [7.821, 83.49], [7.207, 83.73], [7.207, 82.85], [6.549, 83.39],
      [6.299, 84.33], [5.691, 83.98], [5.272, 84.84], [4.49, 85.68], [7.766, 83.98],
      [7.766, 83.31], [7.207, 83.41], [7.052, 84.17], [6.421, 84.33], [5.691, 85.26],
      [5.272, 83.75], [4.552, 85.4],
    ],
    natFront: [
      [1.0, 85.89], [2.0, 85.12], [4.0, 84.56],
      [5.0, 83.21], [6.667, 81.27], [7.143, 80.26],
    ],
    elpFront: [
      [4.0, 86.34], [4.258, 86.12], [4.371, 85.77], [4.49, 85.68], [5.501, 85.51],
      [5.691, 85.42], [7.207, 85.17], [7.766, 83.98], [7.821, 83.77], [8.011, 82.56],
    ],
    anchors: [
      { name: "Looped-DiT (100s, K=4)", x: 1.0, y: 85.89, shape: "square" },
      { name: "100s (K=1)", x: 1.835, y: 84.21, shape: "pentagon" },
    ],
    stars: [
      { label: "Quality (25s, 4.00\u00d7)", x: 4.0, y: 86.34, desc: "GenEval 86.34%, 4.00\u00d7 speedup" },
      { label: "Speed (14s, 7.82\u00d7)", x: 7.821, y: 83.77, desc: "GenEval 83.77%, 7.82\u00d7 speedup" },
    ],
  };

  const PC = {
    nativeLine: [
      { x: 7.45, y: 80.34, label: "Native K=4 (14s)", r: 4.5 },
      { x: 10.64, y: 83.22, label: "Native K=4 (20s)", r: 5.0 },
      { x: 13.3, y: 83.96, label: "Native K=4 (25s)", r: 5.4 },
      { x: 26.59, y: 85.03, label: "Native K=4 (50s)", r: 6.4 },
      { x: 53.18, y: 85.0, label: "Native K=4 (100s, Base)", r: 7.8 },
    ],
    nativeK1: { x: 28.98, y: 84.37, label: "Native K=1 (100s)", r: 6.6 },
    elpLine: [
      { x: 6.8, y: 84.27, label: "Ours: Speed (14s)", r: 5.0 },
      { x: 9.67, y: 85.02, label: "Ours: Balanced (20s)", r: 5.4 },
      { x: 13.3, y: 85.09, label: "Ours: Quality (25s)", r: 5.8 },
    ],
    external: [
      { x: 72.5, y: 82.0, label: "DeCo", r: 9.2 },
      { x: 477.6, y: 74.85, label: "URSA", r: 12.0 },
      { x: 5412, y: 79.05, label: "CogView4", r: 16.5 },
    ],
  };

  const PD = [
    {
      model: "LongLive 2.0",
      sub: "5B",
      clipGain: 8.12,
      lpipsGain: 61.27,
      clipRaw: "0.8585 \u2192 0.9282",
      lpipsRaw: "0.3852 \u2192 0.1492",
    },
    {
      model: "LongLive 1.0",
      sub: "1.3B",
      clipGain: 6.32,
      lpipsGain: 43.27,
      clipRaw: "0.8670 \u2192 0.9218",
      lpipsRaw: "0.2609 \u2192 0.1480",
    },
    {
      model: "Self-Forcing",
      sub: "1.3B",
      clipGain: 15.67,
      lpipsGain: 26.0,
      clipRaw: "0.6585 \u2192 0.7617",
      lpipsRaw: "0.4874 \u2192 0.3607",
    },
  ];

  const HV_SCALERAE = {
    config: [
      [16, 0.2967], [24, 0.6364], [32, 0.7014], [40, 0.7131], [48, 0.7296],
      [56, 0.7308], [64, 0.7324], [72, 0.7543], [80, 0.7923],
    ],
    program: [
      [16, 0.1697], [24, 0.3609], [32, 0.3741], [40, 0.54], [48, 0.579],
      [56, 0.5953], [64, 0.7845], [72, 0.8058], [80, 0.9148],
    ],
  };

  const HV_LOOPED = [
    [0, 2.8756], [16, 5.3002], [24, 5.7116], [32, 5.7194], [40, 5.7214],
    [48, 5.7464], [56, 5.7484], [64, 5.8112], [72, 5.8118], [80, 5.8126],
  ];

  const DORY_OPEN = [
    { name: "Native K=2 (per-loop KV)", x: 96300, y: 60.92, ifb: 78.48, gpqa: 70.39, sci: 33.9, wall: "1.00\u00d7 / 1.72\u00d7", ours: false },
    { name: "Native K=4 (per-loop KV)", x: 161198, y: 61.18, ifb: 78.71, gpqa: 71.02, sci: 33.81, wall: "0.58\u00d7 / 1.00\u00d7", ours: false },
    { name: "ELP K=2 (per-loop KV)", x: 95223, y: 61.45, ifb: 78.88, gpqa: 71.53, sci: 33.94, wall: "1.00\u00d7 / 1.72\u00d7", ours: true },
    { name: "ELP K=2 (last-loop KV)", x: 95719, y: 61.58, ifb: 78.94, gpqa: 71.72, sci: 34.07, wall: "0.96\u00d7 / 1.65\u00d7", ours: true },
  ];

  const DORY_STEM_NAT = [
    { k: "K=1", x: 7.33, y: 58.77 },
    { k: "K=2", x: 11.03, y: 59.64 },
    { k: "K=3", x: 14.74, y: 59.81 },
    { k: "K=4", x: 18.44, y: 60.29 },
    { k: "K=6", x: 25.84, y: 60.24 },
  ];

  const DORY_STEM_ELP = [
    { k: "ELP K=2", x: 9.45, y: 59.69, note: "1.17\u00d7 GFLOPs speedup vs. Native K=2" },
    { k: "ELP K=3", x: 14.74, y: 60.68, note: "Surpasses Native K=4 & K=6 at matched K=3" },
    { k: "ELP K=4", x: 18.44, y: 60.89, note: "+0.60 micro pts at matched K=4" },
  ];

  // --- SVG & Tooltip Primitives ---

  function svgEl(tag, attrs, parent) {
    const el = document.createElementNS(NS, tag);
    if (attrs) {
      for (const [k, v] of Object.entries(attrs)) {
        if (v !== undefined && v !== null) el.setAttribute(k, String(v));
      }
    }
    if (parent) parent.appendChild(el);
    return el;
  }

  function svgText(parent, x, y, text, attrs) {
    const el = svgEl("text", Object.assign({ x, y }, attrs || {}), parent);
    el.textContent = text;
    return el;
  }

  function scaleLin(d0, d1, r0, r1) {
    return (v) => r0 + ((v - d0) / (d1 - d0)) * (r1 - r0);
  }

  function scaleLog(d0, d1, r0, r1) {
    const l0 = Math.log10(d0);
    const l1 = Math.log10(d1);
    return (v) => r0 + ((Math.log10(v) - l0) / (l1 - l0)) * (r1 - r0);
  }

  function diamondPath(cx, cy, r) {
    return `M ${cx} ${cy - r} L ${cx + r} ${cy} L ${cx} ${cy + r} L ${cx - r} ${cy} Z`;
  }

  function trianglePath(cx, cy, r) {
    const h = r * 1.1;
    return `M ${cx} ${cy - h} L ${cx + r} ${cy + r * 0.8} L ${cx - r} ${cy + r * 0.8} Z`;
  }

  function pentagonPath(cx, cy, r) {
    const pts = [];
    for (let i = 0; i < 5; i++) {
      const a = -Math.PI / 2 + (i * 2 * Math.PI) / 5;
      pts.push(`${(cx + r * Math.cos(a)).toFixed(2)},${(cy + r * Math.sin(a)).toFixed(2)}`);
    }
    return `M ${pts.join(" L ")} Z`;
  }

  function starPath(cx, cy, rOuter, rInner) {
    const pts = [];
    for (let i = 0; i < 10; i++) {
      const a = -Math.PI / 2 + (i * Math.PI) / 5;
      const r = i % 2 === 0 ? rOuter : rInner;
      pts.push(`${(cx + r * Math.cos(a)).toFixed(2)},${(cy + r * Math.sin(a)).toFixed(2)}`);
    }
    return `M ${pts.join(" L ")} Z`;
  }

  function attachTooltip(el, html) {
    const tip = document.getElementById("chartTooltip");
    if (!tip || !el) return;
    el.style.cursor = "pointer";
    el.addEventListener("mouseenter", (e) => {
      tip.innerHTML = html;
      tip.classList.add("open");
      moveTip(e);
    });
    el.addEventListener("mousemove", moveTip);
    el.addEventListener("mouseleave", () => {
      tip.classList.remove("open");
    });

    function moveTip(e) {
      const pad = 12;
      const w = tip.offsetWidth || 180;
      const h = tip.offsetHeight || 48;
      let left = e.clientX + pad;
      let top = e.clientY - h - 8;
      if (left + w > window.innerWidth - 10) left = e.clientX - w - pad;
      if (top < 8) top = e.clientY + 16;
      tip.style.left = `${left}px`;
      tip.style.top = `${top}px`;
    }
  }

  function drawAxes(svg, cfg) {
    const { m, w, h, sx, sy, xTicks, yTicks, xFormat, yFormat, xLabel, yLabel, topTicks } = cfg;
    const x0 = m.l;
    const x1 = w - m.r;
    const y0 = h - m.b;
    const y1 = m.t;

    const gGrid = svgEl("g", { class: "chart-grid" }, svg);
    yTicks.forEach((yv) => {
      const py = sy(yv);
      svgEl("line", { x1: x0, y1: py, x2: x1, y2: py, stroke: COLORS.grid, "stroke-width": 1 }, gGrid);
      svgText(svg, x0 - 7, py + 3.5, yFormat ? yFormat(yv) : String(yv), {
        "text-anchor": "end",
        "font-size": 10.5,
        fill: COLORS.muted,
      });
      svgEl("line", { x1: x0 - 3, y1: py, x2: x0, y2: py, stroke: COLORS.axis, "stroke-width": 1 }, gGrid);
    });

    xTicks.forEach((xv) => {
      const px = sx(xv);
      svgEl("line", { x1: px, y1: y0, x2: px, y2: y0 + 3.5, stroke: COLORS.axis, "stroke-width": 1 }, gGrid);
      svgText(svg, px, y0 + 15, xFormat ? xFormat(xv) : String(xv), {
        "text-anchor": "middle",
        "font-size": 10.5,
        fill: COLORS.muted,
      });
    });

    if (topTicks) {
      topTicks.forEach(({ v, label }) => {
        const px = sx(v);
        svgText(svg, px, y1 - 7, label, {
          "text-anchor": "middle",
          "font-size": 9.5,
          "font-weight": 600,
          fill: COLORS.muted,
        });
      });
    }

    // Left and bottom spines
    svgEl("line", { x1: x0, y1: y1, x2: x0, y2: y0, stroke: COLORS.axis, "stroke-width": 1.15 }, svg);
    svgEl("line", { x1: x0, y1: y0, x2: x1, y2: y0, stroke: COLORS.axis, "stroke-width": 1.15 }, svg);

    if (xLabel) {
      svgText(svg, (x0 + x1) / 2, h - 7, xLabel, {
        "text-anchor": "middle",
        "font-size": 11,
        "font-weight": 600,
        fill: COLORS.text,
      });
    }
    if (yLabel) {
      const ty = (y0 + y1) / 2;
      svgText(svg, 14, ty, yLabel, {
        "text-anchor": "middle",
        "font-size": 11,
        "font-weight": 600,
        fill: COLORS.text,
        transform: `rotate(-90 14 ${ty})`,
      });
    }
  }

  function addPolyline(parent, pts, sx, sy, attrs) {
    const d = pts.map(([x, y], i) => `${i === 0 ? "M" : "L"} ${sx(x).toFixed(2)} ${sy(y).toFixed(2)}`).join(" ");
    return svgEl("path", Object.assign({ d, fill: "none" }, attrs), parent);
  }

  function addPolygon(parent, pts, sx, sy, attrs) {
    const p = pts.map(([x, y]) => `${sx(x).toFixed(2)},${sy(y).toFixed(2)}`).join(" ");
    return svgEl("polygon", Object.assign({ points: p }, attrs), parent);
  }

  function drawGainArrow(parent, x, yFrom, yTo, color) {
    const dir = yTo < yFrom ? -1 : 1;
    svgEl("line", { x1: x, y1: yFrom, x2: x, y2: yTo - dir * 5, stroke: color, "stroke-width": 1.8 }, parent);
    const tipY = yTo;
    const baseY = yTo - dir * 7;
    svgEl("polygon", {
      points: `${x},${tipY} ${x - 4},${baseY} ${x + 4},${baseY}`,
      fill: color,
    }, parent);
  }

  function createCard(parent, title, badgeText) {
    const card = document.createElement("div");
    card.className = "chart-card";
    const head = document.createElement("div");
    head.className = "chart-card-head";
    const h = document.createElement("div");
    h.className = "chart-title";
    h.textContent = title;
    head.appendChild(h);
    if (badgeText) {
      const b = document.createElement("span");
      b.className = "chart-tag";
      b.textContent = badgeText;
      head.appendChild(b);
    }
    card.appendChild(head);
    const wrap = document.createElement("div");
    wrap.className = "chart-svg-wrap";
    card.appendChild(wrap);
    parent.appendChild(card);
    return { card, wrap };
  }

  function drawTopLegend(svg, items, xStart, yStart) {
    let x = xStart;
    let y = yStart;
    items.forEach((item, idx) => {
      if (idx > 0 && idx === item.rowBreak) {
        x = xStart;
        y += 15;
      }
      const g = svgEl("g", {}, svg);
      if (item.line) {
        svgEl("line", {
          x1: x, y1: y - 3.5, x2: x + 16, y2: y - 3.5,
          stroke: item.color, "stroke-width": item.lw || 1.6,
          "stroke-dasharray": item.dash || "",
        }, g);
      }
      if (item.marker === "diamond") {
        svgEl("path", { d: diamondPath(x + 8, y - 3.5, 3.2), fill: item.color }, g);
      } else if (item.marker === "circle") {
        svgEl("circle", { cx: x + 8, cy: y - 3.5, r: 2.8, fill: item.color }, g);
      } else if (item.marker === "star") {
        svgEl("path", { d: starPath(x + 8, y - 3.5, 4.6, 2.0), fill: item.color }, g);
      } else if (item.marker === "patch") {
        svgEl("rect", {
          x: x, y: y - 8, width: 14, height: 8, rx: 1.5,
          fill: item.fill || item.color, stroke: item.color, "stroke-width": 1,
        }, g);
      }
      svgText(g, x + 20, y, item.label, { "font-size": 9.8, fill: COLORS.text });
      x += (item.advance || 126);
    });
  }

  function drawCallout(svg, x, y, tx, ty, label, align, color) {
    svgEl("line", {
      x1: tx, y1: ty, x2: x, y2: y,
      stroke: color || COLORS.oursDark, "stroke-width": 0.9,
    }, svg);
    svgText(svg, tx, ty - 2, label, {
      "text-anchor": align || "start",
      "font-size": 9.8,
      "font-weight": 700,
      fill: color || COLORS.oursDark,
    });
  }

  // --- Panel Renderers for 2x2 Teaser ---

  function drawTeaserPanelA(wrap) {
    const w = 440, h = 290;
    const m = { l: 48, r: 16, t: 40, b: 40 };
    const sx = scaleLin(0.35, 2.22, m.l, w - m.r);
    const sy = scaleLin(52.5, 71.8, h - m.b, m.t);
    const svg = svgEl("svg", { viewBox: `0 0 ${w} ${h}`, role: "img", "aria-label": "Scale-RAE GenEval Pareto frontier" }, wrap);

    // Highlight improvement quadrant (x >= 1.0, y >= 53.8)
    svgEl("rect", {
      x: sx(1.0), y: sy(71.8), width: sx(2.22) - sx(1.0), height: sy(53.8) - sy(71.8),
      fill: COLORS.oursFill,
    }, svg);
    svgText(svg, sx(2.18), sy(70.6), "Faster & Higher", {
      "text-anchor": "end", "font-size": 8.8, "font-weight": 700, fill: COLORS.ours, opacity: 0.85,
    });

    drawAxes(svg, {
      m, w, h, sx, sy,
      xTicks: [0.5, 1.0, 1.5, 2.0],
      yTicks: [54, 58, 62, 66, 70],
      xFormat: (v) => `${v}\u00d7`,
      xLabel: "TFLOPs speedup (\u00d7 vs. 25s Base) \u2192",
      yLabel: "GenEval (%) \u2191",
    });

    // Baseline crosshairs
    svgEl("line", { x1: sx(1), y1: sy(52.5), x2: sx(1), y2: sy(71.8), stroke: "#94A3B8", "stroke-dasharray": "4 3", "stroke-width": 1 }, svg);
    svgEl("line", { x1: sx(0.35), y1: sy(53.8), x2: sx(2.22), y2: sy(53.8), stroke: "#94A3B8", "stroke-dasharray": "4 3", "stroke-width": 1 }, svg);

    // Clouds
    PA.cloudRef.forEach(([x, y]) => {
      const c = svgEl("circle", { cx: sx(x), cy: sy(y), r: 2.5, fill: COLORS.ref, opacity: 0.35 }, svg);
      attachTooltip(c, `<b>Config search candidate</b><br>${x.toFixed(2)}\u00d7 speedup \u00b7 ${y.toFixed(2)}% GenEval`);
    });
    PA.cloudOurs.forEach(([x, y]) => {
      const c = svgEl("circle", { cx: sx(x), cy: sy(y), r: 2.7, fill: COLORS.ours, opacity: 0.35 }, svg);
      attachTooltip(c, `<b>ELP candidate</b><br>${x.toFixed(2)}\u00d7 speedup \u00b7 ${y.toFixed(2)}% GenEval`);
    });

    // Frontiers
    addPolyline(svg, PA.cfgFront, sx, sy, { stroke: COLORS.ref, "stroke-width": 1.6, "stroke-dasharray": "4 3" });
    PA.cfgFront.forEach(([x, y]) => {
      const p = svgEl("circle", { cx: sx(x), cy: sy(y), r: 3.1, fill: COLORS.ref }, svg);
      attachTooltip(p, `<b>Configuration Search frontier</b><br>${x.toFixed(2)}\u00d7 speedup \u00b7 ${y.toFixed(2)}% GenEval`);
    });

    addPolyline(svg, PA.prgFront, sx, sy, { stroke: COLORS.ours, "stroke-width": 2.6 });
    PA.prgFront.forEach(([x, y]) => {
      const p = svgEl("path", { d: diamondPath(sx(x), sy(y), 3.8), fill: COLORS.ours }, svg);
      attachTooltip(p, `<b>ELP frontier</b><br>${x.toFixed(2)}\u00d7 speedup \u00b7 ${y.toFixed(2)}% GenEval`);
    });

    // Anchors
    PA.anchors.forEach((a) => {
      const px = sx(a.x), py = sy(a.y);
      let node;
      if (a.shape === "square") {
        node = svgEl("rect", { x: px - 4, y: py - 4, width: 8, height: 8, fill: COLORS.base }, svg);
      } else if (a.shape === "pentagon") {
        node = svgEl("path", { d: pentagonPath(px, py, 4.8), fill: COLORS.refDark, stroke: COLORS.white, "stroke-width": 0.7 }, svg);
      } else {
        node = svgEl("path", { d: trianglePath(px, py, 4.8), fill: COLORS.refDark, stroke: COLORS.white, "stroke-width": 0.7 }, svg);
      }
      attachTooltip(node, `<b>${a.name}</b><br>${a.x.toFixed(2)}\u00d7 \u00b7 ${a.y.toFixed(2)}% GenEval`);
    });

    svgText(svg, sx(1.04), sy(54.4), "Scale-RAE (25s)", { "font-size": 9.3, "font-weight": 600, fill: COLORS.base });
    svgText(svg, sx(0.40), sy(58.0), "Loop w/o LG", { "font-size": 9.2, fill: COLORS.refDark });
    svgText(svg, sx(0.38), sy(61.8), "Loop + LG", { "font-size": 9.2, fill: COLORS.refDark });

    // Gain arrow at Speed (10s, 1.61x) above Base 53.8%
    drawGainArrow(svg, sx(1.615), sy(53.8), sy(64.99) + 7, COLORS.ours);
    svgText(svg, sx(1.65), sy(58.4), "+11.2 pp @ 1.61\u00d7", {
      "font-size": 9.2, "font-weight": 800, fill: COLORS.oursDark,
    });

    // Stars
    PA.stars.forEach((s, i) => {
      const px = sx(s.x), py = sy(s.y);
      const star = svgEl("path", {
        d: starPath(px, py, 7.2, 3.1),
        fill: COLORS.ours, stroke: COLORS.white, "stroke-width": 0.9,
      }, svg);
      attachTooltip(star, `<b>Selected ELP: ${s.label}</b><br>${s.desc}`);
      if (i === 0) {
        drawCallout(svg, px + 3, py - 2, sx(1.26), sy(70.1), "Quality (14s \u00b7 +15.5 pp)", "start", COLORS.oursDark);
      } else {
        drawCallout(svg, px + 3, py - 2, sx(1.69), sy(66.5), "Speed (10s \u00b7 1.61\u00d7)", "start", COLORS.oursDark);
      }
    });

    drawTopLegend(svg, [
      { line: true, marker: "diamond", color: COLORS.ours, label: "ELP frontier", advance: 102 },
      { marker: "star", color: COLORS.ours, label: "Selected programs", advance: 126 },
      { line: true, dash: "4 3", marker: "circle", color: COLORS.ref, label: "Config search", advance: 100 },
    ], m.l, 17);
  }

  function drawTeaserPanelB(wrap) {
    const w = 440, h = 290;
    const m = { l: 48, r: 16, t: 40, b: 40 };
    const sx = scaleLin(0.65, 8.60, m.l, w - m.r);
    const sy = scaleLin(79.8, 87.3, h - m.b, m.t);
    const svg = svgEl("svg", { viewBox: `0 0 ${w} ${h}`, role: "img", "aria-label": "Looped-DiT-B32 GenEval Pareto frontier" }, wrap);

    svgEl("rect", {
      x: sx(1.0), y: sy(87.3), width: sx(8.60) - sx(1.0), height: sy(85.89) - sy(87.3),
      fill: COLORS.oursFill,
    }, svg);

    drawAxes(svg, {
      m, w, h, sx, sy,
      xTicks: [1, 2, 4, 6, 8],
      yTicks: [80, 82, 84, 86],
      xFormat: (v) => `${v}\u00d7`,
      xLabel: "TFLOPs speedup (\u00d7 vs. 100s K=4 Base) \u2192",
      yLabel: "GenEval (%) \u2191",
    });

    svgEl("line", { x1: sx(1), y1: sy(79.8), x2: sx(1), y2: sy(87.3), stroke: "#94A3B8", "stroke-dasharray": "4 3", "stroke-width": 1 }, svg);
    svgEl("line", { x1: sx(0.65), y1: sy(85.89), x2: sx(8.60), y2: sy(85.89), stroke: "#94A3B8", "stroke-dasharray": "4 3", "stroke-width": 1 }, svg);
    svgEl("line", { x1: sx(1.0), y1: sy(86.34), x2: sx(4.0), y2: sy(86.34), stroke: COLORS.ours, "stroke-dasharray": "2 2", "stroke-width": 1.1 }, svg);

    // Shaded advantage zone between ELP frontier and Native Looped-DiT sweep
    addPolygon(svg, [
      [4.0, 86.34], [4.49, 85.68], [5.501, 85.51], [5.691, 85.42], [7.207, 85.17], [7.821, 83.77],
      [7.143, 80.26], [6.667, 81.27], [5.0, 83.21], [4.0, 84.56],
    ], sx, sy, { fill: COLORS.oursGap });

    PB.cloudOurs.forEach(([x, y]) => {
      const c = svgEl("circle", { cx: sx(x), cy: sy(y), r: 2.3, fill: COLORS.ours, opacity: 0.28 }, svg);
      attachTooltip(c, `<b>ELP search candidate</b><br>${x.toFixed(2)}\u00d7 speedup \u00b7 ${y.toFixed(2)}% GenEval`);
    });

    addPolyline(svg, PB.natFront, sx, sy, { stroke: COLORS.ref, "stroke-width": 1.6, "stroke-dasharray": "4 3" });
    PB.natFront.forEach(([x, y]) => {
      const p = svgEl("circle", { cx: sx(x), cy: sy(y), r: 3.1, fill: COLORS.ref }, svg);
      attachTooltip(p, `<b>Native Looped-DiT (K=4 sweep)</b><br>${x.toFixed(2)}\u00d7 speedup \u00b7 ${y.toFixed(2)}% GenEval`);
    });

    addPolyline(svg, PB.elpFront, sx, sy, { stroke: COLORS.ours, "stroke-width": 2.5 });
    PB.elpFront.forEach(([x, y]) => {
      const p = svgEl("path", { d: diamondPath(sx(x), sy(y), 3.7), fill: COLORS.ours }, svg);
      attachTooltip(p, `<b>ELP Pareto frontier</b><br>${x.toFixed(2)}\u00d7 speedup \u00b7 ${y.toFixed(2)}% GenEval`);
    });

    PB.anchors.forEach((a) => {
      const px = sx(a.x), py = sy(a.y);
      const node = a.shape === "square"
        ? svgEl("rect", { x: px - 4, y: py - 4, width: 8, height: 8, fill: COLORS.base }, svg)
        : svgEl("path", { d: pentagonPath(px, py, 4.8), fill: COLORS.refDark, stroke: COLORS.white, "stroke-width": 0.7 }, svg);
      attachTooltip(node, `<b>${a.name}</b><br>${a.x.toFixed(2)}\u00d7 \u00b7 ${a.y.toFixed(2)}% GenEval`);
    });

    svgText(svg, sx(1.12), sy(86.7), "Looped-DiT (100s)", { "font-size": 9.2, "font-weight": 600, fill: COLORS.base });
    svgText(svg, sx(1.16), sy(82.7), "100s (K=1)", { "font-size": 9.2, fill: COLORS.refDark });
    svgText(svg, sx(6.75), sy(80.1), "Native 14s (K=4)", { "text-anchor": "end", "font-size": 9.2, "font-weight": 600, fill: COLORS.refDark });

    // Vertical +3.51 pp gain arrow at 14s
    svgEl("line", { x1: sx(7.143), y1: sy(80.26), x2: sx(7.821), y2: sy(80.26), stroke: COLORS.ref, "stroke-dasharray": "3 2", "stroke-width": 1 }, svg);
    drawGainArrow(svg, sx(7.821), sy(80.26), sy(83.77) + 7, COLORS.ours);
    svgText(svg, sx(7.65), sy(81.55), "+3.51 pp", {
      "text-anchor": "end", "font-size": 9.5, "font-weight": 800, fill: COLORS.oursDark,
    });

    PB.stars.forEach((s, i) => {
      const px = sx(s.x), py = sy(s.y);
      const star = svgEl("path", {
        d: starPath(px, py, 7.2, 3.1),
        fill: COLORS.ours, stroke: COLORS.white, "stroke-width": 0.9,
      }, svg);
      attachTooltip(star, `<b>Selected ELP: ${s.label}</b><br>${s.desc}`);
      if (i === 0) {
        drawCallout(svg, px + 2, py - 3, sx(4.4), sy(86.9), "Quality (25s \u00b7 +0.45 pp, 4.00\u00d7)", "start", COLORS.oursDark);
      } else {
        drawCallout(svg, px + 1, py - 5, sx(8.5), sy(85.7), "Speed (14s \u00b7 7.82\u00d7)", "end", COLORS.oursDark);
      }
    });

    drawTopLegend(svg, [
      { line: true, marker: "diamond", color: COLORS.ours, label: "ELP frontier", advance: 102 },
      { marker: "star", color: COLORS.ours, label: "Selected programs", advance: 126 },
      { line: true, dash: "4 3", marker: "circle", color: COLORS.ref, label: "Looped-DiT sweep", advance: 120 },
    ], m.l, 17);
  }

  function drawTeaserPanelC(wrap) {
    const w = 440, h = 290;
    const m = { l: 48, r: 16, t: 40, b: 40 };
    const sx = scaleLog(4, 10000, m.l, w - m.r);
    const sy = scaleLin(74.0, 87.8, h - m.b, m.t);
    const svg = svgEl("svg", { viewBox: `0 0 ${w} ${h}`, role: "img", "aria-label": "Mean GenEval and DPG vs inference TFLOPs" }, wrap);

    drawAxes(svg, {
      m, w, h, sx, sy,
      xTicks: [10, 100, 1000, 10000],
      yTicks: [75, 78, 81, 84, 87],
      xFormat: (v) => (v >= 1000 ? `${v / 1000}k` : String(v)),
      xLabel: "TFLOPs / image (log scale) \u2193",
      yLabel: "Mean GenEval / DPG (%) \u2191",
    });

    // External baselines
    PC.external.forEach((b) => {
      const c = svgEl("circle", {
        cx: sx(b.x), cy: sy(b.y), r: b.r,
        fill: COLORS.refLight, stroke: COLORS.white, "stroke-width": 1, opacity: 0.9,
      }, svg);
      attachTooltip(c, `<b>${b.label}</b><br>${b.x} TFLOPs \u00b7 ${b.y.toFixed(2)}% Mean Score`);
    });
    svgText(svg, sx(72.5) + 12, sy(82.0) + 3, "DeCo", { "font-size": 9.3, fill: COLORS.muted });
    svgText(svg, sx(477.6), sy(74.85) - 14, "URSA", { "text-anchor": "middle", "font-size": 9.3, fill: COLORS.muted });
    svgText(svg, sx(5412) - 4, sy(79.05) - 20, "CogView4", { "text-anchor": "end", "font-size": 9.3, fill: COLORS.muted });

    // Native trajectory + points
    addPolyline(svg, PC.nativeLine.map((d) => [d.x, d.y]), sx, sy, {
      stroke: COLORS.ref, "stroke-width": 1.3, "stroke-dasharray": "2 3",
    });
    PC.nativeLine.forEach((d, idx) => {
      const c = svgEl("circle", {
        cx: sx(d.x), cy: sy(d.y), r: d.r,
        fill: COLORS.ref, stroke: idx === 4 ? COLORS.base : COLORS.white,
        "stroke-width": idx === 4 ? 1.2 : 0.8, opacity: 0.88,
      }, svg);
      attachTooltip(c, `<b>${d.label}</b><br>${d.x.toFixed(2)} TFLOPs \u00b7 ${d.y.toFixed(2)}% Mean Score`);
    });
    const k1 = PC.nativeK1;
    const k1Node = svgEl("circle", {
      cx: sx(k1.x), cy: sy(k1.y), r: k1.r,
      fill: COLORS.ref, stroke: COLORS.white, "stroke-width": 0.9, opacity: 0.85,
    }, svg);
    attachTooltip(k1Node, `<b>${k1.label}</b><br>${k1.x.toFixed(2)} TFLOPs \u00b7 ${k1.y.toFixed(2)}% Mean Score`);

    svgText(svg, sx(7.45), sy(78.6), "Native K=4 (14s)", { "text-anchor": "middle", "font-size": 9, fill: COLORS.muted });
    svgText(svg, sx(62), sy(85.15), "Looped-DiT (100s)", { "font-size": 9.2, "font-weight": 600, fill: COLORS.base });
    drawCallout(svg, sx(k1.x), sy(k1.y) + 6, sx(42), sy(78.0), "Native K=1 (100s)", "start", COLORS.muted);

    // +3.93 pp gain arrow at 14s
    svgEl("line", { x1: sx(6.8), y1: sy(80.34), x2: sx(7.45), y2: sy(80.34), stroke: COLORS.ref, "stroke-dasharray": "2 2", "stroke-width": 1 }, svg);
    drawGainArrow(svg, sx(6.8), sy(80.34), sy(84.27) + 5, COLORS.ours);
    svgText(svg, sx(7.9), sy(82.1), "+3.93 pp @ 14s", { "font-size": 9.2, "font-weight": 800, fill: COLORS.oursDark });

    // ELP trajectory
    addPolyline(svg, PC.elpLine.map((d) => [d.x, d.y]), sx, sy, {
      stroke: COLORS.ours, "stroke-width": 2.3, "stroke-dasharray": "5 3",
    });
    PC.elpLine.forEach((d) => {
      const c = svgEl("circle", {
        cx: sx(d.x), cy: sy(d.y), r: d.r,
        fill: COLORS.ours, stroke: COLORS.white, "stroke-width": 1,
      }, svg);
      attachTooltip(c, `<b>${d.label}</b><br>${d.x.toFixed(2)} TFLOPs \u00b7 ${d.y.toFixed(2)}% Mean Score`);
    });
    drawCallout(svg, sx(13.3), sy(85.09) - 5, sx(14.5), sy(86.15), "Ours (25s)", "start", COLORS.oursDark);

    // 4x fewer TFLOPs span bracket
    const ySpan = sy(87.05);
    svgEl("line", { x1: sx(13.3), y1: ySpan, x2: sx(53.18), y2: ySpan, stroke: COLORS.oursDark, "stroke-width": 1.4 }, svg);
    svgEl("line", { x1: sx(13.3), y1: ySpan - 4, x2: sx(13.3), y2: ySpan + 4, stroke: COLORS.oursDark, "stroke-width": 1.4 }, svg);
    svgEl("line", { x1: sx(53.18), y1: ySpan - 4, x2: sx(53.18), y2: ySpan + 4, stroke: COLORS.oursDark, "stroke-width": 1.4 }, svg);
    svgText(svg, sx(Math.sqrt(13.3 * 53.18)), ySpan - 5, "4\u00d7 fewer TFLOPs", {
      "text-anchor": "middle",
      "font-size": 9.8,
      "font-weight": 700,
      fill: COLORS.oursDark,
    });

    drawTopLegend(svg, [
      { line: true, dash: "5 3", marker: "circle", color: COLORS.ours, label: "ELP programs", advance: 108 },
      { line: true, dash: "2 3", marker: "circle", color: COLORS.ref, label: "Native Looped-DiT", advance: 124 },
      { marker: "circle", color: COLORS.refLight, label: "Reported baselines", advance: 110 },
    ], m.l, 17);
  }

  function drawTeaserPanelD(wrap) {
    const w = 440, h = 290;
    const m = { l: 46, r: 44, t: 42, b: 42 };
    const sx = scaleLin(-0.55, 2.55, m.l, w - m.r);
    const syL = scaleLin(0, 70, h - m.b, m.t);
    const syR = scaleLin(0, 20, h - m.b, m.t);
    const svg = svgEl("svg", { viewBox: `0 0 ${w} ${h}`, role: "img", "aria-label": "RememBench LPIPS drift reduction and CLIP consistency gain" }, wrap);

    const x0 = m.l, x1 = w - m.r, y0 = h - m.b, y1 = m.t;
    const gGrid = svgEl("g", { class: "chart-grid" }, svg);
    [0, 15, 30, 45, 60].forEach((yv) => {
      const py = syL(yv);
      svgEl("line", { x1: x0, y1: py, x2: x1, y2: py, stroke: COLORS.grid, "stroke-width": 1 }, gGrid);
      svgText(svg, x0 - 6, py + 3.5, `${yv}%`, { "text-anchor": "end", "font-size": 10, "font-weight": 600, fill: COLORS.oursDark });
    });
    [0, 5, 10, 15, 20].forEach((rv) => {
      const py = syR(rv);
      svgText(svg, x1 + 6, py + 3.5, `+${rv}%`, { "text-anchor": "start", "font-size": 10, "font-weight": 600, fill: COLORS.teal });
    });

    // Left, right, and bottom spines
    svgEl("line", { x1: x0, y1: y1, x2: x0, y2: y0, stroke: COLORS.oursDark, "stroke-width": 1.2 }, svg);
    svgEl("line", { x1: x1, y1: y1, x2: x1, y2: y0, stroke: COLORS.teal, "stroke-width": 1.2 }, svg);
    svgEl("line", { x1: x0, y1: y0, x2: x1, y2: y0, stroke: COLORS.axis, "stroke-width": 1.15 }, svg);

    const midY = (y0 + y1) / 2;
    svgText(svg, 12, midY, "LPIPS Drift Cut (%) \u2191", {
      "text-anchor": "middle", "font-size": 10.5, "font-weight": 700, fill: COLORS.oursDark,
      transform: `rotate(-90 12 ${midY})`,
    });
    svgText(svg, w - 10, midY, "Revisit CLIP Gain (%) \u2191", {
      "text-anchor": "middle", "font-size": 10.5, "font-weight": 700, fill: COLORS.teal,
      transform: `rotate(90 ${w - 10} ${midY})`,
    });

    const barW = 30;
    const baseLineY = syL(0);
    PD.forEach((row, i) => {
      const cx = sx(i);
      const xLpips = cx - barW - 3;
      const xClip = cx + 3;
      const yLpips = syL(row.lpipsGain);
      const yClip = syR(row.clipGain);

      const b1 = svgEl("rect", {
        x: xLpips, y: yLpips, width: barW, height: baseLineY - yLpips, rx: 3,
        fill: COLORS.ours, stroke: COLORS.oursDark, "stroke-width": 1,
      }, svg);
      attachTooltip(b1, `<b>${row.model} (${row.sub}) \u2014 LPIPS reduction</b><br>\u2212${row.lpipsGain.toFixed(2)}% drift (${row.lpipsRaw})`);

      const b2 = svgEl("rect", {
        x: xClip, y: yClip, width: barW, height: baseLineY - yClip, rx: 3,
        fill: COLORS.teal, stroke: COLORS.tealDark, "stroke-width": 1,
      }, svg);
      attachTooltip(b2, `<b>${row.model} (${row.sub}) \u2014 CLIP</b><br>+${row.clipGain.toFixed(2)}% (${row.clipRaw})`);

      svgText(svg, xLpips + barW / 2, yLpips - 5, `\u2212${row.lpipsGain.toFixed(1)}%`, {
        "text-anchor": "middle", "font-size": 9.4, "font-weight": 700, fill: COLORS.oursDark,
      });
      svgText(svg, xClip + barW / 2, yClip - 5, `+${row.clipGain.toFixed(1)}%`, {
        "text-anchor": "middle", "font-size": 9.4, "font-weight": 700, fill: COLORS.teal,
      });

      svgText(svg, cx, h - 22, row.model, {
        "text-anchor": "middle", "font-size": 10.6, "font-weight": 700, fill: COLORS.text,
      });
      svgText(svg, cx, h - 8, row.sub, {
        "text-anchor": "middle", "font-size": 9.4, fill: COLORS.muted,
      });
    });

    drawTopLegend(svg, [
      { marker: "patch", color: COLORS.ours, fill: COLORS.ours, label: "LPIPS drift cut (left)", advance: 158 },
      { marker: "patch", color: COLORS.teal, fill: COLORS.teal, label: "CLIP gain (right)", advance: 140 },
    ], m.l, 17);
  }

  function renderTeaserGrid(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = "";
    const grid = document.createElement("div");
    grid.className = "chart-grid-2x2";
    container.appendChild(grid);

    const a = createCard(grid, "(a) Add Loops: Scale-RAE", "Image Gen");
    drawTeaserPanelA(a.wrap);

    const b = createCard(grid, "(b) Improve Loops: Looped-DiT-B32", "Matched Steps");
    drawTeaserPanelB(b.wrap);

    const c = createCard(grid, "(c) Deploy Loops: Mean Quality vs. Compute", "GenEval + DPG");
    drawTeaserPanelC(c.wrap);

    const d = createCard(grid, "(d) Suppress Drift: RememBench Video", "16s Rollouts");
    drawTeaserPanelD(d.wrap);
  }

  // --- Search Progression HV Charts ---

  function renderScaleRaeHV(containerId, opts) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = "";

    const title = (opts && opts.title) || "Scale-RAE Cumulative Hypervolume (R0\u2013R8)";
    const badge = (opts && opts.badge) || "80 candidates";
    const { wrap } = createCard(container, title, badge);

    const w = 480, h = 275;
    const m = { l: 50, r: 22, t: 44, b: 42 };
    const sx = scaleLin(12, 84, m.l, w - m.r);
    const sy = scaleLin(0.15, 0.99, h - m.b, m.t);
    const svg = svgEl("svg", { viewBox: `0 0 ${w} ${h}`, role: "img", "aria-label": title }, wrap);

    drawAxes(svg, {
      m, w, h, sx, sy,
      xTicks: [16, 24, 32, 40, 48, 56, 64, 72, 80],
      yTicks: [0.2, 0.4, 0.6, 0.8, 0.95],
      yFormat: (v) => v.toFixed(2),
      xLabel: "Evaluated candidates \u2192",
      yLabel: "Pareto hypervolume \u2191",
      topTicks: [
        { v: 16, label: "R0" }, { v: 32, label: "R2" }, { v: 48, label: "R4" },
        { v: 64, label: "R6" }, { v: 80, label: "R8" },
      ],
    });

    // Shaded advantage zone once program editing overtakes config search (R6-R8)
    addPolygon(svg, [
      [60.8, 0.7318], [64, 0.7845], [72, 0.8058], [80, 0.9148],
      [80, 0.7923], [72, 0.7543], [64, 0.7324],
    ], sx, sy, { fill: COLORS.oursGap });

    addPolyline(svg, HV_SCALERAE.config, sx, sy, { stroke: COLORS.refDark, "stroke-width": 1.8, "stroke-dasharray": "5 3" });
    HV_SCALERAE.config.forEach(([x, y], idx) => {
      const c = svgEl("circle", { cx: sx(x), cy: sy(y), r: 3.6, fill: COLORS.refDark, stroke: COLORS.white, "stroke-width": 0.7 }, svg);
      attachTooltip(c, `<b>ELP: configurations (R${idx})</b><br>Candidates: ${x} \u00b7 HV: ${y.toFixed(4)}`);
    });

    addPolyline(svg, HV_SCALERAE.program, sx, sy, { stroke: COLORS.ours, "stroke-width": 2.5 });
    HV_SCALERAE.program.forEach(([x, y], idx) => {
      const d = svgEl("path", { d: diamondPath(sx(x), sy(y), 4.4), fill: COLORS.ours, stroke: COLORS.white, "stroke-width": 0.7 }, svg);
      attachTooltip(d, `<b>ELP: programs (R${idx})</b><br>Candidates: ${x} \u00b7 HV: ${y.toFixed(4)}`);
    });

    // R8 vertical +15.5% HV bracket
    svgEl("line", { x1: sx(81.8), y1: sy(0.7923), x2: sx(81.8), y2: sy(0.9148), stroke: COLORS.oursDark, "stroke-width": 1.6 }, svg);
    svgEl("line", { x1: sx(80.5), y1: sy(0.7923), x2: sx(83.0), y2: sy(0.7923), stroke: COLORS.oursDark, "stroke-width": 1.4 }, svg);
    svgEl("line", { x1: sx(80.5), y1: sy(0.9148), x2: sx(83.0), y2: sy(0.9148), stroke: COLORS.oursDark, "stroke-width": 1.4 }, svg);
    svgText(svg, sx(79.0), sy(0.840), "+15.5% HV", {
      "text-anchor": "end", "font-size": 9.8, "font-weight": 800, fill: COLORS.oursDark,
    });

    drawCallout(svg, sx(80), sy(0.9148), sx(69), sy(0.955), "Program R8: 0.9148", "end", COLORS.ours);
    drawCallout(svg, sx(80), sy(0.7923), sx(76), sy(0.675), "Config R8: 0.7923", "end", COLORS.refDark);

    drawTopLegend(svg, [
      { line: true, marker: "diamond", color: COLORS.ours, label: "ELP: programs", advance: 132 },
      { line: true, dash: "5 3", marker: "circle", color: COLORS.refDark, label: "ELP: configurations", advance: 150 },
    ], m.l, 15);
  }

  function renderLoopedDitHV(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = "";

    const { wrap } = createCard(container, "Looped-DiT-B32 Hypervolume & R1\u2013R8 Detail", "Matched steps");
    const w = 480, h = 275;
    const m = { l: 50, r: 22, t: 44, b: 42 };
    const sx = scaleLin(-2, 84, m.l, w - m.r);
    const sy = scaleLin(2.45, 6.35, h - m.b, m.t);
    const svg = svgEl("svg", { viewBox: `0 0 ${w} ${h}`, role: "img", "aria-label": "Looped-DiT-B32 hypervolume curve" }, wrap);

    drawAxes(svg, {
      m, w, h, sx, sy,
      xTicks: [0, 16, 32, 48, 64, 80],
      yTicks: [3, 4, 5, 6],
      xLabel: "Evaluated candidates \u2192",
      yLabel: "Pareto hypervolume \u2191",
      topTicks: [
        { v: 16, label: "R0" }, { v: 32, label: "R2" }, { v: 48, label: "R4" },
        { v: 64, label: "R6" }, { v: 80, label: "R8" },
      ],
    });

    // Shaded advantage zone above native anchor baseline
    addPolygon(svg, HV_LOOPED.concat([[80, 2.8756], [0, 2.8756]]), sx, sy, { fill: COLORS.oursFill });

    // Native anchors line
    const yBase = sy(2.8756);
    svgEl("line", { x1: sx(-2), y1: yBase, x2: sx(84), y2: yBase, stroke: COLORS.ref, "stroke-dasharray": "5 3", "stroke-width": 1.6 }, svg);
    svgText(svg, sx(52), yBase - 6, "Native anchors (2.8756)", { "font-size": 9.5, "font-weight": 600, fill: COLORS.refDark });

    addPolyline(svg, HV_LOOPED, sx, sy, { stroke: COLORS.ours, "stroke-width": 2.4 });
    HV_LOOPED.forEach(([x, y], idx) => {
      const lbl = idx === 0 ? "Native Seed" : `R${idx - 1}`;
      const d = svgEl("path", { d: diamondPath(sx(x), sy(y), 4.2), fill: COLORS.ours, stroke: COLORS.white, "stroke-width": 0.7 }, svg);
      attachTooltip(d, `<b>Looped-DiT ${lbl}</b><br>Candidates: ${x} \u00b7 HV: ${y.toFixed(4)}`);
    });

    // 2.02x (+102.1%) vertical gain arrow near left
    svgEl("line", { x1: sx(6), y1: sy(5.8126), x2: sx(80), y2: sy(5.8126), stroke: COLORS.ours, "stroke-dasharray": "2 3", "stroke-width": 1 }, svg);
    drawGainArrow(svg, sx(8), sy(2.8756), sy(5.8126) + 4, COLORS.ours);
    svgText(svg, sx(11), sy(4.15), "2.02\u00d7 HV (+102.1%)", {
      "font-size": 9.8, "font-weight": 800, fill: COLORS.oursDark,
    });

    // R1-R8 Zoom Inset
    const ix = 235, iy = 104, iw = 208, ih = 96;
    const isx = scaleLin(22, 82, ix + 34, ix + iw - 10);
    const isy = scaleLin(5.705, 5.825, iy + ih - 18, iy + 22);
    const gIn = svgEl("g", {}, svg);
    svgEl("rect", { x: ix, y: iy, width: iw, height: ih, rx: 5, fill: COLORS.white, stroke: "#CBD5E1", "stroke-width": 1 }, gIn);
    svgText(gIn, ix + 8, iy + 14, "R1\u2013R8 detail", { "font-size": 9.2, "font-weight": 700, fill: COLORS.text });
    [5.72, 5.80].forEach((yv) => {
      svgEl("line", { x1: ix + 34, y1: isy(yv), x2: ix + iw - 10, y2: isy(yv), stroke: COLORS.grid, "stroke-width": 0.8 }, gIn);
      svgText(gIn, ix + 30, isy(yv) + 3, yv.toFixed(2), { "text-anchor": "end", "font-size": 8.5, fill: COLORS.muted });
    });
    [24, 48, 80].forEach((xv) => {
      svgText(gIn, isx(xv), iy + ih - 5, String(xv), { "text-anchor": "middle", "font-size": 8.5, fill: COLORS.muted });
    });
    addPolyline(gIn, HV_LOOPED.slice(2), isx, isy, { stroke: COLORS.ours, "stroke-width": 1.6 });
    HV_LOOPED.slice(2).forEach(([x, y], idx) => {
      const p = svgEl("path", { d: diamondPath(isx(x), isy(y), 3.0), fill: COLORS.ours }, gIn);
      attachTooltip(p, `<b>Looped-DiT R${idx + 1}</b><br>Candidates: ${x} \u00b7 HV: ${y.toFixed(4)}`);
    });

    drawTopLegend(svg, [
      { line: true, marker: "diamond", color: COLORS.ours, label: "ELP: programs (final 5.8126)", advance: 190 },
    ], m.l, 15);
  }

  // --- New Explicit Zero-Origin Gain & Speedup Bar Charts ---

  function renderImageGainBar(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = "";
    const { wrap } = createCard(container, "Quality Gain over Unlooped Base", "\u0394 GenEval (pp) \u2191");
    const w = 480, h = 265;
    const m = { l: 50, r: 22, t: 38, b: 42 };
    const sx = scaleLin(0, 1, m.l, w - m.r);
    const sy = scaleLin(0, 10.8, h - m.b, m.t);
    const svg = svgEl("svg", { viewBox: `0 0 ${w} ${h}`, role: "img", "aria-label": "GenEval gain over unlooped base" }, wrap);

    drawAxes(svg, {
      m, w, h, sx, sy,
      xTicks: [],
      yTicks: [0, 2, 4, 6, 8, 10],
      yFormat: (v) => (v === 0 ? "0" : `+${v}`),
      yLabel: "\u0394 GenEval vs. Base (pp) \u2191",
    });

    const groups = [
      {
        cx: 0.27, title: "Scale-RAE", sub: "(vs. 25s Base 51.64%)",
        bars: [
          { label: "Loop w/o LG", v: 5.40, color: COLORS.refLight, textColor: COLORS.muted, raw: "57.04%" },
          { label: "Loop + LG", v: 6.92, color: COLORS.ref, textColor: COLORS.refDark, raw: "58.56%" },
          { label: "ELP Quality (14s)", v: 9.34, color: COLORS.ours, textColor: COLORS.oursDark, raw: "60.98%" },
        ],
      },
      {
        cx: 0.74, title: "RAE SigLIP2-B", sub: "(vs. 50s Base 38.56%)",
        bars: [
          { label: "Loop w/o LG", v: 0.31, color: COLORS.refLight, textColor: COLORS.muted, raw: "38.87%" },
          { label: "Loop + LG", v: 4.72, color: COLORS.ref, textColor: COLORS.refDark, raw: "43.28%" },
          { label: "ELP Quality (10s)", v: 6.38, color: COLORS.ours, textColor: COLORS.oursDark, raw: "44.94%" },
        ],
      },
    ];

    const barW = 34, gap = 8;
    const baseLineY = sy(0);
    groups.forEach((g) => {
      const centerPx = sx(g.cx);
      const startX = centerPx - (barW * 3 + gap * 2) / 2;
      g.bars.forEach((b, i) => {
        const bx = startX + i * (barW + gap);
        const by = sy(b.v);
        const rect = svgEl("rect", {
          x: bx, y: by, width: barW, height: baseLineY - by, rx: 3,
          fill: b.color, stroke: i === 2 ? COLORS.oursDark : COLORS.axis, "stroke-width": i === 2 ? 1.1 : 0.6,
        }, svg);
        attachTooltip(rect, `<b>${g.title} \u2014 ${b.label}</b><br>+${b.v.toFixed(2)} pp vs. Base (${b.raw} GenEval)`);
        svgText(svg, bx + barW / 2, by - 5, `+${b.v.toFixed(2)}`, {
          "text-anchor": "middle", "font-size": i === 2 ? 9.8 : 9.0, "font-weight": i === 2 ? 800 : 600, fill: b.textColor,
        });
      });
      svgText(svg, centerPx, h - 22, g.title, { "text-anchor": "middle", "font-size": 10.6, "font-weight": 700, fill: COLORS.text });
      svgText(svg, centerPx, h - 8, g.sub, { "text-anchor": "middle", "font-size": 9.1, fill: COLORS.muted });
    });

    drawTopLegend(svg, [
      { marker: "patch", color: COLORS.refDark, fill: COLORS.refLight, label: "Loop w/o LG", advance: 108 },
      { marker: "patch", color: COLORS.ref, fill: COLORS.ref, label: "Loop + LG", advance: 98 },
      { marker: "patch", color: COLORS.ours, fill: COLORS.ours, label: "ELP Quality (Ours)", advance: 130 },
    ], m.l, 15);
  }

  function renderImageSpeedupBar(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = "";
    const { wrap } = createCard(container, "Compute Speedup vs. Loop + LG", "FLOPs Speedup (\u00d7) \u2191");
    const w = 480, h = 265;
    const m = { l: 50, r: 22, t: 38, b: 42 };
    const sx = scaleLin(0, 1, m.l, w - m.r);
    const sy = scaleLin(0, 11.2, h - m.b, m.t);
    const svg = svgEl("svg", { viewBox: `0 0 ${w} ${h}`, role: "img", "aria-label": "FLOPs speedup vs Loop + LG" }, wrap);

    drawAxes(svg, {
      m, w, h, sx, sy,
      xTicks: [],
      yTicks: [0, 2, 4, 6, 8, 10],
      yFormat: (v) => `${v}\u00d7`,
      yLabel: "Speedup vs. Loop + LG (\u00d7) \u2191",
    });

    const groups = [
      {
        cx: 0.27, title: "Scale-RAE", sub: "(vs. 72.46 TF Loop+LG)",
        bars: [
          { label: "Loop + LG", v: 1.00, color: COLORS.refLight, textColor: COLORS.muted, raw: "72.46 TFLOPs" },
          { label: "25s Base", v: 2.29, color: COLORS.ref, textColor: COLORS.refDark, raw: "31.58 TFLOPs" },
          { label: "ELP Speed (10s)", v: 3.71, color: COLORS.teal, textColor: COLORS.tealDark, raw: "19.56 TFLOPs" },
        ],
      },
      {
        cx: 0.74, title: "RAE SigLIP2-B", sub: "(vs. 54.20 TF Loop+LG)",
        bars: [
          { label: "Loop + LG", v: 1.00, color: COLORS.refLight, textColor: COLORS.muted, raw: "54.20 TFLOPs" },
          { label: "50s Base", v: 1.86, color: COLORS.ref, textColor: COLORS.refDark, raw: "29.07 TFLOPs" },
          { label: "ELP Speed (6s)", v: 9.68, color: COLORS.teal, textColor: COLORS.tealDark, raw: "5.60 TFLOPs" },
        ],
      },
    ];

    const barW = 34, gap = 8;
    const baseLineY = sy(0);
    groups.forEach((g) => {
      const centerPx = sx(g.cx);
      const startX = centerPx - (barW * 3 + gap * 2) / 2;
      g.bars.forEach((b, i) => {
        const bx = startX + i * (barW + gap);
        const by = sy(b.v);
        const rect = svgEl("rect", {
          x: bx, y: by, width: barW, height: baseLineY - by, rx: 3,
          fill: b.color, stroke: i === 2 ? COLORS.tealDark : COLORS.axis, "stroke-width": i === 2 ? 1.1 : 0.6,
        }, svg);
        attachTooltip(rect, `<b>${g.title} \u2014 ${b.label}</b><br>${b.v.toFixed(2)}\u00d7 vs. Loop+LG (${b.raw})`);
        svgText(svg, bx + barW / 2, by - 5, `${b.v.toFixed(2)}\u00d7`, {
          "text-anchor": "middle", "font-size": i === 2 ? 9.8 : 9.0, "font-weight": i === 2 ? 800 : 600, fill: b.textColor,
        });
      });
      svgText(svg, centerPx, h - 22, g.title, { "text-anchor": "middle", "font-size": 10.6, "font-weight": 700, fill: COLORS.text });
      svgText(svg, centerPx, h - 8, g.sub, { "text-anchor": "middle", "font-size": 9.1, fill: COLORS.muted });
    });

    drawTopLegend(svg, [
      { marker: "patch", color: COLORS.refDark, fill: COLORS.refLight, label: "Loop + LG (1.0\u00d7)", advance: 118 },
      { marker: "patch", color: COLORS.ref, fill: COLORS.ref, label: "Unlooped Base", advance: 112 },
      { marker: "patch", color: COLORS.teal, fill: COLORS.teal, label: "ELP Speed (Ours)", advance: 130 },
    ], m.l, 15);
  }

  function renderQwenGainBar(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = "";
    const { wrap } = createCard(container, "Qwen3-4B: Zero-Origin Accuracy Gain over Non-Looped Baseline", "4,145-Question STEM Suite");
    const w = 960, h = 245;
    const m = { l: 58, r: 24, t: 38, b: 42 };
    const sx = scaleLin(0, 1, m.l, w - m.r);
    const sy = scaleLin(0, 3.35, h - m.b, m.t);
    const svg = svgEl("svg", { viewBox: `0 0 ${w} ${h}`, role: "img", "aria-label": "Qwen3-4B STEM gains over Non-looped baseline" }, wrap);

    drawAxes(svg, {
      m, w, h, sx, sy,
      xTicks: [],
      yTicks: [0, 0.5, 1.0, 1.5, 2.0, 2.5, 3.0],
      yFormat: (v) => (v === 0 ? "0.0" : `+${v.toFixed(1)}`),
      yLabel: "\u0394 Accuracy (pp) \u2191",
    });

    const items = [
      { cx: 0.14, label: "GPQA-Main", sub: "31.92% \u2192 34.82%", fix: 1.34, elp: 2.90, tag: "2.16\u00d7 Fixed Loop" },
      { cx: 0.38, label: "MMLU-STEM", sub: "62.43% \u2192 64.72%", fix: 1.77, elp: 2.29, tag: "+0.52 pp vs Loop" },
      { cx: 0.62, label: "Macro Domain", sub: "58.37% \u2192 60.36%", fix: 1.23, elp: 1.99, tag: "1.62\u00d7 Fixed Loop" },
      { cx: 0.86, label: "Micro Acc (All Qs)", sub: "63.81% \u2192 65.48%", fix: 1.23, elp: 1.67, tag: "+0.44 pp vs Loop" },
    ];

    const barW = 48, gap = 12;
    const baseLineY = sy(0);
    items.forEach((it) => {
      const centerPx = sx(it.cx);
      const x1 = centerPx - barW - gap / 2;
      const x2 = centerPx + gap / 2;
      const y1 = sy(it.fix);
      const y2 = sy(it.elp);

      const b1 = svgEl("rect", {
        x: x1, y: y1, width: barW, height: baseLineY - y1, rx: 4,
        fill: COLORS.blue, stroke: "#0369A1", "stroke-width": 0.9, opacity: 0.85,
      }, svg);
      attachTooltip(b1, `<b>${it.label} \u2014 Fixed Loop</b><br>+${it.fix.toFixed(2)} pp over Non-looped`);

      const b2 = svgEl("rect", {
        x: x2, y: y2, width: barW, height: baseLineY - y2, rx: 4,
        fill: COLORS.ours, stroke: COLORS.oursDark, "stroke-width": 1.1,
      }, svg);
      attachTooltip(b2, `<b>${it.label} \u2014 ELP (Ours)</b><br>+${it.elp.toFixed(2)} pp (${it.sub}) \u00b7 ${it.tag}`);

      svgText(svg, x1 + barW / 2, y1 - 6, `+${it.fix.toFixed(2)}`, {
        "text-anchor": "middle", "font-size": 10.5, "font-weight": 700, fill: "#0369A1",
      });
      svgText(svg, x2 + barW / 2, y2 - 6, `+${it.elp.toFixed(2)} pp`, {
        "text-anchor": "middle", "font-size": 11, "font-weight": 800, fill: COLORS.oursDark,
      });
      svgText(svg, x2 + barW / 2, y2 - 20, it.tag, {
        "text-anchor": "middle", "font-size": 9.4, "font-weight": 700, fill: COLORS.teal,
      });

      svgText(svg, centerPx, h - 22, it.label, { "text-anchor": "middle", "font-size": 11.5, "font-weight": 700, fill: COLORS.text });
      svgText(svg, centerPx, h - 7, it.sub, { "text-anchor": "middle", "font-size": 9.8, fill: COLORS.muted });
    });

    drawTopLegend(svg, [
      { marker: "patch", color: "#0369A1", fill: COLORS.blue, label: "Fixed Loop (gain vs. Non-looped)", advance: 230 },
      { marker: "patch", color: COLORS.oursDark, fill: COLORS.ours, label: "ELP Dual-Window RK3 (Ours)", advance: 210 },
    ], m.l, 15);
  }

  // --- Pretrained Looped LLM: Dory1.0-4B Interactive Charts ---

  function renderDoryCharts(openId, stemId) {
    const openWrapEl = document.getElementById(openId);
    if (openWrapEl) {
      openWrapEl.innerHTML = "";
      const { wrap } = createCard(openWrapEl, "Open-Ended 8-Repeat Pareto", "IFBench + GPQA-D + SciCode");
      const w = 480, h = 265;
      const m = { l: 54, r: 24, t: 36, b: 42 };
      const sx = scaleLin(88000, 170000, m.l, w - m.r);
      const sy = scaleLin(60.82, 61.72, h - m.b, m.t);
      const svg = svgEl("svg", { viewBox: `0 0 ${w} ${h}`, role: "img", "aria-label": "Dory1.0-4B Open-ended Pareto" }, wrap);

      svgEl("rect", {
        x: sx(88000), y: sy(61.72), width: sx(96300) - sx(88000), height: sy(61.18) - sy(61.72),
        fill: COLORS.oursGap,
      }, svg);

      drawAxes(svg, {
        m, w, h, sx, sy,
        xTicks: [95000, 120000, 145000, 165000],
        yTicks: [60.9, 61.1, 61.3, 61.5, 61.7],
        xFormat: (v) => `${Math.round(v / 1000)}k`,
        yFormat: (v) => `${v.toFixed(1)}%`,
        xLabel: "Total inference TFLOPs (lower is faster) \u2190",
        yLabel: "8-Repeat Avg Score (%) \u2191",
      });

      addPolyline(svg, [[96300, 60.92], [161198, 61.18]], sx, sy, {
        stroke: COLORS.ref, "stroke-width": 1.6, "stroke-dasharray": "4 3",
      });

      // Vertical +0.66 pp gain arrow between Native K=2 (60.92) and ELP last-loop (61.58)
      drawGainArrow(svg, sx(92800), sy(60.92), sy(61.58), COLORS.ours);
      svgEl("line", { x1: sx(92400), y1: sy(60.92), x2: sx(96300), y2: sy(60.92), stroke: COLORS.ref, "stroke-dasharray": "2 2", "stroke-width": 1 }, svg);
      svgEl("line", { x1: sx(92400), y1: sy(61.58), x2: sx(95719), y2: sy(61.58), stroke: COLORS.ours, "stroke-dasharray": "2 2", "stroke-width": 1 }, svg);
      svgText(svg, sx(98500), sy(61.26), "+0.66 pp", { "font-size": 9.4, "font-weight": 800, fill: COLORS.oursDark });

      DORY_OPEN.forEach((d, idx) => {
        const px = sx(d.x), py = sy(d.y);
        const node = d.ours
          ? svgEl("path", { d: starPath(px, py, 7.2, 3.2), fill: COLORS.ours, stroke: COLORS.white, "stroke-width": 0.9 }, svg)
          : svgEl("circle", { cx: px, cy: py, r: 4.8, fill: COLORS.ref, stroke: COLORS.white, "stroke-width": 0.9 }, svg);
        attachTooltip(node, `<b>${d.name}</b><br>Avg: ${d.y.toFixed(2)}% \u00b7 ${d.x.toLocaleString()} TFLOPs<br>IFBench ${d.ifb}% \u00b7 GPQA-D ${d.gpqa}% \u00b7 SciCode ${d.sci}%<br>Wall vs K=2/K=4: ${d.wall}`);

        if (idx === 0) svgText(svg, px + 8, py + 12, "Native K=2 (60.92%)", { "font-size": 9.3, fill: COLORS.refDark });
        if (idx === 1) svgText(svg, px - 6, py - 9, "Native K=4 (61.18%)", { "text-anchor": "end", "font-size": 9.3, fill: COLORS.refDark });
        if (idx === 2) drawCallout(svg, px + 5, py + 1, sx(119000), sy(61.46), "ELP per-loop KV (61.45%)", "start", COLORS.oursDark);
        if (idx === 3) drawCallout(svg, px + 5, py - 2, sx(119000), sy(61.63), "ELP last-loop KV (61.58%)", "start", COLORS.ours);
      });

      const ySave = sy(61.33);
      svgEl("line", { x1: sx(95223), y1: ySave, x2: sx(161198), y2: ySave, stroke: COLORS.teal, "stroke-width": 1.3, "stroke-dasharray": "3 2" }, svg);
      svgEl("line", { x1: sx(95223), y1: ySave - 3.5, x2: sx(95223), y2: ySave + 3.5, stroke: COLORS.teal, "stroke-width": 1.3 }, svg);
      svgEl("line", { x1: sx(161198), y1: ySave - 3.5, x2: sx(161198), y2: ySave + 3.5, stroke: COLORS.teal, "stroke-width": 1.3 }, svg);
      svgText(svg, sx(131000), ySave - 5, "1.69\u00d7 fewer FLOPs (\u221240.9%)", {
        "text-anchor": "middle", "font-size": 9.4, "font-weight": 800, fill: COLORS.teal,
      });

      drawTopLegend(svg, [
        { marker: "star", color: COLORS.ours, label: "ELP K=2 programs", advance: 132 },
        { line: true, dash: "4 3", marker: "circle", color: COLORS.ref, label: "Native Dory1.0-4B", advance: 140 },
      ], m.l, 15);
    }

    const stemWrapEl = document.getElementById(stemId);
    if (stemWrapEl) {
      stemWrapEl.innerHTML = "";
      const { wrap } = createCard(stemWrapEl, "Matched-K STEM Reasoning Scaling", "MMLU + GPQA + ARC + SciQ");
      const w = 480, h = 265;
      const m = { l: 54, r: 22, t: 36, b: 42 };
      const sx = scaleLin(6, 27.5, m.l, w - m.r);
      const sy = scaleLin(58.65, 61.10, h - m.b, m.t);
      const svg = svgEl("svg", { viewBox: `0 0 ${w} ${h}`, role: "img", "aria-label": "Dory1.0-4B Matched-K STEM Scaling" }, wrap);

      drawAxes(svg, {
        m, w, h, sx, sy,
        xTicks: [8, 12, 16, 20, 24],
        yTicks: [59.0, 59.5, 60.0, 60.5, 61.0],
        yFormat: (v) => `${v.toFixed(1)}%`,
        xLabel: "Compute per token (GFLOPs / tok) \u2190",
        yLabel: "STEM Micro Acc (%) \u2191",
      });

      // Shaded gain polygon over Native K=2..K=4
      addPolygon(svg, [
        [9.45, 59.69], [14.74, 60.68], [18.44, 60.89],
        [18.44, 60.29], [14.74, 59.81], [11.03, 59.64],
      ], sx, sy, { fill: COLORS.oursGap });

      addPolyline(svg, DORY_STEM_NAT.map((d) => [d.x, d.y]), sx, sy, {
        stroke: COLORS.ref, "stroke-width": 1.7, "stroke-dasharray": "4 3",
      });
      DORY_STEM_NAT.forEach((d, idx) => {
        const px = sx(d.x), py = sy(d.y);
        const c = svgEl("circle", { cx: px, cy: py, r: 4, fill: COLORS.ref, stroke: COLORS.white, "stroke-width": 0.8 }, svg);
        attachTooltip(c, `<b>Native Dory1.0-4B (${d.k})</b><br>${d.x.toFixed(2)} GFLOPs/tok \u00b7 ${d.y.toFixed(2)}% Micro`);
        const yOff = idx >= 1 ? 14 : -8;
        const xOff = idx === 4 ? -4 : 0;
        svgText(svg, px + xOff, py + yOff, d.k, { "text-anchor": "middle", "font-size": 9.2, fill: COLORS.refDark });
      });

      // Vertical gain arrows at K=3 (+0.87) and K=4 (+0.60)
      drawGainArrow(svg, sx(14.74), sy(59.81), sy(60.68) + 4, COLORS.ours);
      svgText(svg, sx(14.4), sy(60.28), "+0.87", { "text-anchor": "end", "font-size": 9.0, "font-weight": 800, fill: COLORS.oursDark });
      drawGainArrow(svg, sx(18.44), sy(60.29), sy(60.89) + 4, COLORS.ours);
      svgText(svg, sx(18.9), sy(60.58), "+0.60", { "text-anchor": "start", "font-size": 9.0, "font-weight": 800, fill: COLORS.oursDark });

      addPolyline(svg, DORY_STEM_ELP.map((d) => [d.x, d.y]), sx, sy, {
        stroke: COLORS.ours, "stroke-width": 2.4,
      });
      DORY_STEM_ELP.forEach((d, idx) => {
        const px = sx(d.x), py = sy(d.y);
        const p = svgEl("path", { d: diamondPath(px, py, 4.8), fill: COLORS.ours, stroke: COLORS.white, "stroke-width": 0.8 }, svg);
        attachTooltip(p, `<b>${d.k}</b><br>${d.x.toFixed(2)} GFLOPs/tok \u00b7 ${d.y.toFixed(2)}% Micro<br>${d.note}`);
        if (idx === 0) {
          drawCallout(svg, px, py - 5, sx(6.7), sy(60.35), `${d.k} (1.17\u00d7 faster)`, "start", COLORS.tealDark);
        } else if (idx === 1) {
          svgText(svg, px, py - 9, `ELP K=3 (> K=6)`, {
            "text-anchor": "end", "font-size": 9.2, "font-weight": 700, fill: COLORS.oursDark,
          });
        } else {
          svgText(svg, px, py - 9, `${d.k} (${d.y.toFixed(2)}%)`, {
            "text-anchor": "start", "font-size": 9.2, "font-weight": 700, fill: COLORS.oursDark,
          });
        }
      });

      drawTopLegend(svg, [
        { line: true, marker: "diamond", color: COLORS.ours, label: "ELP programs", advance: 122 },
        { line: true, dash: "4 3", marker: "circle", color: COLORS.ref, label: "Native (K=1..6)", advance: 132 },
      ], m.l, 15);
    }
  }

  window.ELPCharts = {
    renderAll() {
      renderTeaserGrid("teaserSvgGrid");
      renderScaleRaeHV("teaserHvChart", {
        title: "Scale-RAE Cumulative Pareto Hypervolume (R0\u2013R8)",
        badge: "80 candidates",
      });
      renderImageGainBar("benchImageGain");
      renderImageSpeedupBar("benchImageSpeedup");
      renderScaleRaeHV("benchScaleHv", {
        title: "Scale-RAE Pareto Trajectory",
        badge: "R0\u2013R8",
      });
      renderLoopedDitHV("benchLoopedHv");
      renderDoryCharts("doryOpenChart", "doryStemChart");
      renderQwenGainBar("benchQwenGain");
    },
  };
})();
