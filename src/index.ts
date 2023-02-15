import { ReadStream } from "fs";
import * as path from "path";
import { graph } from "rdflib";
import { parseEmail } from "./input/parseEmail";
import { writeFiles } from "./output/writeFiles";
import { emailToRdf } from "./rdf/emailToRdf";

export function run(stream: ReadStream, outDir: string) {
  parseEmail(stream)
    .then((email) => {
      let store = graph();
      const { baseUrl, slug } = emailToRdf(email, store);
      return writeFiles(email, baseUrl, store, path.join(outDir, slug, "/"));
    })
    .then(() => {
      console.log("Finished.");
    });
}
