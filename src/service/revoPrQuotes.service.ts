import axios from "axios";
import { uploadRevoFiles } from "../cloudstorge/cloudstorage.js";
import { REVO_PR_QUOTES_API } from "../utils/config.js";

export const revoPrQuotesService = {
    revoPrQuotesService: async (request: any, reply: any) => {
        console.log(request.body, "PROCESSED TEXT FIELDS");
        console.log(request.files.length, "REWQ FILES");
        const files = request.files;
        console.log(files);
        try {
            let data: any
            if (files.length > 0) {
                if (!request.body.prnumber) {
                    reply.status(400).send("prnumber  is missing");
                }

                data = await uploadRevoFiles(files, "revo_pr_quotes", request.body.prnumber);
                console.log(data, 'data from cloud storage');
            }
            let prquotesurl = []
            if (data.success && data.files.length > 0) {
                data.files.forEach((file: any) => {
                    prquotesurl.push(file.url)
                }
                )
            }
            request.body.quoteurl = prquotesurl[0]
            console.log(request.body, 'request.body');
            console.log(REVO_PR_QUOTES_API);
            let insertPrQuotes = await axios.post(REVO_PR_QUOTES_API, request.body)
            console.log(insertPrQuotes, 'insertPrQuotes');
            return insertPrQuotes
        } catch (error) {
            console.error("Error uploading files:", error);
            reply
                .status(500)
                .send({ status: "fail", message: "File upload failed" });
        }
    }
}