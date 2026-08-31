/**
 * Aria Dental — Talk to Aria (site voice guide).
 * Same pattern as velzyx.ai / ariamedspa.ai: Fish Audio Hannah TTS + OpenAI LLM.
 */
(function () {
  "use strict";
  if (window.__adAriaGuide) return;
  window.__adAriaGuide = true;

  var GREETING =
    "Hey — this is a live demo of Aria, the Voice AI receptionist we build for dental practices. I can walk the platform, play voices, or hold a thirty-minute walkthrough. What brought you in?";

  var WIDGET_IDS = ["aria-wrap", "aria-bubble", "aria-badge", "aria-panel"];
  var WIDGET_CLIENT = "velzyx-ai";
  var WIDGET_SRC = "https://voice.velzyx.ai/aria-widget.js";

  function speechCtor() {
    var w = window;
    return w.SpeechRecognition || w.webkitSpeechRecognition || null;
  }

  var PLAYBACK_RATE = 44100;
  var player = {
    ctx: null,
    gain: null,
    gen: 0,
    leftover: new Uint8Array(0),
    next: 0,
    sources: [],
    abort: null,
    rate: PLAYBACK_RATE,
    sourceRate: PLAYBACK_RATE,
    srcHold: new Float32Array(0),
    srcFrac: 0,
  };

  function isMobile() {
    return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  }

  function concatBytes(a, b) {
    var out = new Uint8Array(a.length + b.length);
    out.set(a);
    out.set(b, a.length);
    return out;
  }

  function decodeS16le(bytes, leftover) {
    var merged = leftover.length ? concatBytes(leftover, bytes) : bytes;
    var even = merged.byteLength - (merged.byteLength % 2);
    var rest = even < merged.byteLength ? merged.subarray(even) : new Uint8Array(0);
    var count = even / 2;
    var samples = new Float32Array(count);
    var view = new DataView(merged.buffer, merged.byteOffset, even);
    for (var i = 0; i < count; i++) {
      var n = view.getInt16(i * 2, true);
      var s = n / 32768;
      samples[i] = s > 1 ? 1 : s < -1 ? -1 : s;
    }
    return { samples: samples, leftover: rest.length ? rest.slice() : new Uint8Array(0) };
  }

  function resample(input) {
    var from = player.sourceRate;
    var to = player.rate;
    if (!from || !to || from === to) return input;
    var src = new Float32Array(player.srcHold.length + input.length);
    src.set(player.srcHold);
    src.set(input, player.srcHold.length);
    var ratio = from / to;
    var idx = player.srcFrac;
    var outLen = Math.max(0, Math.floor((src.length - 1 - idx) / ratio));
    var out = new Float32Array(outLen);
    for (var i = 0; i < outLen; i++) {
      var i0 = Math.floor(idx);
      var f = idx - i0;
      var i1 = Math.min(i0 + 1, src.length - 1);
      out[i] = src[i0] * (1 - f) + src[i1] * f;
      idx += ratio;
    }
    var keep = Math.min(src.length, Math.floor(idx));
    player.srcHold = src.slice(keep);
    player.srcFrac = idx - keep;
    return out;
  }

  function unlockAudio() {
    if (!player.ctx) {
      var Ctor = window.AudioContext || window.webkitAudioContext;
      if (!Ctor) return Promise.resolve(null);
      try {
        player.ctx = new Ctor({ sampleRate: PLAYBACK_RATE, latencyHint: "playback" });
      } catch (_) {
        player.ctx = new Ctor();
      }
      player.rate = player.ctx.sampleRate || PLAYBACK_RATE;
      player.gain = player.ctx.createGain();
      player.gain.gain.value = 0.94;
      player.gain.connect(player.ctx.destination);
    }
    if (player.ctx.state === "suspended") return player.ctx.resume().then(function () { return player.ctx; });
    return Promise.resolve(player.ctx);
  }

  function stopSources() {
    player.sources.forEach(function (s) {
      try { s.stop(); } catch (_) {}
    });
    player.sources = [];
    player.next = player.ctx ? player.ctx.currentTime : 0;
  }

  function enqueuePcm(pcm) {
    if (!player.ctx || !player.gain || !pcm.length) return;
    var buf = player.ctx.createBuffer(1, pcm.length, player.rate);
    buf.getChannelData(0).set(pcm);
    var src = player.ctx.createBufferSource();
    src.buffer = buf;
    src.connect(player.gain);
    var look = player.ctx.currentTime + (isMobile() ? 0.14 : 0.06);
    var startAt = player.next > player.ctx.currentTime ? player.next : look;
    src.start(startAt);
    player.next = startAt + buf.duration;
    player.sources.push(src);
    src.onended = function () {
      player.sources = player.sources.filter(function (s) { return s !== src; });
    };
  }

  function remainingMs() {
    if (!player.ctx) return 0;
    return Math.max(0, (player.next - player.ctx.currentTime) * 1000);
  }

  function injectStyles() {
    if (document.getElementById("vz-aria-guide-css")) return;
    var s = document.createElement("style");
    s.id = "vz-aria-guide-css";
    s.textContent =
      "#vz-guide-fab{position:fixed;left:50%;bottom:24px;transform:translateX(-50%);z-index:80;display:flex;align-items:center;gap:12px;padding:10px 18px 10px 12px;border:1px solid rgba(255,255,255,.12);border-radius:999px;background:#0D0E10;color:#EFEFEF;box-shadow:0 12px 40px rgba(13,14,16,.45);cursor:pointer;font:400 14px/1.2 Sora,system-ui,sans-serif;letter-spacing:.01em}" +
      "#vz-guide-fab:hover{transform:translateX(-50%) scale(1.02)}" +
      "#vz-guide-fab .vz-mic{width:34px;height:34px;border-radius:50%;background:linear-gradient(180deg,#D4952A,#E8B84A);color:#fff;display:grid;place-items:center;flex-shrink:0;box-shadow:0 0 0 4px rgba(212,149,42,.28)}" +
      "#vz-guide-fab .vz-fab-wave{display:flex;align-items:center;gap:2px;height:16px}" +
      "#vz-guide-fab .vz-fab-wave .bar{width:2px;height:100%;background:linear-gradient(180deg,#D4952A,#E8B84A);opacity:.9;transform-origin:center;animation:vzFabWave 1.1s ease-in-out infinite}" +
      "#vz-guide-fab .vz-fab-wave .bar:nth-child(2){animation-delay:.12s}#vz-guide-fab .vz-fab-wave .bar:nth-child(3){animation-delay:.24s}#vz-guide-fab .vz-fab-wave .bar:nth-child(4){animation-delay:.08s}#vz-guide-fab .vz-fab-wave .bar:nth-child(5){animation-delay:.2s}" +
      "@keyframes vzFabWave{0%,100%{transform:scaleY(.35)}50%{transform:scaleY(1)}}" +
      "#vz-guide-card{position:fixed;left:50%;bottom:20px;z-index:90;width:min(420px,calc(100% - 24px));transform:translateX(-50%);}" +
      "#vz-guide-card .vz-shell{overflow:hidden;border-radius:22px;border:1px solid rgba(13,14,16,.1);background:#FFFFFF;color:#1E2124;box-shadow:0 28px 90px rgba(13,14,16,.18)}" +
      "#vz-guide-card header{display:flex;align-items:center;gap:10px;padding:14px 16px;border-bottom:1px solid rgba(13,14,16,.08);cursor:grab}" +
      "#vz-guide-card .vz-logo{display:block;height:28px;width:auto;max-width:150px;object-fit:contain;flex-shrink:0}" +
      "#vz-guide-card .vz-head-meta{flex:1;min-width:0}" +
      "#vz-guide-card .vz-kicker{margin:0;font:400 10px/1 ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.12em;text-transform:uppercase;color:#D4952A}" +
      "#vz-guide-card .vz-live{display:flex;align-items:center;gap:8px;font:400 10px/1 ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.12em;text-transform:uppercase;color:#636363}" +
      "#vz-guide-card .vz-live-dot{width:8px;height:8px;border-radius:50%;background:#E8B84A;display:inline-block;box-shadow:0 0 8px rgba(212,149,42,.7);animation:vzLivePulse 2s cubic-bezier(.4,0,.2,1) infinite}" +
      "@keyframes vzLivePulse{0%,100%{opacity:.45}50%{opacity:1}}" +
      "#vz-guide-card header button{width:32px;height:32px;border:0;background:transparent;cursor:pointer;border-radius:10px;color:#1E2124}" +
      "#vz-guide-card header button:hover{background:rgba(13,14,16,.06)}" +
      "#vz-guide-stage{position:relative;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:22px 16px 10px;min-height:118px;background:radial-gradient(ellipse at 50% 40%,rgba(212,149,42,.14),rgba(232,184,74,.08) 42%,transparent 68%),#FFFFFF}" +
      "#vz-guide-stage .vz-ring{position:absolute;left:50%;top:50%;width:132px;height:132px;margin:-66px 0 0 -66px;border-radius:50%;border:1px solid rgba(212,149,42,.22);pointer-events:none}" +
      "#vz-guide-stage .vz-ring.inner{width:96px;height:96px;margin:-48px 0 0 -48px;border-color:rgba(212,149,42,.4)}" +
      "#vz-guide-card[data-vz-status=speaking] .vz-ring{animation:vzRing 1.6s ease-out infinite}" +
      "#vz-guide-card[data-vz-status=listening] .vz-ring.inner{animation:vzRing 2.4s ease-out infinite}" +
      "@keyframes vzRing{0%{transform:scale(.92);opacity:.9}100%{transform:scale(1.18);opacity:0}}" +
      "#vz-guide-wave{position:relative;z-index:1;display:flex;align-items:center;justify-content:center;gap:3px;height:56px;width:min(280px,80%)}" +
      "#vz-guide-wave .bar{flex:1;max-width:3px;height:100%;background:#1E2124;opacity:.16;transform:scaleY(.18);transform-origin:center;border-radius:1px}" +
      "#vz-guide-wave .bar:nth-child(3n){height:62%}#vz-guide-wave .bar:nth-child(4n){height:88%}#vz-guide-wave .bar:nth-child(5n){height:40%}#vz-guide-wave .bar:nth-child(7n){height:100%}#vz-guide-wave .bar:nth-child(8n){height:28%}" +
      "#vz-guide-card[data-vz-status=listening] #vz-guide-wave .bar{opacity:.95;background:linear-gradient(180deg,#D4952A,#E8B84A);animation:vzWaveListen 1.4s ease-in-out infinite}" +
      "#vz-guide-card[data-vz-status=speaking] #vz-guide-wave .bar{opacity:.95;background:linear-gradient(180deg,#D4952A,#E8B84A);animation:vzWaveSpeak .7s ease-in-out infinite}" +
      "#vz-guide-card[data-vz-status=thinking] #vz-guide-wave .bar{opacity:.55;background:linear-gradient(180deg,#D4952A,#E8B84A);animation:vzWaveThink 1s linear infinite}" +
      "#vz-guide-wave .bar:nth-child(2n){animation-delay:.08s}#vz-guide-wave .bar:nth-child(3n){animation-delay:.16s}#vz-guide-wave .bar:nth-child(4n){animation-delay:.24s}#vz-guide-wave .bar:nth-child(5n){animation-delay:.32s}#vz-guide-wave .bar:nth-child(6n){animation-delay:.12s}#vz-guide-wave .bar:nth-child(7n){animation-delay:.2s}" +
      "@keyframes vzWaveListen{0%,100%{transform:scaleY(.22)}50%{transform:scaleY(.7)}}" +
      "@keyframes vzWaveSpeak{0%,100%{transform:scaleY(.2)}50%{transform:scaleY(1)}}" +
      "@keyframes vzWaveThink{0%,100%{transform:scaleY(.16)}50%{transform:scaleY(.4)}}" +
      "#vz-guide-status{position:relative;z-index:1;margin:10px 0 0;font:400 10px/1 ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.18em;text-transform:uppercase;color:#767676}" +
      "#vz-guide-log{max-height:200px;overflow:auto;padding:12px 16px;display:flex;flex-direction:column;gap:12px;border-top:1px solid rgba(13,14,16,.08)}" +
      "#vz-guide-log::-webkit-scrollbar{width:6px}#vz-guide-log::-webkit-scrollbar-thumb{background:rgba(13,14,16,.16)}" +
      "#vz-guide-log .vz-line{display:grid;grid-template-columns:52px 1fr;gap:10px;font:400 14px/1.45 Sora,system-ui,sans-serif;margin:0;color:#1E2124}" +
      "#vz-guide-log .vz-who{font:400 10px/1.6 ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.08em;text-transform:uppercase;color:#767676}" +
      "#vz-guide-log .vz-line.you .vz-said{color:#636363}" +
      "#vz-guide-chips{display:flex;flex-wrap:wrap;gap:6px;padding:0 16px 10px}" +
      "#vz-guide-chips button{border:1px solid rgba(13,14,16,.14);background:#FFFFFF;color:#1E2124;border-radius:999px;padding:6px 12px;font:400 12px/1 Sora,system-ui,sans-serif;cursor:pointer}" +
      "#vz-guide-chips button:hover{border-color:#D4952A;color:#D4952A}" +
      "#vz-guide-form{display:flex;gap:8px;padding:0 16px 12px}" +
      "#vz-guide-form input{flex:1;height:40px;border-radius:999px;border:1px solid rgba(13,14,16,.14);background:#F9F9F9;color:#1E2124;padding:0 16px;font:400 14px Sora,system-ui,sans-serif}" +
      "#vz-guide-form input::placeholder{color:#767676}" +
      "#vz-guide-form button{height:40px;border:0;border-radius:999px;background:linear-gradient(90deg,#D4952A,#E8B84A);color:#0D0E10;padding:0 16px;font:400 14px Sora,system-ui,sans-serif;cursor:pointer}" +
      "#vz-guide-end{display:block;margin:0 auto 14px;border:0;background:transparent;font:400 10px/1 ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.18em;text-transform:uppercase;color:#767676;cursor:pointer}" +
      "#vz-guide-note{padding:0 16px 8px;font:400 12px Sora,system-ui,sans-serif;color:#b42318}" +
      ".hero-dark button.arrow-link{background:transparent;font:inherit;cursor:pointer;border-top:0;border-left:0;border-right:0}" +
      "html[data-aria-guide-open]:not([data-aria-show-widget]) #aria-wrap,html[data-aria-guide-open]:not([data-aria-show-widget]) #aria-bubble,html[data-aria-guide-open]:not([data-aria-show-widget]) #aria-badge,html[data-aria-guide-open]:not([data-aria-show-widget]) #aria-panel,html[data-aria-guide-open]:not([data-aria-show-widget]) #aria-root,html[data-aria-guide-open]:not([data-aria-show-widget]) #aria-launcher,html[data-aria-guide-open]:not([data-aria-show-widget]) #aria-toggle,html[data-aria-guide-open]:not([data-aria-show-widget]) #aria-fab,html[data-aria-guide-open]:not([data-aria-show-widget]) #aria-widget{visibility:hidden!important;pointer-events:none!important}" +
      "#vz-guide-card.vz-dock-left{left:16px;transform:none}" +
      "#vz-guide-card .vz-logo{font-family:Fraunces,Georgia,serif;font-size:22px;font-weight:600;color:#D4952A;text-decoration:none;letter-spacing:-.03em;height:auto;max-width:none}" +
      "#vz-guide-fab{background:#1A1A2E}" +
      "#vz-guide-fab .vz-mic{background:linear-gradient(180deg,#D4952A,#C9A227);box-shadow:0 0 0 4px rgba(212,149,42,.28)}" +
      "@media(max-width:640px){#vz-guide-fab{left:16px;transform:none}#vz-guide-fab:hover{transform:scale(1.02)}#vz-guide-card.vz-dock-left{left:12px;width:min(420px,calc(100% - 24px))}}";
    document.head.appendChild(s);
  }

  function injectWidgetBrandCss() {
    var s = document.getElementById("ad-widget-brand-css");
    if (!s) {
      s = document.createElement("style");
      s.id = "ad-widget-brand-css";
      s.textContent =
        "#aria-bubble{background:#D4952A!important;background-color:#D4952A!important;box-shadow:0 4px 16px rgba(212,149,42,.4),0 2px 6px rgba(0,0,0,.1)!important}" +
        "#aria-bubble:hover{box-shadow:0 6px 24px rgba(212,149,42,.5),0 4px 12px rgba(0,0,0,.15)!important}" +
        "#aria-header{background:linear-gradient(135deg,#1A1A2E 0%,#2A2A4E 100%)!important}" +
        "#aria-send{background:#D4952A!important;box-shadow:0 2px 6px rgba(212,149,42,.3)!important}" +
        "#aria-input:focus{border-color:#D4952A!important}" +
        "#aria-followups .aria-fup{border-color:rgba(212,149,42,.35)!important;color:#1A1A2E!important}" +
        "#aria-followups .aria-fup:hover{background:rgba(212,149,42,.1)!important;border-color:#D4952A!important}" +
        "#aria-hname{font-family:Fraunces,Georgia,serif!important;font-weight:600!important}" +
        "#aria-bubble img.aria-ic-chat,#aria-bubble img{width:62px!important;height:62px!important;object-fit:cover!important;border-radius:50%!important;position:absolute!important}" +
        "#aria-avatar img,.aria-msg-avatar img{width:100%!important;height:100%!important;object-fit:cover!important;border-radius:50%!important}" +
        "#aria-wrap .aria-msg.bot .aria-bubble-text{border-color:rgba(212,149,42,.2)!important}" +
        "#aria-footer a{color:#D4952A!important}";
    }
    document.head.appendChild(s);
  }

  function skinBookingWidget() {
    injectWidgetBrandCss();
    var wrap = document.getElementById("aria-wrap");
    if (!wrap) return false;
    var badge = document.getElementById("aria-badge");
    if (badge && /velzyx|have a question/i.test(badge.textContent || "")) {
      badge.textContent = "Questions about Aria? Book a walkthrough.";
    }
    var input = document.getElementById("aria-input");
    if (input && /velzyx/i.test(input.getAttribute("placeholder") || "")) {
      input.setAttribute("placeholder", "Ask about Aria, or book a walkthrough...");
    }
    var hname = document.getElementById("aria-hname");
    if (hname) hname.textContent = "Aria";
    document.querySelectorAll("#aria-bubble img, #aria-avatar img, .aria-msg-avatar img").forEach(function (img) {
      if (!/aria-avatar/.test(img.getAttribute("src") || "")) {
        img.setAttribute("src", "/images/aria-avatar.png");
        img.setAttribute("alt", "Aria");
      }
    });
    var first = document.querySelector("#aria-messages .aria-msg.bot .aria-bubble-text");
    if (first && /velzyx/i.test(first.textContent || "")) {
      first.textContent =
        "Hi — I'm Aria for dental practices. I can explain the platform or book a thirty-minute walkthrough on the calendar.";
    }
    return true;
  }

  function watchWidgetBrand() {
    injectWidgetBrandCss();
    var tries = 0;
    var tick = window.setInterval(function () {
      tries += 1;
      skinBookingWidget();
      if (tries > 48) window.clearInterval(tick);
    }, 250);
  }

  function waveBars(n) {
    var html = "";
    for (var i = 0; i < n; i++) html += '<span class="bar"></span>';
    return html;
  }

  function micSvg() {
    return '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3a3 3 0 0 1 3 3v6a3 3 0 1 1-6 0V6a3 3 0 0 1 3-3Z"/><path d="M19 11a7 7 0 0 1-14 0M12 18v3"/></svg>';
  }

  var STORE = "ad-aria-guide";
  var DEFAULT_CHIPS = [
    { label: "Platform", path: "/platform" },
    { label: "Voices", path: "/voices/" },
    { label: "Book a demo", path: "/contact" },
  ];
  var DEMO_RE = /\b((book|schedule|set up|want|wanna|ask about|get) (a |me (a )?)?(demo|call|meeting|walkthrough)|a demo|the demo|on the calendar|fill (out|in) (the |your |my )?(form|info|information)|contact (form|page|us)|talk to (an )?(engineer|human)|sign me up)\b/i;
  var INDUSTRIES_RE = /\bindustr|\bverticals?\b|\bwho (do you|you|we) serve\b|\bwhat you serve\b|\b(show|tell|list) me .{0,80}serve/i;
  var VOICES_RE = /\bvoices\b|\bvoice (library|page|catalog|options|list)\b|\bclone (my |our |your )?voice\b|\bmultilingual\b/i;
  var TOPIC_GO = [
    ["/contact", DEMO_RE],
    ["/voices/", VOICES_RE],
    ["/configure/", /\b(build (my |your |an )?aria|configur|customize|pick the voice|set the rules)\b/i],
    ["/platform", /\b(platform|product|what (does|do) aria do|capabilities|features)\b/i],
    ["/how-it-works", /\b(how (it|this|you) works|setup|deploy|go live|onboard)\b/i],
    ["/marketing", /\b(marketing|seo|website|google ads|paid ads|local seo)\b/i],
    ["/dental-insurance-verification-ai", /\b(insurance|eligib|payer|delta dental|ppo)\b/i],
    ["/integrations", /\b(integrat|opendental|open dental|dentrix|eaglesoft|pms|practice management)\b/i],
    ["/security", /\b(hipaa|baa|security|compliance|privacy)\b/i],
    ["/demos", /\b(demo recordings?|listen to (a |the )?call|sample call)\b/i],
    ["/compare", /\bcompar|versus|\bvs\.?\b|arini|dentina|weave|rondah\b/i],
    ["/clone/", /\bclone (my |our |your )?voice\b/i],
    ["/portfolio", /\bportfolio|case stud|examples? you (built|shipped)\b/i],
    ["/about", /\babout (aria|velzyx|the (company|firm|team)|who (are|is) (you|varinder))\b/i],
    ["/roi-calculator", /\b(roi|return on|calculator|how much (money|revenue))\b/i],
  ];

  function topicPath(text) {
    var t = String(text || "");
    if (DEMO_RE.test(t)) return "/contact";
    if (VOICES_RE.test(t)) return "/voices/";
    if (INDUSTRIES_RE.test(t)) return "/platform";
    for (var i = 0; i < TOPIC_GO.length; i++) {
      if (TOPIC_GO[i][1].test(t)) return TOPIC_GO[i][0];
    }
    return "";
  }
  var state = {
    open: false,
    muted: false,
    status: "idle",
    turns: [],
    chips: DEFAULT_CHIPS.slice(),
    rec: null,
    wantListen: false,
    holdRec: false,
    speaking: false,
    lastSpoken: "",
    ignoreUntil: 0,
    pendingSpeak: "",
    pendingBook: false,
    showWidget: false,
    asking: false,
    didSoftNav: false,
    navigating: false,
  };

  function normSpeech(s) {
    return String(s || "")
      .toLowerCase()
      .replace(/[^a-z0-9 ]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function isKeyboardNoise(said) {
    var words = normSpeech(said).split(" ").filter(Boolean);
    if (!words.length) return true;
    if (words.every(function (w) { return w.length <= 1; })) return true;
    if (
      words.length <= 2 &&
      words.every(function (w) {
        return /^(a|ah|oh|um|uh|mm|hmm|er|the|and|to|of|it|you|i)$/.test(w);
      })
    ) {
      return true;
    }
    return false;
  }

  function isLikelyEcho(said, spoken) {
    var a = normSpeech(said);
    var b = normSpeech(spoken);
    if (!a) return false;
    if (/i ?m aria (with|from|for) (velzyx|valdez|velsix)/.test(a)) return true;
    if (/walk you through what we build/.test(a)) return true;
    if (/custom ai solutions for service businesses/.test(a)) return true;
    if (/what brought you (here|in)/.test(a)) return true;
    if (/would love to show you/.test(a)) return true;
    if (/live demo of aria/.test(a)) return true;
    if (/what a voice ai agent can sound like/.test(a)) return true;
    if (/implement it on your business/.test(a)) return true;
    if (/are you (interested|looking) (in|to) (learning|explore)/.test(a)) return true;
    if (!b) return false;
    if (b.indexOf(a) !== -1 && a.length >= 10) return true;
    if (a.indexOf(b.slice(0, Math.min(40, b.length))) !== -1 && a.length >= 16) return true;
    var aw = a.split(" ");
    var bw = b.split(" ");
    var n = Math.min(4, aw.length, bw.length);
    if (n >= 3) {
      var hit = 0;
      for (var i = 0; i < n; i++) {
        if (aw[i] === bw[i] || aw[i].indexOf(bw[i]) === 0 || bw[i].indexOf(aw[i]) === 0) hit += 1;
      }
      if (hit >= n - 1 && a.length <= b.length + 12) return true;
    }
    return false;
  }

  function lastAssistantText() {
    for (var i = state.turns.length - 1; i >= 0; i--) {
      if (state.turns[i].role === "assistant") return state.turns[i].content;
    }
    return state.lastSpoken || "";
  }

  function shouldIgnoreHeard(said) {
    if (!said) return true;
    if (state.muted || state.speaking || state.holdRec || state.asking) return true;
    if (Date.now() < state.ignoreUntil) return true;
    if (isKeyboardNoise(said)) return true;
    if (isLikelyEcho(said, state.lastSpoken) || isLikelyEcho(said, lastAssistantText())) return true;
    var words = said.trim().split(/\s+/).filter(Boolean);
    if (words.length < 3 && !/^(hi|hello|hey|yes|yeah|ok|okay|stop|no)$/i.test(said)) return true;
    return false;
  }

  function setWidgetHidden(hidden) {
    document.documentElement.toggleAttribute("data-aria-guide-open", hidden);
    WIDGET_IDS.forEach(function (id) {
      var el = document.getElementById(id);
      if (!el) return;
      el.style.visibility = "";
      el.style.pointerEvents = "";
    });
  }

  function persist() {
    try {
      if (!state.open) {
        sessionStorage.removeItem(STORE);
        return;
      }
      sessionStorage.setItem(
        STORE,
        JSON.stringify({
          v: 1,
          open: true,
          muted: state.muted,
          turns: state.turns.slice(-20),
          chips: state.chips || [],
          pendingSpeak: state.pendingSpeak || "",
          pendingBook: !!state.pendingBook,
          showWidget: !!state.showWidget,
          t: Date.now(),
        })
      );
    } catch (_) {}
  }

  function readSession() {
    try {
      var raw = sessionStorage.getItem(STORE);
      if (!raw) return null;
      var s = JSON.parse(raw);
      if (!s || !s.open || Date.now() - s.t > 45 * 60 * 1000) {
        sessionStorage.removeItem(STORE);
        return null;
      }
      return s;
    } catch (_) {
      return null;
    }
  }

  function chipNarration(c) {
    var p = c && c.path ? String(c.path) : "";
    if (/\/platform/.test(p)) {
      return "This is the platform — voice, chat, SMS, live insurance, payments, and recall in one front office. Tell me which piece you want first.";
    }
    if (/\/voices/.test(p)) {
      return "This is the voice library — seventeen production operators in English, Spanish, Chinese, and Hindi. Tap a card to hear one, or we clone yours from a sixty-second sample.";
    }
    if (/\/how-it-works/.test(p)) {
      return "Typical practices are live in about a week. Discovery, voice and rules, calendar write-back, then a dry run on your real schedule.";
    }
    if (/\/marketing/.test(p)) {
      return "Websites, local SEO, and ads — built so ranking does not hit voicemail. Aria answers whatever that marketing produces.";
    }
    if (/\/contact/.test(p)) {
      return "This is contact. Fill in the form on this page, or use the chat on the right and book the thirty-minute walkthrough.";
    }
    if (/insurance/.test(p)) {
      return "Aria verifies coverage on the call across thirty-four hundred payers, including dependents, and can quote out-of-pocket before they hang up.";
    }
    if (/\/clone/.test(p)) {
      return "Sixty seconds of your voice and Aria sounds like you on every callback and recall. Leave a sample and we take it from there.";
    }
    if (/\/configure/.test(p)) {
      return "This is the builder — pick a voice, set booking rules, and see what your Aria would sound like before a walkthrough.";
    }
    if (/\/integrations/.test(p)) {
      return "Open Dental write-back is live. Dentrix and Eaglesoft are on the roadmap. Google Calendar is the fallback when there is no PMS.";
    }
    if (/\/security/.test(p)) {
      return "Production Voice AI ships under a BAA. Access is scoped, calls are logged, and we do not train public models on your patients.";
    }
    if (/\/compare/.test(p)) {
      return "This is how Aria stacks against the other dental receptionists — live insurance and marketing in the same stack is the usual gap.";
    }
    if (/\/demos/.test(p)) {
      return "These are recorded calls. Press play and you will hear Aria book, verify, or recall the way a front desk would.";
    }
    if (/\/roi/.test(p)) {
      return "Plug in your missed-call volume and see what those voicemails are costing. Most practices recoup Aria with one or two extra booked visits a month.";
    }
    if (/\/about/.test(p)) {
      return "Aria is a product of Velzyx AI Inc. in Newport Beach. Same engineering team as the med spa sister brand.";
    }
    return "Take a look at this page. Ask me anything — I would love to walk you through what you are seeing.";
  }

  function setStatus(s) {
    state.status = s;
    var card = document.getElementById("vz-guide-card");
    if (card) card.setAttribute("data-vz-status", s);
    var el = document.getElementById("vz-guide-status");
    if (el) {
      el.textContent =
        s === "listening" ? "Listening" : s === "speaking" ? "Speaking" : s === "thinking" ? "Thinking" : "Standby";
    }
  }

  function speak(text, onEnd) {
    interruptSpeech();
    pauseRec();
    state.speaking = true;
    state.lastSpoken = String(text || "");
    setStatus("speaking");
    var gen = player.gen;
    var ctrl = new AbortController();
    player.abort = ctrl;

    function done(ok) {
      if (gen !== player.gen) return;
      state.speaking = false;
      state.ignoreUntil = Date.now() + 800;
      if (!ok) {
        var note = document.getElementById("vz-guide-note");
        if (note) note.textContent = "Voice is unavailable — type a message below.";
      }
      if (state.open && !state.muted) {
        setStatus("listening");
        resumeRec();
      }
      if (onEnd) onEnd();
    }

    unlockAudio()
      .then(function () {
        if (gen !== player.gen) return;
        return fetch("/api/fish/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: text,
            sampleRate: Math.min(player.rate, PLAYBACK_RATE),
            voice: "hannah",
          }),
          signal: ctrl.signal,
        });
      })
      .then(function (res) {
        if (!res || !res.ok || !res.body) throw new Error("tts");
        player.sourceRate = Number(res.headers.get("X-Audio-Sample-Rate")) || 44100;
        player.srcHold = new Float32Array(0);
        player.srcFrac = 0;
        player.leftover = new Uint8Array(0);
        var reader = res.body.getReader();
        var got = false;
        function pump() {
          return reader.read().then(function (chunk) {
            if (gen !== player.gen) return;
            if (chunk.done) {
              if (player.leftover.length >= 2) {
                var last = decodeS16le(new Uint8Array(0), player.leftover);
                player.leftover = new Uint8Array(0);
                if (last.samples.length) enqueuePcm(resample(last.samples));
              }
              if (!got) throw new Error("empty");
              window.setTimeout(function waitIdle() {
                if (gen !== player.gen) return;
                if (player.sources.length || remainingMs() > 50) {
                  window.setTimeout(waitIdle, 120);
                  return;
                }
                window.setTimeout(function () { done(true); }, 700);
              }, remainingMs() + 80);
              return;
            }
            if (chunk.value && chunk.value.byteLength) {
              got = true;
              var decoded = decodeS16le(chunk.value.slice(), player.leftover);
              player.leftover = decoded.leftover;
              if (decoded.samples.length) enqueuePcm(resample(decoded.samples));
            }
            return pump();
          });
        }
        return pump();
      })
      .catch(function (err) {
        if (ctrl.signal.aborted || (err && err.name === "AbortError")) return;
        done(false);
      });
  }

  function interruptSpeech() {
    player.gen += 1;
    if (player.abort) {
      try { player.abort.abort(); } catch (_) {}
      player.abort = null;
    }
    stopSources();
    player.leftover = new Uint8Array(0);
    player.srcHold = new Float32Array(0);
    player.srcFrac = 0;
    player.sourceRate = player.rate;
    state.speaking = false;
  }

  function addLine(role, text) {
    var log = document.getElementById("vz-guide-log");
    if (!log) return;
    var p = document.createElement("p");
    p.className = "vz-line " + role;
    var who = document.createElement("span");
    who.className = "vz-who";
    who.textContent = role === "you" ? "You" : "Aria";
    var said = document.createElement("span");
    said.className = "vz-said";
    said.textContent = text;
    p.appendChild(who);
    p.appendChild(said);
    log.appendChild(p);
    log.scrollTop = log.scrollHeight;
  }

  function renderChips(list) {
    state.chips = list && list.length ? list : state.chips;
    var wrap = document.getElementById("vz-guide-chips");
    if (!wrap) return;
    wrap.innerHTML = "";
    (state.chips || []).forEach(function (c) {
      var b = document.createElement("button");
      b.type = "button";
      b.textContent = c.label;
      b.addEventListener("click", function () {
        goChip(c);
      });
      wrap.appendChild(b);
    });
  }

  function setShowWidget(on) {
    state.showWidget = !!on;
    document.documentElement.toggleAttribute("data-aria-show-widget", state.showWidget);
    var card = document.getElementById("vz-guide-card");
    if (card) card.classList.toggle("vz-dock-left", state.showWidget);
  }

  function focusContactForm() {
    var form =
      document.getElementById("demoForm") ||
      document.getElementById("contact-form") ||
      document.querySelector(".contact-form");
    var interest = document.querySelector("#demoForm select[name='interest']");
    if (interest) {
      for (var i = 0; i < interest.options.length; i++) {
        if (/full platform/i.test(interest.options[i].value || interest.options[i].textContent || "")) {
          interest.selectedIndex = i;
          break;
        }
      }
    }
    var msg = document.querySelector("#demoForm textarea[name='message']") || document.getElementById("message");
    if (msg && !String(msg.value || "").trim()) {
      msg.value = "I'd like a 30-minute walkthrough with an engineer.";
    }
    if (form) form.scrollIntoView({ behavior: "smooth", block: "start" });
    var name =
      document.querySelector("#demoForm input[name='first_name']") ||
      document.getElementById("name") ||
      document.querySelector(".contact-form input[type='text']");
    if (name) {
      try {
        name.focus({ preventScroll: true });
      } catch (_) {
        name.focus();
      }
    }
  }

  function openBookingWidget() {
    setShowWidget(true);
    var tries = 0;
    var tick = function () {
      var bubble = document.getElementById("aria-bubble");
      if (bubble) {
        var panel = document.getElementById("aria-panel");
        if (!panel || !panel.classList.contains("open")) {
          try {
            bubble.click();
          } catch (_) {}
        }
        return;
      }
      tries += 1;
      if (tries < 20) window.setTimeout(tick, 250);
    };
    window.setTimeout(tick, 400);
  }

  function scrollToHash(hash) {
    if (!hash || hash === "#") return;
    var id = String(hash).replace(/^#/, "");
    if (!id) return;
    window.setTimeout(function () {
      var el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 80);
  }

  function bindNav() {
    var nav = document.getElementById("nav");
    var toggle = document.getElementById("navToggle");
    var links = document.getElementById("navLinks");
    if (toggle && links) {
      toggle.onclick = function () {
        links.classList.toggle("open");
      };
    }
    if (nav) nav.classList.toggle("scrolled", window.scrollY > 20);
    if (!window.__adNavScroll) {
      window.__adNavScroll = true;
      window.addEventListener("scroll", function () {
        var n = document.getElementById("nav");
        if (n) n.classList.toggle("scrolled", window.scrollY > 20);
      });
    }
  }

  function bindReveal() {
    var nodes = document.querySelectorAll(".reveal");
    if (!nodes.length) return;
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) en.target.classList.add("visible");
        });
      },
      { threshold: 0, rootMargin: "0px 0px -40px 0px" }
    );
    nodes.forEach(function (el) {
      io.observe(el);
    });
  }

  function arrive(path, opts) {
    opts = opts || {};
    var dest = String(path || "");
    var book = !!(opts.widget || opts.form || /\/contact\/?$/.test(dest.replace(/https?:\/\/[^/]+/i, "")));
    if (book) {
      state.pendingBook = false;
      openBookingWidget();
      if (/\/contact/.test(location.pathname)) focusContactForm();
    } else {
      setShowWidget(false);
    }
    if (opts.hash) scrollToHash(opts.hash);
    persist();
  }

  function keepChrome(n) {
    if (!n || n.nodeType !== 1) return false;
    var id = n.id || "";
    if (/^vz-guide/.test(id) || /^aria-/.test(id)) return true;
    return false;
  }

  function applyPageStyles(doc) {
    var old = document.getElementById("vz-page-style");
    if (old) old.remove();
    var bits = [];
    doc.querySelectorAll("style").forEach(function (st) {
      bits.push(st.textContent || "");
    });
    if (!bits.length) return;
    var neu = document.createElement("style");
    neu.id = "vz-page-style";
    neu.textContent = bits.join("\n");
    document.head.appendChild(neu);
  }

  function replayPageScripts(doc) {
    var skip = /aria-guide|aria-widget|gtm|googletagmanager|gtag|clarity|nav\.js|analytics-events|footer-accordion|__vzBlocked|navToggle|getElementById\(['"]nav['"]\)/;
    doc.querySelectorAll("script").forEach(function (old) {
      var src = old.getAttribute("src") || "";
      var body = old.textContent || "";
      if (old.type === "application/ld+json") return;
      if (src && skip.test(src)) return;
      if (!src && skip.test(body)) return;
      if (!src && !body.trim()) return;
      var s = document.createElement("script");
      if (src) {
        s.src = src;
        s.defer = true;
        document.body.appendChild(s);
        return;
      }
      s.textContent = "(function(){\n" + body + "\n})();";
      document.body.appendChild(s);
      s.remove();
    });
  }

  function adoptEl(from, to) {
    if (!from || !to || !to.parentNode) return false;
    var neu = document.importNode(from, true);
    neu.querySelectorAll("script").forEach(function (s) {
      s.remove();
    });
    to.parentNode.replaceChild(neu, to);
    return true;
  }

  function swapBetween(curStart, curEnd, srcStart, srcEnd) {
    if (!curStart || !curEnd || !srcStart || !srcEnd) return false;
    var n = curStart.nextSibling;
    while (n && n !== curEnd) {
      var next = n.nextSibling;
      if (!keepChrome(n)) n.parentNode.removeChild(n);
      n = next;
    }
    var node = srcStart.nextSibling;
    while (node && node !== srcEnd) {
      var nxt = node.nextSibling;
      if (node.nodeType === 1 && (node.tagName === "SCRIPT" || keepChrome(node))) {
        node = nxt;
        continue;
      }
      curEnd.parentNode.insertBefore(document.importNode(node, true), curEnd);
      node = nxt;
    }
    return true;
  }

  function swapDocument(doc) {
    document.title = doc.title || document.title;
    var curNav = document.getElementById("nav") || document.querySelector("nav");
    var srcNav = doc.getElementById("nav") || doc.querySelector("nav");
    var curMain = document.getElementById("main") || document.querySelector("main");
    var srcMain = doc.getElementById("main") || doc.querySelector("main");
    var curFooter = document.querySelector("footer") || document.querySelector(".site-footer");
    var srcFooter = doc.querySelector("footer") || doc.querySelector(".site-footer");

    if (curNav && srcNav) {
      curNav.className = srcNav.className;
      curNav.innerHTML = srcNav.innerHTML;
    }

    var swapped = false;
    if (curMain && srcMain) {
      swapped = adoptEl(srcMain, curMain);
    } else {
      swapped = swapBetween(
        curNav || document.querySelector("header") || document.querySelector(".site-header"),
        curFooter,
        srcNav || doc.querySelector("header") || doc.querySelector(".site-header"),
        srcFooter
      );
    }
    if (!swapped) return false;

    if (curFooter && srcFooter) adoptEl(srcFooter, document.querySelector("footer") || document.querySelector(".site-footer"));

    applyPageStyles(doc);
    bindNav();
    bindReveal();
    replayPageScripts(doc);
    window.scrollTo(0, 0);
    return true;
  }

  function hardGo(abs, line, book) {
    state.pendingSpeak = line || (state.speaking ? state.lastSpoken : "") || "";
    state.pendingBook = !!book;
    state.showWidget = !!book;
    persist();
    var hash = abs.hash || (book ? "#contact-form" : "");
    location.href = abs.pathname + abs.search + hash;
  }

  function goTo(path, line, opts) {
    opts = opts || {};
    var dest = String(path || "");
    if (!dest) {
      if (line) speak(line);
      return;
    }
    var abs;
    try {
      abs = new URL(dest, location.href);
    } catch (_) {
      if (line) speak(line);
      return;
    }
    var book = !!(opts.widget || opts.form || /\/contact\/?$/.test(abs.pathname));
    if (abs.origin !== location.origin) {
      window.open(abs.href, "_blank", "noopener");
      if (line) speak(line);
      persist();
      return;
    }
    if (
      !opts.force &&
      abs.pathname.replace(/\/$/, "") === location.pathname.replace(/\/$/, "")
    ) {
      arrive(abs.pathname, { widget: book, form: book, hash: abs.hash });
      if (line && !state.speaking) speak(line);
      persist();
      return;
    }
    var href = abs.pathname + abs.search + (abs.hash || (book ? "#contact-form" : ""));
    if (state.navigating) return;
    state.navigating = true;
    fetch(abs.pathname + abs.search, { headers: { Accept: "text/html" } })
      .then(function (res) {
        if (!res.ok) throw new Error("nav");
        return res.text();
      })
      .then(function (html) {
        var doc = new DOMParser().parseFromString(html, "text/html");
        if (!swapDocument(doc)) throw new Error("swap");
        state.didSoftNav = true;
        if (opts.push !== false) history.pushState({ vzGuide: 1 }, "", href);
        arrive(abs.pathname, { widget: book, form: book, hash: abs.hash });
        if (line && !state.speaking) speak(line);
        persist();
        state.navigating = false;
      })
      .catch(function () {
        state.navigating = false;
        hardGo(abs, line, book);
      });
  }

  function goChip(c) {
    var line = chipNarration(c);
    state.turns.push({ role: "assistant", content: line });
    addLine("aria", line);
    persist();
    var book = /\/contact/.test((c && c.path) || "");
    goTo(c && c.path, line, book ? { widget: true, form: true } : {});
  }

  async function ask(text) {
    var t = String(text || "").trim();
    if (!t || state.asking) return;
    state.asking = true;
    interruptSpeech();
    pauseRec();
    state.turns.push({ role: "user", content: t });
    addLine("you", t);
    persist();
    setStatus("thinking");
    var reply = {
      text: "Aria is Voice AI plus marketing for dental practices — phone, chat, SMS, insurance, and recall. Tell me if you want the platform, the voices, or a walkthrough.",
      chips: DEFAULT_CHIPS.slice(),
    };
    try {
      var res = await fetch("/api/guide/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: state.turns.slice(-8),
          path: location.pathname,
        }),
      });
      if (res.ok) {
        var data = await res.json();
        if (data.text) reply = data;
      }
    } catch (_) {}
    state.turns.push({ role: "assistant", content: reply.text });
    addLine("aria", reply.text);
    renderChips(reply.chips);
    persist();
    state.asking = false;
    var dest = reply.go && reply.go.path;
    var book = !!(reply.go && (reply.go.widget || reply.go.form));
    if (DEMO_RE.test(t)) {
      dest = dest || "/contact";
      book = true;
    } else if (VOICES_RE.test(t)) {
      dest = dest || "/voices/";
    } else if (INDUSTRIES_RE.test(t)) {
      dest = dest || "/platform";
    } else if (!dest) {
      dest = topicPath(t);
    }
    if (dest) goTo(dest, reply.text, book || /\/contact/.test(dest) ? { widget: true, form: true } : {});
    else speak(reply.text);
  }

  function heard(said) {
    if (shouldIgnoreHeard(said)) return;
    ask(said);
  }

  function startRec() {
    if (state.muted || state.holdRec || !state.open) return;
    var Ctor = speechCtor();
    if (!Ctor) {
      var note = document.getElementById("vz-guide-note");
      if (note) note.textContent = "This browser can’t listen — type a message below.";
      return;
    }
    state.wantListen = true;
    if (state.rec) {
      try {
        state.rec.start();
      } catch (_) {}
      if (!state.speaking) setStatus("listening");
      return;
    }
    var rec = new Ctor();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = "en-US";
    rec.onresult = function (ev) {
      if (state.muted || state.speaking || state.holdRec || state.asking) return;
      if (player.sources.length || remainingMs() > 50) return;
      var last = ev.results[ev.results.length - 1];
      if (!last || !last.isFinal) return;
      var said = (last[0] && last[0].transcript ? last[0].transcript : "").trim();
      var conf = last[0] && last[0].confidence;
      if (typeof conf === "number" && conf > 0 && conf < 0.55) return;
      heard(said);
    };
    rec.onend = function () {
      if (state.holdRec || !state.wantListen || state.muted || !state.open) return;
      window.setTimeout(function () {
        if (state.holdRec || !state.wantListen || state.muted || !state.open) return;
        try {
          rec.start();
        } catch (_) {}
      }, 180);
    };
    rec.onerror = function (ev) {
      if (ev.error === "not-allowed") {
        var blocked = document.getElementById("vz-guide-note");
        if (blocked) blocked.textContent = "Microphone blocked — type instead, or allow mic and retry.";
        state.wantListen = false;
      }
    };
    state.rec = rec;
    try {
      rec.start();
      if (!state.speaking) setStatus("listening");
    } catch (_) {
      if (!state.speaking) setStatus("listening");
    }
  }

  function pauseRec() {
    state.holdRec = true;
    if (state.rec) {
      try {
        state.rec.abort();
      } catch (_) {
        try {
          state.rec.stop();
        } catch (__) {}
      }
    }
  }

  function resumeRec() {
    state.holdRec = false;
    if (!state.open || state.muted) return;
    state.wantListen = true;
    startRec();
  }

  function stopRec() {
    state.wantListen = false;
    state.holdRec = false;
    if (state.rec) {
      try {
        state.rec.abort();
      } catch (_) {
        try {
          state.rec.stop();
        } catch (__) {}
      }
    }
  }

  function holdMic(thenSpeak) {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      if (thenSpeak) thenSpeak();
      return;
    }
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then(function (stream) {
        stream.getTracks().forEach(function (t) {
          t.stop();
        });
        if (thenSpeak) thenSpeak();
      })
      .catch(function () {
        var n = document.getElementById("vz-guide-note");
        if (n) n.textContent = "Microphone blocked — type instead, or allow mic and retry.";
        if (thenSpeak) thenSpeak();
      });
  }

  function showCard() {
    state.open = true;
    setWidgetHidden(true);
    var card = document.getElementById("vz-guide-card");
    var fab = document.getElementById("vz-guide-fab");
    if (card) {
      card.hidden = false;
      if (!card.getAttribute("data-vz-status")) card.setAttribute("data-vz-status", "idle");
    }
    if (fab) fab.hidden = true;
  }

  function hangup() {
    state.open = false;
    state.muted = false;
    state.pendingSpeak = "";
    state.pendingBook = false;
    state.asking = false;
    setShowWidget(false);
    stopRec();
    interruptSpeech();
    setWidgetHidden(false);
    persist();
    var card = document.getElementById("vz-guide-card");
    var fab = document.getElementById("vz-guide-fab");
    if (card) card.hidden = true;
    if (fab) fab.hidden = false;
    setStatus("idle");
  }

  function paintLog() {
    var log = document.getElementById("vz-guide-log");
    if (log) log.innerHTML = "";
    (state.turns || []).forEach(function (turn) {
      addLine(turn.role === "user" ? "you" : "aria", turn.content);
    });
    renderChips(state.chips);
  }

  function restoreGuide(session) {
    unlockAudio();
    state.turns = Array.isArray(session.turns) && session.turns.length ? session.turns : [{ role: "assistant", content: GREETING }];
    state.chips = session.chips && session.chips.length ? session.chips : DEFAULT_CHIPS.slice();
    state.muted = !!session.muted;
    state.pendingSpeak = "";
    state.pendingBook = !!session.pendingBook;
    showCard();
    var note = document.getElementById("vz-guide-note");
    if (note) note.textContent = "";
    paintLog();
    persist();
    var pending = session.pendingSpeak || "";
    if (session.pendingBook || session.showWidget) {
      arrive("/contact", { widget: true, form: true });
    }
    holdMic(function () {
      if (pending) speak(pending);
      else if (!state.muted) resumeRec();
    });
  }

  function openGuide() {
    if (state.open) return;
    unlockAudio();
    state.turns = [{ role: "assistant", content: GREETING }];
    state.chips = DEFAULT_CHIPS.slice();
    state.muted = false;
    state.pendingSpeak = "";
    state.pendingBook = false;
    setShowWidget(false);
    showCard();
    var note = document.getElementById("vz-guide-note");
    if (note) note.textContent = "";
    paintLog();
    persist();
    holdMic(function () {
      speak(GREETING);
    });
  }

  function ensureWidget() {
    if (state.open) return;
    if (document.getElementById("aria-bubble") || document.getElementById("aria-wrap") || document.getElementById("aria-root")) return;
    if (document.querySelector("script[src*='aria-widget.js']")) return;
    if (window.AriaDentalWidgetBrand) window.AriaDentalWidgetBrand.install();
    var s = document.createElement("script");
    s.src = WIDGET_SRC;
    s.setAttribute("data-client", WIDGET_CLIENT);
    document.body.appendChild(s);
  }

  function mount() {
    injectStyles();
    var fab = document.createElement("button");
    fab.id = "vz-guide-fab";
    fab.type = "button";
    fab.innerHTML =
      '<span class="vz-mic">' +
      micSvg() +
      '</span><span class="vz-fab-wave" aria-hidden="true">' +
      waveBars(5) +
      "</span><span>Talk to Aria</span>";
    fab.addEventListener("click", openGuide);

    var card = document.createElement("div");
    card.id = "vz-guide-card";
    card.hidden = true;
    card.setAttribute("data-vz-status", "idle");
    card.innerHTML =
      '<div class="vz-shell">' +
      "<header>" +
      '<a class="vz-logo" href="/" aria-label="Aria">aria</a>' +
      '<div class="vz-head-meta">' +
      '<p class="vz-kicker">Aria Dental</p>' +
      "</div>" +
      '<span class="vz-live"><span class="vz-live-dot" aria-hidden="true"></span>Live</span>' +
      '<button type="button" id="vz-guide-mute" aria-label="Mute">' +
      micSvg() +
      "</button>" +
      '<button type="button" id="vz-guide-close" aria-label="Close">×</button>' +
      "</header>" +
      '<div id="vz-guide-stage">' +
      '<span class="vz-ring" aria-hidden="true"></span>' +
      '<span class="vz-ring inner" aria-hidden="true"></span>' +
      '<div id="vz-guide-wave" aria-hidden="true">' +
      waveBars(28) +
      "</div>" +
      '<div id="vz-guide-status">Standby</div>' +
      "</div>" +
      '<div id="vz-guide-log"></div>' +
      '<div id="vz-guide-note"></div>' +
      '<div id="vz-guide-chips"></div>' +
      '<form id="vz-guide-form">' +
      '<input id="vz-guide-input" placeholder="Type a message" autocomplete="off">' +
      "<button type=\"submit\">Send</button>" +
      "</form>" +
      '<button type="button" id="vz-guide-end">End</button>' +
      "</div>";

    document.body.appendChild(fab);
    document.body.appendChild(card);

    document.getElementById("vz-guide-close").addEventListener("click", hangup);
    document.getElementById("vz-guide-end").addEventListener("click", hangup);
    document.getElementById("vz-guide-mute").addEventListener("click", function () {
      state.muted = !state.muted;
      persist();
      if (state.muted) {
        stopRec();
        interruptSpeech();
        this.setAttribute("aria-label", "Unmute");
      } else {
        resumeRec();
        this.setAttribute("aria-label", "Mute");
      }
    });
    document.getElementById("vz-guide-form").addEventListener("submit", function (e) {
      e.preventDefault();
      var inp = document.getElementById("vz-guide-input");
      var v = inp.value;
      inp.value = "";
      var t = String(v || "").trim();
      if (!t) return;
      state.ignoreUntil = 0;
      ask(t);
    });

    document.addEventListener(
      "click",
      function (e) {
        var openBtn = e.target.closest("[data-aria-guide-open]");
        if (openBtn) {
          e.preventDefault();
          openGuide();
          return;
        }
        if (!state.open) return;
        if (e.target.closest("#vz-guide-card") || e.target.closest("#vz-guide-fab")) return;
        var a = e.target.closest("a[href]");
        if (!a || a.target === "_blank" || a.hasAttribute("download")) return;
        var raw = a.getAttribute("href") || "";
        if (!raw || raw.charAt(0) === "#" || /^(mailto|tel|javascript):/i.test(raw)) return;
        var abs;
        try {
          abs = new URL(a.href, location.href);
        } catch (_) {
          return;
        }
        if (abs.origin !== location.origin) return;
        e.preventDefault();
        goTo(abs.pathname + abs.search + abs.hash, "", {});
      },
      true
    );

    window.addEventListener("popstate", function () {
      if (!state.didSoftNav) return;
      goTo(location.pathname + location.search + location.hash, "", { push: false, force: true });
    });

    window.openAriaGuide = openGuide;
    window.addEventListener("pagehide", persist);
    window.addEventListener("beforeunload", persist);
    watchWidgetBrand();

    var session = readSession();
    if (session && session.open) {
      restoreGuide(session);
    } else {
      setWidgetHidden(false);
      window.setTimeout(ensureWidget, 2500);
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount);
  else mount();
})();
