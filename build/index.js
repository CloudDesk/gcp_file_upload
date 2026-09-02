import Fastify from "fastify";
import fastifyStatic from "@fastify/static";
import fastifyMultipart from "@fastify/multipart";
import { fileURLToPath } from "url";
import { dirname, join, resolve } from "path";
import cors from "@fastify/cors";
import formbody from "@fastify/formbody";
import fastifyCookie from "fastify-cookie";
import { pdfroute } from "./routes/routes.js";
const fastify = Fastify({
    logger: false, // Enable logging for debugging
});
await fastify.register(cors, {
    origin: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept"],
    credentials: true,
    maxAge: 86400,
    exposedHeaders: ["set-cookie"],
});
console.log('test');
fastify.register(formbody);
fastify.register(fastifyCookie);
fastify.register(fastifyMultipart);
fastify.register(pdfroute, { fastifyInstance: fastify });
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const parentDir = resolve(__dirname, "..");
;
fastify.register(fastifyStatic, {
    root: join(parentDir, "/uploads"),
});
// Add error handling
fastify.setErrorHandler((error, request, reply) => {
    fastify.log.error(error);
    reply.code(error.statusCode || 500).send({ error: error.message });
});
// Add 404 handler
fastify.setNotFoundHandler((request, reply) => {
    reply.code(404).send({ error: `Route ${request.url} not found` });
});
// Server listening configuration
const start = async () => {
    try {
        const address = await fastify.listen({
            port: 4500,
            host: "0.0.0.0",
            listen: true,
        });
        console.log(`File-upload server is running at ${address}`);
    }
    catch (err) {
        console.error("File-upload server failed to start:", err?.message || err);
        process.exit(1);
    }
};
start().catch((err) => {
    console.error("Error starting server:", err);
    process.exit(1);
});
//# sourceMappingURL=index.js.map