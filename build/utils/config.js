import dotenv from "dotenv";
dotenv.config();
const config = {
    REVO_PRODUCT_IMAGE_API: process.env.REVO_PRODUCT_IMAGE_API,
    REVO_PRODUCT_RATING_API: process.env.REVO_PRODUCT_RATING_API,
    REVO_PO_INVOICE_API: process.env.REVO_PO_INVOICE_API,
    REVO_PR_QUOTES_API: process.env.REVO_PR_QUOTES_API,
    REVO_TICKETS_IMAGES_API: process.env.REVO_TICKETS_IMAGES_API,
    REVO_PO_GENERATE_API: process.env.REVO_PO_GENERATE_API,
    REVO_PR_GENERATE_API: process.env.REVO_PR_GENERATE_API,
    REVO_COST_ESTIMATTION_GENERATE_API: process.env.REVO_COST_ESTIMATTION_GENERATE_API,
    REVO_INVOICE_GENERATE_API: process.env.REVO_INVOICE_GENERATE_API,
};
export const { REVO_PRODUCT_IMAGE_API } = config;
export const { REVO_PRODUCT_RATING_API } = config;
export const { REVO_PO_INVOICE_API } = config;
export const { REVO_PR_QUOTES_API } = config;
export const { REVO_TICKETS_IMAGES_API } = config;
export const { REVO_PO_GENERATE_API } = config;
export const { REVO_PR_GENERATE_API } = config;
export const { REVO_COST_ESTIMATTION_GENERATE_API } = config;
export const { REVO_INVOICE_GENERATE_API } = config;
//# sourceMappingURL=config.js.map