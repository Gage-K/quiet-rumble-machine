import { encodeToHex, decodeFromHex } from "./encoding.js";

/**
 * @description
 * Manages the URL and state serialization of the app
 * Accepts base url from configuration options and updates browser url on state change with hash
 */
export default class URLManager {
  constructor({ url }) {
    // source of truth is the browser url, so we need to sync the url state to the browser url
    this._baseUrl = url
      ? url.split("#")[0]
      : window.location.origin + window.location.pathname;
  }

  // url before hash
  getBaseUrl() {
    return this._baseUrl;
  }

  // hash after '#' in url
  getHash() {
    // Hash needs to always be read from the browser to maintain the source of truth
    return window.location.hash || "#";
  }

  setHash(hash) {
    // Only update the browser hash
    // Validate whether the hash starts with a #
    window.location.hash = hash.startsWith("#") ? hash : `#${hash}`;
  }

  /**
   * @description
   * Decodes the hash (containing the serialized state) to get the state
   * Returns null if no hash is found
   */
  getStateFromHash() {
    const hash = this.getHash();

    // validate that the hash is not empty
    if (hash.length <= 1) {
      console.warn("Complete hashed state not found");
      return null;
    }

    // substring removes the # from the hash
    return decodeFromHex(hash.substring(1));
  }

  setStateToHash(state) {
    const encodedState = encodeToHex(state);
    this.setHash(encodedState);
  }
}
