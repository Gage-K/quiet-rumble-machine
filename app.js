import config from "./config/qr-config.js";

class QRSequencer {
  constructor(containerId, options = {}) {
    this.container = document.getElementById(containerId);
    this.options = {
      steps: 16,
      numTracks: 4,
      url: "https://www.google.com",
      ...options,
    };

    this.qr = null;
    this.size = 0;
    this.qrNodes = null;
    this.sequencerState = Array.from({ length: this.options.numTracks }, () =>
      Array(this.options.steps).fill(false)
    );
    this.init();
  }

  init() {
    this.generateQR();
    this.createQRGrid();
  }

  generateQR() {
    this.qr = qrcode(config.typeNumber, config.errorCorrection);
    this.qr.addData(this.options.url);
    this.qr.make();
    this.size = this.qr.getModuleCount();
    this.qrNodes = this.getQRNodes();
  }

  getQRNodes() {
    const qrNodes = [];
    for (let row = 0; row < this.size; row++) {
      qrNodes[row] = [];
      for (let col = 0; col < this.size; col++) {
        qrNodes[row][col] = this.qr.isDark(row, col);
      }
    }
    return qrNodes;
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

  getSequencerBounds() {
    return {
      startRow: 7,
      endRow: 12,
      startCol: 7,
      endCol: 25,
    };
  }

  toggleStep(stepButton, trackIndex, stepIndex) {
    stepButton.classList.toggle("active-step");
    this.sequencerState[trackIndex][stepIndex] =
      !this.sequencerState[trackIndex][stepIndex];
    this.onSequencerChange(this.sequencerState);
  }

  onSequencerChange(state) {
    console.log("Sequencer state updated:", state);
  }

  createStepButton(row, col) {
    const stepButton = document.createElement("button");
    stepButton.setAttribute("aria-label", `Step ${col - 7} Track ${row - 7}`);
    stepButton.classList.add("step");

    const stepIndex = col - 8;
    const trackIndex = row - 8;
    stepButton.addEventListener("click", () =>
      this.toggleStep(stepButton, trackIndex, stepIndex)
    );
    return stepButton;
  }

  createQRNode(row, col) {
    const qrNode = document.createElement("div");
    qrNode.classList.add(
      this.qrNodes[row][col] ? "qr-brick-on" : "qr-brick-off"
    );
    qrNode.setAttribute("aria-hidden", "true");
    return qrNode;
  }

  createBorderElement() {
    const borderDiv = document.createElement("div");
    borderDiv.classList.add("sequencer-border");
    borderDiv.setAttribute("aria-hidden", "true");
    return borderDiv;
  }

  createSpacerElement() {
    const spacer = document.createElement("span");
    spacer.classList.add("spacer");
    spacer.setAttribute("aria-hidden", "true");
    return spacer;
  }

  createQRGrid() {
    if (!this.container) {
      throw new Error("Container could not be found. Abort!");
    }

    this.container.innerHTML = "";

    let element;

    for (let row = 0; row < this.size; row++) {
      for (let col = 0; col < this.size; col++) {
        if (this.isSequencerBorder(row, col)) {
          element = this.createBorderElement();
        } else if (this.isSequencerSpacer(row, col)) {
          element = this.createSpacerElement();
        } else if (this.isSequencerStep(row, col)) {
          element = this.createStepButton(row, col);
        } else {
          element = this.createQRNode(row, col);
        }

        this.container.appendChild(element);
      }
    }
  }

  getSequencerState() {
    return [...this.sequencerState.map((track) => [...track])];
  }

  setSequencerState(newState) {
    if (newState.length !== this.options.numTracks) {
      throw new Error("Invalid number of tracks!");
    }

    this.sequencerState = newState.map((track) => [...track]);
    this.updateUI();
  }

  updateUI() {
    const stepButtons = this.container.querySelectorAll(".step");
    stepButtons.forEach((button, index) => {
      const trackIndex = Math.floor(index / this.options.steps);
      const stepIndex = index % this.options.steps;

      if (this.sequencerState[trackIndex][stepIndex]) {
        button.classList.add("active-step");
      } else {
        button.classList.remove("active-step");
      }
    });
  }

  clearSequencer() {
    this.sequencerState = Array.from({ length: this.options.numTracks }, () =>
      Array(this.options.steps).fill(false)
    );
    this.updateUI();
  }

  updateQRCode(newUrl) {
    this.options.url = newUrl;
    this.generateQR();
    this.createQRGrid();
  }
}

const qrSequencer = new QRSequencer("container", {
  url: "https://www.google.com", // Use 'url' not 'qrUrl'
  steps: 16,
  numTracks: 4,
});
