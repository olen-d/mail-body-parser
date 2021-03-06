const { decodeBody, detectContentType, parse } = require("../generic");

describe("Testing decodeBody", () => { 
  test("should decode content-transfer-encoding: quoted-printable", () => {
    expect(decodeBody("Content-Transfer-Encoding: quoted-printable","=5BTesting=5D This is a test message.")).toBe("[Testing] This is a test message.");
  });
  
  test("should return unchanged body if no content-transfer-encoding specified", () => {
    expect(decodeBody("Content-Type: text/html; charset=utf-8","=5BTesting=5D This is a test message.")).toBe("=5BTesting=5D This is a test message.");
  });
  
  test("should throw an error if content-transfer-encoding is unrecognized", () => {
    expect(() => {
      decodeBody("Content-Transfer-Encoding: unrecognized-type","[Testing] This is a test message.");
    }).toThrow("Content-Transfer-Encoding not recognized. Failed to decode body");
  });

  test("should return unchanged body if no header provided", () => {
    expect(decodeBody(false, "=5BTesting=5D This is a test message.")).toBe("=5BTesting=5D This is a test message.");
  });
});

describe("Testing detectContentType", () => {
  test("should return html on detecting content-type: text/html", () => {
    expect(detectContentType("Content-Type: text/html")).toBe("html");
  });
  
  test("should return text on detecting content-type: text/plain", () => {
    expect(detectContentType("Content-Type: text/plain")).toBe("text");
  });
  
  test("should throw an error for an unrecognized content-type:", () => {
    expect(() => {
      detectContentType("Content-Type: text/enriched");
    }).toThrow("Content-Type not recognized or invalid. Failed to detect content type.");
  });
  
  test("should return text if no content-type specified", () => {
    expect(detectContentType("")).toBe("text");
  });
});

describe("Testing parse", () => {
  test("should return an object with a text property and the value of the text", async () => {
    const result = await parse(false, "Content-Type: text/plain\r\nContent-Transfer-Encoding: quoted-printable", "=5BTesting=5D This is a test message.");
    expect(result).toEqual({ "text": "[Testing] This is a test message." });
  });
  // Note: the following returns the html message, since the text property is overwritten. This is expected and will be fixed in the future when HTML autodetection is implemented.
  test("should return an object with a text property and the value of the text should not be decoded", async () => {
    const result = await parse("simpleboundary",null,"\r\n--simpleboundary\r\n\r\n=5BTesting=5D This is a test message.\r\n--simpleboundary\r\n\r\n=3Chtml=3E=5BTesting=5D This is a test message.=3C/html=3E\r\n--simpleboundary--");
    expect(result).toEqual({ "text": "\r\n\r\n=3Chtml=3E=5BTesting=5D This is a test message.=3C/html=3E" });
  });

  test("should return an object with text and html properties and the text and html values", async () => {
    const result = await parse("simpleboundary",null,"\r\n--simpleboundary\r\nContent-Type: text/plain\r\nContent-Transfer-Encoding: quoted-printable\r\n\r\n=5BTesting=5D This is a test message.\r\n--simpleboundary\r\nContent-Type: text/html\r\nContent-Transfer-Encoding: quoted-printable\r\n\r\n=3Chtml=3E=5BTesting=5D This is a test message.=3C/html=3E\r\n--simpleboundary--");
    expect(result).toEqual({ "html": "<html>[Testing] This is a test message.</html>", "text": "[Testing] This is a test message." });
  });
});
