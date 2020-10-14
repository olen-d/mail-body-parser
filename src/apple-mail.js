const parse = (boundary, message) => {
  return new Promise((resolve, reject) => {
    try {

      // Get the starting positions of each body part
      const boundaryIndices = [];
      if (boundary) {

        // Get the starting and ending postions of each section
        let currentIndex = 0;
        let fromIndex = 0;

        while (currentIndex !== -1) {
          currentIndex = message.indexOf(boundary, fromIndex);
          boundaryIndices.push(currentIndex);
          fromIndex = currentIndex + 1;
        }
      }

      const bodyParts = { text: null, html: null };
      const boundaryLen = boundary.length;
      const boundaryIndicesLen = boundaryIndices.length - 1; // The last value in boundaryIndices should always be -1

      let j = 0;
      for (let i =0; i < boundaryIndicesLen; i++) {
        j = i + 1;

        // Get the body part, minus the boundaries
        const bodyPart = message.slice(boundaryIndices[i] + boundaryLen, boundaryIndices[j]);

        // Process the body part, first get just the body without the header information
        const headerIndex = bodyPart.indexOf("\r\n\r\n");
        const body = bodyPart.slice(headerIndex + 4);

        if (bodyPart.includes("text/plain")) {
          bodyParts.text = body;
        }
        if (bodyPart.includes("text/html")) {
          bodyParts.html = body;
        }
      }

      resolve({ status: 200, data: bodyParts });
    } catch(error) {
      reject({ error });
    }
  });
};

module.exports = { parse };
