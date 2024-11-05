import axios from "axios";
import Multer from "fastify-multer";
import { docgenController } from "../controller/docgen.controller.js";
import imageResize from "../utils/imageresize.js";
import { REVO_PRODUCT_IMAGE_API } from "../utils/config.js";
import { revoimagecontroller } from "../controller/revoproductimage.controller.js";
import { revoratingsuploadcontroller } from "../controller/revoratinguploads.controller.js";
import { uploadRatingimages } from "../cloudstorge/cloudstorage.js";
import filesUpload from "../multer/multer.js";
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
    console.log(req, "req from file upload");
    try {
      let data = await docgenController.insertfileupload(req, reply);
      console.log(data, "data from file upload");
      return data;
    } catch (error) {
      return error;
    }
  });

  // fastify.post("/product/images/:productid", async (req: any, reply: any) => {
  //   const parts = req.files() as any;
  //   console.log(req.params.productid, "req.body");
  //   const processedFiles: any = {};
  //   let data: any = await imageResize(req);
  //   data.productid = req.params.productid;
  //   try {
  //     console.log("BEGIN");
  //     let dataresult = await axios.post(REVO_PRODUCT_IMAGE_API, data);
  //     console.log("CLOS");
  //     console.log(dataresult, "dataresult");
  //     reply.send(dataresult.data.product);
  //     // reply.send("test");
  //     // console.log(dataresult);
  //   } catch (error) {
  //     console.log(error.message);
  //     reply.send(error.message);
  //   }
  // });

  fastify.post("/product/images/:productid", revoimagecontroller.uploadimage);
  fastify.post(
    "/ratings/uploads",
    revoratingsuploadcontroller.revoratingupload
  );

  // Configure multer for file uploads
  // const multerStorage = Multer.memoryStorage(); // Store files in memory
  // const upload = Multer({ storage: multerStorage });

  // Endpoint to upload multiple files

  // Define your route with upload middleware
  // fastify.post(
  //   "/uploaddatais",
  //   { preHandler: [upload.array("files", 10)] },
  //   async (req, reply) => {
  //     console.log(req.files, "REWQ FILES");
  //     const fields = req.body;
  //     const files = req.files;

  //     console.log(fields, "PROCESSED TEXT FIELDS");
  //     console.log(files.length, "PROCESSED FILES");

  //     // let data = await uploadRatingimages(
  //     //   files,
  //     //   "revo_ratings_images",
  //     //   req.body.productid
  //     // );
  //     // console.log(data);
  //     // Handle your business logic here...

  //     reply.send({ status: "success" });
  //   }
  //);

  filesUpload;
  fastify.post(
    "/uploaddataistest",
    { preHandler: [filesUpload] },
    async (req, reply) => {
      console.log(req.files.length, "REWQ FILES");
      const files = req.files;
      console.log(files);
      if (!files || files.length === 0) {
        return reply
          .status(400)
          .send({ status: "fail", message: "No files uploaded" });
      }

      try {
        // const uploadPromises = files.map(file => uploadToGCP(file));
        // const uploadedFiles = await Promise.all(uploadPromises);

        reply.send({ status: "success" });
      } catch (error) {
        console.error("Error uploading files:", error);
        reply
          .status(500)
          .send({ status: "fail", message: "File upload failed" });
      }
    }
  );

  done();
};
