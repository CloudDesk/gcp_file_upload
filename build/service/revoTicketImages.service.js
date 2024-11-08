import axios from "axios";
import { uploadRevoFiles } from "../cloudstorge/cloudstorage.js";
import { REVO_TICKETS_IMAGES_API } from "../utils/config.js";
export const revoTicketService = {
    revoTicketService: async (request, reply) => {
        try {
            console.log(request.body, "PROCESSED TEXT FIELDS");
            console.log(request.files.length, "REWQ FILES");
            const files = request.files;
            console.log(files);
            try {
                let data;
                if (files.length > 0) {
                    if (!request.body.userid) {
                        reply.status(400).send("userid  is missing");
                    }
                    data = await uploadRevoFiles(files, "revo_ticket_images", `userId - ${request.body.userid}`);
                    console.log(data, 'data from cloud storage');
                }
                let ticketimagesurl = [];
                if (data.success && data.files.length > 0) {
                    data.files.forEach((file) => {
                        ticketimagesurl.push(file.url);
                    });
                }
                request.body.recipturl = ticketimagesurl[0];
                console.log(request.body, 'request.body');
                console.log(REVO_TICKETS_IMAGES_API);
                let insertTicketImages = await axios.post(REVO_TICKETS_IMAGES_API, request.body);
                console.log(insertTicketImages, 'insertTicketImages');
                return insertTicketImages;
            }
            catch (error) {
                console.error("Error uploading files:", error);
                reply
                    .status(500)
                    .send({ status: "fail", message: "File upload failed" });
            }
        }
        catch (error) {
        }
    }
};
//# sourceMappingURL=revoTicketImages.service.js.map