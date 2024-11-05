import axios from "axios";
import imageResize from "../utils/imageresize.js";
import { REVO_PRODUCT_IMAGE_API } from "../utils/config.js";

export const revoimageservice = {
  uploadimage: async (request: any, reply: any) => {
    try {
      if (request.params.productid) {
        console.log(request.params.productid, "req.body");
        let data: any = await imageResize(request);
        data.productid = request.params.productid;
        let dataresult = await axios.post(REVO_PRODUCT_IMAGE_API, data);
        console.log(dataresult, "dataresult");
        return dataresult.data.product;
      } else {
        return "Product id is missing";
      }
    } catch (error) {
      console.log(error.message);
      return error.message;
    }
  },
};
