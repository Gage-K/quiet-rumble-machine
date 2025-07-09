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

const steps = 16;
const numTracks = 4;

// for (let i = 0; i < numTracks; i++) {
//   const trackContainer = document.createElement("div");
//   trackContainer.classList.add("track");
//   trackContainer.classList.add(`track-${i + 1}`);
//   for (let j = 0; j < steps; j++) {
//     if (j === steps / 2) {
//       const spacer = document.createElement("span");
//       spacer.classList.add("spacer");
//       trackContainer.appendChild(spacer);
//     }
//     const stepButton = document.createElement("button");
//     stepButton.classList.add("step-button");
//     stepButton.classList.add(`step-${j + 1}`);
//     trackContainer.appendChild(stepButton);
//   }
//   container.appendChild(trackContainer);
// }

// x = 8–25
// y = 8–12

function createQRGrid() {
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      if (col >= 7 && col < 26) {
        if (row >= 7 && row < 13) {
          if (col === 7 || col === 25 || row === 7 || row === 12) {
            const pixelElement = document.createElement("div");
            pixelElement.classList.add("sequencer-border");
            container.appendChild(pixelElement);
            continue;
          }

          if (col === Math.floor(size / 2)) {
            const spacer = document.createElement("span");
            spacer.classList.add("spacer");
            container.appendChild(spacer);
            continue;
          }

          const pixelElement = document.createElement("button");
          pixelElement.classList.add("step");
          container.appendChild(pixelElement);
          continue;
        }
      }

      const pixelElement = document.createElement("div");
      qrPixels2D[row][col] === true
        ? pixelElement.classList.add("qr-brick-on")
        : pixelElement.classList.add("qr-brick-off");
      container.appendChild(pixelElement);
    }
  }
}

function addStepClicks() {
  const buttonSteps = document.querySelectorAll("button");
  buttonSteps.forEach((step) => {
    step.addEventListener("click", () => {
      // if (step.classList.contains("active-step")) {
      //   step.classList.toggle("active-step");
      // }
      step.classList.toggle("active-step");
    });
  });
  console.log(buttonSteps);
}

createQRGrid();
addStepClicks();
// console.table(getPixels(qr));
