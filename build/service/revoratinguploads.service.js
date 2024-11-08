// import { uploadRatingimages } from "../cloudstorge/cloudstorage.js";
export {};
// export const revoratingsuploadservice = {
//   revoratingupload: async (request: any, reply: any) => {
//     try {
//       console.log(request.body, "Body si iis ");
//       const upsertFiles = request.files() as AsyncGenerator<{
//         file: NodeJS.ReadableStream;
//         filename: string;
//         mimetype: string;
//       }>;
//       for await (const file of upsertFiles) {
//         const datagcp = await uploadRatingimages(
//           file.filename,
//           file.file,
//           "revo_ratings_images",
//           "113"
//         );
//         console.log(datagcp, "datagcp");
//       }
//       return "test";
//     } catch (error) {
//       console.error("Error:", error);
//       return error;
//     }
//   },
// };
//# sourceMappingURL=revoratinguploads.service.js.map