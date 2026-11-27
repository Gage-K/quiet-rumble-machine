import config from "./config/qr-config.js";
import URLManager from "./urlManager.js";
import AudioEngine from "./audio.js";
import SequencerState from "./sequencer.js";
import QRCode from "./qrCode.js";
import GridRenderer from "./userInterface.js";
import GridGeometry from "./gridGeometry.js";
import StateCodec from "./stateCodec.js";

/**
 * @description
 * Composition root. Constructs the modules, injects their dependencies, and
 * wires the edit, BPM, and playback flows. Holds no geometry or URL magic of
 * its own.
 */
class App {
  constructor(options) {
    this.options = options;
    this.qrCode = null;
    this.urlManager = null;
    this.sequencerState = null;
    this.grid = null;
    this.audioEngine = null;

    this.init();
  }

  init() {
    this.qrCode = new QRCode({
      url: this.options.baseUrl,
      typeNumber: this.options.typeNumber,
      errorCorrectionLevel: this.options.errorCorrection,
    });

    const codec = new StateCodec({
      tracks: this.options.tracks,
      steps: this.options.steps,
    });
    this.urlManager = new URLManager({ url: this.options.baseUrl, codec });

    const geometry = new GridGeometry({
      qrSize: this.qrCode.getQRSize(),
      tracks: this.options.tracks,
      steps: this.options.steps,
    });

    this.sequencerState = new SequencerState({
      numTracks: this.options.tracks,
      steps: this.options.steps,
    });
    // load state from the hash if present, otherwise use the default
    if (this.urlManager.hasState()) {
      this.sequencerState.setState(this.urlManager.getStateFromHash());
    } else {
      this.sequencerState.setState(this.options.defaultState);
    }

    this.grid = new GridRenderer({
      geometry,
      qrNodes: this.qrCode.getQRNodes(),
      sequencerState: this.sequencerState,
      onStepToggled: this.onStepToggled.bind(this),
      currentBpm: 120,
      onBpmChanged: this.onBpmChanged.bind(this),
    });

    this.audioEngine = new AudioEngine({
      steps: this.options.steps,
      sequencerState: this.sequencerState,
      currentBpm: this.grid.currentBpm,
      onStep: (step) => this.grid.setPlayhead(step),
    });
  }

  /**
   * @description
   * Applies a user edit: toggle the step, persist to the URL, regenerate the
   * QR from the new URL, and re-render the grid. Each collaborator owns its own
   * mutation, so nothing reaches across a seam.
   */
  onStepToggled(trackIndex, stepIndex) {
    this.sequencerState.toggleStep(trackIndex, stepIndex);
    this.urlManager.save(this.sequencerState.getState());
    const qrNodes = this.qrCode.update(this.urlManager.getCurrentUrl());
    this.grid.render(qrNodes);
  }

  /**
   * @description
   * Handles BPM changes from the slider by updating the audio engine tempo.
   */
  onBpmChanged(newBpm) {
    if (this.audioEngine) {
      this.audioEngine.bpm = newBpm;
    }
  }
}

const app = new App(config);

// TODO: move these to the userInterface class
const playButton = document.getElementById("play-button");
const stopButton = document.getElementById("stop-button");

playButton.addEventListener("click", () => {
  Tone.start();
  app.audioEngine.startPlayback();
  playButton.style.display = "none";
  stopButton.style.display = "block";
  stopButton.classList.add("invertColors");
});

stopButton.addEventListener("click", () => {
  app.audioEngine.stopPlayback();
  playButton.style.display = "block";
  stopButton.style.display = "none";
});
