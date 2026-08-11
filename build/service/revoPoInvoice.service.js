import axios from "axios";
import { uploadRevoFiles } from "../cloudstorge/cloudstorage.js";
import { REVO_PO_INVOICE_API, REVO_PO_INVOICE_BUCKET } from "../utils/config.js";
export const revoPoInvoiceService = {
    revoPoInvoiceService: async (request) => {
        const authHeader = request.headers.authorization;
        const files = request.files || [];
        if (!request.body.ponumber) {
            const error = new Error("PO number is missing");
            error.statusCode = 400;
            throw error;
        }
        if (files.length === 0) {
            const error = new Error("Invoice file is missing");
            error.statusCode = 400;
            throw error;
        }
        let data;
        try {
            data = await uploadRevoFiles(files, REVO_PO_INVOICE_BUCKET, request.body.ponumber);
        }
        catch (error) {
            console.error("Error uploading PO invoice file:", error);
            const uploadError = new Error("File upload failed");
            uploadError.statusCode = 500;
            throw uploadError;
        }
        const uploadedFile = data?.files?.find((file) => file.success);
        if (!data?.success || !uploadedFile?.url) {
            const error = new Error("File upload failed");
            error.statusCode = 500;
            throw error;
        }
        const invoicePayload = {
            ...request.body,
            invoiceurl: uploadedFile.url,
        };
        return axios.post(REVO_PO_INVOICE_API, invoicePayload, {
            headers: {
                Authorization: authHeader,
            },
        });
    },
};
//# sourceMappingURL=revoPoInvoice.service.js.map