import axios from "axios";
import { fileUploadService } from "../service/fileupload.service.js";
import { REVO_COST_ESTIMATTION_GENERATE_API, REVO_INVOICE_GENERATE_API, REVO_PO_GENERATE_API, REVO_PR_GENERATE_API, } from "../utils/config.js";
export const fileUploadController = {
    fileUpload: async (request, reply) => {
        const templateType = request.params.templatetype;
        let authHeader = request.headers.authorization;
        console.log(authHeader, "authHeader is data ");
        console.log(templateType, "templateType");
        try {
            let uploadResult = await fileUploadService.uploadFile(request, request.body, reply);
            console.log(uploadResult, "poresult");
            if (uploadResult.success && templateType === "po") {
                request.body = uploadResult.uploadData;
                if (request?.body[0]?.changeFormat) {
                    delete request.body[0].changeFormat;
                }
                console.log(request.body, "request.body PO");
                try {
                    let updatedResult = await axios.post(REVO_PO_GENERATE_API, request.body[0], {
                        headers: {
                            Authorization: authHeader,
                        },
                    });
                    reply.send(updatedResult.data.Data.fileurl);
                }
                catch (error) {
                    console.log(error, "ERROR IN FILE UPLOAD PO ");
                    reply.status(404).send(error.message);
                }
            }
            else if (uploadResult.success && templateType === "pr") {
                request.body = uploadResult.uploadData;
                if (request?.body[0]?.changeFormat) {
                    delete request.body[0].changeFormat;
                }
                try {
                    let updatedResult = await axios.post(REVO_PR_GENERATE_API, request.body[0], {
                        headers: {
                            Authorization: authHeader,
                        },
                    });
                    reply.send(updatedResult.data.Data.prurl);
                }
                catch (error) {
                    console.log(error.message, "ERROR IN FILE UPLOAD PO ");
                    reply.status(404).send(error.message);
                }
            }
            else if (uploadResult.success && templateType === "costestimation") {
                request.body = uploadResult.uploadData;
                request.body.forEach((e) => {
                    if (e.productdata) {
                        e.productdata = JSON.stringify(e.productdata);
                    }
                    if (e.servicedata) {
                        e.servicedata = JSON.stringify(e.servicedata);
                    }
                    if (e.estimationdate) {
                        delete e.estimationdate;
                    }
                });
                try {
                    let updatedResult = await axios.post(REVO_COST_ESTIMATTION_GENERATE_API, request.body[0], {
                        headers: {
                            Authorization: authHeader,
                        },
                    });
                    reply.send(updatedResult.data.data.estimationurl);
                }
                catch (error) {
                    console.log(error.message, "ERROR IN FILE UPLOAD PO ");
                    reply.status(404).send(error.message);
                }
            }
            else if (uploadResult.success && templateType === "productinvoice") {
                request.body = uploadResult.uploadData;
                let data = {
                    id: request.body[0].id,
                    invoiceurl: request.body[0].invoiceurl,
                };
                try {
                    let updatedResult = await axios.post(REVO_INVOICE_GENERATE_API, data, {
                        headers: {
                            Authorization: authHeader,
                        },
                    });
                    reply.send(updatedResult.data.data.invoiceurl);
                }
                catch (error) {
                    console.log(error.message, "ERROR IN FILE UPLOAD PO ");
                    reply.status(404).send(error.message);
                }
            }
            else if (uploadResult.success && templateType === "serviceinvoice") {
                request.body = uploadResult.uploadData;
                let data = {
                    id: request.body[0].id,
                    invoiceurl: request.body[0].invoiceurl,
                };
                try {
                    let updatedResult = await axios.post(REVO_INVOICE_GENERATE_API, data, {
                        headers: {
                            Authorization: authHeader,
                        },
                    });
                    reply.send(updatedResult.data.data.invoiceurl);
                }
                catch (error) {
                    console.log(error.message, "ERROR IN FILE UPLOAD PO ");
                    reply.status(404).send(error.message);
                }
            }
        }
        catch (error) {
            reply.status(404).send(error.message);
        }
    },
};
//# sourceMappingURL=fileupload.controller.js.map