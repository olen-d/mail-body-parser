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

module.exports = { detectClient }
