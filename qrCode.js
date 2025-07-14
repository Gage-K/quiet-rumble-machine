export default class QRCode {
  // qr code generation requires: data(url), size, type, errorCorrection
  constructor({ url, typeNumber, errorCorrectionLevel }) {
    this.qr = null; // this is the qr code object itself
    this.typeNumber = typeNumber;
    this.errorCorrectionLevel = errorCorrectionLevel;
    this.url = url;
    this.qrNodes = null; // this is the qr code nodes
    this.size = null;
    this.init(); // initialize the qr code on load
  }

  init() {
    this.generateQR();
  }

  generateQR() {
    console.log("generating qr");
    this.qr = qrcode(this.typeNumber, this.errorCorrectionLevel);
    this.qr.addData(this.url);
    this.qr.make();
    this.size = this.qr.getModuleCount();
    this.qrNodes = this.getQRNodes();
  }

  getQRData() {
    return this.getQRNodes();
  }

  getQRSize() {
    return this.qr.getModuleCount();
  }

  getQRNodes() {
    const qrNodes = [];
    for (let row = 0; row < this.size; row++) {
      qrNodes[row] = [];
      for (let col = 0; col < this.size; col++) {
        qrNodes[row][col] = this.qr.isDark(row, col);
      }
    }
    return qrNodes;
  }
}
