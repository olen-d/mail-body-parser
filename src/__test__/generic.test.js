const { decodeBody, detectContentType, processBodyPart } = require("../generic");

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
  
  test("should return false for an unrcognized content-type:", () => {
    expect(detectContentType("Content-Type: text/enriched")).toBe(false);
  });
  
  test("should return text if no content-type specified", () => {
    expect(detectContentType("")).toBe("text");
  });
});

// processBodyPart tests
test("should return an object with text and html properties and the text or html message", () => {
  expect(processBodyPart("This is a test message.")).toEqual({text: "This is a test message."});
});
