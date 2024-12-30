import Fastify from "fastify";
import fastifyStatic from "@fastify/static";
import fastifyMultipart from "@fastify/multipart";
import { fileURLToPath } from "url";
import { dirname, join, resolve } from "path";
import cors from "@fastify/cors";
import formbody from "@fastify/formbody";
import fastifyCookie from "fastify-cookie";
import { pdfroute } from "./routes/routes.js";

const fastify: any = Fastify({
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
    await fastify.listen({
      port: 4500,
      host: "0.0.0.0",
      listen: true,
    });

    console.log(`Server is running on ${fastify.server.address().port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start().catch((err) => {
  console.error("Error starting server:", err);
  process.exit(1);
});
