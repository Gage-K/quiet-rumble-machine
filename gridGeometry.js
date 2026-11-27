/**
 * @description
 * GridGeometry is the single owner of the map between the two identities every
 * cell in this app has: a QR module at (row, col), and — for the cells inside
 * the sequencer block — a sequencer (track, step).
 *
 * Previously this map was hand-written four times (GridRenderer, AudioEngine,
 * the state codec, and style.css) as loose magic numbers. It now lives here,
 * derived once from the QR size and the sequencer dimensions.
 *
 * It is a pure module: no DOM, no Tone, no globals. Construct it with the
 * dimensions and it answers every geometry question. The interface is the
 * test surface.
 *
 * Layout: the sequencer is a bordered block sitting just below the QR code's
 * top-left finder pattern. Steps are split into two equal halves either side of
 * a spacer column at the centre of the QR, so the QR's central blank column
 * reads as the gap in the middle of the sequencer.
 */
export default class GridGeometry {
  /**
   * @param {object} opts
   * @param {number} opts.qrSize    module count of the QR code (one side)
   * @param {number} opts.tracks    number of sequencer tracks (rows)
   * @param {number} opts.steps     number of sequencer steps (must be even)
   * @param {number} [opts.blockStartRow=7] top row of the sequencer block;
   *        defaults to 7 to clear the 7x7 finder pattern.
   */
  constructor({ qrSize, tracks, steps, blockStartRow = 7 }) {
    if (steps % 2 !== 0) {
      throw new Error(`steps must be even to split around the spacer, got ${steps}`);
    }

    this.qrSize = qrSize;
    this.tracks = tracks;
    this.steps = steps;

    // half the steps sit on each side of the centre spacer column
    this._halfSteps = steps / 2;

    // the spacer falls on the QR's central column (QR size is always odd)
    this._spacerCol = Math.floor(qrSize / 2);

    // bordered block bounds, derived from the spacer and the dimensions
    this._startCol = this._spacerCol - this._halfSteps - 1;
    this._endCol = this._spacerCol + this._halfSteps + 1;
    this._startRow = blockStartRow;
    this._endRow = blockStartRow + tracks + 1;

    if (this._startCol < 0 || this._endCol > qrSize - 1 || this._endRow > qrSize - 1) {
      throw new Error(
        `sequencer block (${tracks}x${steps}) does not fit inside a ${qrSize}x${qrSize} QR code`
      );
    }
  }

  /** one side of the grid, in cells */
  get size() {
    return this.qrSize;
  }

  /**
   * Classifies a cell by what should be rendered there.
   * @returns {"step"|"border"|"spacer"|"qr"}
   */
  cellKind(row, col) {
    if (!this._inBlock(row, col)) return "qr";
    if (
      row === this._startRow ||
      row === this._endRow ||
      col === this._startCol ||
      col === this._endCol
    ) {
      return "border";
    }
    if (col === this._spacerCol) return "spacer";
    return "step";
  }

  /** (track, step) -> (row, col) of its cell in the grid */
  toCell(track, step) {
    const row = this._startRow + 1 + track;
    const col =
      step < this._halfSteps
        ? this._startCol + 1 + step
        : this._spacerCol + 1 + (step - this._halfSteps);
    return { row, col };
  }

  /** (row, col) of a step cell -> its (track, step) */
  toStep(row, col) {
    const track = row - this._startRow - 1;
    const step =
      col < this._spacerCol
        ? col - this._startCol - 1
        : col - this._spacerCol - 1 + this._halfSteps;
    return { track, step };
  }

  /** the grid column a given step occupies (same for every track) */
  columnForStep(step) {
    return this.toCell(0, step).col;
  }

  _inBlock(row, col) {
    return (
      row >= this._startRow &&
      row <= this._endRow &&
      col >= this._startCol &&
      col <= this._endCol
    );
  }
}
