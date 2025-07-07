console.log("hello world, ready to rumble");

var typeNumber = 3; // size or version -- from 1 (21) to 40 (177)
var errorCorrectionLevel = 'H';
var qr = qrcode(typeNumber, errorCorrectionLevel);

qr.addData('https://www.google.com');
qr.make();

console.log(qr.getModuleCount()); // 177 for 40, pixels inone direction
// document.getElementById('placeHolder').innerHTML = qr.createImgTag(); // print qr code for reference


// goes down each column for moduleCount amounts of pixels, then across the row
function getPixels(qr) {
    let qrPixels = [];
    for (let i = 0; i < qr.getModuleCount(); i++) { // colums
        for (let j = 0; j < qr.getModuleCount(); j++) { // rows?
            qrPixels.push(qr.isDark(j, i));
        }
    }
    return qrPixels;
}

let qrPixels = getPixels(qr);

const container = document.getElementById('container');

const pixelElement = document.createElement('div');

for (let i = 0; i < qr.getModuleCount() * qr.getModuleCount(); i++) {
    const pixelElement = document.createElement('button');
    console.log(qrPixels[i]);
    (qrPixels[i] === true) ? pixelElement.classList.add('black') : pixelElement.classList.add('white');
    container.appendChild(pixelElement);
}



console.table(getPixels(qr));






// qr.addData('Hi!');
// qr.make();
// document.getElementById('placeHolder').innerHTML = qr.createImgTag();