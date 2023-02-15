import EmlParser from "eml-parser";
import { ReadStream } from "fs";
import { Email } from "../domain/Email";

export async function parseEmail(stream: ReadStream): Promise<Email> {
  const parser = new EmlParser(stream);
  const headers = await parser.getEmailHeaders();
  const emailHtml = await parser.getEmailBodyHtml();
  const attachments = await parser.getEmailAttachments();

  const eml = await parser.parseEml();
  const bodyHtml = eml.html ? emailHtml : eml.textAsHtml;

  const html = `
<!doctype html>
<html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport"
              content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0">
        <meta http-equiv="X-UA-Compatible" content="ie=edge">
        <title>${headers.subject}</title>
    </head>
    <body>
        ${bodyHtml}
    </body>
</html>
    `;

  return {
    headers,
    html,
    attachments,
  };
}
