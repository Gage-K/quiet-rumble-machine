import config from "./config/qr-config.js";

const qr = qrcode(config.typeNumber, config.errorCorrection);

qr.addData("https://www.google.com");
qr.make();

const size = qr.getModuleCount();

// 1D array - goes down each column for moduleCount amounts of pixels, then across the row
function getPixels(qr) {
  let qrPixels = [];
  for (let i = 0; i < size; i++) {
    // colums
    for (let j = 0; j < size; j++) {
      // rows?
      qrPixels.push(qr.isDark(j, i));
    }
  }
  return qrPixels;
}

// 2d array! [row][col]
function getPixels2D(qr) {
  const qrPixels2D = [];
  for (let row = 0; row < size; row++) {
    qrPixels2D[row] = [];
    for (let col = 0; col < size; col++) {
      qrPixels2D[row][col] = qr.isDark(row, col);
    }
  }
  return qrPixels2D;
}

const qrPixels = getPixels(qr);
const qrPixels2D = getPixels2D(qr);

const container = document.getElementById("container");

for (let row = 0; row < size; row++) {
  for (let col = 0; col < size; col++) {
    const pixelElement = document.createElement("button");
    qrPixels2D[row][col] === true
      ? pixelElement.classList.add("black")
      : pixelElement.classList.add("white");
    container.appendChild(pixelElement);
  }
}

// console.table(getPixels(qr));
