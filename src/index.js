const generic = require("./generic");
// Currently the generic parser works fine, but in the future specific parsers may be needed for clients that send non-compliant messages.

/**
 * Splits out individual parts of messages based on the email client the message was sent from
 * @author Olen Daelhousen <mailbodyparser@olen.dev>
 * @param {string} boundary - the multi-part boundary delimiter
 * @param {string} message - the body of the email message
 * @returns {Promise} Promise object returns body parts
 */

const parseBody = (boundary, message) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Use the generic parser
      // As noted abover, the generic parser currently handles everything, but in the future client-specific code could be inserted here
      result = await generic.parse(boundary, message);
      const { status, data } = result;

      if (status !== 200) {
        bodyParts = { error: "Failed to parse email message." };
      } else {
        bodyParts = data;
      }
      resolve({ bodyParts });
    } catch(error) {
      reject({ error });
    }
  });
}

module.exports = { parseBody }
