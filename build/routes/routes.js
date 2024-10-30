import axios from "axios";
import { docgenController } from "../controller/docgen.controller.js";
import imageResize from "../utils/imageresize.js";
import { REVO_PRODUCT_IMAGE_API } from "../utils/config.js";
export const pdfroute = (fastify, opts, done) => {
    fastify.get("/", async (req, reply) => {
        return { hello: "world" };
    });
    fastify.post("/pdf", async (req, reply) => {
        try {
            let data = await docgenController.insertfileconversiondocgendta(req, reply);
            return data;
        }
        catch (error) {
            return error;
        }
    });
    ;
    fastify.post("/file-upload/:organisation", async (req, reply) => {
        console.log(req, "req from file upload");
        try {
            let data = await docgenController.insertfileupload(req, reply);
            console.log(data, "data from file upload");
            return data;
        }
        catch (error) {
            return error;
        }
    });
    fastify.post('/product/images/:productid', async (req, reply) => {
        const parts = req.files();
        console.log(req.params.productid, 'req.body');
        const processedFiles = {};
        let data = await imageResize(req);
        data.productid = req.params.productid;
        try {
            console.log('BEGIN');
            let dataresult = await axios.post(REVO_PRODUCT_IMAGE_API, data);
            console.log('CLOS');
            console.log(dataresult, 'dataresult');
            reply.send(dataresult.data.product);
            // reply.send("test");
            // console.log(dataresult);
        }
        catch (error) {
            console.log(error.message);
            reply.send(error.message);
        }
    });
    // fastify.post('/product/images/:productid',revoimagecontroller.uploadimage);
    done();
};
//# sourceMappingURL=routes.js.map