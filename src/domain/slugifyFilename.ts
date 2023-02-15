import slugify from "slugify";
import { Attachment } from "./Attachment";

export function slugifyFilename(file: Attachment) {
  return slugify(file.filename, { lower: true });
}
