/**
 * Aria Dental brand overlay for the shared booking widget.
 * Run: node lib/widget-brand.test.js
 */
const brand = require("../aria-widget-brand.js");

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

const painted = brand.applyConfig({
  name: "VELZYX AI",
  accent: "#000000",
  logo: "https://example.com/velzyx.png",
  greeting: "Hi, I'm Aria with Velzyx.",
  phone: "1-949-546-1538",
  systemPrompt: "This chat is VELZYX selling to business owners.",
  features: { booking: true },
});

assert(painted.name === "Aria", "name");
assert(painted.accent === "#D4952A", "accent");
assert(!painted.logo, "logo cleared");
assert(!/velzyx/i.test(painted.greeting), "greeting");
assert(painted.phone === "1-949-546-1538", "keeps phone");
assert(painted.features && painted.features.booking === true, "keeps booking flag");
assert(/ariadental\.ai/.test(painted.systemPrompt), "dental prompt");
assert(!/They are on velzyx\.ai/.test(painted.systemPrompt), "not velzyx site");

const providers = brand.applyProviders({
  success: true,
  providers: [{ id: 730, name: "Velzyx Engineer", title: "Client relations associate" }],
});
assert(providers.providers[0].name === "Aria specialist", "provider name");
assert(providers.providers[0].title === "Walkthrough", "provider title");

const sys = brand.brandSystem(
  "This chat is VELZYX selling to business owners. They are on velzyx.ai.\n\nFORMATTING: Never use markdown."
);
assert(/ariadental\.ai/.test(sys), "rewritten prompt");
assert(/FORMATTING: Never use markdown/.test(sys), "keeps format rule");
assert(!/They are on velzyx\.ai/.test(sys), "drops velzyx audience line");

console.log("ok lib/widget-brand.test.js");
