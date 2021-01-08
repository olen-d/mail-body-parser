const quotedPrintable = require("quoted-printable");
const utf8 = require("utf8");

const parse = (boundary, message) => {
  return new Promise((resolve, reject) => {
    try {
      const bodyParts = {};

      const processBodyPart = bodyPart => {
        // Look for a content-type field in the body part
        reContentType = /content-type:/gi;
        if (reContentType.test(bodyPart)) {
          // Get just the body without the header information
          // As per the specification, headers are followed by two CRLFs
          const headerIndex = bodyPart.indexOf("\r\n\r\n");
          const body = bodyPart.slice(headerIndex + 4);

          if (bodyPart.includes("text/plain")) {
            let decoded = false;

            if (bodyPart.includes("Content-Transfer-Encoding: quoted-printable")) {
              decoded = utf8.decode(quotedPrintable.decode(body));
            } 
            bodyParts.text = decoded;
          }
          if (bodyPart.includes("text/html")) {
            let decoded = false;

            if (bodyPart.includes("Content-Transfer-Encoding: quoted-printable")) {
              decoded = utf8.decode(quotedPrintable.decode(body));
            }
            bodyParts.html = decoded;
          }
        } else {
          // No content type, assume plain text and US ASCII
          decoded = utf8.decode(quotedPrintable(bodyPart)); // TODO: Update in the future to get quoted-printable from the headers
          bodyParts.text = decoded;
        }
      }

      // Check for a boundary, if it exists then deal with the multiple parts
      const boundaryIndices = [];
      if (boundary) {
        let currentIndex = 0;
        let fromIndex = 0;

        // Get the starting and ending postions of each section
        while (currentIndex !== -1) {
          currentIndex = message.indexOf(boundary, fromIndex);
          boundaryIndices.push(currentIndex);
          fromIndex = currentIndex + 1;
        }

        const boundaryLen = boundary.length;
        const boundaryIndicesLen = boundaryIndices.length - 1; // The last value in boundaryIndices should always be -1

        let j = 0;
        for (let i =0; i < boundaryIndicesLen; i++) {
          j = i + 1;

          // Get the body part, minus the boundaries
          const bodyPart = message.slice(boundaryIndices[i] + boundaryLen, boundaryIndices[j]);
          processBodyPart(bodyPart);
        }
      } else {
        // If a boundary is not provided assume plain text and process the message
        processBodyPart(message);
      }
      resolve({ status: 200, message: "ok", data: bodyParts });
    } catch(error) {
      reject({ status: 500, message: "Internal Server Error", error });
    }
  });
}

module.exports = { parse };
