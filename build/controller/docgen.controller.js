import { docgenService } from "../service/docgen.service.js";
export var docgenController;
(function (docgenController) {
    docgenController.insertfileconversiondocgendta = async (req, reply) => {
        try {
            console.log("test");
            let inserstpdf = await docgenService.insertfileconversiondocgendata(req, reply);
            return inserstpdf;
        }
        catch (error) {
            return error;
        }
    };
    docgenController.insertfileupload = async (req, reply) => {
        try {
            console.log("test");
            let inserstpdf = await docgenService.insertfileupload(req, reply);
            return inserstpdf;
        }
        catch (error) {
            return error;
        }
    };
})(docgenController || (docgenController = {}));
//# sourceMappingURL=docgen.controller.js.map