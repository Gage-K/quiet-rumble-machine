export default class AudioEngine {
  constructor({ tracks, steps, sequencerState }) {
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
    this.bpm = 175;
    this.tracks = tracks;
    this.steps = steps;
    this.sequencerState = sequencerState;
  }

  startPlayback() {
    if (this.loop) {
      this.loop.dispose();
    }
    let stepIndex = 0;

    this.loop = new Tone.Loop((time) => {
      this.isPlaying = true;
      // steping colorz
      const getVisualColumnIndex = (step) => {
        // If step is past the spacer position, add 1 to skip over it
        // Assuming spacer is at position 8 (between step 7 and 8)
        return step >= 8 ? step + 9 : step + 8;
      };

      // Stepping colorz
      const prevStepIndex = (stepIndex - 1 + this.steps) % this.steps;

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
      stepIndex = (stepIndex + 1) % this.steps;
    }, "16n").start(0);

    Tone.getTransport().start();
  }

  stopPlayback() {
    if (this.loop) {
      this.isPlaying = false;
      this.loop.dispose();
      this.loop = null;
    }
    Tone.getTransport().stop();
    // clear the colorz
    const colors = document.querySelectorAll(".invertColors");
    colors.forEach((node) => node.classList.remove("invertColors"));
  }

  set bpm(value) {
    this._bpm = value;
    Tone.getTransport().bpm.value = this._bpm;
  }

  get bpm() {
    return this._bpm;
  }
}
