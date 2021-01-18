const generic = require("./generic");
// Currently the generic parser works fine, but in the future specific parsers may be needed for clients that send non-compliant messages.

/**
 * Splits out individual parts of messages based on the email client the message was sent from
 * @author Olen Daelhousen <mailbodyparser@olen.dev>
 * @param {string} boundary - the multi-part boundary delimiter
 * @param {string} header - the header of the email message
 * @param {string} message - the body of the email message
 * @returns {Promise} Promise object returns body parts
 */

const parseBody = async (boundary, header, message) => {
  try {
    // Use the generic parser
    // As noted above, the generic parser currently handles everything, but in the future client-specific code could be inserted here
    const result = await generic.parse(boundary, header, message);
    return result;
  } catch(error) {
    return(error);
  }
}

module.exports = { parseBody }
