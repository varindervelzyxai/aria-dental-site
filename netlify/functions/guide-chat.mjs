import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { handleGuideChat } = require("../../lib/aria-apis.js");

export default async (req) => {
  if (req.method === "GET") {
    return Response.json({ ok: true, brain: "guide" });
  }
  if (req.method !== "POST") {
    return Response.json({ error: "method not allowed" }, { status: 405 });
  }
  try {
    const payload = await req.json().catch(function () {
      return {};
    });
    const result = await handleGuideChat(payload);
    return new Response(result.body, {
      status: result.status,
      headers: result.headers,
    });
  } catch (e) {
    return Response.json(
      { error: "chat failed", detail: String((e && e.message) || e) },
      { status: 500 }
    );
  }
};
