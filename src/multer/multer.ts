

import Multer from "fastify-multer";
import { fileURLToPath } from "url";
import { dirname, join, resolve } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const parentDir = resolve(__dirname, "../../uploads");
const fileMaxSize = 150 * 1024 * 1024;
const storage = Multer.diskStorage({
  destination: (req, file, cb) => {
    const ROOT_PATH = parentDir;

    cb(null, ROOT_PATH);
  },
  filename: (req, file, cb) => {
    cb(
      null,
      new Date().toISOString().replace(/:/g, "-") + "-" + file.originalname
    );
  },
});

const upload = Multer({
  storage: storage,
  limits: { fileSize: fileMaxSize },
});

const filesUpload: any = upload.array("file");

export { filesUpload, Multer };
