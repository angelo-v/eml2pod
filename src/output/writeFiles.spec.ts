jest.mock("fs/promises");

import { writeFile, mkdir } from "fs/promises";
import { graph, sym } from "rdflib";
import { Email } from "../domain/Email";
import { writeFiles } from "./writeFiles";

describe("write files", () => {
  let email: Email;
  beforeEach(() => {
    jest.resetAllMocks();
    email = {
      html: "",
      headers: {
        from: [],
        to: [],
        subject: "",
        date: new Date(),
        messageId: "",
      },
      attachments: [],
    };
  });

  it("recursively creates out directory", async () => {
    await writeFiles(email, "base-url", graph(), "out/dir");
    expect(mkdir).toHaveBeenCalledWith("out/dir", {
      recursive: true,
    });
  });

  it("writes the html content to file", async () => {
    await writeFiles(
      { ...email, html: "html content" },
      "base-url",
      graph(),
      "out/dir"
    );
    expect(writeFile).toHaveBeenCalledWith("out/dir/mail.html", "html content");
  });

  it("writes attachment to file", async () => {
    await writeFiles(
      {
        ...email,
        attachments: [
          {
            filename: "My File.pdf",
            content: Buffer.from("binary"),
            contentType: "application/pdf",
          },
        ],
      },
      "base-url",
      graph(),
      "out/dir"
    );
    expect(writeFile).toHaveBeenCalledWith(
      "out/dir/my-file.pdf",
      Buffer.from("binary")
    );
  });

  it("writes rdf data to meta file", async () => {
    const store = graph();
    store.add(
      sym("https://pod.example/"),
      sym("https://pod.example/"),
      sym("https://pod.example/")
    );
    await writeFiles(email, "https://pod.example/", store, "out/dir");
    expect(writeFile).toHaveBeenCalledWith(
      "out/dir/.meta",
      `@prefix : </#>.
@prefix pod: <>.

pod: pod: pod: .

`
    );
  });
});
