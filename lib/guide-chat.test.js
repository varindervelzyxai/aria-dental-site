/**
 * Guide-chat knowledge brain: topic → page walk.
 * Run: node lib/guide-chat.test.js
 */
const { handleGuideChat } = require("./aria-apis");

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

async function chat(text, path) {
  delete process.env.OPENAI_API_KEY;
  delete process.env.NETLIFY_AI_GATEWAY_KEY;
  delete process.env.NETLIFY_AI_GATEWAY_BASE_URL;
  delete process.env.OPENAI_BASE_URL;
  const result = await handleGuideChat({
    messages: [{ role: "user", content: text }],
    path: path || "/",
  });
  assert(result.status === 200, "status 200 for " + text);
  return JSON.parse(result.body);
}

async function main() {
  const voices = await chat("show me the voices");
  assert(voices.go && voices.go.path === "/voices/", "voices go " + JSON.stringify(voices.go));

  const platform = await chat("what does Aria do");
  assert(platform.go && platform.go.path === "/platform", "platform path " + JSON.stringify(platform.go));

  const demo = await chat("book a demo");
  assert(demo.go && demo.go.path === "/contact", "demo path");
  assert(demo.go.widget === true && demo.go.form === true, "demo opens widget");

  const insurance = await chat("how does insurance verification work");
  assert(insurance.go.path === "/dental-insurance-verification-ai", "insurance path");

  const marketing = await chat("tell me about local SEO");
  assert(marketing.go.path === "/marketing", "marketing path");

  const how = await chat("how does the system work");
  assert(how.go && how.go.path === "/how-it-works", "system how path");

  const stop = await chat("stop");
  assert(!stop.go, "stop stays put");
  assert(/stop here|pick it back up/i.test(stop.text), "stop does not recap product");

  const pms = await chat("do you integrate with Open Dental");
  assert(pms.go.path === "/integrations", "integrations path");

  const hipaa = await chat("are you HIPAA compliant");
  assert(hipaa.go.path === "/security", "security path");

  const small = await chat("hey there");
  assert(!small.go, "small talk stays put");

  const price = await chat("how much does it cost");
  assert(price.go && price.go.path === "/contact" && price.go.widget, "price books walkthrough");

  console.log("ok lib/guide-chat.test.js");
}

main().catch(function (err) {
  console.error("FAIL", err && err.message ? err.message : err);
  process.exit(1);
});
