import { revoPoInvoiceService } from "../service/revoPoInvoice.service.js";
import axios from "axios";
export const revoPoInvoiceController = {
    revoPoInvoiceController: async (request, reply) => {
        try {
            const uploadPonvoice = await revoPoInvoiceService.revoPoInvoiceService(request);
            return reply.status(uploadPonvoice.status).send(uploadPonvoice.data);
        }
        catch (error) {
            console.error("Error creating PO invoice:", error);
            if (axios.isAxiosError(error) && error.response) {
                return reply.status(error.response.status).send(error.response.data);
            }
            reply.status(error.statusCode || 500).send({
                status: "fail",
                message: error.message || "Unable to create PO invoice",
            });
        }
    },
};
//# sourceMappingURL=revoPoInvoce.controller.js.map