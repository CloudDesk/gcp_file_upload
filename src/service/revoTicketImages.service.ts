import axios from "axios";
import { uploadRevoFiles } from "../cloudstorge/cloudstorage.js";
import { REVO_TICKET_IMAGES_BUCKET, REVO_TICKETS_IMAGES_API } from "../utils/config.js";

export const revoTicketService = {
    revoTicketService: async (request: any, reply: any) => {
        try {
            console.log(request.body, "PROCESSED TEXT FIELDS");
            console.log(request.files.length, "REWQ FILES");
            const files = request.files;
            console.log(files);
            try {
                let data: any
                if (files.length > 0) {
                    if (!request.body.userid) {
                        reply.status(400).send("userid  is missing");
                    }
                    data = await uploadRevoFiles(files,REVO_TICKET_IMAGES_BUCKET, `userId - ${request.body.userid}`);
                    console.log(data, 'data from cloud storage');
                }
                let ticketimagesurl = []
                if (data.success && data.files.length > 0) {
                    data.files.forEach((file: any) => {
                        ticketimagesurl.push(file.url)
                    }
                    )
                }
                request.body.recipturl = ticketimagesurl[0]
                console.log(request.body, 'request.body');
                console.log(REVO_TICKETS_IMAGES_API);
                let insertTicketImages = await axios.post(REVO_TICKETS_IMAGES_API, request.body)
                console.log(insertTicketImages, 'insertTicketImages');
                return insertTicketImages
            } catch (error) {
                console.error("Error uploading files:", error);
                reply
                    .status(500)
                    .send({ status: "fail", message: "File upload failed" });
            }

        } catch (error) {

        }
    }


}