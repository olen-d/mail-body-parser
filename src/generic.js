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
    // TODO: Autodetect quoted-printable to make this more robust in the future
    return body;
  }
}

/**
 * Detects if a body part is text/html or text/plain and defaults to text/plain if no content type is specified
 * @author Olen Daelhousen <mailbodyparser@olen.dev>
 * @param {string} header - the header included an individual body part of a multi-part message, or from a single message
 * @returns {string} throws an error if the content type is unrecognized, html, or text 
 */

const detectContentType = header => {
  const reContentType = /content-type:/gi;
  if (reContentType.test(header)) {
    if (header.includes("text/plain")) {
      return "text"
    }
    if (header.includes("text/html")) {
      return "html";
    } else {
      throw new Error("Content-Type not recognized or invalid. Failed to detect content type.");
    }
  } else {
    // No content type specified, default to text/plain, as per RFC 2046
    // TODO: Autodetect HTML and/or enriched to make this more robust
    return "text";
  }
}

/**
 * Loops through the parts of a multipart internet message and decodes them if necessary
 * @author Olen Daelhousen <mailbodyparser@olen.dev>
 * @param {boolean, string} boundary - boolean (false) if a boundary does not exist, string representing the boundary if it does
 * @param {string} header - null if a header is not provided, string representing the header of a message if it does
 * @param {string} message - an internet message body
 * @returns {object} Promise object returns text and html properties with the associated text and html messages 
 */

const parse = (boundary, header, message) => {
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
        const totalBodyParts = boundaryIndices.length - 2; // There is always one more boundary than body parts and the last value in boundaryIndices should always be -1

        let j = 0;
        for (let i =0; i < totalBodyParts; i++) {
          j = i + 1;

          // Get the body part, minus the boundaries
          const bodyPart = message.slice(boundaryIndices[i] + boundaryLen, boundaryIndices[j] - 4); // -4 to account for the CRLF and -- the boundary starts with
          const reContentType = /content-type:/gi;

          if (reContentType.test(bodyPart)) {
            // Get just the body without the header information
            // As per the specification, headers are followed by two CRLFs
            const headerIndex = bodyPart.indexOf("\r\n\r\n");
            const bpHeader = bodyPart.slice(0, headerIndex);
            const body = bodyPart.slice(headerIndex + 4);

            const contentType = detectContentType(bpHeader);
            const decodedBody = decodeBody(bpHeader, body);
            const newBodyParts = { [contentType]: decodedBody }

            Object.assign(bodyParts, newBodyParts);
          } else {
            // No content-type in header
            // Assume there is no header because content-type is not specified. 
            const contentType = detectContentType("none"); // Will default to text
            const decodedBody = decodeBody(false, bodyPart); // Will return text
            const newBodyParts = { [contentType]: decodedBody };

            Object.assign(bodyParts, newBodyParts);
          }
        }
      } else {
        // If a boundary is not provided, this is a single message
        // Header comes from calling function
        const contentType = detectContentType(header);
        const decodedBody = decodeBody(header, message);
        const newBodyParts = { [contentType]: decodedBody };
        Object.assign(bodyParts, newBodyParts);
      }
      resolve({ ...bodyParts });
    } catch(error) {
      reject(new Error(error));
    }
  });
}

module.exports = { decodeBody, detectContentType, parse };
