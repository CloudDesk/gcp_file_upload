import { docgenService } from "../service/docgen.service.js";

export namespace docgenController {
  export const insertfileconversiondocgendta = async (req: any, reply: any) => {
    try {
      let inserstpdf = await docgenService.insertfileconversiondocgendata(
        req,
        reply
      );
      return inserstpdf;
    } catch (error) {
      return error;
    }
  };


  export const insertfileupload = async (req: any, reply: any) => {
    try {
      let inserstpdf = await docgenService.insertfileupload(req, reply);
      return inserstpdf;
    } catch (error) {
      return error;
    }
  };

  export const getFiles = async (req: any, reply: any) => {
    try {
      let inserstpdf = await docgenService.getFiles(req, reply);
      return inserstpdf;
    } catch (error) {
      return error;
    }
  };
}
