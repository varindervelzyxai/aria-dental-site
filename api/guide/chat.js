const { handleGuideChat, readJsonBody, applyVercel } = require("../../lib/aria-apis");

module.exports = async function (req, res) {
  if (req.method !== "POST") {
    res.statusCode = 405;
    res.setHeader("Allow", "POST");
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: "method not allowed" }));
    return;
  }
  try {
    const result = await handleGuideChat(readJsonBody(req));
    applyVercel(res, result);
  } catch (e) {
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: "chat failed", detail: String(e.message || e) }));
  }
};
