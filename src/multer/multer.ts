import Multer from "fastify-multer";

const storage = Multer.memoryStorage();

const upload = Multer({
  storage: storage,
});

const filesUpload: any = upload.array("file");
export default filesUpload;
