const { handleGuideChat, readJsonBody, toNetlify } = require("../../lib/aria-apis");

exports.handler = async function (event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "method not allowed" }) };
  }
  try {
    const result = await handleGuideChat(readJsonBody(event));
    return toNetlify(result);
  } catch (e) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "chat failed", detail: String(e.message || e) }),
    };
  }
};
