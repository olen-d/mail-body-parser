const parse = (boundary, message) => {
  return new Promise((resolve, reject) => {
    try {
      const bodyParts = {};

      // Check for a boundary, if it exists then deal with the multiple parts
      if (boundary) {
        // Multipart
        // multipart-mixed
        // multipart-alternative
        bodyParts.message = message;

      } else {
        // If not, figure out what we have and then process it
        // Get the header index
        const headerIndex = message.indexOf("\r\n\r\n");

        // If no headers are present, set the body equal to the message, otherwise slice off the headers
        const body = headerIndex === -1 ? message : message.slice(headerIndex + 4);

        // Check for Content-types
        if (message.includes("Content-type:")) {
          if (message.includes("Content-type: text/plain"))
          {
            bodyParts.text = body;
          } else if (message.includes("Content-type: text/html")) {
            bodyParts.html = body;
          } else {}
        } else {
          // No content type, assume plain text and US ASCII
          bodyParts.text = body;
        }
      }
      resolve({ status: 200, data: bodyParts });
    } catch(error) {
      reject({ error });
    }
  });
}

module.exports = { parse };
