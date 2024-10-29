import Fastify from "fastify";
// import Multer from "fastify-multer";
import fastifyStatic from "@fastify/static";
import fastifyMultipart from "@fastify/multipart";
import { fileURLToPath } from "url";
import { dirname, join, resolve } from "path";
import formidable from 'formidable';

// import { checkDatabaseConnection } from './database/postgres.js';
import cors from "@fastify/cors";
// import { PORT } from './config/config.js';
import formbody from "@fastify/formbody";
import fastifyCookie from "fastify-cookie";
import { pdfroute } from "./routes/routes.js";
// import { connectGetSessionredis } from './database/redis.session.js';

const fastify: any = Fastify();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const parentDir = resolve(__dirname, "..");

fastify.register(formbody);
fastify.register(fastifyCookie);
// fastify.register(fastifyMultipart);
fastify.register(fastifyMultipart, {
  limits: {
    fieldNameSize: 100, 
    fieldSize: 100,     
    fields: 10,         
    fileSize: 1000000,  
    files: 10,           
    headerPairs: 2000,  
    parts: 1000        
  }
});

// fastify.register(fastifyMultipart, { attachFieldsToBody: true })

fastify.register(formidable);


// fastify.register(Multer.contentParser);
fastify.register(pdfroute, { fastifyInstance: fastify });

console.log(join(parentDir, "/uploads"), "INDEX PATH");
console.log(parentDir, "INDEX PATH 2");
fastify.register(fastifyStatic, {
  root: join(parentDir, "/uploads"),
});

fastify.register(cors);

// fastify.addHook('onRequest', async (request, reply) => {
//     request.sessionTimings = {
//       rid: Date.now(),
//       cfsession:0,
//       queryStartTime: 0,
//       queryEndTime: 0,
//       datatypecheckStartTime: 0,
//       datatypecheckEndTime: 0,
//       closeTime: 0
//     };
//     console.log('ON REQUEST ROUTE IS');
//   });

//   fastify.addHook('onResponse', (request, reply, done) => {

//     request.sessionTimings.closeTime = Date.now();  // Request End Time
//     const totalProcessingTime = request.sessionTimings.closeTime - request.sessionTimings.rid;
//     console.log(`Route: ${request.routerPath} - Processing time: ${totalProcessingTime}ms`);
//     console.log('ON RESPONSE ROUTE IS');
//     done();
//   });

// fastify.addHook('onReady', async () => {
//     try {
//         let data = await checkDatabaseConnection();
//         console.log(data, 'inside');
//         await connectGetSessionredis();
//         // done()
//         // console.log(fastify.isServerReady, 'Loging value is');
//     } catch (error) {
//         console.error("Failed to connect to the database:", error);
//         return error
//     }
// });

fastify.listen(
  {
    // port: PORT,
    port: 4500,
  },
  (err: any, address: any) => {
    try {
      if (err) {
        console.error(err);
      }
      if (address) {
        console.log("Successfully Connected", address);
      } else {
        console.log("Server Not Connectd ");
      }
    } catch (error) {
      return error;
    }
  }
);

// export { fastify };
