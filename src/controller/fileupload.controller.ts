import axios from "axios";
import { fileUploadService } from "../service/fileupload.service.js";
import { revoPoInvoiceService } from "../service/revoPoInvoice.service.js";
import { REVO_PO_GENERATE_API } from "../utils/config.js";

export const fileUploadController = {
  fileUpload: async (request: any, reply: any) => {
    const templateType = request.params.templatetype;

    try {
      let poresult = await fileUploadService.uploadFile(
        request,
        request.body,
        reply
      );
      console.log(poresult, "poresult");
      if (poresult.success && templateType === "po") {
        request.body = poresult.poData;
        console.log(request.body, "request.body");
        console.log(REVO_PO_GENERATE_API + "REVO_PO_GENERATE_API");
        let updatedResult = await axios.post(
          REVO_PO_GENERATE_API,
          request.body[0]
        );
        console.log(updatedResult, "updatedResult");
        reply.send(updatedResult);
      } else if (poresult.success && templateType === "pr") {
        // do something
      } else if (poresult.success && templateType === "costestimation") {
        // do something
      }
      reply.send(poresult);
    } catch (error) {
      reply.status(404).send(error.message);
    }
  },
};
