#!/usr/bin/env node
import fs from "fs";
import path from "path";
import AdmZip from "adm-zip";
import { extractText, getDocumentProxy } from "unpdf";

const DOWNLOADS = path.join(process.env.USERPROFILE, "Downloads");

async function preview(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === ".pdf") {
    const buf = fs.readFileSync(filePath);
    const pdf = await getDocumentProxy(new Uint8Array(buf));
    const { text } = await extractText(pdf, { mergePages: false });
    const pages = Array.isArray(text) ? text : [text];
    return pages.slice(0, 5).join("\n").slice(0, 2000);
  }
  if (ext === ".epub") {
    const zip = new AdmZip(filePath);
    let out = "";
    for (const e of zip.getEntries()) {
      if (e.isDirectory || !/\.(xhtml|html|htm)$/i.test(e.entryName)) continue;
      out += e.getData().toString("utf8").replace(/<[^>]+>/g, " ") + " ";
      if (out.length > 2000) break;
    }
    return out.slice(0, 2000);
  }
  return "";
}

for (const name of fs.readdirSync(DOWNLOADS).filter((n) => /^annas-arch/i.test(n))) {
  const text = await preview(path.join(DOWNLOADS, name));
  console.log("\n===", name, "===");
  console.log(text.slice(0, 500));
}
