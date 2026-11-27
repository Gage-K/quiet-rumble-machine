/**
 * @description
 * Manages the URL and state serialization of the app.
 * Accepts a base url and a StateCodec (injected, not created here) and keeps
 * the browser hash in sync with the sequencer state. It also owns URL
 * assembly, so callers never string-concatenate the base and hash themselves.
 */
export default class URLManager {
  constructor({ url, codec }) {
    // source of truth is the browser url, so we sync state to the browser hash
    this._baseUrl = url
      ? url.split("#")[0]
      : window.location.origin + window.location.pathname;
    this._codec = codec;
  }

  // url before hash
  getBaseUrl() {
    return this._baseUrl;
  }

  // full current url: base + live hash. The one place base and hash are joined.
  getCurrentUrl() {
    return this._baseUrl + this.getHash();
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

  // true when the browser hash carries a serialized state
  hasState() {
    return window.location.hash.length > 2;
  }

  /**
   * @description
   * Decodes the hash (containing the serialized state) to get the state.
   * Returns null if no hash is found.
   */
  getStateFromHash() {
    const hash = this.getHash();

    // validate that the hash is not empty
    if (hash.length <= 1) {
      console.warn("Complete hashed state not found");
      return null;
    }

    // substring removes the # from the hash
    return this._codec.decode(hash.substring(1));
  }

  // serialize state into the browser hash
  save(state) {
    this.setHash(this._codec.encode(state));
  }
}
