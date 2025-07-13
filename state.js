export default class SequencerState {
  constructor(options) {
    this.options = options;
    this.state = this.resetState();
  }

  getState() {
    return [...this.state.map((track) => [...track])];
  }

  setState(newState) {
    if (newState.length !== this.options.numTracks) {
      throw new Error("Invalid number of tracks!");
    }

    this.state = newState.map((track) => [...track]);
  }

  resetState() {
    return Array.from({ length: this.options.numTracks }, () =>
      Array(this.options.steps).fill(false)
    );
  }

  toggleStep(trackIndex, stepIndex) {
    if (!this.isValidStep(trackIndex, stepIndex)) {
      throw new Error("Invalid step!");
    }
    this.state[trackIndex][stepIndex] = !this.state[trackIndex][stepIndex];
    return this.state[trackIndex][stepIndex];
  }

  getStep(trackIndex, stepIndex) {
    if (!this.isValidStep(trackIndex, stepIndex)) {
      throw new Error("Invalid step!");
    }
    return this.state[trackIndex][stepIndex];
  }

  /**
   *
   * Validation check: returns true if the step is within the bounds of the sequencer
   *
   * @param {*} trackIndex
   * @param {*} stepIndex
   * @returns
   */
  isValidStep(trackIndex, stepIndex) {
    return (
      trackIndex >= 0 &&
      trackIndex < this.options.numTracks &&
      stepIndex >= 0 &&
      stepIndex < this.options.steps
    );
  }
}
