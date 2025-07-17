const tracks = 4;
const steps = 16;

const config = {
  typeNumber: 5, // Versions 1 (21 nodes) thtrough 40 (177 nodes)
  errorCorrection: "H",
  baseUrl: "https://qrmrc.vercel.app/",
  tracks,
  steps,
  defaultState: Array(tracks).fill(Array(steps).fill(false)),
};

export default config;
