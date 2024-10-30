import axios from "axios";
import imageResize from "../utils/imageresize.js";
import { REVO_PRODUCT_IMAGE_API } from "../utils/config.js";

export module revoimageservice {
    export const uploadimage = async (request: any, reply: any) => {
        try {
            console.log(request.params.productid, 'req.body');
            let data: any = await imageResize(request);
            data.productid = request.params.productid
            let dataresult = await axios.post(REVO_PRODUCT_IMAGE_API, data);
            console.log(dataresult, 'dataresult');
            return dataresult.data.product;
        } catch (error) {
            console.log(error.message);
            reply.send(error.message);
        }
    }
}