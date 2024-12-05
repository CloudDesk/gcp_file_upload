import axios from "axios";
import { fileUploadService } from "../service/fileupload.service.js";
import { revoPoInvoiceService } from "../service/revoPoInvoice.service.js";
import { REVO_COST_ESTIMATTION_GENERATE_API, REVO_PO_GENERATE_API, REVO_PR_GENERATE_API } from "../utils/config.js";

export const fileUploadController = {
  fileUpload: async (request: any, reply: any) => {
    const templateType = request.params.templatetype;

    try {
      let uploadResult = await fileUploadService.uploadFile(
        request,
        request.body,
        reply
      );
      console.log(uploadResult, "poresult");
      if (uploadResult.success && templateType === "po") {
        request.body = uploadResult.uploadData;
        console.log(request.body, "request.body");
        console.log(REVO_PO_GENERATE_API + "REVO_PO_GENERATE_API");
        try {
          let updatedResult = await axios.post(
            REVO_PO_GENERATE_API,
            request.body[0]
          );
          console.log(updatedResult, "updatedResult data is ");
          reply.send(updatedResult.data);
        } catch (error) {
          console.log(error.message, 'ERROR IN FILE UPLOAD PO ')
          reply.status(404).send(error.message);
        }

      } else if (uploadResult.success && templateType === "pr") {
        request.body = uploadResult.uploadData;
        console.log(request.body, "request.body PR");
        console.log(REVO_PR_GENERATE_API + "REVO_PO_GENERATE_API");
        try {
          let updatedResult = await axios.post(
            REVO_PR_GENERATE_API,
            request.body[0]
          );
          console.log(updatedResult, "updatedResult data is ");
          reply.send(updatedResult.data);
        } catch (error) {
          console.log(error.message, 'ERROR IN FILE UPLOAD PO ')
          reply.status(404).send(error.message);
        }
      } else if (uploadResult.success && templateType === "costestimation") {
        request.body = uploadResult.uploadData;
        console.log(request.body, "request.body COSTESTIMATION");
        console.log(REVO_COST_ESTIMATTION_GENERATE_API + "REVO_COST_ESTIMATTION_GENERATE_API");
        try {
          let updatedResult = await axios.post(
            REVO_COST_ESTIMATTION_GENERATE_API,
            request.body[0]
          );
          console.log(updatedResult, "updatedResult data is ");
          reply.send(updatedResult.data);
        } catch (error) {
          console.log(error.message, 'ERROR IN FILE UPLOAD PO ')
          reply.status(404).send(error.message);
        }

      }
    } catch (error) {
      reply.status(404).send(error.message);
    }
  },
};
