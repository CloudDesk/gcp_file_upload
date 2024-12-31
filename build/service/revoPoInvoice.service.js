import axios from "axios";
import { uploadRevoFiles } from "../cloudstorge/cloudstorage.js";
import { REVO_PO_INVOICE_API, REVO_PO_INVOICE_BUCKET } from "../utils/config.js";
export const revoPoInvoiceService = {
    revoPoInvoiceService: async (request, reply) => {
        let authHeader = request.headers.authorization;
        const files = request.files;
        try {
            let data;
            if (files.length > 0) {
                if (!request.body.ponumber) {
                    reply.status(400).send("ponumber  is missing");
                }
                data = await uploadRevoFiles(files, REVO_PO_INVOICE_BUCKET, request.body.ponumber);
                console.log(data, "data from cloud storages");
            }
            let invoiceurl = [];
            if (data.success && data.files.length > 0) {
                data.files.forEach((file) => {
                    invoiceurl.push(file.url);
                });
            }
            request.body.invoiceurl = invoiceurl[0];
            let insertPoInvoice = await axios.post(REVO_PO_INVOICE_API, request.body, {
                headers: {
                    Authorization: authHeader
                }
            });
            return insertPoInvoice;
        }
        catch (error) {
            console.error("Error uploading files:", error);
            reply.status(500).send({ status: "fail", message: "File upload failed" });
        }
    },
};
//# sourceMappingURL=revoPoInvoice.service.js.map