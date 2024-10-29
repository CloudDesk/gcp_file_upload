import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import { Storage } from "@google-cloud/storage";
import { Transform } from "stream";
import { exec } from "child_process";
import util from "util";
import fs from "fs";
import axios from "axios";

const storage = new Storage({
  keyFilename: "src/cloudstorge/docblitz-437213-d99f2718bd72.json",
});
const bucketName = "pdfgenfile";
const PROTOCOL = "http";
const execAsync = util.promisify(exec);
let returnResult;
let globaltemplate: any;

const GenerateDocx = async (request: any, data: any, template: any) => {
  try {
    globaltemplate = template;
    returnResult = request;
    for (const e of data) {
      let finalOutput = await fileGeneration(e);
      return finalOutput;
    }
  } catch (error: any) {
    return error.message;
  }
};

const fileGeneration = async (data: any) => {
  try {
    const content = fs.readFileSync(globaltemplate, "binary");
    const zip = new PizZip(content);
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
      nullGetter() {
        return "-";
      },
    });

    doc.render(data);

    const buf = doc.getZip().generate({
      type: "nodebuffer",
      compression: "DEFLATE",
    });

    const filename = `${
      data.ponumber ||
      data.prnumber ||
      data.invoicenumber ||
      data.ticketnumber ||
      "Revo"
    }.docx`;
    const bucket = storage.bucket(bucketName);
    const docxFile = bucket.file(filename);
    await docxFile.save(buf, {
      resumable: false,
      contentType:
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    });
    console.log(`${filename} uploaded successfully to Google Cloud Storage`);
    const pdfFilename = `${filename.replace(".docx", ".pdf")}`;
    let result = await convertToPdf(buf, pdfFilename, data.id);
    return result;
  } catch (error: any) {
    return error.message;
  }
};

const convertToPdf = async (docxBuffer: any, pdfFilename: any, id: any) => {
  try {
    const command = `soffice --headless --convert-to pdf:writer_pdf_Export --outdir /tmp`;

    // Write the DOCX buffer to a temporary file
    const tempDocxPath = `/tmp/temp_${Date.now()}.docx`;
    fs.writeFileSync(tempDocxPath, docxBuffer);

    await execAsync(`${command} ${tempDocxPath}`);

    const pdfPath = tempDocxPath.replace(".docx", ".pdf");
    const pdfBuffer = fs.readFileSync(pdfPath);

    const pdfFile = storage.bucket(bucketName).file(pdfFilename);
    console.log(pdfFile, "pdf file");
    await pdfFile.save(pdfBuffer, {
      resumable: false,
      contentType: "application/pdf",
    });

    const fileUrl = `https://storage.cloud.google.com/${bucketName}/${pdfFilename}`;
    console.log(fileUrl, "fileurl");
    await axios
      .get(fileUrl)
      .then((res) => {
        console.log(res, "res");
      })
      .catch((err) => {
        console.log(err, "err");
      });

    console.log(
      `PDF ${pdfFilename} uploaded successfully to Google Cloud Storage`
    );

    return { fileUrl, id };
  } catch (error) {
    console.error("Error during PDF conversion:", error);
    throw error;
  }
};

export default GenerateDocx;
