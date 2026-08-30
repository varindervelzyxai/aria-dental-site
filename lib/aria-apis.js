/**
 * Shared Fish Audio TTS + OpenAI guide-chat handlers.
 * Used by Vercel (/api) and Netlify functions.
 *
 * Env:
 *   FISH_API_KEY or FISH_AUDIO_API_KEY
 *   FISH_HANNAH_VOICE_ID (default: official Hannah)
 *   OPENAI_API_KEY
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
};

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

GOAL
Answer the question they asked. Then, when natural, offer a 30-minute walkthrough. Collect name, practice, city, PMS (Open Dental / Dentrix / Eaglesoft / none), email or phone.

Return JSON only: {"text":"your spoken reply","chips":[{"label":"...","path":"/..."}]}
Use chips from: Platform /platform, Voices /voices/, How it works /how-it-works, Marketing /marketing, Book a demo /contact, Insurance /dental-insurance-verification-ai.
If they want a demo or to talk to a human, include a chip to /contact.`;

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

function fishKey() {
  return process.env.FISH_API_KEY || process.env.FISH_AUDIO_API_KEY || "";
}

function hannahId() {
  return process.env.FISH_HANNAH_VOICE_ID || HANNAH_ID;
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
      model: process.env.FISH_TTS_MODEL || "s2-pro",
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
  if (/voice|speak|sound|clone|multilingual|spanish|español|hindi|chinese|mandarin/.test(t)) {
    return {
      text: "The library is seventeen production voices across English, Spanish, Chinese, and Hindi — or we clone yours from a sixty-second sample. I can take you to the voices page.",
      chips: [CHIPS.voices, CHIPS.demo],
    };
  }
  if (/insurance|eligib|payer|delta dental|ppo/.test(t)) {
    return {
      text: "Aria verifies coverage on the call — member ID, remaining benefits, out-of-pocket — across thirty-four hundred payers, including dependents. That is the piece generic receptionists skip.",
      chips: [CHIPS.insurance, CHIPS.demo],
    };
  }
  if (/price|cost|how much|monthly|subscription/.test(t)) {
    return {
      text: "We do not publish a rate card. Pricing is scoped on a thirty-minute walkthrough against your call volume and locations. I can hold that on the calendar.",
      chips: [CHIPS.demo, CHIPS.platform],
    };
  }
  if (/market|seo|website|ads|google/.test(t)) {
    return {
      text: "We build the site, local SEO, and ads so ranking does not hit voicemail. Voice AI answers whatever that marketing produces — including nine pm on a phone.",
      chips: [CHIPS.marketing, CHIPS.demo],
    };
  }
  if (/how (it|this|you) work|setup|deploy|go live|opendental|dentrix|eaglesoft|pms/.test(t)) {
    return {
      text: "Typical single-location practices are live in about a week: discovery, voice and rules, calendar or Open Dental write-back, then a dry run on your real schedule. Dentrix and Eaglesoft are on the roadmap.",
      chips: [CHIPS.how, CHIPS.demo],
    };
  }
  if (/demo|walkthrough|book|talk to (a |an )?(human|founder|engineer)|contact/.test(t)) {
    return {
      text: "I can take you to contact — fill the form, or use the chat on the right to hold a thirty-minute walkthrough. A founder replies within a day.",
      chips: [CHIPS.demo],
    };
  }
  if (/path/.test(String(path || "")) && /voices/.test(String(path))) {
    return {
      text: "These are the production voices. Tap a card to hear one. If you want Aria to sound like you, we clone from a sixty-second sample.",
      chips: [CHIPS.voices, CHIPS.demo],
    };
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
  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    fallback.brain = "knowledge";
    return json(200, fallback);
  }

  const openaiMessages = [{ role: "system", content: SYSTEM_PROMPT }].concat(
    messages.map(function (m) {
      return { role: m.role === "assistant" ? "assistant" : "user", content: String(m.content || "").slice(0, 2000) };
    })
  );

  try {
    const res = await fetch(OPENAI_URL, {
      method: "POST",
      headers: {
        Authorization: "Bearer " + key,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        temperature: 0.6,
        max_tokens: 420,
        response_format: { type: "json_object" },
        messages: openaiMessages,
      }),
    });
    if (!res.ok) {
      fallback.brain = "knowledge";
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
    return json(200, {
      text: text || fallback.text,
      chips: chips,
      brain: "openai",
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
    });
  } catch (e) {
    fallback.brain = "knowledge";
    fallback.detail = String(e.message || e);
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
