import { test } from "node:test";
import assert from "node:assert/strict";
import GridGeometry from "../gridGeometry.js";

// the production configuration: a 4x16 sequencer inside a type-5 QR (37 modules)
const geo = () => new GridGeometry({ qrSize: 37, tracks: 4, steps: 16 });

test("size is the QR module count", () => {
  assert.equal(geo().size, 37);
});

test("cellKind matches the legacy layout", () => {
  const g = geo();
  assert.equal(g.cellKind(0, 0), "qr"); // outside the block
  assert.equal(g.cellKind(7, 9), "border"); // top-left corner of block
  assert.equal(g.cellKind(12, 27), "border"); // bottom-right corner
  assert.equal(g.cellKind(8, 9), "border"); // left edge
  assert.equal(g.cellKind(7, 18), "border"); // spacer column but on the border row
  assert.equal(g.cellKind(8, 18), "spacer"); // centre column, inside
  assert.equal(g.cellKind(8, 10), "step"); // first step
  assert.equal(g.cellKind(11, 26), "step"); // last step
});

test("toCell matches the legacy +10 / +11 mapping", () => {
  const g = geo();
  assert.deepEqual(g.toCell(0, 0), { row: 8, col: 10 });
  assert.deepEqual(g.toCell(0, 7), { row: 8, col: 17 }); // last of left half
  assert.deepEqual(g.toCell(0, 8), { row: 8, col: 19 }); // first of right half (skips spacer 18)
  assert.deepEqual(g.toCell(0, 15), { row: 8, col: 26 });
  assert.deepEqual(g.toCell(3, 15), { row: 11, col: 26 });
});

test("toStep matches the legacy -10 / -11 mapping", () => {
  const g = geo();
  assert.deepEqual(g.toStep(8, 10), { track: 0, step: 0 });
  assert.deepEqual(g.toStep(8, 17), { track: 0, step: 7 });
  assert.deepEqual(g.toStep(8, 19), { track: 0, step: 8 });
  assert.deepEqual(g.toStep(11, 26), { track: 3, step: 15 });
});

test("columnForStep matches AudioEngine's old getVisualColumnIndex", () => {
  const g = geo();
  // old: step >= 8 ? step + 11 : step + 10
  for (let step = 0; step < 16; step++) {
    const expected = step >= 8 ? step + 11 : step + 10;
    assert.equal(g.columnForStep(step), expected);
  }
});

test("toStep is the inverse of toCell across the whole grid", () => {
  const g = geo();
  for (let track = 0; track < 4; track++) {
    for (let step = 0; step < 16; step++) {
      const { row, col } = g.toCell(track, step);
      assert.deepEqual(g.toStep(row, col), { track, step });
    }
  }
});

test("rejects odd step counts (cannot split around the spacer)", () => {
  assert.throws(() => new GridGeometry({ qrSize: 37, tracks: 4, steps: 15 }));
});

test("rejects a block that does not fit the QR", () => {
  // too many steps: the halves overflow past the left edge
  assert.throws(() => new GridGeometry({ qrSize: 21, tracks: 4, steps: 36 }));
  // too many tracks: the block overflows past the bottom edge
  assert.throws(() => new GridGeometry({ qrSize: 21, tracks: 20, steps: 16 }));
});
