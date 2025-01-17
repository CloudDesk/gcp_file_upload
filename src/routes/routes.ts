import axios from "axios";
import { docgenController } from "../controller/docgen.controller.js";
import {
  REVO_PRODUCT_RATING_API,
  REVO_RATINGS_IMAGES_BUCKET,
} from "../utils/config.js";
import { revoimagecontroller } from "../controller/revoproductimage.controller.js";
// import { revoratingsuploadcontroller } from "../controller/revoratinguploads.controller.js";
import { uploadRevoFiles } from "../cloudstorge/cloudstorage.js";
import { filesUpload } from "../multer/multer.js";
import { revoPoInvoiceController } from "../controller/revoPoInvoce.controller.js";
import { revoPrQuotesController } from "../controller/revoPrQuotes.controller.js";
import { revoTicketController } from "../controller/revoTicketController.js";
import { fileUploadController } from "../controller/fileupload.controller.js";
export const pdfroute = (fastify: any, opts: any, done: any) => {
  fastify.get("/", async (req: any, reply: any) => {
    return { hello: "world" };
  });
  fastify.post("/pdf", async (req: any, reply: any) => {
    try {
      let data = await docgenController.insertfileconversiondocgendta(
        req,
        reply
      );
      return data;
    } catch (error) {
      return error;
    }
  });
  fastify.post("/file-upload/:organisation", async (req: any, reply: any) => {
    try {
      let data = await docgenController.insertfileupload(req, reply);
      console.log(data, "data from file upload");
      return data;
    } catch (error) {
      return error;
    }
  });

  fastify.get("/get-files/:organisation", async (req: any, reply: any) => {
    try {
      let data = await docgenController.getFiles(req, reply);
      console.log(data, "data from file upload");
      return data;
    } catch (error) {
      return error;
    }
  });

  fastify.post("/product/images/:productid", revoimagecontroller.uploadimage);
  fastify.post("/po/invoice", { preHandler: [filesUpload] }, revoPoInvoiceController.revoPoInvoiceController);
  fastify.post("/pr/quotes", { preHandler: [filesUpload] }, revoPrQuotesController.revoPrQuotesController);
  fastify.post("/tickets/images", { preHandler: [filesUpload] }, revoTicketController.revoTicketController);

  //Rating with image upload
  fastify.post("/uploadrating/images", { preHandler: [filesUpload] }, async (req, reply) => {
    console.log(req.body, "PROCESSED TEXT FIELDS");
    console.log(req.files.length, "REWQ FILES");
    const files = req.files;
    try {
      let data: any;
      if (files.length > 0) {
        if (!req.body.productid) {
          reply.status(400).send("Product id is missing");
        }

        data = await uploadRevoFiles(
          files,
          REVO_RATINGS_IMAGES_BUCKET,
          req.body.productid
        );
      }
      let ratingurl = [];
      if (data.success && data.files.length > 0) {
        data.files.forEach((file: any) => {
          ratingurl.push(file.url);
        });
      }
      req.body.url = ratingurl;
      let insertrating = await axios.post(REVO_PRODUCT_RATING_API, req.body);
      console.log(insertrating, "insertrating");
      if (insertrating.data) {
        reply.send(insertrating.data);
      }
    } catch (error) {
      console.error("Error uploading files:", error);
      reply
        .status(500)
        .send({ status: "fail", message: "File upload failed" });
    }
  }
  );

  fastify.post("/generate-document/:templatetype", { preHandler: [filesUpload] }, async (req, reply) => {
    try {
      let result = await fileUploadController.fileUpload(req, reply);
      return result;
    } catch (error) {
      return error;
    }
  }
  );

  done();
};
