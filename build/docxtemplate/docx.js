import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import fs from "fs";
import path, { dirname } from "path";
import util from "util";
import { exec } from "child_process";
import { fileURLToPath } from "url";
// import { PROTOCOL } from "../../config/config.js";
const PROTOCOL = "http";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const uploadsDir = path.resolve(__dirname, "../../uploads");
const execAsync = util.promisify(exec);
let returnResult;
let globaltemplate;
const GenerateDocx = async (request, data, template) => {
    try {
        globaltemplate = template;
        returnResult = request;
        for (const e of data) {
            let finalOutput = await fileGeneration(e);
            return finalOutput;
        }
    }
    catch (error) {
        return error.message;
    }
};
const fileGeneration = async (data) => {
    try {
        const currentEpochTimeInSeconds = Math.floor(Date.now() / 1000);
        const content = fs.readFileSync(path.resolve(globaltemplate), "binary");
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
        const pdfFilePath = path.resolve(`${uploadsDir}/${data.ponumber
            ? data.ponumber
            : data.prnumber
                ? data.prnumber
                : data.invoicenumber
                    ? data.invoicenumber
                    : data.ticketnumber
                        ? data.ticketnumber
                        : "Revo"}.pdf`);
        // const docxFilePath = path.resolve(
        //   // `${data.name}_PaySlip_${data.paySlipMonth}_${data.paySlipYear}.docx`
        //   `${uploadsDir}/${data.ponumber ? data.ponumber : data.prnumber ? data.prnumber : data.invoicenumber ? data.invoicenumber : data.ticketnumber ? data.ticketnumber : "Revo" || currentEpochTimeInSeconds}.docx`
        // );
        const docxFilePath = path.resolve(`${uploadsDir}/${data.ponumber ||
            data.prnumber ||
            data.invoicenumber ||
            data.ticketnumber ||
            (currentEpochTimeInSeconds ? currentEpochTimeInSeconds : "Revo")}.docx`);
        fs.writeFileSync(docxFilePath, buf);
        let result = await convertToPdf(docxFilePath, pdfFilePath, data.id, data.ponumber);
        return result;
    }
    catch (error) {
        return error.message;
    }
};
const convertToPdf = async (docxFilePath, pdfFilePath, id, poNumber) => {
    try {
        let fileurl;
        const command = `soffice --headless --convert-to pdf "${docxFilePath}" --outdir "${uploadsDir}"`;
        const { stdout, stderr } = await execAsync(command);
        const relativeFilePath = path.resolve("uploads", pdfFilePath);
        let filename = pdfFilePath.replace(/^.*[\\/]/, "");
        // fileurl = returnResult.protocol + "s://" + returnResult.headers.host + '/' + filename
        fileurl = PROTOCOL + "://" + returnResult.headers.host + "/" + filename;
        if (stderr) {
            return stderr;
        }
        return { fileurl, relativeFilePath, id, poNumber, filename };
    }
    catch (error) {
        console.error("Error :", error);
    }
};
export default GenerateDocx;
//# sourceMappingURL=docx.js.map