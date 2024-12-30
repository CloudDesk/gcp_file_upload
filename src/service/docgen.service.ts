import { fileURLToPath } from "url";
// import GenerateDocx from "../docxtemplate/docx.js";
import {
  uploadFileToGcp,
  getBucketFiles,
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
      reply.send(docxresult.fileUrl);
    } catch (error) {
      return error;
    }
  };

  export const insertfileupload = async (req: any, reply: any) => {
    try {
      let organisation = req.params.organisation;
      let filesdata = await req.file();
      const { file, filename } = filesdata;
      let uploadfile = await uploadFileToGcp(filename, file, organisation);
      reply.send(uploadfile);
    } catch (error) {
      return error;
    }
  };

  export const getFiles = async (req: any, reply: any) => {
    try {
      let organisation = req.params.organisation;
      let uploadfile = await getBucketFiles(organisation);
      console.log(uploadfile, "uploadfile");
      return uploadfile.files;
    } catch (error) {
      return error;
    }
  };
}
