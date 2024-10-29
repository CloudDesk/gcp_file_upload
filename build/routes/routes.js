import { docgenController } from "../controller/docgen.controller.js";
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
    fastify.post("/upload", async (req, reply) => {
        try {
            let data = await docgenController.insertfiles(req, reply);
            return data;
        }
        catch (error) {
            return error;
        }
    });
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
    done();
};
//# sourceMappingURL=routes.js.map