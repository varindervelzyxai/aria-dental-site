const { handleFishTts, readJsonBody, applyVercel } = require("../../lib/aria-apis");

module.exports = async function (req, res) {
  if (req.method === "GET") {
    res.setHeader("Content-Type", "application/json");
    res.statusCode = 200;
    res.end(JSON.stringify({ ok: true, provider: "fish", voice: "hannah" }));
    return;
  }
  if (req.method !== "POST") {
    res.statusCode = 405;
    res.setHeader("Allow", "GET, POST");
    res.end(JSON.stringify({ error: "method not allowed" }));
    return;
  }
  try {
    const result = await handleFishTts(readJsonBody(req));
    applyVercel(res, result);
  } catch (e) {
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: "tts failed", detail: String(e.message || e) }));
  }
};
