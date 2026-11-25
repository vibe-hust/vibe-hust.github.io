/* Original interactive SVG + DOM walkthrough for Evolving Loop Programs (ELP).
   Zero external dependencies; renders real manuscript trajectories across Image, Video, and Text. */
(function () {
  "use strict";

  const NS = "http://www.w3.org/2000/svg";

  function clamp(v, lo, hi) {
    return Math.max(lo, Math.min(hi, v));
  }

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function easeInOut(t) {
    const x = clamp(t, 0, 1);
    return x * x * (3 - 2 * x);
  }

  function svgEl(tag, attrs, parent) {
    const el = document.createElementNS(NS, tag);
    if (attrs) {
      for (const [k, v] of Object.entries(attrs)) {
        el.setAttribute(k, String(v));
      }
    }
    if (parent) parent.appendChild(el);
    return el;
  }

  function fmtTime(sec) {
    const total = Math.max(0, Math.round(sec * 10) / 10);
    const m = Math.floor(total / 60);
    const s = (total % 60).toFixed(1).padStart(4, "0");
    return `${m}:${s}`;
  }

  // Exact verified manuscript scenarios featuring strongest headline results
  const SCENARIOS = [
    {
      id: "scalerae",
      pill: "Image \u00b7 Scale-RAE (+8.1 pp, 3.7\u00d7)",
      file: "candidate_scale_rae.py",
      modelTitle: "Scale-RAE (1.5B + 2.4B)",
      stackTitle: "Diffusion Transformer (32 Blocks)",
      chartTitle: "Development Pareto HV (GenEval, DPG, Speedup)",
      yLabel: "Dev HV \u2191",
      yRange: [0.10, 0.98],
      yTicks: [0.20, 0.45, 0.70, 0.95],
      yFmt: (v) => v.toFixed(2),
      telemPrefix: "Dev HV",
      telemFmt: (v) => v.toFixed(3),
      duration: 22.0,
      baselineCurve: [
        { tNorm: 0.04, label: "R0", value: 0.297 },
        { tNorm: 0.16, label: "R1", value: 0.636 },
        { tNorm: 0.27, label: "R2", value: 0.701 },
        { tNorm: 0.38, label: "R3", value: 0.713 },
        { tNorm: 0.49, label: "R4", value: 0.730 },
        { tNorm: 0.60, label: "R5", value: 0.731 },
        { tNorm: 0.72, label: "R6", value: 0.732 },
        { tNorm: 0.84, label: "R7", value: 0.754 },
        { tNorm: 0.96, label: "R8", value: 0.792 }
      ],
      baselineLegend: "Config Search (0.792)",
      mainCurve: [
        { tNorm: 0.04, act: 0, label: "R0", value: 0.170 },
        { tNorm: 0.16, act: 1, label: "R1", value: 0.361 },
        { tNorm: 0.27, act: 1, label: "R2", value: 0.374 },
        { tNorm: 0.38, act: 1, label: "R3", value: 0.540 },
        { tNorm: 0.49, act: 2, label: "R4", value: 0.579 },
        { tNorm: 0.60, act: 2, label: "R5", value: 0.595 },
        { tNorm: 0.72, act: 3, label: "R6", value: 0.785 },
        { tNorm: 0.84, act: 4, label: "R7", value: 0.806 },
        { tNorm: 0.96, act: 4, label: "R8", value: 0.915 }
      ],
      mainLegend: "ELP Programs (0.915)",
      acts: [
        {
          id: "r0",
          start: 0.0,
          end: 3.3,
          focusT: 0.88,
          compIdx: 0,
          roundTag: "R0 \u00b7 Anchor",
          state: "anchor",
          stateLabel: "\u25cf Anchor Baseline",
          flopsText: "72.46 TFLOPs",
          arcLabel: "K=4 passes",
          orbLabel: "GenEval 58.56% Full (72.46 TF)",
          narration: "R0 starts from naive Loop + LoopGuidance (25 steps, 72.46 TFLOPs), paying expensive reference passes on every looped step.",
          observe: "Anchor Loop + LG costs 72.46 TFLOPs (0.784 s/img), yielding 57.90% held-out GenEval.",
          evolve: "Expose editable loop_forward(x, t_idx) over structure, state dynamics, and step control.",
          structBadge: "B12\u201327, K=4 dense",
          dynBadge: "Standard Loop + LG",
          ctrlBadge: "25 steps, all D_ref",
          frozen: false,
          codeDiff: [],
          code: [
            "def loop_forward(x, t_idx):",
            "  d_ref = unlooped_pass(x)",
            "  h = prefix(x)",
            "  for k in range(4):        # B12..27",
            "    h = loop_blocks_12_27(h)",
            "  d_loop = head(h)",
            "  return d_ref + w * (d_loop - d_ref)",
            "# Anchor Loop+LG: 25 steps, 72.46 TFLOPs"
          ],
          svgMode: "steps_dense"
        },
        {
          id: "r1_3",
          start: 3.3,
          end: 8.8,
          focusT: 8.36,
          compIdx: 0,
          roundTag: "R1\u2013R3 \u00b7 Structure",
          state: "rewrite",
          stateLabel: "\u2726 Co-Adapting Loop",
          flopsText: "15 steps \u00b7 K=2 Euler",
          arcLabel: "K=2 Euler (0.5)",
          orbLabel: "15-step K=2 Euler (HV 0.540)",
          narration: "Rounds 1\u20133 compress 25 steps to 15, isolate middle-late blocks 12\u201327 with K=2 damped Euler (0.5), and confine looping to t <= 0.5.",
          observe: "Layerwise B12\u201327 residuals stabilize at K=2 with half-weight Euler; late steps need no loops.",
          evolve: "Skip looping when t/T > 0.5, scale Euler update by 0.5, and set LoopGuidance w=3.0.",
          structBadge: "B12\u201327, K=2 layer",
          dynBadge: "Euler (0.5) + w=3.0",
          ctrlBadge: "Early half (t/T<=0.5)",
          frozen: false,
          codeDiff: [3, 4, 6, 7],
          code: [
            "def loop_forward(x, t_idx):",
            "  d_ref = unlooped_pass(x)",
            "  if t_idx >= 8: return d_ref",
            "  h = prefix(x)",
            "  for k in range(2):        # prune K=4->2",
            "    h = h + 0.5 * (loop_blocks_12_27(h) - h)",
            "  d_loop = head(h)",
            "  return d_ref + 3.0 * (d_loop - d_ref)"
          ],
          svgMode: "steps_dense"
        },
        {
          id: "r4_5",
          start: 8.8,
          end: 13.8,
          focusT: 13.20,
          compIdx: 1,
          roundTag: "R4\u2013R5 \u00b7 Diagnostics",
          state: "probe",
          stateLabel: "\u25c6 Running Probes",
          flopsText: "208 Traces \u00b7 +0 Slots",
          arcLabel: "K=2 (Probing)",
          orbLabel: "",
          probeBanner: "guidance_probe.py: cos=0.995 | Lag-1 0.56",
          narration: "In Rounds 4\u20135, the search LLM writes guidance_probe.py (208 traces) and falsifies lag-2 and linear extrapolation despite 0.995 cosine similarity.",
          observe: "cos(D_loop, D_ref)=0.995, yet \u0394_t rel error is Lag-1 0.56\u20130.63 \u2713 vs Lag-2 0.86\u20131.10 \u2717, Linear 0.84\u20131.35 \u2717.",
          evolve: "Reject lag>=2 & extrapolation; keep D_loop fresh on every active step and reuse Lag-1 \u0394_cache.",
          structBadge: "B12\u201327, K=2 probed",
          dynBadge: "Probe \u0394_t=D_loop-D_ref",
          ctrlBadge: "208 traces (+0 slots)",
          frozen: false,
          codeDiff: [0, 1, 2, 3, 4],
          code: [
            "# guidance_probe.py (read-only on 208 traces)",
            "cos_sim = cos(d_loop, d_ref)        # 0.994..0.995",
            "err_lag1 = rms(delta[t-1] - delta)  # 0.56..0.63 OK",
            "err_lag2 = rms(delta[t-2] - delta)  # 0.86..1.10 FAIL",
            "err_lin  = rms(extrap_2   - delta)  # 0.84..1.35 FAIL",
            "# Decision: refresh D_ref on even steps {0,2,4},",
            "# keep fresh D_loop, reuse 1-step delta on odd!"
          ],
          svgMode: "probe_bars"
        },
        {
          id: "r6",
          start: 13.8,
          end: 18.0,
          focusT: 15.84,
          compIdx: 2,
          roundTag: "R6 \u00b7 Breakthrough",
          state: "rewrite",
          stateLabel: "\u2726 Rewriting Program",
          flopsText: "19.56 TFLOPs",
          arcLabel: "K=2 Euler (0.5)",
          orbLabel: "Ctrl +3.91 pp (60.23\u219264.14)",
          narration: "In Round 6, ELP rewrites 10-step control to refresh D_ref on steps {0,2,4} and reuse 1-step \u0394_cache on odd steps, jumping HV from 0.595 to 0.785.",
          observe: "Matched-call control confirms 1-step \u0394 reuse beats omitting D_ref (64.14 vs 60.23 GenEval, +3.91 pp).",
          evolve: "Deploy 10-step strided reuse (5->3 D_ref calls): ELP 0.785 breaks past Config ceiling (0.732).",
          structBadge: "B12\u201327, K=2 Euler",
          dynBadge: "Fresh D_loop + \u0394_cache",
          ctrlBadge: "10 steps; D_ref {0,2,4}",
          frozen: false,
          codeDiff: [1, 2, 3, 4, 5, 6],
          code: [
            "def loop_forward(x, t_idx):",
            "  d_loop = eval_loop_b12_27(x, K=2)  # always fresh",
            "  if t_idx in (0, 2, 4):             # 5 -> 3 calls",
            "    d_ref = unlooped_pass(x)",
            "    delta_cache = (d_loop - d_ref).detach()",
            "    return d_ref + 3.0 * delta_cache",
            "  return d_loop + 2.0 * delta_cache  # odd step reuse!"
          ],
          svgMode: "steps_strided"
        },
        {
          id: "r7_8",
          start: 18.0,
          end: 22.0,
          focusT: 21.12,
          compIdx: 3,
          roundTag: "R7\u2013R8 \u00b7 Freeze",
          state: "frozen",
          stateLabel: "\ud83d\udd12 Frozen Program",
          flopsText: "19.56 TF (3.71\u00d7 LG)",
          arcLabel: "K=2 Euler (0.5)",
          orbLabel: "Held-out +8.10 pp | 4.48\u00d7 Wall",
          narration: "Rounds 7\u20138 lift HV to 0.915 vs Config Search 0.792 and freeze Speed (60.54% full / +8.10 pp held-out GenEval, 4.48\u00d7 wall vs LG) and Quality (60.98%).",
          observe: "R7 prunes unstable RMS rescale (\u22125.47 GenEval); R8 Speed cuts cost 3.71\u00d7 vs LG & Quality hits 60.98%.",
          evolve: "Freeze (code, \u03bb) permanently: Speed runs 0.175 s/img (1.61\u00d7 Base / 4.48\u00d7 LG) with 0 LLM calls.",
          structBadge: "B12\u201327, K=2 (Frozen)",
          dynBadge: "Euler + 1-step \u0394_cache",
          ctrlBadge: "Speed 10s (19.56 TF)",
          frozen: true,
          codeDiff: [],
          code: [
            "# FROZEN DEPLOYMENT (Held-out GenEval +8.10 pp)",
            "def loop_forward_frozen(x, t_idx):",
            "  if t_idx >= 5: return unlooped_pass(x)",
            "  d_loop = eval_loop_b12_27(x, K=2, euler=0.5)",
            "  if t_idx in (0, 2, 4):",
            "    d_ref = unlooped_pass(x)",
            "    delta_cache = (d_loop - d_ref).detach()",
            "  return d_loop + 2.0 * delta_cache  # 4.48x wall vs LG"
          ],
          svgMode: "steps_strided"
        }
      ]
    },
    {
      id: "looped",
      pill: "Image \u00b7 Looped-DiT (7.86\u00d7, +102% HV)",
      file: "looped_dit_program.py",
      modelTitle: "Looped-DiT-B32 (5B Core)",
      stackTitle: "Weight-Tied Diffusion Core (6 + 5\u00d7K + 6)",
      chartTitle: "Development Pareto HV (+102.1% over Native Ref)",
      yLabel: "Dev HV \u2191",
      yRange: [2.4, 6.2],
      yTicks: [2.8, 3.8, 4.8, 5.8],
      yFmt: (v) => v.toFixed(1),
      telemPrefix: "Dev HV",
      telemFmt: (v) => v.toFixed(2),
      duration: 18.0,
      baselineCurve: [
        { tNorm: 0.06, label: "Native", value: 2.88 },
        { tNorm: 0.30, label: "R0", value: 2.88 },
        { tNorm: 0.48, label: "R1", value: 2.88 },
        { tNorm: 0.68, label: "R4", value: 2.88 },
        { tNorm: 0.94, label: "R8", value: 2.88 }
      ],
      baselineLegend: "Native Frontier (2.88)",
      mainCurve: [
        { tNorm: 0.06, act: 0, label: "Native", value: 2.88 },
        { tNorm: 0.30, act: 1, label: "R0", value: 5.30 },
        { tNorm: 0.48, act: 2, label: "R1", value: 5.71 },
        { tNorm: 0.68, act: 2, label: "R4", value: 5.75 },
        { tNorm: 0.94, act: 3, label: "R8", value: 5.81 }
      ],
      mainLegend: "ELP Frontier (5.81, +102%)",
      acts: [
        {
          id: "l_base",
          start: 0.0,
          end: 4.2,
          focusT: 1.08,
          compIdx: 0,
          roundTag: "Native \u00b7 K=4",
          state: "anchor",
          stateLabel: "\u25cf Native Pretrained Loop",
          flopsText: "53.18 TFLOPs (100s)",
          arcLabel: "Uniform K=4",
          orbLabel: "100s Native: 400 Core Passes",
          narration: "Even on Looped-DiT-B32 (pretrained with a 5-block recurrent core), native inference runs uniform K=4 passes at every step (400 passes, 53.18 TFLOPs).",
          observe: "Cutting native K=4 straight to 14 steps crashes GenEval from 84.65% down to 79.36%.",
          evolve: "Expose warped SNR schedule, core loop depth K_t, dual-stream transitions, and residual cache.",
          structBadge: "5B core, uniform K=4",
          dynBadge: "Fixed K=4 core pass",
          ctrlBadge: "100 uniform SNR steps",
          frozen: false,
          codeDiff: [],
          code: [
            "def looped_dit_native(x_t, txt_emb, steps=100):",
            "  for idx, t0 in enumerate(uniform_snr(steps)):",
            "    img, txt = pre_blocks(x_t, txt_emb)",
            "    for r in range(4):      # 400 total core passes",
            "      img, txt = run_weight_tied_core(img, txt)",
            "    pred = post_blocks(img, txt)",
            "    x_t = euler_step(x_t, pred, idx)",
            "# 100s Ref: 53.18 TF (0.814 s/img); 14s drops -5.3 pp!"
          ],
          svgMode: "stride_cache"
        },
        {
          id: "l_probe",
          start: 4.2,
          end: 8.8,
          focusT: 5.40,
          compIdx: 1,
          roundTag: "R0 \u00b7 Diagnostics",
          state: "probe",
          stateLabel: "\u25c6 Trajectory Probes",
          flopsText: "64 Samples \u00b7 Parity OK",
          arcLabel: "Probing Core",
          orbLabel: "",
          probeBanner: "Curvature 0.836@t=0.02 | Res cos 0.999+",
          narration: "Round 0 probes pinpoint high initial curvature (0.836), 0.999+ cross-step (h4\u2212h2) residual cosine, and unstable CFG variance (0.735), driving 97% of gain by R1.",
          observe: "(h4\u2212h2) cosine reaches 0.9989\u20130.9997 across t in [0.15, 0.90], while CFG diffs vary wildly (0.735).",
          evolve: "Warp SNR toward early curvature, reject CFG caching, and cache (h4\u2212h2) across 4/2 strides.",
          structBadge: "B_core r=1..4 probed",
          dynBadge: "Cos(r_j,r_{j-1})=0.999",
          ctrlBadge: "Falsify CFG reuse (0.74)",
          frozen: false,
          codeDiff: [1, 2, 3, 4],
          code: [
            "# Trajectory diagnostics (64 dev prompts, bit-exact):",
            "curv(t=0.02) = 0.836 vs 0.018..0.021 mid-band",
            "cos(h4_h2[j], h4_h2[j-1]) = 0.9989..0.9997  # REUSE OK",
            "cfg_diff_rel_var(t=0.90)  = 0.735           # REJECT!",
            "# Insight: pair warped SNR with bounded delta_2->4",
            "# Jump in R0-R1 alone: HV 2.88 -> 5.30 -> 5.71!"
          ],
          svgMode: "probe_bars"
        },
        {
          id: "l_evolve",
          start: 8.8,
          end: 13.6,
          focusT: 12.24,
          compIdx: 2,
          roundTag: "R1\u2013R6 \u00b7 Co-Design",
          state: "rewrite",
          stateLabel: "\u2726 Co-Adapting Dynamics",
          flopsText: "6.80 TF (48 passes)",
          arcLabel: "Kt\u2208{4,2} + Extrap",
          orbLabel: "14s +4.21 pp | 25s 86.34% Dev",
          narration: "ELP co-designs curvature-warped SNR (s=1.38), dual-stream extrapolation (\u03b1=0.20), tapered x0 AB2 (\u03b2=0.32), and bounded K_t in {4,2} reuse (age <= 2).",
          observe: "R4 tapered x0 reaches 86.34% dev GenEval; R6 prunes stale cache age > 2 for 85.17% at 7.21x.",
          evolve: "Alternate K_t in {4,2}: cut 14s passes 56->48 (6.80 TF) & beat Schedule-only by +1.32 pp.",
          structBadge: "Adaptive Kt\u2208{4,2} (48p)",
          dynBadge: "Dual Extrap + x0 AB2",
          ctrlBadge: "Warped SNR s=1.38, age<=2",
          frozen: false,
          codeDiff: [1, 2, 3, 4, 5, 6],
          code: [
            "for idx, t0 in warped_snr_schedule(steps=14, s=1.38):",
            "  K_t = 4 if (idx in refresh or t0 < low_t) else 2",
            "  if K_t == 4:                      # dual-stream extrap",
            "    img += 0.20 * (img - prev_img); txt += 0.20 * (txt - prev_txt)",
            "    res_cache = (img - h2_img, txt - h2_txt)",
            "  elif cache_age <= 2:              # bounded reuse",
            "    img, txt = img + w * res_cache[0], txt + w * res_cache[1]"
          ],
          svgMode: "stride_cache"
        },
        {
          id: "l_freeze",
          start: 13.6,
          end: 18.0,
          focusT: 16.92,
          compIdx: 3,
          roundTag: "R8 \u00b7 Freeze & Beat 100s",
          state: "frozen",
          stateLabel: "\ud83d\udd12 Frozen Program",
          flopsText: "7.86\u00d7 / 5.53\u00d7 Wall",
          arcLabel: "48 Passes (7.86\u00d7)",
          orbLabel: "Balanced 5.53\u00d7 Beats 100s!",
          narration: "Frozen Balanced (20s) beats 100s Native on held-out GenEval (84.92% vs 84.43%) at 5.53\u00d7 H100 wall speedup; Speed (14s) runs at 7.86\u00d7 wall speedup (+4.21 pp).",
          observe: "Held-out (1,298 prompts): Speed 7.86x wall (+4.21 pp GenEval, +3.96 pp DPG); Balanced 5.53x beats 100s.",
          evolve: "Freeze standalone inference code: HV 2.88 -> 5.81 (+102.1%) with zero LLM calls at deployment.",
          structBadge: "48 / 68 Core Passes",
          dynBadge: "Verified AB2 + Reuse",
          ctrlBadge: "Speed 7.86\u00d7 / Bal 5.53\u00d7",
          frozen: true,
          codeDiff: [],
          code: [
            "# FROZEN DEPLOYMENT (32x H100 Measured Wall Speedup)",
            "# Speed (14s, 6.80 TF): 7.86x wall, +4.21 pp held GenEval",
            "# Balanced (20s, 9.67 TF): 5.53x wall, 84.92% > 100s (84.43%)",
            "pred = post_blocks(img, txt)",
            "if prev_pred is not None:  # tapered x0 AB2 (beta=0.32)",
            "  pred += (0.32 * taper(t0) * dt_ratio) * (pred - prev_pred)",
            "x_t = step_update(x_t, pred, idx)  # 0 LLM calls!"
          ],
          svgMode: "stride_cache"
        }
      ]
    },
    {
      id: "video",
      pill: "Video \u00b7 LongLive 2.0 (\u221261% Drift)",
      file: "longlive2_program.py",
      modelTitle: "LongLive 2.0 5B (30 Blk)",
      stackTitle: "Causal Wan-DiT Stack (30 Blocks)",
      chartTitle: "RememBench T2V Revisit Error (Held-out 80 LPIPS \u2193)",
      yLabel: "LPIPS \u2193",
      yRange: [0.12, 0.42],
      yTicks: [0.15, 0.25, 0.35, 0.40],
      yFmt: (v) => v.toFixed(2),
      telemPrefix: "Held LPIPS",
      telemFmt: (v) => v.toFixed(3),
      invertBetter: true,
      duration: 18.0,
      baselineCurve: [
        { tNorm: 0.06, label: "Native", value: 0.198 },
        { tNorm: 0.30, label: "Fixed Loop", value: 0.198 },
        { tNorm: 0.50, label: "Per-Blk K=5", value: 0.198 },
        { tNorm: 0.68, label: "Win K=4", value: 0.198 },
        { tNorm: 0.94, label: "Win K=6", value: 0.198 }
      ],
      baselineLegend: "Fixed Loop Ref (0.198)",
      mainCurve: [
        { tNorm: 0.06, act: 0, label: "Native", value: 0.391 },
        { tNorm: 0.30, act: 1, label: "Fixed Loop", value: 0.198 },
        { tNorm: 0.50, act: 2, label: "Per-Blk K=5", value: 0.185 },
        { tNorm: 0.68, act: 2, label: "Win K=4", value: 0.167 },
        { tNorm: 0.94, act: 3, label: "Win K=6", value: 0.158 }
      ],
      mainLegend: "ELP Trajectory (0.158)",
      acts: [
        {
          id: "v_native",
          start: 0.0,
          end: 4.0,
          focusT: 1.08,
          compIdx: 0,
          roundTag: "Anchor \u00b7 Native",
          state: "anchor",
          stateLabel: "\u25cf Native Baseline",
          flopsText: "48/100 Collapse",
          arcLabel: "No Loop",
          orbLabel: "All-100 LPIPS: 0.3852 (Drifts)",
          narration: "Without looping, autoregressive chunk-wise video rollouts commit per-chunk errors to the causal KV cache and collapse on 48 of 100 scenes upon revisit.",
          observe: "Departure->revisit error compounds in causal KV (Held-out LPIPS 0.3907, CLIP 0.8551).",
          evolve: "Define autoregressive rollout baseline on 20 dev scenes (80 held-out isolated).",
          structBadge: "30 blocks, no loop",
          dynBadge: "Single forward pass",
          ctrlBadge: "4 UniPC, write KV all",
          frozen: false,
          codeDiff: [],
          code: [
            "def chunk_step(x, step_idx, kv_cache):",
            "  # Standard 30-block causal Wan-DiT pass",
            "  for idx in range(30):",
            "    x, kv = blocks[idx](x, kv_cache, write_kv=True)",
            "  return x",
            "# Native held-out LPIPS: 0.3907 (48/100 collapses)"
          ],
          svgMode: "video_kv"
        },
        {
          id: "v_scope",
          start: 4.0,
          end: 8.6,
          focusT: 5.40,
          compIdx: 1,
          roundTag: "Probes + Scoping",
          state: "probe",
          stateLabel: "\u25c6 Probes + Block Scope",
          flopsText: "Dev HV 0.712\u2192",
          arcLabel: "Fixed B12\u201319",
          orbLabel: "",
          probeBanner: "Residual probes: avoid B1/B29; pick B11\u201318",
          narration: "Diagnostics flag boundary instabilities (block 1 & block 29) and show block-level loop scoping prevents sub-layer overfitting on 20 scenes (0.402 -> 0.198 LPIPS).",
          observe: "Unscoped FFN search overfits N=20 (held LPIPS 0.402); Fixed block loop cuts drift to 0.198.",
          evolve: "Expose band, window vs per-block mode, active steps, and K inside block-scoped KV contract.",
          structBadge: "Middle band scoped",
          dynBadge: "Euler + deferred KV",
          ctrlBadge: "Block-scoped N=20",
          frozen: false,
          codeDiff: [1, 2, 3, 4],
          code: [
            "# Diagnostic & edit-granularity check (N=20 scenes):",
            "# Boundary B1/B29 residuals spike -> avoid endpoints",
            "# Unscoped FFN overfits N=20 (0.402) vs Fixed (0.198)",
            "# Block-scoped loop contract (band/steps/K open):",
            "for r in range(K):",
            "  # read-only passes before final-pass KV commit!"
          ],
          svgMode: "video_kv"
        },
        {
          id: "v_search",
          start: 8.6,
          end: 13.6,
          focusT: 12.24,
          compIdx: 2,
          roundTag: "Windowwise + KV Defer",
          state: "rewrite",
          stateLabel: "\u2726 Windowwise Evolution",
          flopsText: "Dev HV 0.857",
          arcLabel: "Win B11\u201318",
          orbLabel: "Win K=4 Beats Per-Blk K=5!",
          narration: "Search lifts Dev HV 0.712 -> 0.857, finding contiguous windowwise B11\u201318 at steps {0,1,2} outperforms per-block K=5 even at K=4 (0.167 LPIPS, 0.9228 CLIP).",
          observe: "Contiguous window B11\u201318 beats per-block K=5 (0.185 -> 0.167) and Fixed Loop (0.198) on 80 held-out.",
          evolve: "Loop contiguous window W_{11..18} K=6 times with Euler 1/6; commit KV only at r=5.",
          structBadge: "Window B11\u201318, K=6",
          dynBadge: "Windowwise Euler 1/6",
          ctrlBadge: "Steps {0,1,2}; r=5 KV",
          frozen: false,
          codeDiff: [2, 3, 4, 5, 6],
          code: [
            "def chunk_step(x, step_idx, kv_cache):",
            "  h = run_blocks(0..10, x, write_kv=True)",
            "  if step_idx in (0, 1, 2):   # t in {999, 937, 833}",
            "    for r in range(6):        # windowwise K=6",
            "      w = run_blocks(11..18, h, kv_cache,",
            "                     write_kv=(r == 5))",
            "      h = h + (1.0 / 6.0) * (w - h)",
            "  return run_blocks(19..29, h, write_kv=True)"
          ],
          svgMode: "video_kv"
        },
        {
          id: "v_freeze",
          start: 13.6,
          end: 18.0,
          focusT: 16.92,
          compIdx: 3,
          roundTag: "Confirmed \u00b7 Frozen",
          state: "frozen",
          stateLabel: "\ud83d\udd12 Frozen Program",
          flopsText: "\u221261.3% All-100 LPIPS",
          arcLabel: "K=6 (r=5 Commit)",
          orbLabel: "10\u00d7 Fewer Collapses (48\u21925)",
          narration: "Frozen Windowwise K=6 slashes all-100 LPIPS by 61.3% (0.1492 vs 0.3852), cuts held-out LPIPS 20.4% past Fixed Loop (0.1577 vs 0.1982), and drops collapses tenfold.",
          observe: "Held-out LPIPS 0.1577 (\u221259.6%), CLIP 0.9213 (all-100: 0.9282), collapses 48->5 (41->4 held-out).",
          evolve: "Freeze deterministic 16s chunk-rollout module with zero search-LLM overhead at deployment.",
          structBadge: "Win B11\u201318, K=6",
          dynBadge: "Euler (1/6) Verified",
          ctrlBadge: "Steps {0,1,2}; r=5 KV",
          frozen: true,
          codeDiff: [],
          code: [
            "# FROZEN DEPLOYMENT (All-100 LPIPS: 0.3852 -> 0.1492, -61.3%)",
            "# Held-out LPIPS: 0.1577 (-59.6% vs Native, -20.4% vs Fixed)",
            "def chunk_step_frozen(x, step_idx, kv_cache):",
            "  h = prefix_0_10(x, write_kv=True)",
            "  if step_idx in (0, 1, 2):",
            "    for r in range(6):",
            "      h += (run_w_11_18(h, commit=(r==5)) - h) / 6",
            "  return suffix_19_29(h, write_kv=True)"
          ],
          svgMode: "video_kv"
        }
      ]
    },
    {
      id: "dory",
      pill: "Text \u00b7 Dory1.0-4B (Beats K=4 at 1.7\u00d7)",
      file: "dory_open_program.py",
      modelTitle: "Dory1.0-4B (Elastic Core)",
      stackTitle: "Pretrained Elastic Recurrent LM",
      chartTitle: "Open-Ended 80% Held-Out Avg (IFBench, GPQA-D, SciCode)",
      yLabel: "Held-out Avg \u2191",
      yRange: [61.6, 62.7],
      yTicks: [61.8, 62.1, 62.4, 62.7],
      yFmt: (v) => v.toFixed(1) + "%",
      telemPrefix: "Held Avg",
      telemFmt: (v) => v.toFixed(2) + "%",
      duration: 18.0,
      baselineCurve: [
        { tNorm: 0.08, label: "Native K=2", value: 61.87 },
        { tNorm: 0.34, label: "Native K=4", value: 61.87 },
        { tNorm: 0.66, label: "Per-Loop KV", value: 61.87 },
        { tNorm: 0.94, label: "Last-Loop KV", value: 61.87 }
      ],
      baselineLegend: "Native K=4 (61.87%, 161k TF)",
      mainCurve: [
        { tNorm: 0.08, act: 0, label: "Native K=2", value: 61.82 },
        { tNorm: 0.34, act: 1, label: "Native K=4", value: 61.87 },
        { tNorm: 0.66, act: 2, label: "Per-Loop KV", value: 62.09 },
        { tNorm: 0.94, act: 3, label: "Last-Loop KV", value: 62.50 }
      ],
      mainLegend: "ELP K=2 (62.50%, 96k TF)",
      acts: [
        {
          id: "d_base",
          start: 0.0,
          end: 4.2,
          focusT: 1.44,
          compIdx: 0,
          roundTag: "Anchors \u00b7 K=2 vs K=4",
          state: "anchor",
          stateLabel: "\u25cf Native Pretrained Core",
          flopsText: "96k vs 161k TFLOPs",
          arcLabel: "Native K=2 / K=4",
          orbLabel: "K=4 Adds Only +0.05 pp!",
          narration: "On Dory1.0-4B (pretrained with an elastic recurrent block), doubling native depth from K=2 to K=4 spends 161,198 TFLOPs yet gains only +0.05 pp held-out avg.",
          observe: "Held-out avg barely moves from 61.82% (K=2, 96.3k TF) to 61.87% (K=4, 161.2k TF, 0.58x speed).",
          evolve: "Search inter-loop hyperspherical transitions & KV commit policy at K=2 compute budget.",
          structBadge: "Weight-tied core K=2",
          dynBadge: "Native recurrence",
          ctrlBadge: "Per-loop KV; K=2 vs 4",
          frozen: false,
          codeDiff: [],
          code: [
            "def dory_native_decode(h, kv_cache, K=2):",
            "  h = prelude_blocks(h)",
            "  for k in range(K):    # K=4 costs 161,198 TFLOPs",
            "    h = recurrent_core(h, kv_cache, write_kv=True)",
            "  return coda_head(h)",
            "# Native held-out: K=2 61.82% | K=4 61.87% (0.58x)"
          ],
          svgMode: "dory_geo"
        },
        {
          id: "d_probe",
          start: 4.2,
          end: 8.8,
          focusT: 6.12,
          compIdx: 1,
          roundTag: "Trajectory Probes",
          state: "probe",
          stateLabel: "\u25c6 Probing State Orbit",
          flopsText: "Hypersphere Tracked",
          arcLabel: "Trajectory Probe",
          orbLabel: "",
          probeBanner: "Passes 1->2 set unit-sphere geodesic",
          narration: "Runtime probes show passes 1 and 2 already establish each token's dominant angular trajectory on the unit hypersphere, while per-loop KV retains pass-1 noise.",
          observe: "Pass-1->2 angular displacement predicts K=4 direction; per-loop KV caches unconverged k=1 states.",
          evolve: "Synthesize bounded geodesic extrapolation after k=2 and defer KV commits to last loop pass.",
          structBadge: "Weight-tied core K=2",
          dynBadge: "Angular orbit probed",
          ctrlBadge: "Check k=1 vs k=2 KV",
          frozen: false,
          codeDiff: [1, 2, 3, 4],
          code: [
            "# Passive state-orbit probe (dev reasoning batches):",
            "u1 = normalize(h_after_pass1)  # unit hypersphere",
            "u2 = normalize(h_after_pass2)",
            "theta = angle_between(u1, u2)  # dominant K=4 axis",
            "# Finding: pass-2 direction predicts K=4 depth;",
            "# Per-loop KV pollutes decoding with unconverged u1!"
          ],
          svgMode: "dory_geo"
        },
        {
          id: "d_evolve",
          start: 8.8,
          end: 13.6,
          focusT: 11.88,
          compIdx: 2,
          roundTag: "Geodesic Extrap (K=2)",
          state: "rewrite",
          stateLabel: "\u2726 Geodesic Dynamics",
          flopsText: "95,223 TF (1.72\u00d7 Wall)",
          arcLabel: "K=2 + Geodesic",
          orbLabel: "Beats Native K=4 at 1.72\u00d7!",
          narration: "Applying bounded geodesic extrapolation after pass 2 approximates K=4 thinking at K=2 compute (95,223 TFLOPs), beating Native K=4 at 1.72\u00d7 wall speedup.",
          observe: "Even with per-loop KV, geodesic K=2 lifts held-out avg to 62.09% (GPQA-D 72.15%) at 1.72x vs K=4.",
          evolve: "Commit converged post-extrapolation last-loop KV states across decoding steps.",
          structBadge: "K=2 + Geodesic step",
          dynBadge: "Unit-sphere extrap.",
          ctrlBadge: "95,223 TF (1.72x K=4)",
          frozen: false,
          codeDiff: [2, 3, 4, 5],
          code: [
            "def dory_elp_evolve(h, kv_cache):",
            "  h = prelude_blocks(h)",
            "  h1 = recurrent_core(h, kv_cache, write_kv=False)",
            "  h2 = recurrent_core(h1, kv_cache, write_kv=False)",
            "  # Bounded geodesic extrapolation replaces passes 3 & 4",
            "  h_geo = bounded_geodesic_extrap(h1, h2)",
            "  return coda_head(h_geo)  # Per-loop: 62.09% @ 1.72x"
          ],
          svgMode: "dory_geo"
        },
        {
          id: "d_freeze",
          start: 13.6,
          end: 18.0,
          focusT: 16.92,
          compIdx: 3,
          roundTag: "Confirmed \u00b7 Frozen",
          state: "frozen",
          stateLabel: "\ud83d\udd12 Frozen Program",
          flopsText: "95,719 TF (1.65\u00d7 Wall)",
          arcLabel: "K=2 Geo + Last KV",
          orbLabel: "Held 62.50% | GPQA +1.74 pp",
          narration: "Frozen K=2 with geodesic extrapolation and converged last-loop KV reaches 62.50% held-out avg (+1.74 pp GPQA-D), beating Native K=4 at 1.65\u00d7 wall / 1.68\u00d7 FLOPs speed.",
          observe: "Leads every benchmark: IFBench 79.48%, GPQA-D 72.31% (+1.74 pp vs K=2), SciCode 35.71%.",
          evolve: "Freeze Dory1.0-4B K=2 geodesic + last-loop KV program with zero LLM calls at test time.",
          structBadge: "K=2 + Converged KV",
          dynBadge: "Bounded Geodesic (S^d)",
          ctrlBadge: "1.65\u00d7 wall / 1.68\u00d7 FLOPs",
          frozen: true,
          codeDiff: [],
          code: [
            "# FROZEN DEPLOYMENT (Beats Native K=4 @ 1.65x Wall Speedup)",
            "# Full avg: 61.58% | Held-out avg: 62.50% (GPQA-D +1.74 pp)",
            "def dory_elp_frozen(h, kv_cache):",
            "  h = prelude_blocks(h)",
            "  h1 = recurrent_core(h, kv_cache, write_kv=False)",
            "  h2 = recurrent_core(h1, kv_cache, write_kv=True)",
            "  h_out = bounded_geodesic_extrap(h1, h2)",
            "  return coda_head(h_out)  # 95,719 vs 161,198 TFLOPs!"
          ],
          svgMode: "dory_geo"
        }
      ]
    }
  ];

  const COMPONENTS = [
    { num: "1", title: "Program", sub: "Loop code (c, \u03bb)" },
    { num: "2", title: "Diagnostics", sub: "Read-only traces" },
    { num: "3", title: "Evolution", sub: "Code & rule edits" },
    { num: "4", title: "Freeze", sub: "Pareto & 0 LLM" }
  ];

  function interpCurve(curve, tNorm) {
    if (!curve || curve.length === 0) return 0;
    if (tNorm <= curve[0].tNorm) return curve[0].value;
    for (let i = 1; i < curve.length; i++) {
      if (tNorm <= curve[i].tNorm) {
        const span = Math.max(1e-6, curve[i].tNorm - curve[i - 1].tNorm);
        const u = clamp((tNorm - curve[i - 1].tNorm) / span, 0, 1);
        return lerp(curve[i - 1].value, curve[i].value, u);
      }
    }
    return curve[curve.length - 1].value;
  }

  function mount(root) {
    if (!root) return;
    root.innerHTML = "";
    root.classList.add("ma-root");

    const motionMQ = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)");
    let scenarioIdx = 0;
    let timeSec = SCENARIOS[0].acts[0].focusT;
    let playing = !(motionMQ && motionMQ.matches);
    let lastRaf = null;
    let inView = true;
    let draggingChart = false;

    if (motionMQ && motionMQ.matches) {
      timeSec = SCENARIOS[0].acts[SCENARIOS[0].acts.length - 1].focusT;
    }

    // --- 1. Top Header Bar: Stacked Scenario Tabs + 4-Component Pipeline Stepper ---
    const topBar = document.createElement("div");
    topBar.className = "ma-topbar";

    const scenStrip = document.createElement("div");
    scenStrip.className = "ma-scen-strip";
    const scenLbl = document.createElement("span");
    scenLbl.className = "ma-scen-label";
    scenLbl.textContent = "Search Trace:";
    scenStrip.appendChild(scenLbl);

    const scenButtons = SCENARIOS.map((sc, idx) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "ma-scen-btn" + (idx === 0 ? " active" : "");
      btn.textContent = sc.pill;
      btn.addEventListener("click", () => switchScenario(idx));
      scenStrip.appendChild(btn);
      return btn;
    });

    const compStrip = document.createElement("div");
    compStrip.className = "ma-comp-strip";
    const compButtons = COMPONENTS.map((c, idx) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "ma-comp-btn";
      btn.innerHTML = `<span class="ma-comp-num">${c.num}</span><span class="ma-comp-txt"><strong>${c.title}</strong><small>${c.sub}</small></span>`;
      btn.addEventListener("click", () => {
        const sc = SCENARIOS[scenarioIdx];
        const matches = sc.acts.filter((a) => a.compIdx === idx);
        const targetAct = matches.length ? matches[matches.length - 1] : sc.acts[Math.min(idx, sc.acts.length - 1)];
        timeSec = clamp(targetAct.focusT, 0, sc.duration);
        playing = false;
        renderFrame(true);
      });
      compStrip.appendChild(btn);
      return btn;
    });

    topBar.appendChild(scenStrip);
    topBar.appendChild(compStrip);
    root.appendChild(topBar);

    // --- 2. Main 2-Column Stage ---
    const stage = document.createElement("div");
    stage.className = "ma-stage";

    const vecCard = document.createElement("div");
    vecCard.className = "ma-vec-card";
    const vecSvg = svgEl("svg", { class: "ma-vec-svg", viewBox: "0 0 600 355", role: "img", "aria-label": "Animated ELP transformer loop mechanism schematic" }, vecCard);
    stage.appendChild(vecCard);

    const sideCol = document.createElement("div");
    sideCol.className = "ma-side-col";

    const codeCard = document.createElement("div");
    codeCard.className = "ma-code-card";
    const codeHead = document.createElement("div");
    codeHead.className = "ma-code-head";
    const fileLabel = document.createElement("span");
    fileLabel.className = "ma-code-file";
    const headRight = document.createElement("div");
    headRight.className = "ma-code-badges";
    const roundBadge = document.createElement("span");
    roundBadge.className = "ma-round-badge";
    const stateBadge = document.createElement("span");
    stateBadge.className = "ma-state-badge";
    headRight.appendChild(roundBadge);
    headRight.appendChild(stateBadge);
    codeHead.appendChild(fileLabel);
    codeHead.appendChild(headRight);

    const codeBody = document.createElement("div");
    codeBody.className = "ma-code-body";
    codeCard.appendChild(codeHead);
    codeCard.appendChild(codeBody);

    const logCard = document.createElement("div");
    logCard.className = "ma-log-card";
    const obsRow = document.createElement("div");
    obsRow.className = "ma-log-row";
    obsRow.innerHTML = `<span class="ma-log-key ma-k-obs">OBSERVE</span><span class="ma-log-val"></span>`;
    const evoRow = document.createElement("div");
    evoRow.className = "ma-log-row";
    evoRow.innerHTML = `<span class="ma-log-key ma-k-evo">EVOLVE</span><span class="ma-log-val"></span>`;
    const obsValEl = obsRow.querySelector(".ma-log-val");
    const evoValEl = evoRow.querySelector(".ma-log-val");
    logCard.appendChild(obsRow);
    logCard.appendChild(evoRow);

    sideCol.appendChild(codeCard);
    sideCol.appendChild(logCard);
    stage.appendChild(sideCol);
    root.appendChild(stage);

    // --- 3. Interactive Metric Timeline SVG ---
    const chartWrap = document.createElement("div");
    chartWrap.className = "ma-chart-wrap";
    const chartSvg = svgEl("svg", { class: "ma-chart-svg", viewBox: "0 0 960 116", role: "img", "aria-label": "Interactive metric trajectory timeline" }, chartWrap);
    root.appendChild(chartWrap);

    // --- 4. Footer: Dynamic Narration + Controls ---
    const footer = document.createElement("div");
    footer.className = "ma-footer";
    const narrEl = document.createElement("p");
    narrEl.className = "ma-narr";
    narrEl.setAttribute("aria-live", "polite");

    const ctrlRow = document.createElement("div");
    ctrlRow.className = "ma-ctrl-row";
    const playBtn = document.createElement("button");
    playBtn.type = "button";
    playBtn.className = "ma-btn ma-btn-play";
    const slider = document.createElement("input");
    slider.type = "range";
    slider.className = "ma-slider";
    slider.min = "0";
    slider.max = "1000";
    slider.step = "1";
    slider.value = "0";
    slider.setAttribute("aria-label", "Method walkthrough timeline");
    const clockEl = document.createElement("span");
    clockEl.className = "ma-clock";
    const replayBtn = document.createElement("button");
    replayBtn.type = "button";
    replayBtn.className = "ma-btn";
    replayBtn.textContent = "\u21bb Replay";

    ctrlRow.appendChild(playBtn);
    ctrlRow.appendChild(slider);
    ctrlRow.appendChild(clockEl);
    ctrlRow.appendChild(replayBtn);
    footer.appendChild(narrEl);
    footer.appendChild(ctrlRow);
    root.appendChild(footer);

    // --- Persistent SVG Structures (Reset cleanly per Scenario) ---
    let dynVec = {};
    let dynChart = {};
    let lastCodeSig = "";
    let lastActId = "";

    function buildVecScene() {
      vecSvg.innerHTML = "";
      dynVec = {};
      const sc = SCENARIOS[scenarioIdx];
      const defs = svgEl("defs", {}, vecSvg);

      const mLoop = svgEl("marker", { id: "maArrowOurs", markerWidth: "7", markerHeight: "7", refX: "5.5", refY: "3.5", orient: "auto" }, defs);
      svgEl("path", { d: "M0,1 L6,3.5 L0,6 z", fill: "#d81b60" }, mLoop);

      const mTeal = svgEl("marker", { id: "maArrowTeal", markerWidth: "7", markerHeight: "7", refX: "5.5", refY: "3.5", orient: "auto" }, defs);
      svgEl("path", { d: "M0,1 L6,3.5 L0,6 z", fill: "#0f766e" }, mTeal);

      const mBlue = svgEl("marker", { id: "maArrowBlue", markerWidth: "7", markerHeight: "7", refX: "5.5", refY: "3.5", orient: "auto" }, defs);
      svgEl("path", { d: "M0,1 L6,3.5 L0,6 z", fill: "#0076c6" }, mBlue);

      const mGreen = svgEl("marker", { id: "maArrowGreen", markerWidth: "7", markerHeight: "7", refX: "5.5", refY: "3.5", orient: "auto" }, defs);
      svgEl("path", { d: "M0,1 L6,3.5 L0,6 z", fill: "#10b981" }, mGreen);

      const mSlate = svgEl("marker", { id: "maArrowSlate", markerWidth: "7", markerHeight: "7", refX: "5.5", refY: "3.5", orient: "auto" }, defs);
      svgEl("path", { d: "M0,1 L6,3.5 L0,6 z", fill: "#94a3b8" }, mSlate);

      // Outer subtle surface
      svgEl("rect", { x: 2, y: 2, width: 596, height: 351, rx: 12, fill: "#fbfcfe", stroke: "#e2e8f0" }, vecSvg);

      // Top Header Strip
      svgEl("rect", { x: 12, y: 10, width: 576, height: 28, rx: 7, fill: "#f1f5f9", stroke: "#e2e8f0" }, vecSvg);
      const tModel = svgEl("text", { x: 20, y: 27.6, fill: "#0f172a", "font-size": "10.6", "font-weight": "700" }, vecSvg);
      tModel.textContent = sc.modelTitle;
      svgEl("rect", { x: 228, y: 15, width: 106, height: 18, rx: 9, fill: "#ffffff", stroke: "#cbd5e1" }, vecSvg);
      const tWts = svgEl("text", { x: 281, y: 27.0, "text-anchor": "middle", fill: "#475569", "font-size": "9.2", "font-weight": "600" }, vecSvg);
      tWts.textContent = "\ud83d\udd12 Frozen Weights";

      const telemBg = svgEl("rect", { x: 342, y: 15, width: 238, height: 18, rx: 9, fill: "#fdf2f6", stroke: "#f9d5e3" }, vecSvg);
      const tTelem = svgEl("text", { x: 461, y: 27.0, "text-anchor": "middle", fill: "#a7144a", "font-size": "9.3", "font-weight": "700" }, vecSvg);

      // Left Panel: Transformer Stack + Recurrence Arc
      svgEl("rect", { x: 12, y: 46, width: 314, height: 242, rx: 10, fill: "#ffffff", stroke: "#e2e8f0" }, vecSvg);
      const leftHead = svgEl("text", { x: 24, y: 65, fill: "#334155", "font-size": "10.8", "font-weight": "700" }, vecSvg);
      leftHead.textContent = sc.stackTitle;

      // Forward backbone line across transformer blocks (`y=192`)
      svgEl("line", { x1: 20, y1: 192, x2: 314, y2: 192, stroke: "#cbd5e1", "stroke-width": 1.6 }, vecSvg);
      const blocks = [];
      let blockSpecs;
      if (sc.id === "scalerae") {
        blockSpecs = [
          { x: 42, w: 62, lbl: "Prefix", sub: "B0..11", activeOn: [] },
          { x: 112, w: 132, lbl: "Looped Band", sub: "Blocks 12\u201327", activeOn: ["r0", "r1_3", "r4_5", "r6", "r7_8"] },
          { x: 252, w: 58, lbl: "Head", sub: "B28..31", activeOn: [] }
        ];
      } else if (sc.id === "looped") {
        blockSpecs = [
          { x: 42, w: 62, lbl: "Pre 0..5", sub: "6 Blocks", activeOn: [] },
          { x: 112, w: 132, lbl: "Core (5B)", sub: "Weight-Tied", activeOn: ["l_base", "l_probe", "l_evolve", "l_freeze"] },
          { x: 252, w: 58, lbl: "Post 0..5", sub: "6 Blocks", activeOn: [] }
        ];
      } else if (sc.id === "video") {
        blockSpecs = [
          { x: 42, w: 62, lbl: "Prefix", sub: "B0..10", activeOn: [] },
          { x: 112, w: 132, lbl: "Middle Band", sub: "Blocks 11\u201318", activeOn: ["v_scope", "v_search", "v_freeze"] },
          { x: 252, w: 58, lbl: "Suffix", sub: "B19..29", activeOn: [] }
        ];
      } else {
        blockSpecs = [
          { x: 42, w: 62, lbl: "Prelude", sub: "Embed/Pre", activeOn: [] },
          { x: 112, w: 132, lbl: "Elastic Core", sub: "Weight-Tied K=2", activeOn: ["d_base", "d_probe", "d_evolve", "d_freeze"] },
          { x: 252, w: 58, lbl: "Coda", sub: "LM Head", activeOn: [] }
        ];
      }

      blockSpecs.forEach((b) => {
        const rect = svgEl("rect", { x: b.x, y: 164, width: b.w, height: 56, rx: 7, fill: "#f8fafc", stroke: "#cbd5e1", "stroke-width": 1.3 }, vecSvg);
        const l1 = svgEl("text", { x: b.x + b.w / 2, y: 187, "text-anchor": "middle", fill: "#1e293b", "font-size": "10.4", "font-weight": "700" }, vecSvg);
        l1.textContent = b.lbl;
        const l2 = svgEl("text", { x: b.x + b.w / 2, y: 204, "text-anchor": "middle", fill: "#64748b", "font-size": "9.1" }, vecSvg);
        l2.textContent = b.sub;
        blocks.push({ spec: b, rect, l1, l2 });
      });

      // Primary recurrence arc (consistent geometry on all 4 scenarios)
      const arcGroup1 = svgEl("g", {}, vecSvg);
      const arc1Start = 234;
      const arc1End = 122;
      const arc1CtrlY = 86;
      const arc1PathStr = `M ${arc1Start},162 C ${arc1Start},${arc1CtrlY} ${arc1End},${arc1CtrlY} ${arc1End},160`;
      const arc1Ghost = svgEl("path", { d: arc1PathStr, fill: "none", stroke: "#f9d5e3", "stroke-width": 4.2, "stroke-linecap": "round" }, arcGroup1);
      const arc1Flow = svgEl("path", { d: arc1PathStr, fill: "none", stroke: "#d81b60", "stroke-width": 2.1, "stroke-dasharray": "7 5", "stroke-linecap": "round", "marker-end": "url(#maArrowOurs)" }, arcGroup1);
      const arc1Pill = svgEl("rect", { x: 120, y: 98, width: 116, height: 19, rx: 9.5, fill: "#fdf2f6", stroke: "#d81b60", "stroke-width": 1 }, arcGroup1);
      const arc1Lbl = svgEl("text", { x: 178, y: 110.5, "text-anchor": "middle", fill: "#a7144a", "font-size": "9.3", "font-weight": "700" }, arcGroup1);

      // Diagnostic probe sensor beam (appears during probing acts)
      const probeBeam = svgEl("g", { opacity: "0" }, vecSvg);
      svgEl("line", { x1: 178, y1: 222, x2: 178, y2: 256, stroke: "#0076c6", "stroke-width": 1.8, "stroke-dasharray": "3 3", "marker-end": "url(#maArrowBlue)" }, probeBeam);
      svgEl("rect", { x: 34, y: 258, width: 274, height: 22, rx: 6, fill: "#eff6ff", stroke: "#0076c6", "stroke-width": 1.1 }, probeBeam);
      const probeText = svgEl("text", { x: 171, y: 272.5, "text-anchor": "middle", fill: "#00508f", "font-size": "9.3", "font-weight": "700" }, probeBeam);

      // Signal orb flowing continuously across transformer blocks + loop arc
      const orbOuter = svgEl("circle", { cx: 42, cy: 192, r: 6.5, fill: "rgba(216,27,96,0.22)" }, vecSvg);
      const orbCore = svgEl("circle", { cx: 42, cy: 192, r: 3.6, fill: "#d81b60" }, vecSvg);
      const orbPassLbl = svgEl("text", { x: 178, y: 244, "text-anchor": "middle", fill: "#475569", "font-size": "9.4", "font-weight": "600" }, vecSvg);

      // Right Panel inside SVG (`x=334..588, y=46..288`)
      svgEl("rect", { x: 334, y: 46, width: 254, height: 242, rx: 10, fill: "#ffffff", stroke: "#e2e8f0" }, vecSvg);
      const rightHead = svgEl("text", { x: 346, y: 65, fill: "#334155", "font-size": "10.8", "font-weight": "700" }, vecSvg);

      const rightFooterBadge = svgEl("rect", { x: 344, y: 254, width: 234, height: 24, rx: 6, fill: "#f8fafc", stroke: "#cbd5e1" }, vecSvg);
      const rightFooterText = svgEl("text", { x: 461, y: 269.5, "text-anchor": "middle", fill: "#334155", "font-size": "9.4", "font-weight": "700" }, vecSvg);

      if (sc.id === "scalerae") {
        rightHead.textContent = "Step Schedule & Cache Control";
        const imgStepsG = svgEl("g", {}, vecSvg);
        const imgStepCells = [];
        const imgCacheArcs = [];
        for (let s = 0; s < 10; s++) {
          const row = Math.floor(s / 5);
          const col = s % 5;
          const bx = 346 + col * 47;
          const by = 104 + row * 70;
          const rect = svgEl("rect", { x: bx, y: by, width: 41, height: 34, rx: 6, fill: "#fdf2f6", stroke: "#d81b60", "stroke-width": 1.1 }, imgStepsG);
          const lbl = svgEl("text", { x: bx + 20.5, y: by + 13.5, "text-anchor": "middle", fill: "#475569", "font-size": "8.4", "font-weight": "700" }, imgStepsG);
          lbl.textContent = `t=${s}`;
          const op = svgEl("text", { x: bx + 20.5, y: by + 26.5, "text-anchor": "middle", fill: "#a7144a", "font-size": "9.2", "font-weight": "700" }, imgStepsG);
          imgStepCells.push({ s, bx, by, rect, lbl, op });
        }
        for (const [srcIdx, dstIdx] of [[0, 1], [2, 3]]) {
          const sx = 346 + srcIdx * 47 + 20.5;
          const dx = 346 + dstIdx * 47 + 20.5;
          const p = svgEl("path", {
            d: `M ${sx},102 C ${sx},77 ${dx},77 ${dx},100`,
            fill: "none", stroke: "#0f766e", "stroke-width": 2.0, "stroke-dasharray": "4 3", "marker-end": "url(#maArrowTeal)"
          }, imgStepsG);
          imgCacheArcs.push({ p, dstIdx });
        }
        const reuseNote = svgEl("text", { x: 461, y: 228, "text-anchor": "middle", fill: "#475569", "font-size": "9.3" }, imgStepsG);
        dynVec.imgStepsG = imgStepsG;
        dynVec.imgStepCells = imgStepCells;
        dynVec.imgCacheArcs = imgCacheArcs;
        dynVec.reuseNote = reuseNote;

        // Diagnostic bars sub-group
        const probeBarsG = svgEl("g", { opacity: "0" }, vecSvg);
        const pTitle = svgEl("text", { x: 346, y: 88, fill: "#00508f", "font-size": "9.6", "font-weight": "700" }, probeBarsG);
        pTitle.textContent = "guidance_probe.py (208 traces \u00b7 0 slots)";
        svgEl("rect", { x: 346, y: 97, width: 230, height: 22, rx: 5, fill: "#eff6ff", stroke: "#93c5fd" }, probeBarsG);
        const cosTxt = svgEl("text", { x: 461, y: 111.5, "text-anchor": "middle", fill: "#00508f", "font-size": "9.4", "font-weight": "700" }, probeBarsG);
        cosTxt.textContent = "Raw prediction cos(D_loop, D_ref) = 0.995";

        const bars = [
          { label: "Lag-1 reuse err", text: "0.56\u20130.63 \u2713", color: "#0f766e", wMax: 66 },
          { label: "Lag-2 reuse err", text: "0.86\u20131.10 \u2717", color: "#64748b", wMax: 108 },
          { label: "Linear extrap.", text: "0.84\u20131.35 \u2717", color: "#be123c", wMax: 132 }
        ];
        const probeBarNodes = [];
        bars.forEach((b, i) => {
          const y = 138 + i * 38;
          const bl = svgEl("text", { x: 346, y, fill: "#334155", "font-size": "9.3", "font-weight": "600" }, probeBarsG);
          bl.textContent = b.label;
          svgEl("rect", { x: 346, y: y + 5, width: 148, height: 11, rx: 5.5, fill: "#f1f5f9" }, probeBarsG);
          const fill = svgEl("rect", { x: 346, y: y + 5, width: b.wMax, height: 11, rx: 5.5, fill: b.color }, probeBarsG);
          const bt = svgEl("text", { x: 500, y: y + 14, fill: b.color, "font-size": "9.0", "font-weight": "700" }, probeBarsG);
          bt.textContent = b.text;
          probeBarNodes.push({ fill, wMax: b.wMax });
        });
        dynVec.probeBarsG = probeBarsG;
        dynVec.probeBarNodes = probeBarNodes;
      } else if (sc.id === "looped") {
        rightHead.textContent = "Curvature Warp & 4/2 Stride";
        const loopedStepsG = svgEl("g", {}, vecSvg);
        const loopedCells = [];
        const loopedArcs = [];
        // 7 representative warped timesteps (`idx 0..6`: adaptive 4/2/2 refresh + reuse)
        for (let i = 0; i < 7; i++) {
          const bx = 344 + i * 33.5;
          const rect = svgEl("rect", { x: bx, y: 102, width: 29.5, height: 42, rx: 5, fill: "#fdf2f6", stroke: "#d81b60", "stroke-width": 1.1 }, loopedStepsG);
          const t1 = svgEl("text", { x: bx + 14.75, y: 116, "text-anchor": "middle", fill: "#475569", "font-size": "8.0", "font-weight": "700" }, loopedStepsG);
          t1.textContent = `s${i}`;
          const t2 = svgEl("text", { x: bx + 14.75, y: 132, "text-anchor": "middle", fill: "#a7144a", "font-size": "8.4", "font-weight": "700" }, loopedStepsG);
          loopedCells.push({ i, rect, t1, t2 });
        }
        // Dashed reuse arcs 0->1, 0->2, 3->4, 3->5 (age <= 2)
        for (const [srcI, dstI, h] of [[0, 1, 78], [0, 2, 70], [3, 4, 78], [3, 5, 70]]) {
          const sx = 344 + srcI * 33.5 + 14.75;
          const dx = 344 + dstI * 33.5 + 14.75;
          const p = svgEl("path", {
            d: `M ${sx},100 C ${sx},${h} ${dx},${h} ${dx},98`,
            fill: "none", stroke: "#0f766e", "stroke-width": 1.7, "stroke-dasharray": "3.5 2.5", "marker-end": "url(#maArrowTeal)"
          }, loopedStepsG);
          loopedArcs.push({ p, dstI });
        }
        svgEl("rect", { x: 344, y: 156, width: 234, height: 86, rx: 8, fill: "#f8fafc", stroke: "#cbd5e1" }, loopedStepsG);
        const loopSumT = svgEl("text", { x: 461, y: 175, "text-anchor": "middle", fill: "#0f172a", "font-size": "9.7", "font-weight": "700" }, loopedStepsG);
        const loopSumM = svgEl("text", { x: 461, y: 194, "text-anchor": "middle", fill: "#a7144a", "font-size": "9.3", "font-weight": "700" }, loopedStepsG);
        const loopSumB = svgEl("text", { x: 461, y: 213, "text-anchor": "middle", fill: "#0f766e", "font-size": "9.0", "font-weight": "700" }, loopedStepsG);
        const loopSumF = svgEl("text", { x: 461, y: 230, "text-anchor": "middle", fill: "#475569", "font-size": "8.7" }, loopedStepsG);

        dynVec.loopedStepsG = loopedStepsG;
        dynVec.loopedCells = loopedCells;
        dynVec.loopedArcs = loopedArcs;
        dynVec.loopSumT = loopSumT;
        dynVec.loopSumM = loopSumM;
        dynVec.loopSumB = loopSumB;
        dynVec.loopSumF = loopSumF;

        // Looped-DiT Probe Bars sub-group
        const probeBarsG = svgEl("g", { opacity: "0" }, vecSvg);
        const pTitle = svgEl("text", { x: 346, y: 88, fill: "#00508f", "font-size": "9.6", "font-weight": "700" }, probeBarsG);
        pTitle.textContent = "R0 Trajectory Probes (64 prompts \u00b7 parity OK)";
        svgEl("rect", { x: 346, y: 97, width: 230, height: 22, rx: 5, fill: "#eff6ff", stroke: "#93c5fd" }, probeBarsG);
        const cosTxt = svgEl("text", { x: 461, y: 111.5, "text-anchor": "middle", fill: "#00508f", "font-size": "9.2", "font-weight": "700" }, probeBarsG);
        cosTxt.textContent = "h4\u2212h2 cosine = 0.9989..0.9997 across t";

        const bars = [
          { label: "Early curvature (t=0.02)", text: "0.836 (Warp!)", color: "#0076c6", wMax: 120 },
          { label: "Step residual cosine", text: "0.999+ \u2713", color: "#0f766e", wMax: 138 },
          { label: "CFG diff rel. var (t=0.9)", text: "0.735 \u2717", color: "#be123c", wMax: 108 }
        ];
        const probeBarNodes = [];
        bars.forEach((b, i) => {
          const y = 138 + i * 38;
          const bl = svgEl("text", { x: 346, y, fill: "#334155", "font-size": "9.2", "font-weight": "600" }, probeBarsG);
          bl.textContent = b.label;
          svgEl("rect", { x: 346, y: y + 5, width: 146, height: 11, rx: 5.5, fill: "#f1f5f9" }, probeBarsG);
          const fill = svgEl("rect", { x: 346, y: y + 5, width: b.wMax, height: 11, rx: 5.5, fill: b.color }, probeBarsG);
          const bt = svgEl("text", { x: 498, y: y + 14, fill: b.color, "font-size": "9.0", "font-weight": "700" }, probeBarsG);
          bt.textContent = b.text;
          probeBarNodes.push({ fill, wMax: b.wMax });
        });
        dynVec.probeBarsG = probeBarsG;
        dynVec.probeBarNodes = probeBarNodes;
      } else if (sc.id === "video") {
        rightHead.textContent = "High-Noise Steps & Causal KV";
        const vidKvG = svgEl("g", {}, vecSvg);
        const vidSteps = [];
        for (let s = 0; s < 4; s++) {
          const bx = 346 + s * 59;
          const r = svgEl("rect", { x: bx, y: 78, width: 52, height: 34, rx: 6, fill: "#f8fafc", stroke: "#cbd5e1" }, vidKvG);
          const t1 = svgEl("text", { x: bx + 26, y: 92, "text-anchor": "middle", fill: "#334155", "font-size": "9.2", "font-weight": "700" }, vidKvG);
          t1.textContent = `Step ${s}`;
          const t2 = svgEl("text", { x: bx + 26, y: 105, "text-anchor": "middle", fill: "#64748b", "font-size": "8.5" }, vidKvG);
          t2.textContent = ["t=999", "t=937", "t=833", "t=624"][s];
          vidSteps.push({ r, t1, t2 });
        }
        svgEl("rect", { x: 346, y: 126, width: 230, height: 116, rx: 8, fill: "#f8fafc", stroke: "#cbd5e1" }, vidKvG);
        const kvTitle = svgEl("text", { x: 461, y: 145, "text-anchor": "middle", fill: "#0f172a", "font-size": "10.2", "font-weight": "700" }, vidKvG);
        kvTitle.textContent = "Causal Chunk KV Memory";
        const passPills = [];
        for (let p = 0; p < 6; p++) {
          const pxBox = 356 + p * 35.5;
          const pr = svgEl("rect", { x: pxBox, y: 158, width: 31, height: 28, rx: 5, fill: "#ffffff", stroke: "#cbd5e1" }, vidKvG);
          const pt = svgEl("text", { x: pxBox + 15.5, y: 175.5, "text-anchor": "middle", fill: "#475569", "font-size": "8.8", "font-weight": "700" }, vidKvG);
          pt.textContent = `r=${p}`;
          passPills.push({ pr, pt });
        }
        const kvStatusTxt = svgEl("text", { x: 461, y: 208, "text-anchor": "middle", fill: "#0076c6", "font-size": "9.5", "font-weight": "700" }, vidKvG);
        const kvSubTxt = svgEl("text", { x: 461, y: 226, "text-anchor": "middle", fill: "#475569", "font-size": "8.9" }, vidKvG);
        dynVec.vidSteps = vidSteps;
        dynVec.passPills = passPills;
        dynVec.kvStatusTxt = kvStatusTxt;
        dynVec.kvSubTxt = kvSubTxt;
      } else {
        rightHead.textContent = "Hypersphere Extrap. & Last KV";
        const doryG = svgEl("g", {}, vecSvg);

        // Top box: Unit hypersphere geodesic extrapolation schematic (`x=346, y=78, width=230, height=76`)
        svgEl("rect", { x: 346, y: 78, width: 230, height: 76, rx: 8, fill: "#f8fafc", stroke: "#cbd5e1" }, doryG);
        const geoHead = svgEl("text", { x: 461, y: 93, "text-anchor": "middle", fill: "#0f172a", "font-size": "9.6", "font-weight": "700" }, doryG);
        geoHead.textContent = "Hypersphere Orbit: Geodesic Extrap.";
        // Unit sphere arc curve inside `x=364..558, y=102..144`
        svgEl("path", { d: "M 366,140 Q 458,92 554,136", fill: "none", stroke: "#cbd5e1", "stroke-width": 2.0 }, doryG);
        // State nodes h1 -> h2 -> h_geo
        svgEl("circle", { cx: 382, cy: 133, r: 4.5, fill: "#64748b" }, doryG);
        const h1Lbl = svgEl("text", { x: 382, y: 147, "text-anchor": "middle", fill: "#475569", "font-size": "8.4", "font-weight": "700" }, doryG);
        h1Lbl.textContent = "h^(1)";
        svgEl("circle", { cx: 444, cy: 115, r: 4.8, fill: "#0076c6" }, doryG);
        const h2Lbl = svgEl("text", { x: 444, y: 132, "text-anchor": "middle", fill: "#00508f", "font-size": "8.4", "font-weight": "700" }, doryG);
        h2Lbl.textContent = "h^(2)";
        svgEl("line", { x1: 387, y1: 131, x2: 438, y2: 116.5, stroke: "#0076c6", "stroke-width": 1.8, "marker-end": "url(#maArrowBlue)" }, doryG);

        const geoJumpArc = svgEl("path", {
          d: "M 450,114 Q 496,105 538,125",
          fill: "none", stroke: "#d81b60", "stroke-width": 2.4, "stroke-dasharray": "5 3", "marker-end": "url(#maArrowOurs)"
        }, doryG);
        const geoNode = svgEl("circle", { cx: 542, cy: 127, r: 5.2, fill: "#d81b60", stroke: "#ffffff", "stroke-width": 1.3 }, doryG);
        const geoLbl = svgEl("text", { x: 540, y: 145, "text-anchor": "middle", fill: "#a7144a", "font-size": "8.5", "font-weight": "700" }, doryG);

        // Bottom box: Converged Last-Loop KV State (`x=346, y=162, width=230, height=82`)
        svgEl("rect", { x: 346, y: 162, width: 230, height: 82, rx: 8, fill: "#f8fafc", stroke: "#cbd5e1" }, doryG);
        const kvHead = svgEl("text", { x: 461, y: 179, "text-anchor": "middle", fill: "#0f172a", "font-size": "9.8", "font-weight": "700" }, doryG);
        kvHead.textContent = "Elastic Decoding KV Commit";
        const doryPills = [];
        const pLabels = ["Pass k=1 (Read)", "Pass k=2 + Geo", "Commit KV \u2713"];
        for (let i = 0; i < 3; i++) {
          const bx = 354 + i * 73;
          const kr = svgEl("rect", { x: bx, y: 190, width: 68, height: 25, rx: 5, fill: "#ffffff", stroke: "#cbd5e1" }, doryG);
          const kt = svgEl("text", { x: bx + 34, y: 205.5, "text-anchor": "middle", fill: "#475569", "font-size": "8.3", "font-weight": "700" }, doryG);
          kt.textContent = pLabels[i];
          doryPills.push({ kr, kt });
        }
        const doryKvNote = svgEl("text", { x: 461, y: 232, "text-anchor": "middle", fill: "#0f766e", "font-size": "8.9", "font-weight": "700" }, doryG);

        dynVec.geoJumpArc = geoJumpArc;
        dynVec.geoNode = geoNode;
        dynVec.geoLbl = geoLbl;
        dynVec.doryPills = doryPills;
        dynVec.doryKvNote = doryKvNote;
      }

      // Bottom Architecture Coordinates Strip (`x=12..588, y=298..342`)
      svgEl("rect", { x: 12, y: 298, width: 576, height: 44, rx: 8, fill: "#f8fafc", stroke: "#e2e8f0" }, vecSvg);
      const coordItems = [
        { x: 20, label: "Structure" },
        { x: 158, label: "Dynamics" },
        { x: 306, label: "Control" }
      ];
      const coordVals = [];
      coordItems.forEach((ci) => {
        const l = svgEl("text", { x: ci.x, y: 314, fill: "#64748b", "font-size": "8.5", "font-weight": "700" }, vecSvg);
        l.textContent = ci.label.toUpperCase();
        const v = svgEl("text", { x: ci.x, y: 330, fill: "#0f172a", "font-size": "9.0", "font-weight": "700" }, vecSvg);
        coordVals.push(v);
      });
      const freezeStampBg = svgEl("rect", { x: 468, y: 306, width: 112, height: 28, rx: 14, fill: "#f1f5f9", stroke: "#cbd5e1" }, vecSvg);
      const freezeStampTxt = svgEl("text", { x: 524, y: 323.5, "text-anchor": "middle", fill: "#64748b", "font-size": "9.1", "font-weight": "700" }, vecSvg);

      Object.assign(dynVec, {
        telemBg, tTelem, blocks,
        arcGroup1, arc1Ghost, arc1Flow, arc1Pill, arc1Lbl,
        probeBeam, probeText, orbOuter, orbCore, orbPassLbl,
        rightFooterBadge, rightFooterText,
        coordVals, freezeStampBg, freezeStampTxt,
        arc1Start, arc1End, arc1CtrlY
      });
    }

    function buildChart() {
      chartSvg.innerHTML = "";
      const sc = SCENARIOS[scenarioIdx];
      const padL = 68, padR = 26, padT = 24, padB = 26;
      const cw = 960 - padL - padR;
      const ch = 116 - padT - padB;
      const [yMin, yMax] = sc.yRange;

      const xOf = (tn) => padL + clamp(tn, 0, 1) * cw;
      const yOf = (v) => padT + (1 - (v - yMin) / (yMax - yMin)) * ch;

      // Header title & well-separated legends (`x1=545`, `x1=745`)
      const cTitle = svgEl("text", { x: padL, y: 14, fill: "#0f172a", "font-size": "10.6", "font-weight": "700" }, chartSvg);
      cTitle.textContent = sc.chartTitle;

      svgEl("line", { x1: 545, y1: 11, x2: 565, y2: 11, stroke: "#94a3b8", "stroke-width": 1.8, "stroke-dasharray": "4 3" }, chartSvg);
      const legBase = svgEl("text", { x: 570, y: 14, fill: "#64748b", "font-size": "9.3", "font-weight": "600" }, chartSvg);
      legBase.textContent = sc.baselineLegend;

      svgEl("line", { x1: 745, y1: 11, x2: 765, y2: 11, stroke: "#d81b60", "stroke-width": 2.4 }, chartSvg);
      const legMain = svgEl("text", { x: 770, y: 14, fill: "#a7144a", "font-size": "9.3", "font-weight": "700" }, chartSvg);
      legMain.textContent = sc.mainLegend;

      // Grid lines + Y ticks
      sc.yTicks.forEach((yv) => {
        const py = yOf(yv);
        svgEl("line", { x1: padL, y1: py, x2: padL + cw, y2: py, stroke: "#e2e8f0", "stroke-width": 1 }, chartSvg);
        const yl = svgEl("text", { x: padL - 8, y: py + 3.2, "text-anchor": "end", fill: "#64748b", "font-size": "8.9" }, chartSvg);
        yl.textContent = sc.yFmt(yv);
      });

      const yAxisMidY = padT + ch / 2;
      const yAxisName = svgEl("text", {
        x: 16,
        y: yAxisMidY,
        "text-anchor": "middle",
        transform: `rotate(-90 16 ${yAxisMidY.toFixed(1)})`,
        fill: "#64748b",
        "font-size": "8.6",
        "font-weight": "700"
      }, chartSvg);
      yAxisName.textContent = sc.yLabel;

      // Baseline dashed path
      const basePts = sc.baselineCurve.map((p) => `${xOf(p.tNorm).toFixed(1)},${yOf(p.value).toFixed(1)}`).join(" L ");
      svgEl("path", { d: "M " + basePts, fill: "none", stroke: "#94a3b8", "stroke-width": 1.8, "stroke-dasharray": "4 3" }, chartSvg);

      // Ghost future main curve + active progress main curve
      const mainPtsStr = sc.mainCurve.map((p) => `${xOf(p.tNorm).toFixed(1)},${yOf(p.value).toFixed(1)}`).join(" L ");
      svgEl("path", { d: "M " + mainPtsStr, fill: "none", stroke: "#f9d5e3", "stroke-width": 2.6 }, chartSvg);
      const progPath = svgEl("path", { d: "", fill: "none", stroke: "#d81b60", "stroke-width": 2.8, "stroke-linecap": "round" }, chartSvg);

      // X-axis base rule + playhead
      svgEl("line", { x1: padL, y1: padT + ch, x2: padL + cw, y2: padT + ch, stroke: "#cbd5e1", "stroke-width": 1.2 }, chartSvg);
      const playhead = svgEl("line", { x1: padL, y1: padT - 4, x2: padL, y2: padT + ch, stroke: "#0f172a", "stroke-width": 1.6 }, chartSvg);
      const playKnob = svgEl("circle", { cx: padL, cy: padT + ch, r: 4.5, fill: "#d81b60", stroke: "#ffffff", "stroke-width": 1.5 }, chartSvg);

      // Background scrub hitRect appended BEFORE dots so milestone dot clicks remain directly reachable
      const hitRect = svgEl("rect", { x: padL, y: padT - 4, width: cw, height: ch + 22, fill: "transparent", style: "cursor:ew-resize" }, chartSvg);
      const scrubFromPointer = (ev) => {
        const box = chartSvg.getBoundingClientRect();
        if (!box.width) return;
        const svgX = ((ev.clientX - box.left) / box.width) * 960;
        const tNorm = clamp((svgX - padL) / cw, 0, 1);
        timeSec = tNorm * SCENARIOS[scenarioIdx].duration;
        playing = false;
        renderFrame(true);
      };
      hitRect.addEventListener("pointerdown", (ev) => {
        draggingChart = true;
        hitRect.setPointerCapture(ev.pointerId);
        scrubFromPointer(ev);
      });
      hitRect.addEventListener("pointermove", (ev) => {
        if (draggingChart) scrubFromPointer(ev);
      });
      hitRect.addEventListener("pointerup", () => {
        draggingChart = false;
      });
      hitRect.addEventListener("pointercancel", () => {
        draggingChart = false;
      });

      // Clickable milestone points appended ABOVE hitRect
      const dots = sc.mainCurve.map((pt) => {
        const px = xOf(pt.tNorm);
        const py = yOf(pt.value);
        const g = svgEl("g", { class: "ma-chart-pt", style: "cursor:pointer" }, chartSvg);
        svgEl("line", { x1: px, y1: padT, x2: px, y2: padT + ch, stroke: "#f1f5f9", "stroke-width": 1 }, g);
        const c = svgEl("circle", { cx: px, cy: py, r: 4.3, fill: "#ffffff", stroke: "#d81b60", "stroke-width": 2 }, g);
        const xl = svgEl("text", { x: px, y: padT + ch + 14, "text-anchor": "middle", fill: "#475569", "font-size": "9.1", "font-weight": "600" }, g);
        xl.textContent = pt.label;
        svgEl("circle", { cx: px, cy: py, r: 14, fill: "transparent" }, g);
        svgEl("rect", { x: px - 22, y: padT + ch + 1, width: 44, height: 18, fill: "transparent" }, g);
        g.addEventListener("pointerdown", (e) => {
          e.stopPropagation();
        });
        g.addEventListener("click", (e) => {
          e.stopPropagation();
          const scNow = SCENARIOS[scenarioIdx];
          timeSec = clamp(pt.tNorm * scNow.duration, 0, scNow.duration);
          playing = false;
          renderFrame(true);
        });
        return { pt, px, py, c, xl };
      });

      dynChart = { padL, cw, xOf, yOf, progPath, playhead, playKnob, dots };
    }

    function switchScenario(idx) {
      scenarioIdx = idx;
      scenButtons.forEach((b, i) => b.classList.toggle("active", i === idx));
      const sc = SCENARIOS[idx];
      timeSec = (motionMQ && motionMQ.matches) ? sc.acts[sc.acts.length - 1].focusT : sc.acts[0].focusT;
      lastCodeSig = "";
      lastActId = "";
      buildVecScene();
      buildChart();
      renderFrame(true);
    }

    function renderCode(act) {
      const sig = `${scenarioIdx}:${act.id}`;
      if (sig === lastCodeSig) return;
      lastCodeSig = sig;
      const sc = SCENARIOS[scenarioIdx];
      fileLabel.textContent = sc.file;
      roundBadge.textContent = act.roundTag;
      stateBadge.textContent = act.stateLabel;
      stateBadge.className = "ma-state-badge ma-state-" + act.state;
      obsValEl.textContent = act.observe;
      evoValEl.textContent = act.evolve;

      codeBody.innerHTML = "";
      const diffSet = new Set(act.codeDiff || []);
      act.code.forEach((line, idx) => {
        const row = document.createElement("div");
        const isDiff = diffSet.has(idx);
        const lineClass = isDiff ? (act.state === "probe" ? " ma-line-probe" : " ma-line-diff") : (act.frozen && idx === 0 ? " ma-line-frozen" : "");
        row.className = "ma-code-line" + lineClass;
        const ln = document.createElement("span");
        ln.className = "ma-ln";
        ln.textContent = String(idx + 1);
        const txt = document.createElement("code");
        txt.className = "ma-code-text";
        txt.textContent = line;
        row.appendChild(ln);
        row.appendChild(txt);
        codeBody.appendChild(row);
      });
    }

    function renderFrame(forceText) {
      const sc = SCENARIOS[scenarioIdx];
      const dur = sc.duration;
      const t = clamp(timeSec, 0, dur);
      const tNorm = t / dur;
      const act = sc.acts.find((a) => t >= a.start && t < a.end) || sc.acts[sc.acts.length - 1];
      const actT = clamp((t - act.start) / Math.max(0.1, act.end - act.start), 0, 1);

      // Interpolate live trajectory value in lockstep with chart playhead
      const liveVal = interpCurve(sc.mainCurve, tNorm);
      dynVec.tTelem.textContent = `${sc.telemPrefix} ${sc.telemFmt(liveVal)}  \u00b7  ${act.flopsText}`;

      if (forceText || act.id !== lastActId) {
        lastActId = act.id;
        renderCode(act);
        narrEl.textContent = act.narration;
        compButtons.forEach((btn, idx) => {
          btn.classList.toggle("active", idx === act.compIdx);
          btn.classList.toggle("done", idx < act.compIdx);
        });
        dynVec.telemBg.setAttribute("fill", act.frozen ? "#ecfdf5" : (act.state === "probe" ? "#eff6ff" : "#fdf2f6"));
        dynVec.telemBg.setAttribute("stroke", act.frozen ? "#6ee7b7" : (act.state === "probe" ? "#93c5fd" : "#f9d5e3"));
        dynVec.tTelem.setAttribute("fill", act.frozen ? "#0f766e" : (act.state === "probe" ? "#00508f" : "#a7144a"));
        dynVec.coordVals[0].textContent = act.structBadge;
        dynVec.coordVals[1].textContent = act.dynBadge;
        dynVec.coordVals[2].textContent = act.ctrlBadge;
        dynVec.freezeStampBg.setAttribute("fill", act.frozen ? "#ecfdf5" : "#f1f5f9");
        dynVec.freezeStampBg.setAttribute("stroke", act.frozen ? "#10b981" : "#cbd5e1");
        dynVec.freezeStampTxt.setAttribute("fill", act.frozen ? "#047857" : "#64748b");
        dynVec.freezeStampTxt.textContent = act.frozen ? "\ud83d\udd12 Frozen \u00b7 0 LLM" : "Searching Offline...";
      }

      // 1. Update Transformer Block Highlights, Recurrence Arc, and Smooth Continuous Orb
      const isProbe = act.state === "probe";
      const showArc1 = !(sc.id === "video" && act.id === "v_native");
      const themeStroke = act.frozen ? "#10b981" : (isProbe ? "#0076c6" : "#d81b60");
      const themeText = act.frozen ? "#065f46" : (isProbe ? "#00508f" : "#a7144a");
      const themeFill = act.frozen ? "#ecfdf5" : (isProbe ? "#eff6ff" : "#fdf2f6");
      const orbGlow = act.frozen ? "rgba(16,185,129,0.24)" : (isProbe ? "rgba(0,118,198,0.24)" : "rgba(216,27,96,0.22)");

      dynVec.blocks.forEach((b) => {
        const isActive = b.spec.activeOn.includes(act.id);
        b.rect.setAttribute("fill", isActive ? themeFill : "#f8fafc");
        b.rect.setAttribute("stroke", isActive ? themeStroke : "#cbd5e1");
        b.rect.setAttribute("stroke-width", isActive ? "1.8" : "1.2");
        b.l1.setAttribute("fill", isActive ? themeText : "#1e293b");
      });

      dynVec.arcGroup1.setAttribute("opacity", showArc1 ? "1" : "0.22");
      dynVec.arc1Ghost.setAttribute("stroke", act.frozen ? "#a7f3d0" : (isProbe ? "#bfdbfe" : "#f9d5e3"));
      dynVec.arc1Flow.setAttribute("stroke-dashoffset", String((-t * 36).toFixed(1)));
      dynVec.arc1Flow.setAttribute("stroke", themeStroke);
      dynVec.arc1Flow.setAttribute("marker-end", act.frozen ? "url(#maArrowGreen)" : (isProbe ? "url(#maArrowBlue)" : "url(#maArrowOurs)"));
      dynVec.arc1Pill.setAttribute("fill", themeFill);
      dynVec.arc1Pill.setAttribute("stroke", themeStroke);
      dynVec.arc1Lbl.setAttribute("fill", themeText);
      if (sc.id === "video" && (act.id === "v_search" || act.id === "v_freeze")) {
        const passNow = Math.floor((t * 3) % 6);
        dynVec.arc1Lbl.textContent = `K=6 Pass r=${passNow}`;
      } else {
        dynVec.arc1Lbl.textContent = act.arcLabel;
      }

      // Diagnostic sensor beam
      dynVec.probeBeam.setAttribute("opacity", isProbe ? "1" : "0");
      if (isProbe) {
        dynVec.probeText.textContent = act.probeBanner || "Read-only trajectory probe active";
      }

      // Smooth continuous orb motion (zero vertical teleport or mid-cycle freeze)
      const cycle = (t * 0.52) % 1;
      let ox, oy;
      if (!showArc1) {
        ox = lerp(24, 314, cycle);
        oy = 192;
      } else if (cycle < 0.22) {
        ox = lerp(24, dynVec.arc1End, cycle / 0.22);
        oy = 192;
      } else if (cycle < 0.42) {
        ox = lerp(dynVec.arc1End, dynVec.arc1Start, (cycle - 0.22) / 0.20);
        oy = 192;
      } else if (cycle < 0.50) {
        const u = easeInOut((cycle - 0.42) / 0.08);
        ox = dynVec.arc1Start;
        oy = lerp(192, 162, u);
      } else if (cycle < 0.72) {
        const b = (cycle - 0.50) / 0.22;
        const mt = 1 - b;
        const p0x = dynVec.arc1Start, p0y = 162;
        const p1x = dynVec.arc1Start, p1y = dynVec.arc1CtrlY;
        const p2x = dynVec.arc1End, p2y = dynVec.arc1CtrlY;
        const p3x = dynVec.arc1End, p3y = 160;
        ox = mt * mt * mt * p0x + 3 * mt * mt * b * p1x + 3 * mt * b * b * p2x + b * b * b * p3x;
        oy = mt * mt * mt * p0y + 3 * mt * mt * b * p1y + 3 * mt * b * b * p2y + b * b * b * p3y;
      } else if (cycle < 0.80) {
        const u = easeInOut((cycle - 0.72) / 0.08);
        ox = dynVec.arc1End;
        oy = lerp(160, 192, u);
      } else {
        ox = lerp(dynVec.arc1End, 314, (cycle - 0.80) / 0.20);
        oy = 192;
      }
      dynVec.orbOuter.setAttribute("cx", ox.toFixed(1));
      dynVec.orbOuter.setAttribute("cy", oy.toFixed(1));
      dynVec.orbOuter.setAttribute("fill", orbGlow);
      dynVec.orbCore.setAttribute("cx", ox.toFixed(1));
      dynVec.orbCore.setAttribute("cy", oy.toFixed(1));
      dynVec.orbCore.setAttribute("fill", themeStroke);
      dynVec.orbPassLbl.textContent = isProbe ? "" : act.orbLabel;

      // 2. Modality-Specific Right Panel Motion
      if (sc.id === "scalerae") {
        const isProbeSvg = act.svgMode === "probe_bars";
        dynVec.imgStepsG.setAttribute("opacity", isProbeSvg ? "0" : "1");
        dynVec.probeBarsG.setAttribute("opacity", isProbeSvg ? "1" : "0");
        if (isProbeSvg) {
          const grow = easeInOut(clamp(actT * 1.45, 0, 1));
          dynVec.probeBarNodes.forEach((bn) => {
            bn.fill.setAttribute("width", (bn.wMax * grow).toFixed(1));
          });
          dynVec.rightFooterBadge.setAttribute("fill", "#eff6ff");
          dynVec.rightFooterBadge.setAttribute("stroke", "#93c5fd");
          dynVec.rightFooterText.setAttribute("fill", "#00508f");
          dynVec.rightFooterText.textContent = "Verdict: Lag-1 Reuse OK \u00b7 Reject Lag\u22652";
        } else {
          const isStrided = act.svgMode === "steps_strided";
          const activePulseIdx = Math.floor((t * 2.2) % 10);
          dynVec.imgCacheArcs.forEach((arc) => {
            arc.p.setAttribute("opacity", isStrided ? (activePulseIdx === arc.dstIdx ? "1" : "0.78") : "0");
            arc.p.setAttribute("stroke-width", isStrided && activePulseIdx === arc.dstIdx ? "2.6" : "2.0");
            arc.p.setAttribute("stroke-dashoffset", String((-t * 28).toFixed(1)));
          });
          dynVec.imgStepCells.forEach((cell) => {
            const { s, rect, op } = cell;
            if (!isStrided) {
              const loopActive = act.id === "r0" ? s < 10 : s < 5;
              const isSwept = loopActive && (s === (activePulseIdx % (act.id === "r0" ? 10 : 5)));
              op.textContent = loopActive ? "R+L" : "Ref";
              rect.setAttribute("fill", loopActive ? "#fdf2f6" : "#f8fafc");
              rect.setAttribute("stroke", loopActive ? (isSwept ? "#d81b60" : "#f472b6") : "#cbd5e1");
              rect.setAttribute("stroke-width", isSwept ? "2.1" : "1.1");
              op.setAttribute("fill", loopActive ? "#a7144a" : "#64748b");
            } else {
              const isSwept = s === activePulseIdx;
              if (s === 0 || s === 2 || s === 4) {
                op.textContent = "R+L";
                rect.setAttribute("fill", isSwept ? "#fce7f3" : "#fdf2f6");
                rect.setAttribute("stroke", "#d81b60");
                op.setAttribute("fill", "#a7144a");
              } else if (s === 1 || s === 3) {
                op.textContent = "L+\u0394";
                rect.setAttribute("fill", isSwept ? "#d1fae5" : "#ecfdf5");
                rect.setAttribute("stroke", "#0f766e");
                op.setAttribute("fill", "#0f766e");
              } else {
                op.textContent = "Base";
                rect.setAttribute("fill", isSwept ? "#e2e8f0" : "#f8fafc");
                rect.setAttribute("stroke", isSwept ? "#64748b" : "#cbd5e1");
                op.setAttribute("fill", "#64748b");
              }
              rect.setAttribute("stroke-width", isSwept ? "2.1" : "1.1");
            }
          });
          dynVec.reuseNote.textContent = isStrided
            ? "D_ref calls cut 5 \u2192 3 (even refresh + 1-step \u0394)"
            : "Dense loop calls D_ref on every looped step";
          dynVec.rightFooterBadge.setAttribute("fill", act.frozen ? "#ecfdf5" : "#fdf2f6");
          dynVec.rightFooterBadge.setAttribute("stroke", act.frozen ? "#10b981" : "#f9d5e3");
          dynVec.rightFooterText.setAttribute("fill", act.frozen ? "#047857" : "#a7144a");
          dynVec.rightFooterText.textContent = act.id === "r0"
            ? "Anchor Cost: 72.46 TFLOPs"
            : (isStrided ? "Full: 60.54% GenEval | 19.56 TF" : "Compressing 25 \u2192 15 steps (K=2)");
        }
      } else if (sc.id === "looped") {
        const isProbeSvg = act.svgMode === "probe_bars";
        dynVec.loopedStepsG.setAttribute("opacity", isProbeSvg ? "0" : "1");
        dynVec.probeBarsG.setAttribute("opacity", isProbeSvg ? "1" : "0");
        if (isProbeSvg) {
          const grow = easeInOut(clamp(actT * 1.45, 0, 1));
          dynVec.probeBarNodes.forEach((bn) => {
            bn.fill.setAttribute("width", (bn.wMax * grow).toFixed(1));
          });
          dynVec.rightFooterBadge.setAttribute("fill", "#eff6ff");
          dynVec.rightFooterBadge.setAttribute("stroke", "#93c5fd");
          dynVec.rightFooterText.setAttribute("fill", "#00508f");
          dynVec.rightFooterText.textContent = "97% HV Gain Captured in R0\u2013R1!";
        } else {
          const isAdaptive = act.id === "l_evolve" || act.id === "l_freeze";
          const sweepIdx = Math.floor((t * 2.2) % 7);
          dynVec.loopedArcs.forEach((arc) => {
            arc.p.setAttribute("opacity", isAdaptive ? (sweepIdx === arc.dstI ? "1" : "0.75") : "0");
            arc.p.setAttribute("stroke-width", isAdaptive && sweepIdx === arc.dstI ? "2.3" : "1.6");
            arc.p.setAttribute("stroke-dashoffset", String((-t * 28).toFixed(1)));
          });
          dynVec.loopedCells.forEach((c) => {
            const isRefresh = !isAdaptive || c.i === 0 || c.i === 3 || c.i === 6;
            const swept = c.i === sweepIdx;
            if (!isAdaptive) {
              c.t2.textContent = "K=4";
              c.rect.setAttribute("fill", swept ? "#e2e8f0" : "#f8fafc");
              c.rect.setAttribute("stroke", swept ? "#475569" : "#cbd5e1");
              c.t2.setAttribute("fill", "#475569");
            } else if (isRefresh) {
              c.t2.textContent = "K=4";
              c.rect.setAttribute("fill", swept ? "#fce7f3" : "#fdf2f6");
              c.rect.setAttribute("stroke", "#d81b60");
              c.t2.setAttribute("fill", "#a7144a");
            } else {
              c.t2.textContent = "2+\u0394";
              c.rect.setAttribute("fill", swept ? "#d1fae5" : "#ecfdf5");
              c.rect.setAttribute("stroke", "#0f766e");
              c.t2.setAttribute("fill", "#0f766e");
            }
            c.rect.setAttribute("stroke-width", swept ? "2.1" : "1.1");
          });
          if (!isAdaptive) {
            dynVec.loopSumT.textContent = "Uniform 100s K=4: 400 Core Passes";
            dynVec.loopSumM.textContent = "53.18 TFLOPs | 0.814 s/img on H100";
            dynVec.loopSumB.textContent = "Naive 14s crashes to 79.36% GenEval";
            dynVec.loopSumF.textContent = "Uniform K=4 wastes passes on flat regions";
          } else {
            dynVec.loopSumT.textContent = "Co-Designed Adaptive Stride & Extrap.";
            dynVec.loopSumM.textContent = "Speed (14s, 48p): 7.86\u00d7 Wall (+4.21 pp)";
            dynVec.loopSumB.textContent = "Balanced (20s, 68p): 5.53\u00d7 > 100s Ref";
            dynVec.loopSumF.textContent = "84.92% vs 84.43% held-out GenEval (32\u00d7H100)";
          }
          dynVec.rightFooterBadge.setAttribute("fill", act.frozen ? "#ecfdf5" : "#f8fafc");
          dynVec.rightFooterBadge.setAttribute("stroke", act.frozen ? "#10b981" : "#cbd5e1");
          dynVec.rightFooterText.setAttribute("fill", act.frozen ? "#047857" : "#334155");
          dynVec.rightFooterText.textContent = isAdaptive
            ? "Beat Schedule-Only by +1.32 pp @ 6.80 TF"
            : "Looped-DiT-B32 Benchmark";
        }
      } else if (sc.id === "video") {
        const useLoop = act.id === "v_search" || act.id === "v_freeze";
        dynVec.vidSteps.forEach((st, idx) => {
          const active = useLoop && idx < 3;
          st.r.setAttribute("fill", active ? "#fdf2f6" : "#f8fafc");
          st.r.setAttribute("stroke", active ? "#d81b60" : "#cbd5e1");
          st.t1.setAttribute("fill", active ? "#a7144a" : "#334155");
        });
        const activePass = useLoop ? Math.floor((t * 3) % 6) : -1;
        dynVec.passPills.forEach((pp, pIdx) => {
          if (!useLoop) {
            pp.pr.setAttribute("fill", "#f8fafc");
            pp.pr.setAttribute("stroke", "#cbd5e1");
            pp.pt.setAttribute("fill", "#94a3b8");
          } else if (pIdx === 5) {
            const lit = activePass === 5;
            pp.pr.setAttribute("fill", lit ? "#10b981" : "#ecfdf5");
            pp.pr.setAttribute("stroke", "#0f766e");
            pp.pt.setAttribute("fill", lit ? "#ffffff" : "#047857");
          } else {
            const lit = activePass === pIdx;
            pp.pr.setAttribute("fill", lit ? "#0076c6" : "#eff6ff");
            pp.pr.setAttribute("stroke", "#0076c6");
            pp.pt.setAttribute("fill", lit ? "#ffffff" : "#00508f");
          }
        });
        if (!useLoop) {
          dynVec.kvStatusTxt.setAttribute("fill", act.id === "v_native" ? "#be123c" : "#00508f");
          dynVec.kvStatusTxt.textContent = act.id === "v_native" ? "Immediate KV Write (Drifts)" : "Scoping B11\u201318 & KV Contract";
          dynVec.kvSubTxt.textContent = act.id === "v_native" ? "Held-out LPIPS: 0.3907 (48/100 tail)" : "Unscoped N=20 overfits (0.402) vs Fixed 0.198";
        } else if (activePass === 5) {
          dynVec.kvStatusTxt.setAttribute("fill", "#047857");
          dynVec.kvStatusTxt.textContent = "r=5: COMMIT CLEAN KV TO CACHE \u2713";
          dynVec.kvSubTxt.textContent = "Refined window state locked for future chunks";
        } else {
          dynVec.kvStatusTxt.setAttribute("fill", "#00508f");
          dynVec.kvStatusTxt.textContent = `r=${activePass}: READ-ONLY KV (NO WRITE)`;
          dynVec.kvSubTxt.textContent = "Intermediate Euler passes never pollute memory";
        }
        dynVec.rightFooterBadge.setAttribute("fill", act.frozen ? "#ecfdf5" : "#f8fafc");
        dynVec.rightFooterBadge.setAttribute("stroke", act.frozen ? "#10b981" : "#cbd5e1");
        dynVec.rightFooterText.setAttribute("fill", act.frozen ? "#047857" : "#334155");
        dynVec.rightFooterText.textContent = useLoop
          ? "Held-out LPIPS: 0.3907 \u2192 0.1577 (\u221259.6%)"
          : "RememBench 16s Departure \u2192 Revisit";
      } else {
        const useGeo = act.id === "d_evolve" || act.id === "d_freeze";
        const geoColor = act.frozen ? "#0f766e" : (useGeo ? "#d81b60" : "#94a3b8");
        dynVec.geoJumpArc.setAttribute("stroke", geoColor);
        dynVec.geoJumpArc.setAttribute("marker-end", act.frozen ? "url(#maArrowTeal)" : (useGeo ? "url(#maArrowOurs)" : "url(#maArrowSlate)"));
        dynVec.geoJumpArc.setAttribute("opacity", useGeo ? "1" : "0.42");
        dynVec.geoJumpArc.setAttribute("stroke-dashoffset", String((-t * 24).toFixed(1)));
        dynVec.geoNode.setAttribute("fill", geoColor);
        dynVec.geoNode.setAttribute("opacity", useGeo ? "1" : "0.45");
        dynVec.geoLbl.setAttribute("fill", geoColor);
        dynVec.geoLbl.textContent = useGeo ? "h_geo (\u2248K=4)" : "Native K=4";

        const activeStep = Math.floor((t * 2.0) % 3);
        dynVec.doryPills.forEach((dp, idx) => {
          if (act.id === "d_base") {
            dp.kr.setAttribute("fill", "#f8fafc");
            dp.kr.setAttribute("stroke", "#cbd5e1");
            dp.kt.setAttribute("fill", "#94a3b8");
          } else if (idx === 2) {
            const isLastKv = act.id === "d_freeze";
            const lit = isLastKv && activeStep === 2;
            dp.kr.setAttribute("fill", lit ? "#10b981" : (isLastKv ? "#ecfdf5" : "#f8fafc"));
            dp.kr.setAttribute("stroke", isLastKv ? "#0f766e" : "#cbd5e1");
            dp.kt.setAttribute("fill", lit ? "#ffffff" : (isLastKv ? "#047857" : "#94a3b8"));
          } else {
            const lit = activeStep === idx;
            dp.kr.setAttribute("fill", lit ? "#0076c6" : "#eff6ff");
            dp.kr.setAttribute("stroke", "#0076c6");
            dp.kt.setAttribute("fill", lit ? "#ffffff" : "#00508f");
          }
        });
        dynVec.doryKvNote.setAttribute("fill", act.frozen ? "#047857" : (useGeo ? "#00508f" : "#64748b"));
        dynVec.doryKvNote.textContent = act.id === "d_freeze"
          ? "Last-loop KV commits converged state across decode"
          : (act.id === "d_evolve" ? "Per-loop KV already beats K=4 (62.09% @ 1.72\u00d7)" : "Naive K=4 spends 161,198 TF for +0.05 pp");

        dynVec.rightFooterBadge.setAttribute("fill", act.frozen ? "#ecfdf5" : "#f8fafc");
        dynVec.rightFooterBadge.setAttribute("stroke", act.frozen ? "#10b981" : "#cbd5e1");
        dynVec.rightFooterText.setAttribute("fill", act.frozen ? "#047857" : "#334155");
        dynVec.rightFooterText.textContent = useGeo
          ? "GPQA-D Held-out: +1.74 pp (72.31% vs 70.57%)"
          : "IFBench + GPQA-D + SciCode (80% Held-out)";
      }

      // 3. Synchronize Metric Timeline SVG Playhead + Partial Progress Line
      const px = dynChart.xOf(tNorm);
      dynChart.playhead.setAttribute("x1", px.toFixed(1));
      dynChart.playhead.setAttribute("x2", px.toFixed(1));
      dynChart.playKnob.setAttribute("cx", px.toFixed(1));

      const curve = sc.mainCurve;
      const pts = [];
      for (let i = 0; i < curve.length; i++) {
        const cur = curve[i];
        if (cur.tNorm <= tNorm) {
          pts.push([dynChart.xOf(cur.tNorm), dynChart.yOf(cur.value)]);
        } else {
          if (i > 0) {
            const prev = curve[i - 1];
            const seg = (tNorm - prev.tNorm) / Math.max(1e-6, cur.tNorm - prev.tNorm);
            const interpVal = lerp(prev.value, cur.value, clamp(seg, 0, 1));
            pts.push([px, dynChart.yOf(interpVal)]);
          }
          break;
        }
      }
      if (pts.length > 0) {
        dynChart.progPath.setAttribute("d", "M " + pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" L "));
      } else {
        dynChart.progPath.setAttribute("d", "");
      }

      dynChart.dots.forEach((d) => {
        const passed = tNorm >= d.pt.tNorm - 0.008;
        const isCurrent = Math.abs(tNorm - d.pt.tNorm) < 0.025;
        d.c.setAttribute("fill", passed ? "#d81b60" : "#ffffff");
        d.c.setAttribute("r", isCurrent ? "5.2" : (passed ? "4.4" : "3.8"));
        d.xl.setAttribute("fill", isCurrent ? "#a7144a" : (passed ? "#334155" : "#64748b"));
        d.xl.setAttribute("font-weight", isCurrent ? "700" : "600");
      });

      // 4. Footer Playback Controls & Scrubber
      slider.value = String(Math.round(tNorm * 1000));
      playBtn.textContent = playing ? "\u275a\u275a Pause" : "\u25b6 Play";
      clockEl.textContent = `${act.roundTag} \u00b7 ${fmtTime(t)} / ${fmtTime(dur)}`;
    }

    function stepLoop(now) {
      if (lastRaf === null) lastRaf = now;
      const dt = Math.min(0.1, (now - lastRaf) / 1000);
      lastRaf = now;
      if (playing && inView && root.offsetParent !== null) {
        const sc = SCENARIOS[scenarioIdx];
        timeSec += dt;
        if (timeSec >= sc.duration) {
          timeSec = 0;
        }
        renderFrame(false);
      }
      window.requestAnimationFrame(stepLoop);
    }

    playBtn.addEventListener("click", () => {
      playing = !playing;
      renderFrame(false);
    });

    replayBtn.addEventListener("click", () => {
      timeSec = 0;
      playing = true;
      renderFrame(true);
    });

    slider.addEventListener("input", () => {
      const sc = SCENARIOS[scenarioIdx];
      timeSec = (Number(slider.value) / 1000) * sc.duration;
      playing = false;
      renderFrame(true);
    });

    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver((entries) => {
        inView = entries.some((e) => e.isIntersecting);
      }, { threshold: 0.15 });
      io.observe(root);
    }

    buildVecScene();
    buildChart();
    renderFrame(true);
    window.requestAnimationFrame(stepLoop);
  }

  document.addEventListener("DOMContentLoaded", () => {
    const el = document.getElementById("elpMethodAnim");
    if (el) mount(el);
  });
})();
