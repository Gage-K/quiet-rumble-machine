/**
 * @description
 * Handles rendering the UI: the QR code pixels, the sequencer grid, the BPM
 * slider, and the playback playhead. All sequencer cell geometry comes from an
 * injected GridGeometry, so this module holds no coordinate magic numbers of
 * its own for the sequencer. (The BPM slider still carries its own position;
 * folding that into GridGeometry is a natural follow-up.)
 *
 * Accepts: geometry, qrNodes, sequencerState, onStepToggled, currentBpm,
 * onBpmChanged.
 */
export default class GridRenderer {
  constructor({
    geometry,
    qrNodes,
    sequencerState,
    onStepToggled,
    currentBpm,
    onBpmChanged,
  }) {
    this.container = document.getElementById("container");
    this.geometry = geometry;
    this.qrNodes = qrNodes;
    this.sequencerState = sequencerState;

    // onStepToggled is passed in from the App class to handle user edits.
    // It produces side effects (state -> url -> qr -> re-render); GridRenderer
    // only reports which step the user toggled.
    this.onStepToggled = onStepToggled;

    // onBpmChanged is passed in from the App class to handle BPM changes
    this.onBpmChanged = onBpmChanged;
    // stored so the slider keeps its value across QR refreshes
    this.currentBpm = currentBpm;

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
   * Renders the grid: the BPM slider takes priority at its position, otherwise
   * ask the geometry what each cell is and build the matching element.
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
        if (this.isBpmSlider(row, col)) {
          element = this.getBpmSliderElement();
        } else {
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

  getBpmSliderElement() {
    // Create a container for the vertical slider
    const sliderContainer = document.createElement("div");
    sliderContainer.classList.add("bpm-slider-container");

    // Create the actual range input
    const slider = document.createElement("input");
    slider.type = "range";
    slider.min = "80";
    slider.max = "200";
    slider.value = this.currentBpm.toString(); // Use stored BPM value
    slider.classList.add("bpm-slider-input");
    slider.setAttribute("aria-label", "BPM Slider");

    slider.addEventListener("input", (e) => {
      this.currentBpm = parseInt(e.target.value); // Store the new BPM value
      if (this.onBpmChanged) {
        this.onBpmChanged(this.currentBpm);
      }
    });

    sliderContainer.appendChild(slider);
    return sliderContainer;
  }

  // BPM slider position: a single column just left of the sequencer block
  getBpmSliderPosition() {
    return {
      startRow: 7,
      endRow: 15,
      startCol: 7,
      endCol: 7,
    };
  }

  isInBpmSliderArea(row, col) {
    const { startRow, endRow, startCol, endCol } = this.getBpmSliderPosition();
    return col >= startCol && col <= endCol && row >= startRow && row <= endRow;
  }

  isBpmSlider(row, col) {
    const { startRow, endRow, startCol, endCol } = this.getBpmSliderPosition();
    return (
      (col === startCol ||
        col === endCol ||
        row === startRow ||
        row === endRow) &&
      this.isInBpmSliderArea(row, col)
    );
  }

  // toggles class for visual feedback of active step
  toggleStepUI(stepButton) {
    stepButton.classList.toggle("active-step");
  }
}
