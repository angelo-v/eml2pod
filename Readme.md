# eml2pod

Convert e-mails (.eml file format) to files you can store on your Solid Pod.

- Stores e-mail metadata as Linked Data using schema.org vocabulary
- Extracts attachments to plain files, like PDF, images, ...
- Assigns URIs to everything, so you can interlink with other things in your Pod or on the Solid Web.
- Easily share a mail or single attachments with your friends and colleagues by uploading them to your Pod and share access.

## Usage

You need to export an E-Mail as an `.eml` file, which should be possible with your mail client (Possible in Thunderbird and even Gmail web client).

Then run:

```shell
npx eml2pod ./path/to/mail.eml ./output/directory/
```

The script does not upload anything to your Pod, you have to do this by yourself or with other tools.
