import axios from "axios";
import { uploadRevoFiles } from "../cloudstorge/cloudstorage.js";
import { REVO_PO_INVOICE_API, REVO_PO_INVOICE_BUCKET } from "../utils/config.js";

export const revoPoInvoiceService = {
  revoPoInvoiceService: async (request: any) => {
    const authHeader = request.headers.authorization;
    const files = request.files || [];

    if (!request.body.ponumber) {
      const error: any = new Error("PO number is missing");
      error.statusCode = 400;
      throw error;
    }

    if (files.length === 0) {
      const error: any = new Error("Invoice file is missing");
      error.statusCode = 400;
      throw error;
    }

    let data: any;
    try {
      data = await uploadRevoFiles(
        files,
        REVO_PO_INVOICE_BUCKET,
        request.body.ponumber
      );
    } catch (error) {
      console.error("Error uploading PO invoice file:", error);
      const uploadError: any = new Error("File upload failed");
      uploadError.statusCode = 500;
      throw uploadError;
    }

    const uploadedFile = data?.files?.find((file: any) => file.success);
    if (!data?.success || !uploadedFile?.url) {
      const error: any = new Error("File upload failed");
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
