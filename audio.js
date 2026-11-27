/**
 * @description
 * Handles the Tone.js context: instruments and playback.
 * Accepts configuration options (steps, sequencerState, currentBpm, onStep).
 *
 * It no longer touches the DOM. Each tick it reports the current step over the
 * injected onStep callback; rendering the playhead is the grid's job. That
 * keeps playback free of grid geometry and testable without a document.
 */
export default class AudioEngine {
  // TODO: potentially add additional instruments to audio engine based on tracks
  constructor({ steps, sequencerState, currentBpm, onStep }) {
    this.kick = new Tone.Player(
      "https://tonejs.github.io/audio/drum-samples/Kit8/kick.mp3"
    ).toDestination();
    this.snare = new Tone.Player(
      "https://tonejs.github.io/audio/drum-samples/Kit3/snare.mp3"
    ).toDestination();
    this.hihat = new Tone.Player(
      "https://tonejs.github.io/audio/drum-samples/Techno/hihat.mp3"
    ).toDestination();
    this.clap = new Tone.Player(
      "https://tonejs.github.io/audio/drum-samples/Bongos/hihat.mp3"
    ).toDestination();

    this.isPlaying = false;
    this.loop = null;
    this.bpm = currentBpm;
    this.steps = steps;
    this.sequencerState = sequencerState;

    // reports the current step each tick (and null on stop); the grid renders it
    this.onStep = onStep;
  }

  /**
   * @description
   * Starts the playback of the sequencer.
   * Disposes of any existing loop (prevents multiple loops from playing).
   * Each tick, reports the current step and plays the active instruments.
   */
  startPlayback() {
    if (this.loop) {
      this.loop.dispose();
    }
    let stepIndex = 0;

    this.loop = new Tone.Loop((time) => {
      this.isPlaying = true;

      // report the playhead position; the grid owns the visual update
      if (this.onStep) {
        this.onStep(stepIndex);
      }

      // Sequencer playback
      if (this.sequencerState.getStep(0, stepIndex)) {
        this.kick.start(time);
      }
      if (this.sequencerState.getStep(1, stepIndex)) {
        this.snare.start(time);
      }
      if (this.sequencerState.getStep(2, stepIndex)) {
        this.hihat.start(time);
      }
      if (this.sequencerState.getStep(3, stepIndex)) {
        this.clap.start(time);
      }

      // mod moves us forward one step on each clock tick
      stepIndex = (stepIndex + 1) % this.steps;
    }, "16n").start(0);

    Tone.getTransport().start();
  }

  /**
   * @description
   * Stops playback by disposing of the loop and clears the playhead.
   */
  stopPlayback() {
    if (this.loop) {
      this.isPlaying = false;
      this.loop.dispose();
      this.loop = null;
    }
    Tone.getTransport().stop();

    // clear the playhead via the same seam the grid listens on
    if (this.onStep) {
      this.onStep(null);
    }
  }

  // note: bpm change does not halt audio playback, but it does change the tempo
  set bpm(value) {
    this._bpm = value;
    Tone.getTransport().bpm.value = this._bpm;
  }

  get bpm() {
    return this._bpm;
  }
}
