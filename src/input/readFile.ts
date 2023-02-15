import { createReadStream, ReadStream } from "fs";
export function readFile(): ReadStream {
  return createReadStream(process.argv[2]);
}
