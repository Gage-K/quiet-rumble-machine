import config from "./config/qr-config.js";
import URLManager from "./urlManager.js";
import AudioEngine from "./audioEngine.js";
import SequencerState from "./state.js";
import QRCode from "./qrCode.js";
import GridRenderer from "./ui.js";

/**
 * @description
 * This is a class for managing the state of the sequencer. It accepts an object of configuration options
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
    console.log("initializing app");
    this.qrCode = new QRCode({
      url: this.options.baseUrl,
      typeNumber: this.options.typeNumber,
      errorCorrectionLevel: this.options.errorCorrection,
    });
    this.urlManager = new URLManager({ url: this.options.baseUrl });

    this.sequencerState = new SequencerState({
      numTracks: this.options.tracks,
      steps: this.options.steps,
    });
    // if there's a hash, load the state from the hash, otherwise use the default state
    if (window.location.hash.length > 2) {
      const loadedState = this.urlManager.getStateFromHash();
      this.sequencerState.setState(loadedState);
    } else {
      this.sequencerState.setState(this.options.defaultState);
    }
    this.grid = new GridRenderer({
      qrNodes: this.qrCode.getQRNodes(),
      size: this.qrCode.getQRSize(),
      tracks: this.options.tracks,
      steps: this.options.steps,
      sequencerState: this.sequencerState,
      onStepToggled: this.onStepToggled.bind(this), // needed so that the function has access to the context of the App class
    });
    this.audioEngine = new AudioEngine({
      tracks: this.options.tracks,
      steps: this.options.steps,
      sequencerState: this.sequencerState,
    });
  }

  onStepToggled(trackIndex, stepIndex) {
    this.sequencerState.toggleStep(trackIndex, stepIndex);
    this.urlManager.setStateToHash(this.sequencerState.getState());
    console.log("state updated", this.sequencerState.getState());

    // Update the QR code's URL to the new hash or state
    this.qrCode.url = window.location.hash; // or use the correct value from urlManager
    this.qrCode.generateQR();
    this.grid.qrNodes = this.qrCode.getQRNodes();
    this.grid.renderGrid();
  }
}

const app = new App(config);

const playButton = document.getElementById("play-button");
const stopButton = document.getElementById("stop-button");

playButton.addEventListener("click", () => {
  app.audioEngine.startPlayback();
  playButton.style.display = "none";
  stopButton.style.display = "block";
});

stopButton.addEventListener("click", () => {
  app.audioEngine.stopPlayback();
  playButton.style.display = "block";
  stopButton.style.display = "none";
});
