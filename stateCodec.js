/**
 * @description
 * StateCodec serializes the sequencer state to and from the compact hex string
 * carried in the URL hash.
 *
 * It owns the dimension contract. Previously encode carried no dimensions and
 * decode hardcoded 16 steps while guessing the track count from the string
 * length, so the two halves agreed only while the config stayed at 4x16.
 * Here both halves share the same injected { tracks, steps }, and the round
 * trip is the whole test surface: decode(encode(state)) === state.
 *
 * Pure module: no DOM, no globals.
 */
export default class StateCodec {
  /**
   * @param {object} opts
   * @param {number} opts.tracks
   * @param {number} opts.steps
   */
  constructor({ tracks, steps }) {
    this.tracks = tracks;
    this.steps = steps;
  }

  /**
   * state (tracks x steps booleans) -> hex string
   */
  encode(state) {
    let binary = "";
    for (let track = 0; track < this.tracks; track++) {
      for (let step = 0; step < this.steps; step++) {
        binary += state[track][step] ? "1" : "0";
      }
    }

    let hex = "";
    for (let i = 0; i < binary.length; i += 4) {
      const chunk = binary.slice(i, i + 4).padEnd(4, "0");
      hex += parseInt(chunk, 2).toString(16);
    }
    return hex;
  }

  /**
   * hex string -> state (tracks x steps booleans)
   * Shaped by the codec's own dimensions, not by the length of the input.
   */
  decode(hex) {
    let binary = "";
    for (let i = 0; i < hex.length; i++) {
      binary += parseInt(hex[i], 16).toString(2).padStart(4, "0");
    }

    const state = [];
    for (let track = 0; track < this.tracks; track++) {
      const row = [];
      for (let step = 0; step < this.steps; step++) {
        row.push(binary[track * this.steps + step] === "1");
      }
      state.push(row);
    }
    return state;
  }
}
