import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import Docxtemplater from "docxtemplater";
import PizZip from "pizzip";


const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDirectory, "..");
const templatePath = path.join(
  projectRoot,
  "invoice",
  "revoinvoiceservice.docx",
);
const outputDirectory = path.join(projectRoot, ".qa", "service-invoice");
const outputPath = path.join(outputDirectory, "service-invoice-sample.docx");
const businessOutputPath = path.join(
  outputDirectory,
  "service-invoice-business-sample.docx",
);

const sampleInvoice = {
  invoicenumber: "TEQIT-Invoice-QA",
  invoicedate: "7/27/2026",
  companyname: "TEQIT",
  companyaddress: "1/54, OMR, Perungudi, Chennai - 600096",
  phonenumber: "7567386365",
  gstnumber: "33AAMCR5393J1ZV",
  customername: "Divya Dharshini",
  customeraddress: "New Vilangudi, Madurai, Tamil Nadu - 625018",
  customerphonenumber: "6765678909",
  customergstnumber: "-",
  showcustomergst: false,
  shippingcustomername: "Delivery Contact",
  shippingcustomeraddress: "42, Anna Nagar, Chennai, Tamil Nadu - 600040",
  shippingcustomerphonenumber: "9876543210",
  shippingcustomergstnumber: "33AAMCR5393J1ZV",
  invoicedata: {
    items: [
      {
        id: 1,
        productname: "Lenovo Chromebook i5",
        description: "Laptop replacement product",
        quantity: 1,
        hsncode: "84713010",
        price: 40000,
        totalamount: 40000,
      },
    ],
    tax: 18,
    taxlabel: "CGST 9% + SGST 9%",
    taxamount: 7200,
    taxcomponents: [
      { label: "CGST Amount (9%)", amount: 3600 },
      { label: "SGST Amount (9%)", amount: 3600 },
    ],
    total: 1163.48,
    roundoffamount: "-0.48",
  },
  servicedata: {
    items: [
      {
        id: 1,
        description: "Laptop repair service",
        saccode: "998714",
        price: 10000,
        totalamount: 10000,
      },
    ],
    tax: 18,
    taxlabel: "CGST 9% + SGST 9%",
    taxamount: 1800,
    taxcomponents: [
      { label: "CGST Amount (9%)", amount: 900 },
      { label: "SGST Amount (9%)", amount: 900 },
    ],
    total: 1180.4,
    roundoffamount: "-0.40",
  },
  servicetype: "Repair",
  productroundoffamount: -0.48,
  serviceroundoffamount: -0.4,
  roundoffamount: -0.88,
  totalorderamount: 2343,
};

fs.mkdirSync(outputDirectory, { recursive: true });
const renderSample = (data, targetPath) => {
  const zip = new PizZip(fs.readFileSync(templatePath, "binary"));
  const document = new Docxtemplater(zip, {
    paragraphLoop: true,
    linebreaks: true,
    nullGetter: () => "-",
  });
  document.render(data);
  fs.writeFileSync(targetPath, document.getZip().generate({
    type: "nodebuffer",
    compression: "DEFLATE",
  }));
};

renderSample(sampleInvoice, outputPath);
renderSample({
  ...sampleInvoice,
  customergstnumber: "33ABCDE1234F1Z5",
  shippingcustomergstnumber: "33ABCDE1234F1Z5",
  showcustomergst: true,
}, businessOutputPath);

console.log(outputPath);
console.log(businessOutputPath);
