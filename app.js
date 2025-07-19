import config from "./config/qr-config.js";
import URLManager from "./urlManager.js";
import AudioEngine from "./audio.js";
import SequencerState from "./sequencer.js";
import QRCode from "./qrCode.js";
import GridRenderer from "./userInterface.js";

/**
 * @description
 * This is a class for managing the app and initializing all necessary classes
 * It accepts an object of configuration options
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

  /**
   * Initializes app with necssary classes
   * If there's a hash, load the state from the hash, otherwise use the default state
   * Generates QR code and updates grid UI with this state
   */
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
      currentBpm: 120,
      onBpmChanged: this.onBpmChanged.bind(this), // callback to handle BPM changes
    });
    this.audioEngine = new AudioEngine({
      tracks: this.options.tracks,
      steps: this.options.steps,
      sequencerState: this.sequencerState,
      qrData: this.qrCode.getQRNodes(),
      currentBpm: this.grid.currentBpm,
    });
  }

  /**
   * @description
   * Handles step toggling event
   * Updates sequencer state, url, and QR code
   * Passed to GridRenderer class to handle user edits
   */
  onStepToggled(trackIndex, stepIndex) {
    this.sequencerState.toggleStep(trackIndex, stepIndex);
    this.urlManager.setStateToHash(this.sequencerState.getState());
    console.log("state updated", this.sequencerState.getState());

    // Update the QR code's URL to the new hash or state
    this.qrCode.url = this.urlManager.getBaseUrl() + window.location.hash; // or use the correct value from urlManager
    this.qrCode.generateQR();
    this.grid.qrNodes = this.qrCode.getQRNodes();
    this.grid.renderGrid();
    console.log("bpm", this.grid.currentBpm);
  }

  /**
   * @description
   * Handles BPM changes from the slider
   * Updates the audio engine BPM
   */
  onBpmChanged(newBpm) {
    if (this.audioEngine) {
      this.audioEngine.bpm = newBpm;
      console.log("Audio engine BPM updated to:", newBpm);
    }
  }
}

async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    console.log('Text copied to clipboard successfully!');
  } catch (err) {
    console.error('Failed to copy text: ', err);
  }
}

const app = new App(config);

// TODO: move these to the userInterface class
const playButton = document.getElementById("play-button");
const stopButton = document.getElementById("stop-button");
const shareButton = document.getElementById("share-button");

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

shareButton.addEventListener("click", () => {
  // app.urlManager.shareState();
  // get the url from the urlManager
  const url = app.urlManager.getBaseUrl() + window.location.hash;
  // stop sequencer
  app.audioEngine.stopPlayback();
  playButton.style.display = "block";
  stopButton.style.display = "none";
  copyToClipboard(url);
  window.confirm("link copied to clipboard!");
});
