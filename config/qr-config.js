const tracks = 4;
const steps = 16;

const config = {
  typeNumber: 4, // Versions 1 (21 nodes) thtrough 40 (177 nodes)
  errorCorrection: "H",
  baseUrl: "www.google.com",
  tracks,
  steps,
  defaultState: Array(tracks).fill(Array(steps).fill(false)),
};

export default config;
