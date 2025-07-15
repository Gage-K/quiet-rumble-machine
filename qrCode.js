/**
 * @description
 * This is a class for handling the state of and generating QR codes
 * It accepts configuration options (url, typeNumber, errorCorrectionLevel)
 */
export default class QRCode {
  // QR code generation requires: data(url), size, type, errorCorrection
  constructor({ url, typeNumber, errorCorrectionLevel }) {
    this.qr = null; // this is the QR code object itself
    this.typeNumber = typeNumber;
    this.errorCorrectionLevel = errorCorrectionLevel;
    this.url = url;
    this.qrNodes = null; // QR code nodes are the individual pixels of the QR code --> used to render the QR code visually
    this.size = null;
    this.init(); // initialize the QR code on load
  }

  /**
   * @description
   * Initializes the QR code on load
   */
  init() {
    this.generateQR();
  }

  /**
   * @description
   * Generates the QR code based on current config options and current url
   */
  generateQR() {
    this.qr = qrcode(this.typeNumber, this.errorCorrectionLevel);
    this.qr.addData(this.url);
    this.qr.make();
    this.size = this.qr.getModuleCount();
    this.qrNodes = this.getQRNodes();
  }

  getQRData() {
    return this.getQRNodes();
  }

  /**
   * @description
   * Returns the size of the QR code, which is the length of one side of the QR code
   */
  getQRSize() {
    return this.qr.getModuleCount();
  }

  /**
   * @description
   * Returns the QR code nodes, which are the individual pixels of the QR code
   */
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
