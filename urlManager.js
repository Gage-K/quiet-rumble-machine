import { encodeToHex, decodeFromHex } from "./encoding.js";

export default class URLManager {
  constructor({ url }) {
    // realized that the source of truth is the browser url, so we need to sync the url state to the browser url
    this._baseUrl = url
      ? url.split("#")[0]
      : window.location.origin + window.location.pathname;
  }

  getBaseUrl() {
    return this._baseUrl;
  }

  getHash() {
    // Hash needs to always be read from the browser to maintain the source of truth
    return window.location.hash || "#";
  }

  setHash(hash) {
    // Only update the browser hash
    // Validate whether the hash starts with a #
    window.location.hash = hash.startsWith("#") ? hash : `#${hash}`;
  }

  getStateFromHash() {
    const hash = this.getHash();
    if (hash.length <= 1) {
      console.warn("Complete hashed state not found");
      return null;
    }
    return decodeFromHex(hash.substring(1));
  }

  setStateToHash(state) {
    const encodedState = encodeToHex(state);
    this.setHash(encodedState);
  }
}
