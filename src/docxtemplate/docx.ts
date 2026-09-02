import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import fs from "fs";
import path, { dirname, join, resolve } from "path";
import os from "os";
import util from "util";
import { exec } from "child_process";
import { fileURLToPath, pathToFileURL } from "url";
import { uploadPDF } from "../cloudstorge/cloudstorage.js";
import { removeTrailingBlankPdfPages } from "./pdfCleanup.js";
// import { PROTOCOL } from "../../config/config.js";
const PROTOCOL = "http";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const uploadsDir = path.resolve(__dirname, "../../uploads");

const execAsync = util.promisify(exec);
let returnResult: any;
let globaltemplate: any;

const resolveSofficeExecutable = () => {
  if (process.env.SOFFICE_PATH) {
    if (!fs.existsSync(process.env.SOFFICE_PATH)) {
      throw new Error(`SOFFICE_PATH does not exist: ${process.env.SOFFICE_PATH}`);
    }
    return process.env.SOFFICE_PATH;
  }

  if (process.platform === "win32") {
    const candidates = [
      "C:\\Program Files\\LibreOffice\\program\\soffice.com",
      "C:\\Program Files\\LibreOffice\\program\\soffice.exe",
      "C:\\Program Files (x86)\\LibreOffice\\program\\soffice.com",
      "C:\\Program Files (x86)\\LibreOffice\\program\\soffice.exe",
    ];
    const installedPath = candidates.find((candidate) => fs.existsSync(candidate));

    if (!installedPath) {
      throw new Error(
        "LibreOffice is required for PDF conversion. Install LibreOffice locally or run the Docker image."
      );
    }

    return installedPath;
  }

  if (process.platform === "darwin") {
    const macCandidates = [
      "/Applications/LibreOffice.app/Contents/MacOS/soffice",
      "/usr/local/bin/soffice",
      "/opt/homebrew/bin/soffice",
    ];
    const macInstalled = macCandidates.find((c) => fs.existsSync(c));
    if (macInstalled) return macInstalled;
  }

  return "soffice";
};

const GenerateDocx = async (request: any, data: any, template: any) => {
  try {
    globaltemplate = template;
    returnResult = request;
    for (const e of data) {
      let finalOutput = await fileGeneration(e);
      return finalOutput;
    }
  } catch (error: any) {
    throw error;
  }
};

const fileGeneration = async (data: any) => {
  try {
    const currentEpochTimeInSeconds = Math.floor(Date.now() / 1000);
    const content = fs.readFileSync(
      path.resolve(globaltemplate),
      "binary"
    );

    const zip = new PizZip(content);
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
      nullGetter() {
        return "-";
      },
    });

    await doc.render(data);

    const buf = doc.getZip().generate({
      type: "nodebuffer",
      compression: "DEFLATE",
    });

    const pdfFilePath = path.resolve(
      `${uploadsDir}/${
        data.ponumber
          ? data.ponumber
          : data.prnumber
          ? data.prnumber
          : data.invoicenumber
          ? data.invoicenumber
          : data.ticketnumber
          ? data.ticketnumber
          : "Revo"
      }.pdf`
    );
    // const docxFilePath = path.resolve(
    //   // `${data.name}_PaySlip_${data.paySlipMonth}_${data.paySlipYear}.docx`
    //   `${uploadsDir}/${data.ponumber ? data.ponumber : data.prnumber ? data.prnumber : data.invoicenumber ? data.invoicenumber : data.ticketnumber ? data.ticketnumber : "Revo" || currentEpochTimeInSeconds}.docx`
    // );

    const docxFilePath = path.resolve(
      `${uploadsDir}/${
        data.ponumber ||
        data.prnumber ||
        data.invoicenumber ||
        data.ticketnumber ||
        (currentEpochTimeInSeconds ? currentEpochTimeInSeconds : "Revo")
      }.docx`
    );

    fs.writeFileSync(docxFilePath, buf);

    let result = await convertToPdf(
      docxFilePath,
      pdfFilePath,
      data.id,
      data.ponumber
    );
    return result;
  } catch (error: any) {
    throw error;
  }
};

const convertToPdf = async (
  docxFilePath: any,
  pdfFilePath: any,
  id: any,
  poNumber
) => {
  const libreOfficeProfileDir = fs.mkdtempSync(
    path.join(os.tmpdir(), "revo-soffice-")
  );

  try {
    let fileurl: String;
    const sofficeExecutable = resolveSofficeExecutable();
    const libreOfficeProfileUrl = pathToFileURL(libreOfficeProfileDir).href;

    if (fs.existsSync(pdfFilePath)) {
      fs.unlinkSync(pdfFilePath);
    }

    const command =
      `"${sofficeExecutable}" ` +
      `"-env:UserInstallation=${libreOfficeProfileUrl}" ` +
      `--headless --norestore --nodefault --nolockcheck --nofirststartwizard ` +
      `--convert-to pdf "${docxFilePath}" --outdir "${uploadsDir}"`;
    const { stdout, stderr } = await execAsync(command);

    if (!fs.existsSync(pdfFilePath)) {
      throw new Error(
        `LibreOffice did not create the PDF. ${stderr || stdout || ""}`.trim()
      );
    }

    const relativeFilePath = pdfFilePath;
    let filename = pdfFilePath.replace(/^.*[\\/]/, "");
    // fileurl = returnResult.protocol + "s://" + returnResult.headers.host + '/' + filename
    fileurl = PROTOCOL + "://" + returnResult.headers.host + "/" + filename;
    if (stderr) {
      console.warn("LibreOffice conversion warning:", stderr);
    }

    await removeTrailingBlankPdfPages(pdfFilePath);

    return { fileurl, relativeFilePath, id, poNumber, filename };
  } catch (error: any) {
    console.error("Error :", error);
    throw error;
  } finally {
    fs.rmSync(libreOfficeProfileDir, { recursive: true, force: true });
  }
};

export default GenerateDocx;
