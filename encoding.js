/**
 * @description
 * Handles the encoding and decoding of the state of the sequencer
 * Accepts data (state of the sequencer) and returns a hex string
 */
function encodeToHex(data) {
  let hexString = "";

  // compress data to binary so that it just stores a linear list of values
  let binaryString = convertDataToBinary(data);

  // loop through the binary string 4 bits at a time and convert to hex
  for (let i = 0; i < binaryString.length; i += 4) {
    const chunk = binaryString.slice(i, i + 4); // get 4 bits at a time
    const paddedChunk = chunk.padEnd(4, "0"); // Pad if needed
    hexString += parseInt(paddedChunk, 2).toString(16);
  }
  return hexString;
}

/**
 * @description
 * Helper function to convert the data (state of the sequencer) to a binary string
 * Accepts data (state of the sequencer) and returns a binary string
 * @returns binary string
 */
function convertDataToBinary(data) {
  let binaryString = "";
  for (let i = 0; i < data.length; i++) {
    for (let j = 0; j < data[i].length; j++) {
      binaryString += data[i][j] ? "1" : "0";
    }
  }
  return binaryString;
}

/**
 * @description
 * Helper function to convert a hex string to a binary string
 * Accepts a hex string and returns a binary string
 * @returns binary string
 */
function convertHexToBinary(hexString) {
  let binaryString = "";
  for (let i = 0; i < hexString.length; i++) {
    const hexChar = hexString[i];
    const binaryChunk = parseInt(hexChar, 16).toString(2).padStart(4, "0");
    binaryString += binaryChunk;
  }
  return binaryString;
}

/**
 * @description
 * Decodes a hex string into a state of the sequencer
 * @returns state of the sequencer based on encoded data
 */
function decodeFromHex(hexString) {
  const binaryString = convertHexToBinary(hexString);
  const numSteps = 16;
  const numTracks = Math.floor(binaryString.length / numSteps);
  const outputArray = [];

  for (let i = 0; i < numTracks; i++) {
    const trackArray = [];
    for (let j = 0; j < numSteps; j++) {
      const index = i * numSteps + j;
      trackArray.push(binaryString[index] === "1");
    }
    outputArray.push(trackArray);
  }
  return outputArray;
}

export { encodeToHex, decodeFromHex };
