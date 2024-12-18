import fs from "fs/promises";
import { uploadFilesToGcs2 } from "../cloudstorge/cloudstorage.js";
import GenerateDocx from "../docxtemplate/docx.js";
export const fileUploadService = {
    uploadFile: async (request, uploadData, reply) => {
        console.log(uploadData, "DATA IS");
        console.log(request.params, "Params");
        const templateType = request.params.templatetype;
        console.log(templateType, "templateType");
        let template;
        let bucketname = request.params.organisation;
        try {
            if (templateType === "po") {
                template = "po/Revo-PO new 1.docx";
                bucketname = "revo-po";
            }
            else if (templateType === "pr") {
                template = "pr/Revo-PR.docx";
                bucketname = "revo-pr";
            }
            else if (templateType === "costestimation") {
                template = "costestimation/costestimation.docx";
                bucketname = "revo-cost-estimation";
            }
            else if (templateType === "productinvoice") {
                template = "invoice/revoinvoiceproduct.docx";
                bucketname = " revo_product_invoice";
            }
            else if (templateType === "serviceinvoice") {
                template = "invoice/revoinvoiceservice.docx";
                bucketname = "revo_service_invoice";
            }
            let result = await GenerateDocx(request, uploadData, template);
            console.log(result, "result from invoiceData");
            const fileBuffer = await fs.readFile(result.relativeFilePath);
            let uploadPdfToGcs = await uploadFilesToGcs2(bucketname, result.filename, fileBuffer, result.poNumber);
            console.log(uploadPdfToGcs, "uploadPdfToGcs");
            if (Array.isArray(uploadData)) {
                uploadData.forEach((data) => {
                    if (templateType === "po") {
                        data.fileurl = uploadPdfToGcs.url;
                    }
                    else if (templateType === "pr") {
                        data.prurl = uploadPdfToGcs.url;
                    }
                    else if (templateType === "costestimation") {
                        data.estimationurl = uploadPdfToGcs.url;
                    }
                    else if (templateType === "productinvoice") {
                        data.invoiceUrl = uploadPdfToGcs.url;
                    }
                    else if (templateType === "serviceinvoice") {
                        data.invoiceUrl = uploadPdfToGcs.url;
                    }
                });
            }
            else {
                if (templateType === "po") {
                    uploadData.fileurl = uploadPdfToGcs.url;
                }
                else if (templateType === "pr") {
                    uploadData.prurl = uploadPdfToGcs.url;
                }
                else if (templateType === "costestimation") {
                    uploadData.estimationurl = uploadPdfToGcs.url;
                }
                else if (templateType === "productinvoice") {
                    uploadData.invoiceUrl = uploadPdfToGcs.url;
                }
                else if (templateType === "serviceinvoice") {
                    uploadData.invoiceUrl = uploadPdfToGcs.url;
                }
            }
            return { success: true, data: uploadPdfToGcs, uploadData };
        }
        catch (error) {
            console.error("Query Execution Error: IN generatepurchaseOrderData", error);
            reply.status(500).send({ success: false, error: error.message });
        }
    },
};
//# sourceMappingURL=fileupload.service.js.map