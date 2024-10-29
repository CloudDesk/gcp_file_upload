import { fileURLToPath } from "url";
// import GenerateDocx from "../docxtemplate/docx.js";
import {
  uploadFile,
  uploadFileToGcp,
  uploadPDF,
  uploadPDFtwo,
} from "../cloudstorge/cloudstorage.js";
import GenerateDocx from "../docxtemplate/docx_pdf_conversion.js";

export namespace docgenService {
  export const insertfileconversiondocgendata = async (
    req: any,
    reply: any
  ) => {
    try {
      console.log(req.body, "req body is");
      let data = req.body;
      let template = "src/template/Revo-PO new 1.docx";
      let docxresult = await GenerateDocx(req, data, template);
      console.log(docxresult, "docxresult");

      reply.send(docxresult.fileUrl);
    } catch (error) {
      return error;
    }
  };

  

  export const insertfileupload = async (req: any, reply: any) => {
    try {
      console.log("test");
      console.log(req.params, "req params from file upload");
      console.log(req.params.organisation, "req.params.organisation");
      let organisation = req.params.organisation;
      let filesdata = await req.file();
      const { file, filename } = filesdata;
      let uploadfile = await uploadFileToGcp(filename, file, organisation);
      reply.send(uploadfile);
      // console.log(file, "file");
      // console.log(filename, "filename");
    } catch (error) {
      return error;
    }
  };
}
