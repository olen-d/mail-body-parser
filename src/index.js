const appleMail = require("./apple-mail");

const detectClient = message => {
  return new Promise((resolve, reject) => {
    try {
      let client = null;

      const appleMail = "--Apple-Mail-";

      if (message.includes(appleMail)) {
        client = "apple-mail";
      };

      resolve({ client });
    } catch(error) {
      reject({ error });
    }
  });
}

const parseBody = (boundary, message) => {
  return new Promise(async (resolve, reject) => {
    try {
      let bodyParts = null;

      const { client } = await detectClient(message);

      switch (client) {
        case "apple-mail":
          result = await appleMail.parse(boundary, message);
          const { status, data } = result;
          if (status !== 200)
            {
              // Error
            } else {
              // Return the multi-part body
              bodyParts = data;
              
            }
          break;
        default:
          // Use the generic parser
          break;
      }
      resolve({ bodyParts });
    } catch(error) {
      reject({ error });
    }
  });
}

module.exports = { detectClient, parseBody }
