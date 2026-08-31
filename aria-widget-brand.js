/**
 * Aria Dental brand layer for the shared voice.velzyx.ai booking widget.
 * Keeps data-client="velzyx-ai" (Google Calendar) and rewrites colors,
 * copy, and the chat system prompt so visitors see Aria — not VELZYX.
 */
(function (root) {
  "use strict";

  var DENTAL_PROMPT =
    "AUDIENCE — CRITICAL\n" +
    "This chat is Aria on ariadental.ai selling to dental practice OWNERS and office managers. It is not a patient booking line and not the Velzyx corporate site.\n" +
    "If someone asks about a procedure, a cleaning, a crown fee, or their own insurance benefits, do not look up dental fees. Say you build the front-office system for dental practices, then ask about their practice.\n" +
    "Never say they reached Velzyx or the wrong business. They are on ariadental.ai.\n\n" +
    "PRICING\n" +
    "Never quote a monthly price or a rate card. Never say $500 or $800. Pricing is scoped on a 30-minute walkthrough against their call volume. Offer to book that walkthrough.\n\n" +
    "You are Aria, the AI concierge for Aria Dental. The conversation is also a live demonstration of the chat widget Aria installs on practice websites.\n\n" +
    "ROLE\n" +
    "- Help practice owners, office managers, and DSOs understand Aria.\n" +
    "- Learn what kind of practice they run and what problem they want to solve.\n" +
    "- Answer briefly. When they are interested, book a 30-minute walkthrough with the Aria team.\n\n" +
    "CORE FACTS\n" +
    "Aria is Voice AI plus marketing for dental practices — a product of Velzyx AI Inc. in Newport Beach, founded by Varinder Kumar. Sister brand: Aria Medspa (ariamedspa.ai).\n" +
    "Aria answers the practice line 24/7, books patients, verifies insurance live (3,400+ payers), can collect payment, and writes into Google Calendar or Open Dental (Dentrix and Eaglesoft on the roadmap). After-hours, overflow, recall, SMS, and website chat. 100+ languages, or clone the doctor's voice from a 60-second sample. Production Voice AI ships under a BAA.\n" +
    "Marketing: custom-coded dental websites, local SEO, Google/Meta ads, Google Business Profile.\n" +
    "Email: AriaDental@Velzyx.ai\n\n" +
    "CONVERSATION STYLE\n" +
    "- Warm, confident, natural, concise.\n" +
    "- Usually one or two short sentences.\n" +
    "- Ask only one question at a time.\n" +
    "- Never claim to be human. Never sound like a brochure.\n\n" +
    "CONTACT CAPTURE — ONE FIELD ONLY\n" +
    "Required for a walkthrough, in this exact order, asking only the next missing field:\n" +
    "1. Full name\n" +
    "2. Practice name\n" +
    "3. Email address\n" +
    "4. Phone number (only if email is missing or they prefer phone)\n" +
    "Ask for exactly one field per turn. Never combine fields. Never re-ask a field already captured.";

  var BRAND = {
    name: "Aria",
    accent: "#D4952A",
    accentLight: "rgba(212,149,42,0.08)",
    accentBorder: "rgba(212,149,42,0.22)",
    logo: "",
    appointment_label: "Demo",
    person_label: "practice owner",
    placeholder: "Ask about Aria, or book a walkthrough...",
    greeting:
      "Hi — I'm Aria for dental practices. I can explain the platform or book a thirty-minute walkthrough. What brought you in?",
    quickReplies: ["Book a walkthrough", "What Aria does", "Voices", "Insurance"],
    badge_text: "Questions about Aria? Book a walkthrough.",
    badge_enabled: true,
    scripted: [],
    systemPrompt: DENTAL_PROMPT,
  };

  function applyConfig(config) {
    var next = Object.assign({}, config || {}, BRAND);
    if (config && config.phone) next.phone = config.phone;
    return next;
  }

  function applyProviders(data) {
    var list = data && data.providers;
    if (!list || !list.length) return data;
    list.forEach(function (p) {
      if (!p) return;
      if (/velzyx/i.test(String(p.name || ""))) p.name = "Aria specialist";
      if (/velzyx|client relations/i.test(String(p.title || ""))) p.title = "Walkthrough";
    });
    return data;
  }

  function brandSystem(existing) {
    var s = String(existing || "");
    if (!/velzyx/i.test(s)) return s;
    var formatAt = s.search(/\n\nFORMATTING:/);
    var tail = formatAt >= 0 ? s.slice(formatAt) : "";
    return DENTAL_PROMPT + tail;
  }

  function requestUrl(input) {
    if (typeof input === "string") return input;
    if (input && typeof input.url === "string") return input.url;
    return "";
  }

  function jsonResponse(res, data) {
    return new Response(JSON.stringify(data), {
      status: res.status,
      statusText: res.statusText,
      headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
    });
  }

  function rewriteOutgoing(input, init) {
    var url = requestUrl(input);
    var opts = init ? Object.assign({}, init) : {};
    var path = url.split("?")[0];
    if (!/\/api\/chat\/?$/.test(path)) return { input: input, init: init };
    var method = String((opts && opts.method) || (input && input.method) || "GET");
    if (!/^post$/i.test(method)) return { input: input, init: init };
    var raw = opts.body;
    if (!raw && input && typeof input.clone === "function") {
      return { input: input, init: init, rewriteBody: true };
    }
    if (typeof raw !== "string") return { input: input, init: init };
    try {
      var payload = JSON.parse(raw);
      if (payload && typeof payload.system === "string") {
        payload.system = brandSystem(payload.system);
        opts.body = JSON.stringify(payload);
        return { input: input, init: opts };
      }
    } catch (_) {}
    return { input: input, init: init };
  }

  function rewriteIncoming(url, res) {
    if (!res || !res.ok) return Promise.resolve(res);
    if (/\/widget-config/.test(url)) {
      return res.json().then(function (data) {
        if (data && data.config) data.config = applyConfig(data.config);
        return jsonResponse(res, data);
      });
    }
    if (/\/api\/schedule\/[^/]+\/providers/.test(url)) {
      return res.json().then(function (data) {
        return jsonResponse(res, applyProviders(data));
      });
    }
    return Promise.resolve(res);
  }

  function install() {
    if (typeof window === "undefined" || window.__adWidgetBrand) return;
    window.__adWidgetBrand = true;
    var orig = window.fetch;
    if (typeof orig !== "function") return;
    window.fetch = function (input, init) {
      var url = requestUrl(input);
      var rewritten = rewriteOutgoing(input, init);
      return orig.call(this, rewritten.input, rewritten.init).then(function (res) {
        return rewriteIncoming(url, res);
      });
    };
  }

  var api = {
    BRAND: BRAND,
    DENTAL_PROMPT: DENTAL_PROMPT,
    applyConfig: applyConfig,
    applyProviders: applyProviders,
    brandSystem: brandSystem,
    install: install,
  };

  if (typeof window !== "undefined") {
    window.AriaDentalWidgetBrand = api;
    install();
  }
  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }
})(typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : this);
