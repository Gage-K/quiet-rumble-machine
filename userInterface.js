/**
 * @description
 * Handles rendering the UI: the QR code pixels, the sequencer grid, and the
 * playback playhead. All cell geometry comes from an injected GridGeometry, so
 * this module holds no coordinate magic numbers of its own.
 *
 * Accepts: geometry, qrNodes, sequencerState, onStepToggled.
 */
export default class GridRenderer {
  constructor({ geometry, qrNodes, sequencerState, onStepToggled }) {
    this.container = document.getElementById("container");
    this.geometry = geometry;
    this.qrNodes = qrNodes;
    this.sequencerState = sequencerState;

    // onStepToggled is passed in from the App class to handle user edits.
    // It produces side effects (state -> url -> qr -> re-render); GridRenderer
    // only reports which step the user toggled.
    this.onStepToggled = onStepToggled;

    // cells currently lit by the playhead, so we can clear them next tick
    this._playheadCells = [];

    // expose the grid dimension to CSS so the template isn't a hardcoded 37
    if (this.container) {
      this.container.style.setProperty("--qr-size", this.geometry.size);
    }

    this.renderGrid();
  }

  /**
   * @description
   * Sets fresh QR nodes and re-renders. Callers hand in the nodes rather than
   * poking the field directly.
   */
  render(qrNodes) {
    this.qrNodes = qrNodes;
    this.renderGrid();
  }

  /**
   * @description
   * Renders the grid: for every cell, ask the geometry what it is and build the
   * matching element.
   */
  renderGrid() {
    if (!this.container) {
      throw new Error("Container could not be found. Abort!");
    }

    this.container.innerHTML = "";
    this._playheadCells = [];

    const size = this.geometry.size;
    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        let element;
        switch (this.geometry.cellKind(row, col)) {
          case "border":
            element = this.getBorderElement();
            break;
          case "spacer":
            element = this.getSpacerElement();
            break;
          case "step":
            element = this.getStepButton(row, col);
            break;
          default:
            element = this.getQRNode(row, col);
        }
        element.setAttribute("data-column", col);
        this.container.appendChild(element);
      }
    }
  }

  /**
   * @description
   * Moves the playback playhead to the given step (null clears it). The grid
   * owns this rendering; the audio engine only reports the current step.
   */
  setPlayhead(step) {
    this._playheadCells.forEach((node) =>
      node.classList.remove("invertColors")
    );
    this._playheadCells = [];

    if (step === null || step === undefined) return;

    const col = this.geometry.columnForStep(step);
    const cells = this.container.querySelectorAll(`[data-column='${col}']`);
    cells.forEach((node) => node.classList.add("invertColors"));
    this._playheadCells = Array.from(cells);
  }

  getStepButton(row, col) {
    const { track, step } = this.geometry.toStep(row, col);

    const stepButton = document.createElement("button");
    stepButton.classList.add("current-step", "step");
    stepButton.setAttribute("aria-label", `Step ${step + 1} Track ${track + 1}`);

    stepButton.addEventListener("click", () => {
      this.toggleStepUI(stepButton);
      if (this.onStepToggled) {
        this.onStepToggled(track, step);
      }
    });

    if (this.sequencerState.getStep(track, step)) {
      stepButton.classList.add("active-step");
    }
    return stepButton;
  }

  // QR node refers to the individual "pixel" of the QR code
  getQRNode(row, col) {
    const qrNode = document.createElement("div");
    qrNode.classList.add(
      this.qrNodes[row][col] ? "qr-brick-on" : "qr-brick-off"
    );
    qrNode.setAttribute("aria-hidden", "true");
    return qrNode;
  }

  getBorderElement() {
    const borderDiv = document.createElement("div");
    borderDiv.classList.add("sequencer-border");
    borderDiv.setAttribute("aria-hidden", "true");
    return borderDiv;
  }

  getSpacerElement() {
    const spacer = document.createElement("span");
    spacer.classList.add("spacer");
    spacer.setAttribute("aria-hidden", "true");
    return spacer;
  }

  // toggles class for visual feedback of active step
  toggleStepUI(stepButton) {
    stepButton.classList.toggle("active-step");
  }
}
