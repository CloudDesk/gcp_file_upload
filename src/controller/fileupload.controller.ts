import { fileUploadService } from "../service/fileupload.service.js";

export const fileUploadController = {
  fileUpload: async (request: any, reply: any) => {
    try {
      //   let params = request.params;
      let files = await request.files;
      let imageuploader = await fileUploadService.uploadFile(
        request.body,
        files
      );
      console.log(imageuploader, "imageuploader");
      reply.send(imageuploader);
    } catch (error) {
      return error;
    }
  },
};
