import { revoTicketService } from "../service/revoTicketImages.service.js";
export const revoTicketController = {
    revoTicketController: async (request, reply) => {
        try {
            let uploadTicketImages = await revoTicketService.revoTicketService(request, reply);
            if (uploadTicketImages.data.message) {
                reply.status(200).send(uploadTicketImages.data);
            }
            else {
                reply.status(404).send({ error: [uploadTicketImages] });
            }
        }
        catch (error) {
            console.log(error.message);
            reply.send(error.message);
        }
    }
};
//# sourceMappingURL=revoTicketController.js.map