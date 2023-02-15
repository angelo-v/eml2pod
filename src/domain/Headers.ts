import { Contact } from "./Contact";

export interface Headers {
  subject: string;
  from: Contact[];
  to: Contact[];
  date: Date;
  messageId: string;
}
