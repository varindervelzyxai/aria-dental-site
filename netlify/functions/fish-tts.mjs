import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { handleFishTts } = require("../../lib/aria-apis.js");

function asResponse(result) {
  if (result.stream) {
    return new Response(result.stream, {
      status: result.status,
      headers: result.headers,
    });
  }
  if (result.isBase64 && Buffer.isBuffer(result.body)) {
    return new Response(result.body, {
      status: result.status,
      headers: result.headers,
    });
  }
  return new Response(typeof result.body === "string" ? result.body : JSON.stringify(result.body), {
    status: result.status,
    headers: result.headers,
  });
}

export default async (req) => {
  if (req.method === "OPTIONS" || req.method === "GET") {
    return Response.json({ ok: true, provider: "fish", voice: "hannah" });
  }
  if (req.method !== "POST") {
    return Response.json({ error: "method not allowed" }, { status: 405 });
  }
  try {
    const payload = await req.json().catch(function () {
      return {};
    });
    return asResponse(await handleFishTts(payload));
  } catch (e) {
    return Response.json(
      { error: "tts failed", detail: String((e && e.message) || e) },
      { status: 500 }
    );
  }
};
