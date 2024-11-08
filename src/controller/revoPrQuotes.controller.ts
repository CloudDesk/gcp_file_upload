import { revoPrQuotesService } from "../service/revoPrQuotes.service.js";

export const revoPrQuotesController = {
    revoPrQuotesController: async (request: any, reply: any) => {
        try {
            let uploadQuotes = await revoPrQuotesService.revoPrQuotesService(request, reply);
            if(uploadQuotes.data.message){
                reply.status(200).send(uploadQuotes.data)

            }else{
                reply.status(404).send({ error: [uploadQuotes] })
            }
        } catch (error) {
            console.log(error.message);
            reply.send(error.message);
            
        }
    }
}