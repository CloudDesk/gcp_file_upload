import { revoPoInvoiceService } from "../service/revoPoInvoice.service.js";

export const revoPoInvoiceController = {

    revoPoInvoiceController: async (request: any, reply: any) => {

        try {
            let uploadPonvoice = await revoPoInvoiceService.revoPoInvoiceService(request, reply);
            console.log(uploadPonvoice, 'uploadimageresult');
            if (uploadPonvoice.data.message) {
                reply.send(uploadPonvoice.data);
            }
            else {
                reply.status(500).send(uploadPonvoice.data)
            }

        } catch (error) {
            console.log(error.message);
            reply.send(error.message);

        }
    }

}