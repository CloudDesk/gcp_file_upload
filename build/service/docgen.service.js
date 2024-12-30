// import GenerateDocx from "../docxtemplate/docx.js";
import { uploadFileToGcp, getBucketFiles, } from "../cloudstorge/cloudstorage.js";
import GenerateDocx from "../docxtemplate/docx_pdf_conversion.js";
export var docgenService;
(function (docgenService) {
    docgenService.insertfileconversiondocgendata = async (req, reply) => {
        try {
            console.log(req.body, "req body is");
            let data = req.body;
            let template = "src/template/Revo-PO new 1.docx";
            let docxresult = await GenerateDocx(req, data, template);
            reply.send(docxresult.fileUrl);
        }
        catch (error) {
            return error;
        }
    };
    docgenService.insertfileupload = async (req, reply) => {
        try {
            let organisation = req.params.organisation;
            let filesdata = await req.file();
            const { file, filename } = filesdata;
            let uploadfile = await uploadFileToGcp(filename, file, organisation);
            reply.send(uploadfile);
        }
        catch (error) {
            return error;
        }
    };
    docgenService.getFiles = async (req, reply) => {
        try {
            let organisation = req.params.organisation;
            let uploadfile = await getBucketFiles(organisation);
            console.log(uploadfile, "uploadfile");
            return uploadfile.files;
        }
        catch (error) {
            return error;
        }
    };
})(docgenService || (docgenService = {}));
//# sourceMappingURL=docgen.service.js.map