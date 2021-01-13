const quotedPrintable = require("quoted-printable");
const utf8 = require("utf8");

/**
 * Detects the encoding of the bodd and decodes as appropriate
 * @author Olen Daelhousen <mailbodyparser@olen.dev>
 * @param {string} header - the header included in the body part or from the email message 
 * @param {string} body - the body of the email message without headers
 * @returns {string} - throws an error if the content transfer encoding is unrecognized, the decoded body of the email
 */

const decodeBody = (header, body) => {
  if (header) {
    const reContentTransferEncoding = /content-transfer-encoding:/gi;
    if (reContentTransferEncoding.test(header)) {
      if(header.includes("quoted-printable")) {
        const decoded = utf8.decode(quotedPrintable.decode(body));
        return decoded;
      } else {
        throw new Error("Content-Transfer-Encoding not recognized. Failed to decode body.");
      }
    } else {
      // No content transfer encoding specified, default to US-ASCII, as per RFC 2046
      return body;
    }
  } else {
    // No header information, default to US-ASCII, as per RFC 2046
    return body;
  }
}

/**
 * Detects if a body part is text/html or text/plain and defaults to text/plain if no content type is specified
 * @author Olen Daelhousen <mailbodyparser@olen.dev>
 * @param {string} bodyPart - an individual body part of a multi-part message, or a single message
 * @returns {string} false if the body part includes an unrecognized Content-Type, html, or text 
 */

const detectContentType = bodyPart => {
  const reContentType = /content-type:/gi;
  if (reContentType.test(bodyPart)) {
    if (bodyPart.includes("text/plain")) {
      return "text"
    }
    if (bodyPart.includes("text/html")) {
      return "html";
    } else {
      return false;
    }
  } else {
    // No content type specified, default to text/plain, as per RFC 2046
    return "text";
  }
}

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

module.exports = { decodeBody, detectContentType, parse, processBodyPart };
