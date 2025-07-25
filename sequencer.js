/**
 * @description
 * Manages the state of the sequencer
 * Accepts configuration options (number of tracks, number of steps)
 */
export default class SequencerState {
  constructor({ numTracks, steps }) {
    this.numTracks = numTracks;
    this.steps = steps;

    // initialize the state of the sequencer
    this.state = this.resetState();
  }

  getState() {
    // creating a deep copy of the array prevents mutation of the original state
    return [...this.state.map((track) => [...track])];
  }

  setState(newState) {
    if (newState.length !== this.numTracks) {
      throw new Error("Invalid number of tracks!");
    }

    this.state = newState.map((track) => [...track]);
  }

  resetState() {
    return Array.from({ length: this.numTracks }, () =>
      Array(this.steps).fill(false)
    );
  }

  /**
   * @description
   * Toggles the state of a step
   * Returns the new state of the step
   */
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
      trackIndex < this.numTracks &&
      stepIndex >= 0 &&
      stepIndex < this.steps
    );
  }
}
