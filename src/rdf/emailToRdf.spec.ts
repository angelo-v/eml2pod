import { graph, Literal, NamedNode, sym } from "rdflib";
import { emailToRdf } from "./emailToRdf";

describe("email to RDF", () => {
  it("returns base url with slugified subject", () => {
    const store = graph();
    const result = emailToRdf(
      {
        headers: {
          subject: "Test subject",
          from: [],
          to: [],
          date: new Date(),
          messageId: "ce3983d0-d1a0-40aa-a848-e06d1c7ce815",
        },
        html: "",
        attachments: [],
      },
      store
    );
    expect(result.baseUrl).toEqual("https://pod.example/test-subject/");
    expect(result.slug).toEqual("test-subject");
  });

  it("stores an email message with date and subject", () => {
    const store = graph();
    const date = new Date(2023, 0, 30, 19, 20, 21);
    emailToRdf(
      {
        headers: {
          subject: "Test subject",
          from: [],
          to: [],
          date,
          messageId: "ce3983d0-d1a0-40aa-a848-e06d1c7ce815",
        },
        html: "",
        attachments: [],
      },
      store
    );
    const mail = sym("https://pod.example/test-subject/#it");
    const doc = sym("https://pod.example/test-subject/");
    const rdfType = store.any(
      mail,
      sym("http://www.w3.org/1999/02/22-rdf-syntax-ns#type"),
      null,
      doc
    );
    expect(rdfType?.value).toEqual("https://schema.org/EmailMessage");
    expect(rdfType?.termType).toEqual("NamedNode");

    const mailSubject = store.any(
      mail,
      sym("https://schema.org/name"),
      null,
      doc
    );
    expect(mailSubject?.value).toEqual("Test subject");
    expect(mailSubject?.termType).toEqual("Literal");

    const mailDate: Literal = store.any(
      mail,
      sym("https://schema.org/dateSent"),
      null,
      doc
    ) as Literal;
    expect(mailDate?.value).toEqual(date.toISOString());
    expect(mailDate?.termType).toEqual("Literal");
    expect(mailDate?.datatype.value).toEqual(
      "http://www.w3.org/2001/XMLSchema#dateTime"
    );
  });

  it("stores the to and from contacts", () => {
    const store = graph();
    emailToRdf(
      {
        headers: {
          subject: "Test subject",
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
          date: new Date(),
          messageId: "ce3983d0-d1a0-40aa-a848-e06d1c7ce815",
        },
        html: "",
        attachments: [],
      },
      store
    );
    const mail = sym("https://pod.example/test-subject/#it");
    const doc = sym("https://pod.example/test-subject/");

    const mailFrom = store.any(
      mail,
      sym("https://schema.org/sender"),
      null,
      doc
    ) as NamedNode;
    expect(mailFrom?.value).toEqual("https://pod.example/test-subject/#from-0");
    expect(mailFrom?.termType).toEqual("NamedNode");

    const fromAddress = store.any(
      mailFrom,
      sym("https://schema.org/email"),
      null,
      doc
    );
    expect(fromAddress?.value).toEqual("mailto:alice@mail.example");
    expect(fromAddress?.termType).toEqual("NamedNode");

    const fromName = store.any(
      mailFrom,
      sym("https://schema.org/name"),
      null,
      doc
    );
    expect(fromName?.value).toEqual("Alice");
    expect(fromName?.termType).toEqual("Literal");

    const mailTo = store.any(
      mail,
      sym("https://schema.org/recipient"),
      null,
      doc
    ) as NamedNode;
    expect(mailTo?.value).toEqual("https://pod.example/test-subject/#to-0");
    expect(mailTo?.termType).toEqual("NamedNode");

    const toAddress = store.any(
      mailTo,
      sym("https://schema.org/email"),
      null,
      doc
    );
    expect(toAddress?.value).toEqual("mailto:bob@mail.example");
    expect(toAddress?.termType).toEqual("NamedNode");

    const toName = store.any(mailTo, sym("https://schema.org/name"), null, doc);
    expect(toName?.value).toEqual("Bob");
    expect(toName?.termType).toEqual("Literal");
  });

  it("stores the attachments", () => {
    const store = graph();
    emailToRdf(
      {
        headers: {
          subject: "Test subject",
          from: [],
          to: [],
          date: new Date(),
          messageId: "ce3983d0-d1a0-40aa-a848-e06d1c7ce815",
        },
        html: "",
        attachments: [
          {
            content: Buffer.alloc(0),
            contentType: "application/pdf",
            filename: "Attached File.pdf",
          },
        ],
      },
      store
    );
    const mail = sym("https://pod.example/test-subject/#it");
    const doc = sym("https://pod.example/test-subject/");

    const attachment = store.any(
      mail,
      sym("https://schema.org/messageAttachment"),
      null,
      doc
    ) as NamedNode;
    expect(attachment?.value).toEqual(
      "https://pod.example/test-subject/attached-file.pdf"
    );
    expect(attachment?.termType).toEqual("NamedNode");

    const rdfType = store.any(
      attachment,
      sym("http://www.w3.org/1999/02/22-rdf-syntax-ns#type"),
      null,
      doc
    ) as NamedNode;
    expect(rdfType?.value).toEqual("https://schema.org/DigitalDocument");
    expect(rdfType?.termType).toEqual("NamedNode");

    const description = store.any(
      attachment,
      sym("https://schema.org/description"),
      null,
      doc
    ) as NamedNode;
    expect(description?.value).toEqual("Attachment of 'Test subject' e-mail");
    expect(description?.termType).toEqual("Literal");

    const encoding = store.any(
      attachment,
      sym("https://schema.org/encodingFormat"),
      null,
      doc
    ) as NamedNode;
    expect(encoding?.value).toEqual("application/pdf");
    expect(encoding?.termType).toEqual("Literal");

    const name = store.any(
      attachment,
      sym("https://schema.org/name"),
      null,
      doc
    ) as NamedNode;
    expect(name?.value).toEqual("attached-file.pdf");
    expect(name?.termType).toEqual("Literal");
  });

  it("stores the html encoded content", () => {
    const store = graph();
    emailToRdf(
      {
        headers: {
          subject: "Test subject",
          from: [],
          to: [],
          date: new Date(),
          messageId: "ce3983d0-d1a0-40aa-a848-e06d1c7ce815",
        },
        html: "",
        attachments: [],
      },
      store
    );
    const mail = sym("https://pod.example/test-subject/#it");
    const doc = sym("https://pod.example/test-subject/");

    const html = store.any(
      mail,
      sym("https://schema.org/encoding"),
      null,
      doc
    ) as NamedNode;
    expect(html?.value).toEqual("https://pod.example/test-subject/mail.html");
    expect(html?.termType).toEqual("NamedNode");

    const name = store.any(
      html,
      sym("https://schema.org/name"),
      null,
      doc
    ) as NamedNode;
    expect(name?.value).toEqual("Test subject");
    expect(name?.termType).toEqual("Literal");

    const description = store.any(
      html,
      sym("https://schema.org/description"),
      null,
      doc
    ) as NamedNode;
    expect(description?.value).toEqual("HTML content of the e-mail");
    expect(description?.termType).toEqual("Literal");

    const format = store.any(
      html,
      sym("https://schema.org/encodingFormat"),
      null,
      doc
    ) as NamedNode;
    expect(format?.value).toEqual("text/html");
    expect(format?.termType).toEqual("Literal");
  });
});
