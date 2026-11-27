import { test } from "node:test";
import assert from "node:assert/strict";
import StateCodec from "../stateCodec.js";

const emptyState = (tracks, steps) =>
  Array.from({ length: tracks }, () => Array(steps).fill(false));

test("empty 4x16 state encodes to 16 hex zeros", () => {
  const codec = new StateCodec({ tracks: 4, steps: 16 });
  assert.equal(codec.encode(emptyState(4, 16)), "0000000000000000");
});

test("a single leading step sets the top bit", () => {
  const codec = new StateCodec({ tracks: 4, steps: 16 });
  const state = emptyState(4, 16);
  state[0][0] = true;
  assert.equal(codec.encode(state), "8000000000000000");
});

test("round trip is identity for a random 4x16 state", () => {
  const codec = new StateCodec({ tracks: 4, steps: 16 });
  const state = Array.from({ length: 4 }, () =>
    Array.from({ length: 16 }, () => Math.random() < 0.5)
  );
  assert.deepEqual(codec.decode(codec.encode(state)), state);
});

test("decode is shaped by the codec's dimensions, not the input length", () => {
  // the old decode hardcoded 16 steps; this proves steps now propagates
  const codec = new StateCodec({ tracks: 2, steps: 8 });
  const state = [
    [true, false, true, false, true, false, true, false],
    [false, true, false, true, false, true, false, true],
  ];
  const decoded = codec.decode(codec.encode(state));
  assert.equal(decoded.length, 2);
  assert.equal(decoded[0].length, 8);
  assert.deepEqual(decoded, state);
});
