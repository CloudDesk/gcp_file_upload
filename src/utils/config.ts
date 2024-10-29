import dotenv from 'dotenv'
dotenv.config()

const config = {
    REVO_PRODUCT_IMAGE_API: process.env.REVO_PRODUCT_IMAGE_API,
    
  };

  export const { REVO_PRODUCT_IMAGE_API } = config;
 