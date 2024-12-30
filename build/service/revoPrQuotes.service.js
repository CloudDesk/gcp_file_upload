import axios from "axios";
import { uploadRevoFiles } from "../cloudstorge/cloudstorage.js";
import { REVO_PR_QUOTES_API, REVO_PR_QUOTES_BUCKET } from "../utils/config.js";
export const revoPrQuotesService = {
    revoPrQuotesService: async (request, reply) => {
        const files = request.files;
        try {
            let data;
            if (files.length > 0) {
                if (!request.body.prnumber) {
                    reply.status(400).send("prnumber  is missing");
                }
                data = await uploadRevoFiles(files, REVO_PR_QUOTES_BUCKET, request.body.prnumber);
            }
            let prquotesurl = [];
            if (data.success && data.files.length > 0) {
                data.files.forEach((file) => {
                    prquotesurl.push(file.url);
                });
            }
            request.body.quoteurl = prquotesurl[0];
            let insertPrQuotes = await axios.post(REVO_PR_QUOTES_API, request.body);
            return insertPrQuotes;
        }
        catch (error) {
            console.error("Error uploading files:", error);
            reply
                .status(500)
                .send({ status: "fail", message: "File upload failed" });
        }
    }
};
//# sourceMappingURL=revoPrQuotes.service.js.map