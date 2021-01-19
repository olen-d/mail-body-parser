# mail-body-parser
Library to extract and decode message content from single and multi-part email bodies.
## Overview
When traveling across the internet, email messages are encoded in ways that are not human readable. Additionally, messages may include several alternative formats of the same content (e.g. plain text and html). The intent of mail-body-parser is to provide a light-weight library with a simple interface to pull message body content from an email and decode it, returning an object with keys corresponding to the content type (e.g. text, html) and the associated content in plain text.

Initially, mail-body-parser was developed to forward messages in a double blind email system that allows users to communicate over email, while keeping their addresses private. It would also be useful in applications where email input is posted to a web page or application, for example a post by email feature in blogging software. 
## Installation
`$ npm install mail-body-parser`

Then, to use mail-body-parser in your project, at the beginning of your file simply add either:
```javascript
const mailBodyParser = require("mail-body-parser");
```
or if you like destructuring: 
```javascript
const { parseBody } = require("mail-body-parser");
```
## Basic Use
Pass a boundary, header, and message to the parseBody function. If the message is not multipart, pass null as the boundary. If no header is included in the message, pass null as the header and the parser will defaault to US-ASCII. The parseBody function returns a promise that will resolve with an object with the keys corresponding to the content type and decoded messages in human readable format. The following contrived example shows how to use mail-body-parser.
### Example Message
```
--simpleboundary
content-type: text/plain
content-transfer-encoding: quoted-printable

Hello World=3F
--simpleboundary
content-type: text/html
content-transfer-encoding: quoted-printable

=3Chtml=3E=3Cp=3EHello World=3F=3C/p=3E=3Chtml=3E
--simpleboundary--
```
### Example Code
```javascript
const { parseBody } = require("mail-body-parser");

const boundary = "simpleboundary";
const header = "content-type: multipart/alternative";
const message = "<Example Message>";

const getBodyParts = async () => {
  const bodyParts = await parseBody(boundary, header, message);
  return bodyParts;
}

console.log(getBodyParts());
```
The expected output is:
```javascript
{
  "text": "Hello World?",
  "html": "<html><p>Hello World?</p>"
}
```
## API
* **parseBody**(<*string*> boundary, <*string*> header, <*string*> message) - *Promise* - Returns the decoded text associated with the email message, or messages in the case of multipart/alternative. The returned promise is resolved with an object with the following properties:
  * text - *string* - The decoded plain text message
  * html - *string* - The decoded html message
Note: if the input `message` did not include a text/plain or text/html body, `text` or `html` properties will not be included in the object.
## Issues and Feature Requests
Got a problem? Or a new idea you would like to see implemented? Either way, [please open a new issue](https://github.com/olen-d/mail-body-parser/issues/new).
## Tests
This project uses the [Jest JavaScript Testing Framework](https://jestjs.io/en/). To run the tests, install Jest and its dependencies. After Jest is installed, run `$ npm test` from the console. 

Tests are not included in the npm package. They can be dowmloaded from the [mail-body-parser repository](https://github.com/olen-d/mail-body-parser).
## Contributers
* Olen Daelhousen
## Project Status
Currently in development, contributers welcome. Please reach out using the contact information below if you are interested in contributing.

This package works with email messages sent from any standards compliant email client. 
### Tested Clients
mail-body-parser has been verified to work with the following clients:
* Apple iPhone
* Gmail
* Sogo
### Roadmap
In the near term, continue testing with additional email clients in order of highest priority to lowest:
1. Apple Mail
2. Outlook
3. Yahoo! Mail
4. Samsung Mail

Other efforts include:
* Develop a contribution guide and contributer code of conduct
* Add support for additional content types (e.g. enriched)
* Add support for additional content transfer encodings (currently only quoted-printable is supported)
* Auto-detect content transfer encoding if a header is not provided, or the encoding is not specified
* Custom parsers for non-standards compliant email clients
## Copyright
Copyright 2021 Olen Daelhousen. All Rights Reserved.
## License (MIT)
**In plain English**: Do what you want with the code, but you're on your own if it doesn't work.
**Legalease**: This project is licensed under the terms of the [MIT License](https://github.com/olen-d/mail-body-parser/blob/main/LICENSE).
## Contact
Email: <mailbodyparser@olen.dev>

Website: [Olen Daelhousen](https://www.olen.dev)
