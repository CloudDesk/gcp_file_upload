import { docgenService } from "../service/docgen.service.js";

export namespace docgenController {
  export const insertfileconversiondocgendta = async (req: any, reply: any) => {
    try {
      console.log("test");
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
      console.log("test");
      let inserstpdf = await docgenService.insertfileupload(req, reply);
      return inserstpdf;
    } catch (error) {
      return error;
    }
  };

  export const getFiles = async (req: any, reply: any) => {
    try {
      console.log("test");
      let inserstpdf = await docgenService.getFiles(req, reply);
      console.log(inserstpdf, "inserstpdf");
      return inserstpdf;
    } catch (error) {
      return error;
    }
  };
}
