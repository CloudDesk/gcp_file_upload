import axios from "axios";
import { uploadRevoFiles } from "../cloudstorge/cloudstorage.js";
import { REVO_PO_INVOICE_API } from "../utils/config.js";

export const revoPoInvoiceService = {
  revoPoInvoiceService: async (request: any, reply: any) => {
    let authHeader = request.headers.authorization;
    console.log(authHeader, "authHeader is data in po invoice");
    console.log(request.body, "PROCESSED TEXT FIELDS");
    console.log(request.files.length, "REWQ FILES");
    const files = request.files;
    console.log(files);
    try {
      let data: any;
      if (files.length > 0) {
        if (!request.body.ponumber) {
          reply.status(400).send("ponumber  is missing");
        }

        data = await uploadRevoFiles(
          files,
          "revo_poinvoice",
          request.body.ponumber
        );
        console.log(data, "data from cloud storage");
      }
      let invoiceurl = [];
      if (data.success && data.files.length > 0) {
        data.files.forEach((file: any) => {
          invoiceurl.push(file.url);
        });
      }
      request.body.invoiceurl = invoiceurl[0];
      console.log(request.body, "request.body");
      let insertPoInvoice = await axios.post(
        REVO_PO_INVOICE_API, 
        request.body,
        {
        headers: {
          Authorization: authHeader 
        }
      });
      console.log(insertPoInvoice, "insertPoInvoice");
      return insertPoInvoice;
    } catch (error) {
      console.error("Error uploading files:", error);
      reply.status(500).send({ status: "fail", message: "File upload failed" });
    }
  },
};
