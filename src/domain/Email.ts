import { Attachment } from "./Attachment";
import { Headers } from "./Headers";
export interface Email {
  headers: Headers;
  html: string;
  attachments: Attachment[];
}
