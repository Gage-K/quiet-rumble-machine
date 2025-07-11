function encodeToHex(data) {
  let hexString = "";

  // compress data to binary so that it just stores a linear list of values
  let binaryString = convertDataToBinary(data);

  // loop through the binary string 4 bits at a time and convert to hex
  for (let i = 0; i < binaryString.length; i += 4) {
    const chunk = binaryString.slice(i, i + 4); // get 4 bits at a time
    const paddedChunk = chunk.padEnd(4, "0"); // Pad if needed
    // console.log(paddedChunk);
    hexString += parseInt(paddedChunk, 2).toString(16);
  }
  // console.log("binaryString", binaryString);
  // console.log("encoded hex string", hexString);
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
  return parseInt(hexString, 16).toString(2);
}

function decodeFromHex(hexString) {
  const binaryString = convertHexToBinary(hexString);
  const numSteps = 16;
  const numTracks = binaryString.length % numSteps;
  console.log(numTracks);
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
