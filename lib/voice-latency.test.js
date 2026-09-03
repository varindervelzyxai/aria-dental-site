/**
 * Voice-guide latency helpers: Fish payload + streaming JSON extract.
 * Run: node lib/voice-latency.test.js
 */
const { buildFishTtsPayload, extractClosedTextField, extractSpeakableLead, handleGuideChat } = require("./aria-apis");

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

function main() {
  const body = buildFishTtsPayload("Hello from Aria.", 24000);
  assert(body.latency === "low", "fish latency is low");
  assert(body.format === "pcm", "fish format pcm");
  assert(body.sample_rate === 24000, "fish sample rate");
  assert(body.chunk_length === 140, "fish chunk_length");
  assert(body.min_chunk_length === 40, "fish min_chunk_length");
  assert(body.normalize === true, "fish normalize");
  assert(typeof body.reference_id === "string" && body.reference_id.length > 8, "hannah voice id");

  assert(extractClosedTextField("") === null, "empty raw");
  assert(extractClosedTextField('{"chips":[]}') === null, "no text yet");
  assert(extractClosedTextField('{"text":"I can take you to the platform."') === "I can take you to the platform.", "closed text before rest");
  assert(extractClosedTextField('{"text":"She said \\"hello\\" to you."}') === 'She said "hello" to you.', "escaped quote");
  assert(extractClosedTextField('{"text":"Not closed yet') === null, "incomplete text");
  assert(
    extractSpeakableLead('{"text":"These are the production voices. We have seventeen') ===
      "These are the production voices.",
    "lead sentence before text field closes"
  );
  assert(extractSpeakableLead('{"text":"Still going') === null, "no lead until a sentence or close");
  assert(extractSpeakableLead('{"text":"Okay, I will stop here."}') === "Okay, I will stop here.", "closed one-liner");

  return handleGuideChat({
    messages: [{ role: "user", content: "stop" }],
    path: "/",
    stream: true,
  }).then(function (result) {
    assert(result.status === 200, "stream=true without key still 200");
    assert(!result.stream, "knowledge fallback is not SSE");
    const stop = JSON.parse(result.body);
    assert(!stop.go, "stop stays put");
    assert(/stop here|pick it back up/i.test(stop.text), "stop does not recap");
  }).then(function () {
    process.env.OPENAI_API_KEY = "sk-testkeyforlatencytests1234567890";
    const chunks = [
      'data: {"choices":[{"delta":{"content":"{\\"text\\":\\"These are the production voices.\\""}}]}\n',
      'data: {"choices":[{"delta":{"content":",\\"chips\\":[],\\"go\\":{\\"path\\":\\"/voices/\\"}}}"}}]}\n',
      "data: [DONE]\n",
    ];
    var i = 0;
    var prevFetch = global.fetch;
    global.fetch = function () {
      return Promise.resolve({
        ok: true,
        body: {
          getReader: function () {
            return {
              read: function () {
                if (i >= chunks.length) return Promise.resolve({ done: true });
                return Promise.resolve({ done: false, value: Buffer.from(chunks[i++]) });
              },
            };
          },
        },
      });
    };
    return handleGuideChat({
      messages: [{ role: "user", content: "show me the voices" }],
      path: "/",
      stream: true,
    }).then(function (streamed) {
      assert(streamed && streamed.stream, "openai stream returns SSE body");
      var reader = streamed.stream.getReader();
      var dec = new TextDecoder();
      var buf = "";
      function pump() {
        return reader.read().then(function (chunk) {
          if (chunk.done) return buf;
          buf += dec.decode(chunk.value, { stream: true });
          return pump();
        });
      }
      return pump();
    }).then(function (sse) {
      global.fetch = prevFetch;
      delete process.env.OPENAI_API_KEY;
      assert(/"partial":"These are the production voices\."/.test(sse), "partial text emitted early");
      assert(/"path":"\/voices\/"/.test(sse), "final event keeps navigation");
      console.log("ok lib/voice-latency.test.js");
    }).catch(function (err) {
      global.fetch = prevFetch;
      delete process.env.OPENAI_API_KEY;
      throw err;
    });
  });
}

main().catch(function (err) {
  console.error("FAIL", err && err.message ? err.message : err);
  process.exit(1);
});
