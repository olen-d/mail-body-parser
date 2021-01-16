const { parseBody } = require("../index");

describe("Testing parseBody", () => {
  test("should return an object with a text property and the value of the text", async () => {
    const result = await parseBody(false, "Content-Type: text/plain\r\nContent-Transfer-Encoding: quoted-printable", "=5BTesting=5D This is a test message.");
    expect(result).toEqual({"text": "[Testing] This is a test message." });
  });

  // Note: the following returns the html message, since the text property is overwritten. This is expected and will be fixed in the future when HTML autodetection is implemented.
  test("should return an object with a text property and the value of the text should not be decoded", async () => {
    const result = await parseBody("simpleboundary",false,"\r\n--simpleboundary\r\n\r\n=5BTesting=5D This is a test message.\r\n--simpleboundary\r\n\r\n=3Chtml=3E=5BTesting=5D This is a test message.=3C/html=3E\r\n--simpleboundary--");
    expect(result).toEqual({"text": "\r\n\r\n=3Chtml=3E=5BTesting=5D This is a test message.=3C/html=3E"});
  });

  test("should return an object with text and html properties and the text and html values", async () => {
    const result = await parseBody("simpleboundary",false,"\r\n--simpleboundary\r\nContent-Type: text/plain\r\nContent-Transfer-Encoding: quoted-printable\r\n\r\n=5BTesting=5D This is a test message.\r\n--simpleboundary\r\nContent-Type: text/html\r\nContent-Transfer-Encoding: quoted-printable\r\n\r\n=3Chtml=3E=5BTesting=5D This is a test message.=3C/html=3E\r\n--simpleboundary--");
    expect(result).toEqual({"html": "<html>[Testing] This is a test message.</html>", "text": "[Testing] This is a test message."});
  });
});
