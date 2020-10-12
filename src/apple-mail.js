const parse = message => {
  return new Promise((resolve, reject) => {
    try {
      // Parse the body
      // Apple Mail adds a boundary in the format of --Apple-Mail-CCCCCCCC-CCCC-CCCC-CCCC-CCCCCCCCCCCC where "C" is any alphanumeric character
      // Get the list of boundaries
      const regex = /--Apple-Mail-[A-Za-z0-9]{8}(-[A-Zz-z0-9]{4}){3}-[A-Zz-z0-9]{12}/g;
      const boundaries = message.match(regex);
      message = boundaries;

      // Iterate through the matches using indexOf
      // Then begin processing...
      // Check for plain text

      // Check for html
      resolve({ status: 200, data: message });
    } catch(error) {
      reject({ error });
    }
  });
};

module.exports = { parse };
