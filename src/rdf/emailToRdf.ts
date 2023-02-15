import { IndexedFormula, lit, NamedNode, sym } from "rdflib";
import slugify from "slugify";
import { Contact } from "../domain/Contact";
import { Email } from "../domain/Email";
import { slugifyFilename } from "../domain/slugifyFilename";

export function emailToRdf(email: Email, store: IndexedFormula) {
  const mailSubject = email.headers.subject;
  const slug = slugify(mailSubject, {
    lower: true,
  });
  const baseUrl = `https://pod.example/${slug}/`;
  const mail = sym(`${baseUrl}#it`);
  const doc = sym(baseUrl);
  store.add(
    mail,
    sym("http://www.w3.org/1999/02/22-rdf-syntax-ns#type"),
    sym("https://schema.org/EmailMessage"),
    doc
  );
  store.add(mail, sym("https://schema.org/name"), mailSubject, doc);
  store.add(
    mail,
    sym("https://schema.org/dateSent"),
    lit(
      email.headers.date.toISOString(),
      undefined,
      sym("http://www.w3.org/2001/XMLSchema#dateTime")
    ),
    doc
  );
  email.headers.from.forEach((from, idx) => {
    const mailFrom = sym(`${baseUrl}#from-${idx}`);
    store.add(mail, sym("https://schema.org/sender"), mailFrom, doc);
    contactToRdf(store, mailFrom, from, doc);
  });
  email.headers.to.forEach((to, idx) => {
    const mailTo = sym(`${baseUrl}#to-${idx}`);
    store.add(mail, sym("https://schema.org/recipient"), mailTo, doc);
    contactToRdf(store, mailTo, to, doc);
  });

  const htmlNode = sym(`${baseUrl}mail.html`);
  store.add(mail, sym("https://schema.org/encoding"), htmlNode, doc);
  store.add(htmlNode, sym("https://schema.org/name"), mailSubject, doc);
  store.add(
    htmlNode,
    sym("https://schema.org/description"),
    "HTML content of the e-mail",
    doc
  );
  store.add(
    htmlNode,
    sym("https://schema.org/encodingFormat"),
    "text/html",
    doc
  );

  email.attachments.forEach((file) => {
    const slugifiedName = slugifyFilename(file);
    const fileNode = sym(`${baseUrl}${slugifiedName}`);
    store.add(mail, sym("https://schema.org/messageAttachment"), fileNode, doc);
    store.add(
      fileNode,
      sym("http://www.w3.org/1999/02/22-rdf-syntax-ns#type"),
      sym("https://schema.org/DigitalDocument"),
      doc
    );
    store.add(
      fileNode,
      sym("https://schema.org/description"),
      `Attachment of '${mailSubject}' e-mail`,
      doc
    );
    store.add(
      fileNode,
      sym("https://schema.org/encodingFormat"),
      file.contentType,
      doc
    );
    store.add(fileNode, sym("https://schema.org/name"), slugifiedName, doc);
  });
  return { baseUrl, slug };
}

function contactToRdf(
  store: IndexedFormula,
  mailFrom: NamedNode,
  from: Contact,
  doc: NamedNode
) {
  store.add(
    mailFrom,
    sym("https://schema.org/email"),
    sym(`mailto:${from.address}`),
    doc
  );
  store.add(mailFrom, sym("https://schema.org/name"), from.name, doc);
}
