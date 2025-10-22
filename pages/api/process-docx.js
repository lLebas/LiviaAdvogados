import formidable from "formidable";
import fs from "fs";
import mammoth from "mammoth";
import { Document, Packer, Paragraph, TextRun } from "docx";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end("Method not allowed");

  const form = new formidable.IncomingForm();
  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error("Form parse error", err);
      return res.status(500).end("Upload error");
    }

    try {
      const file = files.file;
      const buffer = fs.readFileSync(file.filepath || file.path);
      const result = await mammoth.extractRawText({ buffer });
      let text = result.value;

      // Substituições simples
      const municipio = fields.municipio || "";
      const data = fields.data || "";
      if (municipio) text = text.replace(/Brasileira|Corrente|Jaic[oó]s/gi, municipio);
      if (data) text = text.replace(/\d{1,2}\s+de\s+\w+\s+de\s+\d{4}/g, data);

      // Remover seções 2.2 - 2.8
      const lines = text.split(/\r?\n/);
      let outLines = [];
      let skip = false;
      for (let ln of lines) {
        const t = ln.trim();
        if (/^2\.[2-8]\b/.test(t) || /^2\.[2-8]\s?–/.test(t) || /^2\.[2-8]\s?-/.test(t)) {
          skip = true;
          continue;
        }
        if (skip && /^3\./.test(t)) {
          skip = false;
        }
        if (!skip) outLines.push(ln);
      }

      const cleaned = outLines.join("\n");

      // Gerar docx usando docx
      const doc = new Document();
      const paras = cleaned.split(/\n\n+/g).map((p) => new Paragraph(p));
      doc.addSection({ children: paras });

      const bufferOut = await Packer.toBuffer(doc);

      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
      res.setHeader("Content-Disposition", `attachment; filename=Proposta-ajustada.docx`);
      res.send(bufferOut);
    } catch (err) {
      console.error("Processing error", err);
      res.status(500).end("Processing error");
    }
  });
}
