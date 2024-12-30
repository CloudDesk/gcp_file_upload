import { revoimageservice } from "../service/revoproductimage.service.js";
export const revoimagecontroller = {
    uploadimage: async (request, reply) => {
        try {
            let uploadimageresult = await revoimageservice.uploadimage(request, reply);
            reply.send(uploadimageresult);
        }
        catch (error) {
            console.log(error.message);
            reply.send(error.message);
        }
    },
};
//# sourceMappingURL=revoproductimage.controller.js.map