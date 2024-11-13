import fs from "fs/promises";
import { Files, Params } from "../interface/fileupload.interface.js";
import { uploadFilesToGcs2 } from "../cloudstorge/cloudstorage.js";

export const fileUploadService = {
  uploadFile: async (reqBody: Params, files: Files) => {
    try {
      console.log(reqBody, "reqBody from file upload service");
      const { bucketName, folderName } = reqBody;
      console.log(files, "files from file upload service");

      const file = files[0];
      const { path, originalname: filename } = file;

      const relativeFilePath = path.split("gcp_file_upload/")[1];
      console.log("Relative file path:", relativeFilePath);
      const fileBuffer = await fs.readFile(path);
      console.log("File buffer size:", fileBuffer.length, "bytes");

      const result = await uploadFilesToGcs2(
        bucketName,
        filename,
        file,
        folderName
      );

      //   const result = await uploadFilesToGcs2(
      //     bucketName,
      //     folderName,
      //     relativeFilePath,
      //     filename
      //   );
      //   const result = await uploadFileToGCS(bucketName, folderName, path);
      console.log(result, "result from file upload service");

      if (result.success) {
        return { message: "File uploaded successfully", url: result.url };
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error("File upload service error:", error);
      return { success: false, message: error.message };
    }
  },
};
