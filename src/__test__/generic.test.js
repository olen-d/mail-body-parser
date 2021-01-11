const { detectContentType, processBodyPart } = require("../generic");

describe("Testing detectContentType", () => {
  test("Detect Content-Type: text/html", () => {
    expect(detectContentType("Content-Type: text/html")).toBe("html");
  });
  
  test("Detect Content-Type: text/plain", () => {
    expect(detectContentType("Content-Type: text/plain")).toBe("text");
  });
  
  test("Unrcognized Content-Type:", () => {
    expect(detectContentType("Content-Type: text/enriched")).toBe(false);
  });
  
  test("No Content-Type specified", () => {
    expect(detectContentType("")).toBe("text");
  });
})

// processBodyPart tests
test("Return an object with text and html properties and the text or html message", () => {
  expect(processBodyPart("This is a test message.")).toEqual({text: "This is a test message."});
});
