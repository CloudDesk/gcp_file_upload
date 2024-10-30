// import GenerateDocx from "../docxtemplate/docx.js";
import { uploadFileToGcp, } from "../cloudstorge/cloudstorage.js";
import GenerateDocx from "../docxtemplate/docx_pdf_conversion.js";
export var docgenService;
(function (docgenService) {
    docgenService.insertfileconversiondocgendata = async (req, reply) => {
        try {
            console.log(req.body, "req body is");
            let data = req.body;
            let template = "src/template/Revo-PO new 1.docx";
            let docxresult = await GenerateDocx(req, data, template);
            console.log(docxresult, "docxresult");
            reply.send(docxresult.fileUrl);
        }
        catch (error) {
            return error;
        }
    };
    docgenService.insertfileupload = async (req, reply) => {
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
        }
        catch (error) {
            return error;
        }
    };
})(docgenService || (docgenService = {}));
//# sourceMappingURL=docgen.service.js.map