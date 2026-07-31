import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import Docxtemplater from "docxtemplater";
import PizZip from "pizzip";


const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDirectory, "..");
const templatePath = path.join(
  projectRoot,
  "costestimation",
  "costestimation.docx",
);
const outputDirectory = path.join(projectRoot, ".qa", "cost-estimation");
const outputPath = path.join(outputDirectory, "cost-estimation-sample.docx");

const sampleEstimation = {
  ticketnumber: "TEQIT-Ticket-QA",
  estimationdate: "7/30/2026",
  productdata: [
    {
      id: 1,
      productname: "Acer Laptop",
      description: "Laptop replacement product",
      hsncode: "84713010",
      unitprice: 45000,
      quantity: 1,
      totalamount: 45000,
    },
  ],
  producttaxamount: 8100,
  producttotal: 53100,
  servicedata: [
    {
      id: 1,
      description: "Laptop repair service",
      saccode: "998714",
      unitprice: 10000,
      totalamount: 10000,
    },
  ],
  servicetaxamount: 1800,
  servicetotal: 11800,
  taxlabel: "CGST 9% + SGST 9%",
  totalpayableamount: 64900,
};

fs.mkdirSync(outputDirectory, { recursive: true });
const zip = new PizZip(fs.readFileSync(templatePath, "binary"));
const document = new Docxtemplater(zip, {
  paragraphLoop: true,
  linebreaks: true,
  nullGetter: () => "-",
});
document.render(sampleEstimation);
fs.writeFileSync(
  outputPath,
  document.getZip().generate({
    type: "nodebuffer",
    compression: "DEFLATE",
  }),
);

console.log(outputPath);
