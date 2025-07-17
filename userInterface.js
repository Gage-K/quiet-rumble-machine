/**
 * @description
 * Handles rendering and updated the UI, including visualizing the QR code and sequencer
 * Accepts configuration options (qrNodes, size, tracks, steps, sequencerState, onStepToggled)
 */

const offset = 9; // 7 for the position marker
export default class GridRenderer {
  constructor({ qrNodes, size, tracks, steps, sequencerState, onStepToggled }) {
    this.container = document.getElementById("container");
    this.qrNodes = qrNodes;
    this.size = size;
    this.tracks = tracks;
    this.steps = steps;
    this.sequencerState = sequencerState;

    // onStepToggled is passed in from the App class to handle user edits
    // function is bound to the App class to ensure that the correct context is used
    // onStepToggled produces several side effects:
    // 1. update the sequencer state
    // 2. update the url
    // 3. update the QR code
    // 4. update the grid UI
    this.onStepToggled = onStepToggled;

    this.renderGrid();
  }

  /**
   * @description
   * Renders the grid UI
   * Clears the container and renders the grid based on the current state
   */
  renderGrid() {
    console.log("rendering grid");
    if (!this.container) {
      throw new Error("Container could not be found. Abort!");
    }

    this.container.innerHTML = "";

    let element;

    // renders grid based on if its location in the code is reserved for the sequencer or not
    for (let row = 0; row < this.size; row++) {
      for (let col = 0; col < this.size; col++) {
        if (this.isSequencerBorder(row, col)) {
          element = this.getBorderElement();
        } else if (this.isSequencerSpacer(row, col)) {
          element = this.getSpacerElement();
        } else if (this.isSequencerStep(row, col)) {
          element = this.getStepButton(row, col);
        } else {
          element = this.getQRNode(row, col);
        }
        element.setAttribute("data-column", col);
        this.container.appendChild(element);
      }
    }
  }

  isSequencerBorder(row, col) {
    const { startRow, endRow, startCol, endCol } = this.getSequencerBounds();
    return (
      (col === startCol ||
        col === endCol ||
        row === startRow ||
        row === endRow) &&
      this.isInSequencerArea(row, col)
    );
  }

  isSequencerSpacer(row, col) {
    const { startRow, endRow } = this.getSequencerBounds();
    return (
      col === Math.floor(this.size / 2) && row >= startRow && row <= endRow
    );
  }

  isSequencerStep(row, col) {
    const { startRow, endRow, startCol, endCol } = this.getSequencerBounds();
    return col > startCol && col < endCol && row > startRow && row < endRow;
  }

  isInSequencerArea(row, col) {
    const { startRow, endRow, startCol, endCol } = this.getSequencerBounds();
    return col >= startCol && col <= endCol && row >= startRow && row <= endRow;
  }

  getStepButton(row, col) {
    const stepButton = document.createElement("button");
    stepButton.classList.add("current-step");
    stepButton.setAttribute(
      "aria-label",
      `Step ${col - offset} Track ${row - offset}`
    );
    stepButton.classList.add("step");

    // handle the spacer
    // if col is greater than 16, subtract 9 for spacer
    const spacerCol = Math.floor(this.size / 2); // column 16
    const stepIndex = col >= spacerCol ? col - 11 : col - 10;
    // console.log("col", col);
    // console.log("row", row);
    const trackIndex = row - 8;
    // console.log("trackIndex", trackIndex);
    stepButton.addEventListener("click", () => {
      this.toggleStepUI(stepButton);
      // some extra validation to ensure that function is defined
      if (this.onStepToggled) {
        this.onStepToggled(trackIndex, stepIndex);
      }
    });
    if (this.sequencerState.getStep(trackIndex, stepIndex)) {
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

  getSequencerBounds() {
    // TODO: make these dynamic based on size of qr code, tracks, and steps
    // Important: qr size is always an odd number, so the middle of the qr code is a blank space in the midle of the sequencer
    return {
      startRow: 7,
      endRow: 12,
      startCol: offset,
      endCol: offset + 18,
    };
  }

  // toggles class for visual feedback of active step
  toggleStepUI(stepButton) {
    stepButton.classList.toggle("active-step");
  }
}
