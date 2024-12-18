import axios from "axios";
import { fileUploadService } from "../service/fileupload.service.js";
import { revoPoInvoiceService } from "../service/revoPoInvoice.service.js";
import { REVO_COST_ESTIMATTION_GENERATE_API, REVO_INVOICE_GENERATE_API, REVO_PO_GENERATE_API, REVO_PR_GENERATE_API } from "../utils/config.js";

export const fileUploadController = {
  fileUpload: async (request: any, reply: any) => {
    const templateType = request.params.templatetype;
    let authHeader = request.headers.authorization;
    console.log(authHeader, 'authHeader is data ')
    console.log(templateType, "templateType");
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
        console.log(authHeader, 'authHeader in PO creation ')

        try {
          let updatedResult :any= await axios.post(
            REVO_PO_GENERATE_API,
            request.body[0],
            {
              headers: {
                Authorization: authHeader 
              }
            }
          );
          console.log(updatedResult, "updatedResult data is "); 
          console.log(updatedResult.data.Data, "updatedResult data is ");
          console.log(updatedResult.data.Data.fileurl, "updatedResult data is 2");
          reply.send(updatedResult.data.Data.fileurl);
        } catch (error) {
          console.log(error, 'ERROR IN FILE UPLOAD PO ')
          reply.status(404).send(error.message);
        }

      } else if (uploadResult.success && templateType === "pr") {
        request.body = uploadResult.uploadData;
        console.log(request.body, "request.body PR");
        console.log(REVO_PR_GENERATE_API + "REVO_PO_GENERATE_API");
        console.log(authHeader, 'authHeader in PR creation ')
        try {
          let updatedResult :any = await axios.post(
            REVO_PR_GENERATE_API,
            request.body[0],
            {
              headers: {
                Authorization: authHeader 
              }
            }
          );
          console.log(updatedResult.data.Data, "updatedResult data is ");
          console.log(updatedResult.data.Data.prurl, "updatedResult data is  2");
          reply.send(updatedResult.data.Data.prurl);
        } catch (error) {
          console.log(error.message, 'ERROR IN FILE UPLOAD PO ')
          reply.status(404).send(error.message);
        }
      } else if (uploadResult.success && templateType === "costestimation") {
        request.body = uploadResult.uploadData;
        console.log(request.body, "request.body COSTESTIMATION");
        console.log(REVO_COST_ESTIMATTION_GENERATE_API + " REVO_COST_ESTIMATTION_GENERATE_API");
        console.log(authHeader + " authHeader in cost Estimation Inboice");

        try {
          let updatedResult = await axios.post(
            REVO_COST_ESTIMATTION_GENERATE_API,
            request.body[0],
            {
              headers: {
                Authorization: authHeader 
              }
            }
          );
          console.log(updatedResult, "updatedResult data is ");
          reply.send(updatedResult.data);
        } catch (error) {
          console.log(error.message, 'ERROR IN FILE UPLOAD PO ')
          reply.status(404).send(error.message);
        }

      }
      else if (uploadResult.success && templateType === "productinvoice") {
        request.body = uploadResult.uploadData;
        console.log(request.body, "request.body poproductinvoice");
        console.log(REVO_INVOICE_GENERATE_API + "REVO_PRODUCT_INVOICE_GENERATE_API");
        console.log(authHeader + " authHeader in Product Invoice");

        try {
          let updatedResult = await axios.post(
            REVO_INVOICE_GENERATE_API,
            request.body[0], {
              headers: {
                Authorization: authHeader 
              }
            }
          );
          console.log(updatedResult, "updatedResult data is ");
          reply.send(updatedResult.data);
        } catch (error) {
          console.log(error.message, 'ERROR IN FILE UPLOAD PO ')
          reply.status(404).send(error.message);
        }

      }
      else if (uploadResult.success && templateType === "serviceinvoice") {
        request.body = uploadResult.uploadData;
        console.log(request.body, "request.body poproductinvoice");
        console.log(REVO_INVOICE_GENERATE_API + " REVO_COST_ESTIMATTION_GENERATE_API");
        console.log(authHeader + " authHeader in Service Invoice");
        try {
          let updatedResult = await axios.post(
            REVO_INVOICE_GENERATE_API,
            request.body[0], {
              headers: {
                Authorization: authHeader 
              }
            }
          );
          console.log(updatedResult, "updatedResult data is ");
          reply.send(updatedResult.data);
        } catch (error) {
          console.log(error.message, 'ERROR IN FILE UPLOAD PO ')
          reply.status(404).send(error.message);
        }

      }
      else if (uploadResult.success && templateType === "serviceinvoice") {
        request.body = uploadResult.uploadData;
        console.log(request.body, "request.body poserviceinvoice");
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
