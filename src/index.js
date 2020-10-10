const detectClient = message => {
  const isAppleIos = message.includes("--Apple-Mail-");

  if (isAppleIos) {
    return "Apple, Ios";
  }
}

module.exports = { detectClient }
