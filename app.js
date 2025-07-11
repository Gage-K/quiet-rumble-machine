import config from "./config/qr-config.js";
import { encodeToHex, decodeFromHex } from "./util.js";
console.log(config.baseUrl);

let binaryString = "";

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
    // put the hash function here
    updateHash();
    console.log(createBinaryString()); // this is wrong
    console.log("Sequencer state updated:", state); // state also wrong
  }

  createStepButton(row, col) {
    const stepButton = document.createElement("button");
    stepButton.classList.add("current-step");
    stepButton.setAttribute("aria-label", `Step ${col - 7} Track ${row - 7}`);
    stepButton.classList.add("step");

    // handle the spacer
    // if col is greater than 16, subtract 9 for spacer
    const spacerCol = Math.floor(this.size / 2); // column 16
    const stepIndex = col >= spacerCol ? col - 9 : col - 8;
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
        element.setAttribute("data-column", col);
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
    console.log("sequencer state set!")
    console.log("newState", newState);
  }


  updateSequenceCursor(currentStep) {
    const column = currentStep + 8;
    this.sequencerState.forEach((track, step) => {
      if (step === currentStep) {
      }
    });
  }

  clearSequencer() {
    this.sequencerState = Array.from({ length: this.options.numTracks }, () =>
      Array(this.options.steps).fill(false)
    );
  }

  updateQRCode(newUrl) {
    this.options.url = newUrl;
    this.generateQR();
    this.createQRGrid();
  }
}

let qrSequencer = new QRSequencer("container", {
  url: `${config.baseUrl}`, // Use 'url' not 'qrUrl'
  steps: 16,
  numTracks: 4,
});

// update grid based on new sequencer state
function updateGrid() {
  const stepButtons = qrSequencer.container.querySelectorAll(".step");
  let buttonIndex = 0;

  for (let trackIndex = 0; trackIndex < qrSequencer.options.numTracks; trackIndex++) {
    for (let stepIndex = 0; stepIndex < qrSequencer.options.steps; stepIndex++) {
      if (buttonIndex < stepButtons.length) {
        const button = stepButtons[buttonIndex];
        if (qrSequencer.sequencerState[trackIndex][stepIndex]) {
          button.classList.add("active-step");
        } else {
          button.classList.remove("active-step");
        }
        buttonIndex++;
      }
    }
  }
}


const kick = new Tone.Player(
  "https://tonejs.github.io/audio/drum-samples/Kit8/kick.mp3"
).toDestination();
const snare = new Tone.Player(
  "https://tonejs.github.io/audio/drum-samples/Kit3/snare.mp3"
).toDestination();
const hihat = new Tone.Player(
  "https://tonejs.github.io/audio/drum-samples/Techno/hihat.mp3"
).toDestination();
const clap = new Tone.Player(
  "https://tonejs.github.io/audio/drum-samples/Bongos/hihat.mp3"
).toDestination();

const playButton = document.getElementById("play-button");
const stopButton = document.getElementById("stop-button");

playButton.addEventListener("click", () => {
  startMusic();
  playButton.style.display = "none";
  stopButton.style.display = "block";
});

stopButton.addEventListener("click", () => {
  stopMusic();
  playButton.style.display = "block";
  stopButton.style.display = "none";
});

let loop = null;

function startMusic() {
  if (loop) {
    loop.dispose();
  }
  let stepIndex = 0;

  loop = new Tone.Loop((time) => {
    // steping colorz
    const getVisualColumnIndex = (step) => {
      // If step is past the spacer position, add 1 to skip over it
      // Assuming spacer is at position 8 (between step 7 and 8)
      return step >= 8 ? step + 9 : step + 8;
    };

    // Stepping colorz
    const prevStepIndex =
      (stepIndex - 1 + qrSequencer.options.steps) % qrSequencer.options.steps;

    const currentColIndex = getVisualColumnIndex(stepIndex);
    const lastColIndex = getVisualColumnIndex(prevStepIndex);

    const currentCols = document.querySelectorAll(
      `[data-column='${currentColIndex}']`
    );
    const lastCols = document.querySelectorAll(
      `[data-column='${lastColIndex}']`
    );
    currentCols.forEach((node) => node.classList.add("invertColors"));
    lastCols.forEach((node) => node.classList.remove("invertColors"));
    console.log(stepIndex);

    //sequencer stuff
    if (qrSequencer.sequencerState[0][stepIndex]) {
      kick.start(time);
    }
    if (qrSequencer.sequencerState[1][stepIndex]) {
      snare.start(time);
    }
    if (qrSequencer.sequencerState[2][stepIndex]) {
      hihat.start(time);
    }
    if (qrSequencer.sequencerState[3][stepIndex]) {
      clap.start(time);
    }
    stepIndex = (stepIndex + 1) % qrSequencer.options.steps;
    // qrSequencer.
  }, "8n").start(0);

  Tone.getTransport().bpm.value = 150;
  Tone.getTransport().start();
}

function stopMusic() {
  if (loop) {
    loop.dispose();
    loop = null;
  }
  Tone.getTransport().stop();
  // clear the colorz
  const colorz = document.querySelectorAll(".invertColors");
  colorz.forEach((node) => node.classList.remove("invertColors"));
  updateQR();
}

function updateQR() {
  const encodedData = encodeToHex(qrSequencer.sequencerState); // we get a hex string version of state
  updateHash(encodedData);
  // const newHash = updateHash(encodedData);
  qrSequencer.updateQRCode(window.location.hash);
  updateSequencerState(encodedData);
}

function updateHash(hexString) {
  let currentHash = hexString;

  // Remove the '#' symbol to get just the anchor name
  if (currentHash) {
    let anchorName;
    if (currentHash.includes("#")) {
      anchorName = currentHash.replace("#", "");
    } else {
      anchorName = currentHash;
    }
    console.log("Anchor name:", anchorName); // Example output: "section1"

    // Set a new hash in the URL
    window.location.hash = currentHash; // This will navigate to #newAnchor on the page
    return `#${anchorName}`;
  }
}

function updateSequencerState(hexString) {
  const hash = window.location.hash.substring(1);
  const decodedData = decodeFromHex(hexString);
  if (hash) {
    console.log("Loading sequencer state from hash:", hash);
    qrSequencer.setSequencerState(decodedData);
    updateGrid();
  }
  console.log("qrSequencer new sequencerState", qrSequencer.sequencerState);
}