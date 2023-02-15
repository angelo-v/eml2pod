import { createReadStream } from "fs";
import * as path from "path";
import { Email } from "../domain/Email";
import { parseEmail } from "./parseEmail";

describe("parse email", () => {
  describe("plain text", () => {
    let email: Email;
    beforeEach(async () => {
      const stream = createReadStream(
        path.join(__dirname, "../_test-fixtures/plain-text.eml")
      );
      email = await parseEmail(stream);
    });

    it("parses subject, date, to and from headers", async () => {
      expect(email.headers).toMatchObject({
        subject: "Test E-Mail subject",
        from: [
          {
            address: "alice@mail.example",
            name: "Alice",
          },
        ],
        to: [
          {
            address: "bob@mail.example",
            name: "Bob",
          },
        ],
        date: new Date("2023-01-30T17:19:20.000Z"),
      });
    });

    it("parses the email text", () => {
      const fullHtml = `
<!doctype html>
<html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport"
              content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0">
        <meta http-equiv="X-UA-Compatible" content="ie=edge">
        <title>Test E-Mail subject</title>
    </head>
    <body>
        <p>Dear Bob,</p><p>this is a message for testing purposes.</p><p>Sincerely,<br/>Alice</p>
    </body>
</html>
    `;
      expect(email.html).toEqual(fullHtml);
    });

    it("has no attachments", async () => {
      expect(email.attachments).toEqual([]);
    });
  });

  describe("html without attachments", () => {
    let email: Email;
    beforeEach(async () => {
      const stream = createReadStream(
        path.join(__dirname, "../_test-fixtures/html-mail.eml")
      );
      email = await parseEmail(stream);
    });

    it("parses subject, date, to and from headers", async () => {
      expect(email.headers).toMatchObject({
        subject: "Test E-Mail subject",
        from: [
          {
            address: "alice@mail.example",
            name: "Alice",
          },
        ],
        to: [
          {
            address: "bob@mail.example",
            name: "Bob",
          },
        ],
        date: new Date("2023-01-30T17:19:20.000Z"),
      });
    });

    it("parses the email to html", () => {
      const fullHtml = `
<!doctype html>
<html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport"
              content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0">
        <meta http-equiv="X-UA-Compatible" content="ie=edge">
        <title>Test E-Mail subject</title>
    </head>
    <body>
        <p>Dear Bob,</p>
<p>this is a html message for testing purposes.</p>
<p>Sincerly,<br>Alice</p>
    </body>
</html>
    `;
      expect(email.html).toEqual(fullHtml);
    });

    it("has no attachments", async () => {
      expect(email.attachments).toEqual([]);
    });
  });

  describe("with attachments", () => {
    let email: Email;
    beforeEach(async () => {
      const stream = createReadStream(
        path.join(__dirname, "../_test-fixtures/html-mail-with-attachments.eml")
      );
      email = await parseEmail(stream);
    });
    it("contains attachments", () => {
      expect(email.attachments).toHaveLength(2);
      expect(email.attachments[0].filename).toBe("attachment.pdf");
      expect(email.attachments[0].contentType).toBe("application/pdf");
      expect(email.attachments[0].content).toEqual(
        Buffer.alloc(15, "PDF binary data")
      );
      expect(email.attachments[1].filename).toBe("image.png");
      expect(email.attachments[1].contentType).toBe("image/png");
      expect(email.attachments[1].content).toEqual(
        Buffer.alloc(17, "Image binary data")
      );
    });
  });
});
