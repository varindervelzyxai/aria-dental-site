/**
 * Shared Fish Audio TTS + OpenAI guide-chat handlers.
 * Used by Vercel (/api) and Netlify functions.
 *
 * Env:
 *   FISH_API_KEY or FISH_AUDIO_API_KEY
 *   FISH_HANNAH_VOICE_ID (default: official Hannah)
 *   NETLIFY_AI_GATEWAY_KEY + NETLIFY_AI_GATEWAY_BASE_URL (injected at runtime)
 *   or OPENAI_API_KEY + OPENAI_BASE_URL
 *   OPENAI_MODEL (default gpt-4o-mini)
 */

const HANNAH_ID = "9a9cf47702da476aa4629e2506d4a857";
const FISH_TTS = "https://api.fish.audio/v1/tts";
const OPENAI_URL = "https://api.openai.com/v1/chat/completions";
const VELZYX_TTS_FALLBACK = "https://velzyx.ai/api/fish/tts";

const CHIPS = {
  platform: { label: "Platform", path: "/platform" },
  voices: { label: "Voices", path: "/voices/" },
  how: { label: "How it works", path: "/how-it-works" },
  marketing: { label: "Marketing", path: "/marketing" },
  demo: { label: "Book a demo", path: "/contact" },
  insurance: { label: "Insurance", path: "/dental-insurance-verification-ai" },
  configure: { label: "Build Aria", path: "/configure/" },
  integrations: { label: "Integrations", path: "/integrations" },
  security: { label: "Security", path: "/security" },
  compare: { label: "Compare", path: "/compare" },
  demos: { label: "Demos", path: "/demos" },
  clone: { label: "Clone voice", path: "/clone/" },
  about: { label: "About", path: "/about" },
};

function goPayload(path, book) {
  var go = { path: path };
  if (book) {
    go.widget = true;
    go.form = true;
  }
  return go;
}

function spoken(text, chips, path, book) {
  var out = { text: text, chips: chips };
  if (path) out.go = goPayload(path, book);
  return out;
}

const SYSTEM_PROMPT = `You are Aria, the live voice guide on ariadental.ai — Voice AI and marketing for dental practices, a product of Velzyx AI Inc. (Newport Beach). Visitors are dental practice OWNERS and office managers, not patients booking a cleaning.

Speak like a calm, sharp front-desk coordinator. Short paragraphs. No markdown. No bullet lists. 2–3 sentences. No fake case studies or invented practice names.

WHO WE ARE
- Product: Aria — AI dental receptionist (voice, chat, SMS) plus websites, SEO, and ads.
- Parent: Velzyx AI Inc. Email: AriaDental@Velzyx.ai or info@velzyx.ai
- Sister: Aria Medspa (ariamedspa.ai). Same company, med spa vertical.
- Founder: Varinder Kumar.

WHAT ARIA DOES
- Answers the practice line 24/7, books appointments, verifies insurance live (3,400+ payers), can collect payment, writes into the calendar / Open Dental (Dentrix and Eaglesoft on the roadmap).
- After-hours, overflow, and outbound recall campaigns (one-click calls to overdue hygiene patients).
- Chat widget on the practice website. SMS reminders, intake, reviews, recall.
- 100+ languages. Or clone the doctor's voice from a ~60-second sample.
- HIPAA: production Voice AI is deployed under a BAA.

MARKETING
- Custom-coded dental websites, local SEO, Google/Meta ads with call tracking, Google Business Profile. Ranking is wasted if voicemail answers.

PRICING
- NEVER quote a monthly price. NEVER say $500, $800, or any public rate card.
- Price is scoped on a 30-minute walkthrough against their volume.

NAVIGATION
You walk them through the site the way a product tour would. Always set go.path to the page that matches the topic they just asked about:
- /platform — product, capabilities, what Aria does
- /voices/ — voices, how she sounds, languages
- /clone/ — clone the doctor's voice
- /how-it-works — setup, go-live, onboarding
- /marketing — websites, SEO, ads
- /dental-insurance-verification-ai — insurance, eligibility, payers
- /integrations — Open Dental, Dentrix, Eaglesoft, PMS
- /security — HIPAA, BAA, compliance
- /configure/ — build / configure your Aria
- /demos — recorded call demos
- /compare — vs other receptionists
- /about — company, Velzyx, founder
- /contact — demo, walkthrough, talk to a human, pricing. Set widget:true and form:true.

If they are already on the right page, still return that same path. Stay put (omit go, or use the current path) only for small talk with no topic.

If they say stop, hang up, never mind, that's all, or end — one short closing sentence. Do not recap the product.

GOAL
Answer the question they asked. Then, when natural, offer a 30-minute walkthrough.

Return JSON only:
{"text":"your spoken reply","chips":[{"label":"...","path":"/..."}],"go":{"path":"/platform","widget":false,"form":false}}
Use chips from: Platform /platform, Voices /voices/, How it works /how-it-works, Marketing /marketing, Book a demo /contact, Insurance /dental-insurance-verification-ai, Build Aria /configure/.
If they want a demo or to talk to a human, go.path must be /contact with widget:true and form:true.`;

function json(status, obj, extraHeaders) {
  return {
    status,
    headers: Object.assign(
      { "Content-Type": "application/json", "Cache-Control": "no-store" },
      extraHeaders || {}
    ),
    body: JSON.stringify(obj),
    isBase64: false,
  };
}

function envGet(name) {
  try {
    if (typeof Netlify !== "undefined" && Netlify.env && typeof Netlify.env.get === "function") {
      var v = Netlify.env.get(name);
      if (v != null && String(v) !== "") return String(v);
    }
  } catch (_) {}
  return process.env[name] || "";
}

function fishKey() {
  return envGet("FISH_API_KEY") || envGet("FISH_AUDIO_API_KEY") || "";
}

function hannahId() {
  return envGet("FISH_HANNAH_VOICE_ID") || HANNAH_ID;
}

function looksFakeSecret(v) {
  var s = String(v || "");
  return !s || /^\*+/.test(s) || s.indexOf("****************") === 0;
}

function isOwnOpenAiKey(v) {
  var s = String(v || "");
  return !looksFakeSecret(s) && /^sk-/.test(s);
}

function keyPresence() {
  var names = Object.keys(process.env || {}).filter(function (n) {
    return /OPENAI|ANTHROPIC|GEMINI|OPENROUTER|GATEWAY|NETLIFY_AI|^AI_/i.test(n);
  }).sort();
  return {
    gatewayKey: !looksFakeSecret(envGet("NETLIFY_AI_GATEWAY_KEY")),
    openaiKey: !looksFakeSecret(envGet("OPENAI_API_KEY")),
    gatewayBase: !!envGet("NETLIFY_AI_GATEWAY_BASE_URL"),
    openaiBase: !!envGet("OPENAI_BASE_URL"),
    netlifyEnv: typeof Netlify !== "undefined" && !!(Netlify.env && Netlify.env.get),
    names: names,
  };
}

function openaiKey() {
  var own = envGet("OPENAI_API_KEY");
  if (isOwnOpenAiKey(own)) return own;
  var k = envGet("NETLIFY_AI_GATEWAY_KEY");
  return looksFakeSecret(k) ? "" : k;
}

function openaiModel() {
  var m = envGet("OPENAI_MODEL");
  if (looksFakeSecret(m) || (m && m.length < 6)) return "gpt-4o-mini";
  return m || "gpt-4o-mini";
}

function openaiUrl() {
  if (isOwnOpenAiKey(envGet("OPENAI_API_KEY"))) {
    var ownBase = envGet("OPENAI_BASE_URL");
    if (!ownBase || looksFakeSecret(ownBase) || /netlify/i.test(ownBase)) {
      return "https://api.openai.com/v1/chat/completions";
    }
    ownBase = String(ownBase).replace(/\/$/, "");
    if (/\/chat\/completions$/.test(ownBase)) return ownBase;
    if (/\/v1$/.test(ownBase)) return ownBase + "/chat/completions";
    return ownBase + "/v1/chat/completions";
  }
  var base = envGet("NETLIFY_AI_GATEWAY_BASE_URL") || envGet("OPENAI_BASE_URL") || "https://api.openai.com/v1";
  base = String(base).replace(/\/$/, "");
  if (/\/chat\/completions$/.test(base)) return base;
  if (/\/v1$/.test(base)) return base + "/chat/completions";
  return base + "/v1/chat/completions";
}

async function proxyVelzyxTts(text, sampleRate) {
  const res = await fetch(VELZYX_TTS_FALLBACK, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: text, sampleRate: sampleRate, voice: "hannah" }),
  });
  if (!res.ok) {
    const errText = await res.text().catch(function () { return ""; });
    throw new Error("fallback tts " + res.status + " " + errText.slice(0, 180));
  }
  const buf = Buffer.from(await res.arrayBuffer());
  return {
    status: 200,
    headers: {
      "Content-Type": "application/octet-stream",
      "Cache-Control": "no-store",
      "X-Audio-Encoding": res.headers.get("x-audio-encoding") || "pcm_s16le",
      "X-Audio-Sample-Rate": res.headers.get("x-audio-sample-rate") || String(sampleRate || 44100),
      "X-Fish-Voice": "hannah",
    },
    body: buf,
    isBase64: true,
  };
}

async function handleFishTts(payload) {
  const text = String((payload && payload.text) || "").trim();
  if (!text) return json(400, { error: "text required" });
  const clipped = text.slice(0, 1200);
  const sampleRate = Math.min(Number(payload.sampleRate) || 44100, 44100);
  const key = fishKey();

  if (!key) {
    try {
      return await proxyVelzyxTts(clipped, sampleRate);
    } catch (e) {
      return json(503, { error: "tts unavailable", detail: String(e.message || e) });
    }
  }

  const res = await fetch(FISH_TTS, {
    method: "POST",
    headers: {
      Authorization: "Bearer " + key,
      "Content-Type": "application/json",
      model: envGet("FISH_TTS_MODEL") || envGet("FISH_AUDIO_MODEL") || "s2-pro",
    },
    body: JSON.stringify({
      text: clipped,
      reference_id: hannahId(),
      format: "pcm",
      sample_rate: sampleRate,
      latency: "balanced",
      normalize: true,
    }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(function () { return ""; });
    try {
      return await proxyVelzyxTts(clipped, sampleRate);
    } catch (_) {
      return json(res.status, { error: "fish tts failed", detail: errText.slice(0, 240) });
    }
  }

  const buf = Buffer.from(await res.arrayBuffer());
  return {
    status: 200,
    headers: {
      "Content-Type": "application/octet-stream",
      "Cache-Control": "no-store",
      "X-Audio-Encoding": "pcm_s16le",
      "X-Audio-Sample-Rate": String(sampleRate),
      "X-Fish-Voice": "hannah",
    },
    body: buf,
    isBase64: true,
  };
}

function knowledgeReply(messages, path) {
  const last = (messages || []).filter(function (m) { return m && m.role === "user"; }).pop();
  const t = String((last && last.content) || "").toLowerCase();
  const here = String(path || "");

  if (/^(stop|stop talking|hang up|end( it| this| call)?|that's all|thats all|never mind|nevermind|goodbye|good bye|cancel)$/.test(t.trim())) {
    return spoken(
      "Okay — I'll stop here. Tap Talk to Aria whenever you want to pick it back up.",
      [CHIPS.platform, CHIPS.demo]
    );
  }
  if (/\b((book|schedule|set up|want) (a |me (a )?)?(demo|call|meeting|walkthrough)|a demo|the demo|on the calendar|talk to (an? )?(engineer|human|founder)|contact (form|page|us)|sign me up)\b/.test(t)) {
    return spoken(
      "I can take you to contact — fill the form, or use the chat on the right to hold a thirty-minute walkthrough. A founder replies within a day.",
      [CHIPS.demo],
      "/contact",
      true
    );
  }
  if (/\b(clone (my |our |your )?voice)\b/.test(t)) {
    return spoken(
      "Sixty seconds of your voice and Aria sounds like you on every callback and recall. I will open the clone page — leave a sample and we take it from there.",
      [CHIPS.clone, CHIPS.demo],
      "/clone/"
    );
  }
  if (/\b(voices?|voice (library|page|catalog|options|list)|how (does|do) (she|aria|it) sound|multilingual|spanish|español|hindi|chinese|mandarin)\b/.test(t)) {
    return spoken(
      "The library is seventeen production voices across English, Spanish, Chinese, and Hindi — or we clone yours from a sixty-second sample. I am taking you to the voices page.",
      [CHIPS.voices, CHIPS.demo],
      "/voices/"
    );
  }
  if (/insurance|eligib|payer|delta dental|ppo/.test(t)) {
    return spoken(
      "Aria verifies coverage on the call — member ID, remaining benefits, out-of-pocket — across thirty-four hundred payers, including dependents. That is the piece generic receptionists skip.",
      [CHIPS.insurance, CHIPS.demo],
      "/dental-insurance-verification-ai"
    );
  }
  if (/price|cost|how much|monthly|subscription|rate card/.test(t)) {
    return spoken(
      "We do not publish a rate card. Pricing is scoped on a thirty-minute walkthrough against your call volume and locations. I can hold that on the calendar.",
      [CHIPS.demo, CHIPS.platform],
      "/contact",
      true
    );
  }
  if (/market|seo|website|google ads|paid ads|local seo/.test(t)) {
    return spoken(
      "We build the site, local SEO, and ads so ranking does not hit voicemail. Voice AI answers whatever that marketing produces — including nine pm on a phone.",
      [CHIPS.marketing, CHIPS.demo],
      "/marketing"
    );
  }
  if (/\b(build (my |your |an )?aria|configur|customize|pick the voice)\b/.test(t)) {
    return spoken(
      "The builder lets you pick a voice and set booking rules in about ninety seconds. I will open it — then we can book a walkthrough when you want it live.",
      [CHIPS.configure, CHIPS.demo],
      "/configure/"
    );
  }
  if (/\b(integrat|opendental|open dental|dentrix|eaglesoft|pms|practice management)\b/.test(t)) {
    return spoken(
      "Open Dental write-back is live. Dentrix and Eaglesoft are on the roadmap. Google Calendar is the fallback when there is no PMS.",
      [CHIPS.integrations, CHIPS.demo],
      "/integrations"
    );
  }
  if (/\b(hipaa|baa|security|compliance|privacy)\b/.test(t)) {
    return spoken(
      "Production Voice AI ships under a BAA. Access is scoped, calls are logged, and we do not train public models on your patients.",
      [CHIPS.security, CHIPS.demo],
      "/security"
    );
  }
  if (/how (does |do )?(it|this|you|the system|aria|the platform) work|setup|deploy|go live|onboard/.test(t)) {
    return spoken(
      "Typical single-location practices are live in about a week: discovery, voice and rules, calendar or Open Dental write-back, then a dry run on your real schedule.",
      [CHIPS.how, CHIPS.demo],
      "/how-it-works"
    );
  }
  if (/\bcompar|versus|\bvs\.?\b|arini|dentina|weave|rondah\b/.test(t)) {
    return spoken(
      "This is how Aria stacks against the other dental receptionists — live insurance and marketing in the same stack is the usual gap.",
      [CHIPS.compare, CHIPS.demo],
      "/compare"
    );
  }
  if (/\b(demo recordings?|listen to (a |the )?call|sample call)\b/.test(t)) {
    return spoken(
      "These are recorded calls. Press play and you will hear Aria book, verify, or recall the way a front desk would.",
      [CHIPS.demos, CHIPS.demo],
      "/demos"
    );
  }
  if (/\b(platform|product|what (does|do) aria do|capabilities|features)\b/.test(t)) {
    return spoken(
      "This is the platform — voice, chat, SMS, live insurance, payments, and recall in one front office. Tell me which piece you want first.",
      [CHIPS.platform, CHIPS.demo],
      "/platform"
    );
  }
  if (/\babout (aria|velzyx|the (company|firm|team)|who (are|is) (you|varinder))\b/.test(t)) {
    return spoken(
      "Aria is a product of Velzyx AI Inc. in Newport Beach, founded by Varinder Kumar. Same engineering team as the med spa sister brand.",
      [CHIPS.about, CHIPS.demo],
      "/about"
    );
  }
  if (/voices/.test(here)) {
    return spoken(
      "These are the production voices. Tap a card to hear one. If you want Aria to sound like you, we clone from a sixty-second sample.",
      [CHIPS.voices, CHIPS.clone, CHIPS.demo]
    );
  }
  return {
    text: "Aria is Voice AI plus marketing for dental practices — phone, chat, SMS, live insurance, and recall. Tell me if you want the platform, the voices, or a thirty-minute walkthrough.",
    chips: [CHIPS.platform, CHIPS.voices, CHIPS.demo],
    brain: "knowledge",
  };
}

function extractJson(raw) {
  const s = String(raw || "").trim();
  if (!s) return null;
  try {
    return JSON.parse(s);
  } catch (_) {}
  const start = s.indexOf("{");
  const end = s.lastIndexOf("}");
  if (start >= 0 && end > start) {
    try {
      return JSON.parse(s.slice(start, end + 1));
    } catch (_) {}
  }
  return null;
}

async function handleGuideChat(payload) {
  const messages = Array.isArray(payload && payload.messages) ? payload.messages.slice(-8) : [];
  const path = String((payload && payload.path) || "/");
  const fallback = knowledgeReply(messages, path);
  const key = openaiKey();
  if (!key) {
    fallback.brain = "knowledge";
    fallback.reason = "no_openai_key";
    fallback.env = keyPresence();
    return json(200, fallback);
  }

  const openaiMessages = [{ role: "system", content: SYSTEM_PROMPT }].concat(
    messages.map(function (m) {
      return { role: m.role === "assistant" ? "assistant" : "user", content: String(m.content || "").slice(0, 2000) };
    })
  );

  async function complete(model, useJson) {
    var body = {
      model: model,
      temperature: 0.6,
      max_tokens: 420,
      messages: openaiMessages,
    };
    if (useJson) body.response_format = { type: "json_object" };
    return fetch(openaiUrl(), {
      method: "POST",
      headers: {
        Authorization: "Bearer " + key,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
  }

  try {
    var model = openaiModel();
    var res = await complete(model, true);
    if (!res.ok) {
      res = await complete(model, false);
    }
    if (!res.ok && model !== "gpt-4o-mini") {
      res = await complete("gpt-4o-mini", true);
      if (res.ok) model = "gpt-4o-mini";
    }
    if (!res.ok) {
      var errText = await res.text().catch(function () { return ""; });
      fallback.brain = "knowledge";
      fallback.reason = "openai_http_" + res.status;
      fallback.detail = String(errText || "").replace(/sk-[a-zA-Z0-9_-]+/g, "[redacted]").slice(0, 180);
      fallback.env = keyPresence();
      return json(200, fallback);
    }
    const data = await res.json();
    const raw = data && data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;
    const parsed = extractJson(raw);
    const text = parsed && parsed.text ? String(parsed.text).trim() : String(raw || "").trim();
    const chips =
      parsed && Array.isArray(parsed.chips) && parsed.chips.length
        ? parsed.chips.slice(0, 5).map(function (c) {
            return { label: String(c.label || "More").slice(0, 32), path: String(c.path || "/contact") };
          })
        : fallback.chips;
    var lastUser = (messages || []).filter(function (m) { return m && m.role === "user"; }).pop();
    var lastText = String((lastUser && lastUser.content) || "").trim().toLowerCase();
    var ending = /^(stop|stop talking|hang up|end( it| this| call)?|that's all|thats all|never mind|nevermind|goodbye|good bye|cancel)$/.test(lastText);
    var go = ending ? undefined : fallback.go;
    if (!ending && parsed && parsed.go && parsed.go.path) {
      var goPath = String(parsed.go.path).slice(0, 160);
      go = {
        path: goPath,
        widget: !!(parsed.go.widget || parsed.go.form || /\/contact/.test(goPath)),
        form: !!(parsed.go.form || parsed.go.widget || /\/contact/.test(goPath)),
      };
    }
    return json(200, {
      text: text || fallback.text,
      chips: chips,
      go: go,
      brain: "openai",
      model: model,
    });
  } catch (e) {
    fallback.brain = "knowledge";
    fallback.reason = "openai_error";
    fallback.detail = String(e.message || e).slice(0, 180);
    return json(200, fallback);
  }
}

function readJsonBody(reqOrEvent) {
  if (!reqOrEvent) return {};
  if (typeof reqOrEvent.body === "string") {
    try {
      return JSON.parse(reqOrEvent.body || "{}");
    } catch (_) {
      return {};
    }
  }
  if (reqOrEvent.body && typeof reqOrEvent.body === "object") return reqOrEvent.body;
  return {};
}

function applyVercel(res, result) {
  res.statusCode = result.status;
  Object.keys(result.headers || {}).forEach(function (k) {
    res.setHeader(k, result.headers[k]);
  });
  if (result.isBase64 && Buffer.isBuffer(result.body)) {
    res.end(result.body);
    return;
  }
  res.end(typeof result.body === "string" ? result.body : JSON.stringify(result.body));
}

function toNetlify(result) {
  const out = {
    statusCode: result.status,
    headers: result.headers,
  };
  if (result.isBase64 && Buffer.isBuffer(result.body)) {
    out.isBase64Encoded = true;
    out.body = result.body.toString("base64");
  } else {
    out.body = typeof result.body === "string" ? result.body : JSON.stringify(result.body);
  }
  return out;
}

module.exports = {
  handleFishTts,
  handleGuideChat,
  readJsonBody,
  applyVercel,
  toNetlify,
};
