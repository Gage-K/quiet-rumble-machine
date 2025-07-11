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

function convertDataToBinary(data) {
  let binaryString = "";
  for (let i = 0; i < data.length; i++) {
    for (let j = 0; j < data[i].length; j++) {
      binaryString += data[i][j] ? "1" : "0";
    }
  }
  return binaryString;
}

function convertHexToBinary(hexString) {
  let binaryString = "";
  for (let i = 0; i < hexString.length; i++) {
    const hexChar = hexString[i];
    const binaryChunk = parseInt(hexChar, 16).toString(2).padStart(4, "0");
    binaryString += binaryChunk;
  }
  console.log("binaryString convertHexToBinary", binaryString);
  return binaryString;
}

function decodeFromHex(hexString) {
  const binaryString = convertHexToBinary(hexString);
  const numSteps = 16;
  const numTracks = Math.floor(binaryString.length / numSteps);
  console.log("binaryString decode", binaryString);
  console.log("binaryString.length", binaryString.length);
  console.log("numTracks", numTracks);
  const outputArray = [];

  for (let i = 0; i < numTracks; i++) {
    const trackArray = [];
    for (let j = 0; j < numSteps; j++) {
      const index = i * numSteps + j;
      trackArray.push(binaryString[index] === "1");
    }
    outputArray.push(trackArray);
  }
  console.log("outputArray", outputArray);
  return outputArray;
}

// const testData = new Array(4).fill(
//   new Array(16).fill((index) => (index % 2 === 0 ? true : false))
// );

export { encodeToHex, decodeFromHex };
