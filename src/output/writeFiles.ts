import { mkdir, writeFile } from "fs/promises";
import * as path from "path";
import { IndexedFormula } from "rdflib";
import { Email } from "../domain/Email";
import { slugifyFilename } from "../domain/slugifyFilename";

export async function writeFiles(
  email: Email,
  baseUrl: string,
  store: IndexedFormula,
  outDir: string
) {
  await mkdir(outDir, {
    recursive: true,
  });
  await writeFile(path.join(outDir, "mail.html"), email.html);
  const ttl = store.serialize(baseUrl, "text/turtle", undefined) as string;
  await writeFile(path.join(outDir, ".meta"), ttl);
  for (const file of email.attachments) {
    await writeFile(path.join(outDir, slugifyFilename(file)), file.content);
  }
}
