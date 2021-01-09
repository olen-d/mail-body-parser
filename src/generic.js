const quotedPrintable = require("quoted-printable");
const utf8 = require("utf8");

/**
 * Determines if a body part is text/plain or text/html and if it's encoded with quoted printable and decodes it
 * @author Olen Daelhousen <mailbodyparser@olen.dev>
 * @param {string} bodyPart - an individual body part of a multi-part message, or a single message
 * @returns {object} adds text and html properties to the newBodyParts object along with the text or html message
 */

const processBodyPart = bodyPart => {
  const newBodyParts = {};

  // Look for a content-type field in the body part
  const reContentType = /content-type:/gi;
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
      newBodyParts.text = decoded ? decoded : body;
    }
    if (bodyPart.includes("text/html")) {
      let decoded = false;

      if (bodyPart.includes("Content-Transfer-Encoding: quoted-printable")) {
        decoded = utf8.decode(quotedPrintable.decode(body));
      }
      newBodyParts.html = decoded ? decoded : body;
    }
  } else {
    // No content type, assume plain text and US ASCII
    const decoded = utf8.decode(quotedPrintable.decode(bodyPart)); // TODO: Update in the future to get quoted-printable from the headers
    newBodyParts.text = decoded;
  }
  return newBodyParts;
}

/**
 * Loops through the parts of a multipart internet message and decodes them if necessary
 * @author Olen Daelhousen <mailbodyparser@olen.dev>
 * @param {boolean, string} boundary - boolean (false) if a boundary does not exist, string representing the boundary if it does
 * @param {string} message - an internet message body
 * @returns {object} Promise object returns body parts
 */

const parse = (boundary, message) => {
  return new Promise((resolve, reject) => {
    try {
      const bodyParts = {};

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
          const newBodyParts = processBodyPart(bodyPart);
          Object.assign(bodyParts, newBodyParts);
        }
      } else {
        // If a boundary is not provided assume plain text and process the message
        const newBodyParts = processBodyPart(message);
        Object.assign(bodyParts, newBodyParts);
      }
      resolve({ status: 200, message: "ok", data: bodyParts });
    } catch(error) {
      reject({ status: 500, message: "Internal Server Error", error });
    }
  });
}

module.exports = { parse };
