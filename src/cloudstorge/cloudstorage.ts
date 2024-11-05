import { Storage } from "@google-cloud/storage";
import path from "path";
import fs from "fs";

const storage = new Storage({
  keyFilename: "src/cloudstorge/docblitz-437213-d99f2718bd72.json",
});
const bucketName = "revo_product_images";
const ratingbucketName = "revo_ratings_uploads";
console.log(storage);

export async function uploadPDF(filePath: string) {
  try {
    const fileName = path.basename(filePath);

    await storage.bucket(bucketName).upload(filePath, {
      destination: fileName,
      metadata: {
        contentType: "application/pdf",
      },
    });

    console.log(`File ${fileName} uploaded to ${bucketName} successfully.`);
  } catch (error) {
    console.error("Error uploading file:", error);
  }
}

export async function uploadDynamicFiles(
  filePath: string,
  bucketnamedata: string
) {
  try {
    const filename = path.basename(filePath);
    console.log(filename, "filename is");
    const fileExtension = filename.split(".").pop()?.toLowerCase();
    console.log(fileExtension, "fileExtension");
    console.log(bucketnamedata, "bucketnamedata");
    const contentType = getContentType(fileExtension);
    await storage.bucket(bucketnamedata).upload(filePath, {
      destination: filename,
      metadata: {
        contentType: contentType,
      },
    });

    console.log(`File ${filename} uploaded to ${bucketnamedata} successfully.`);
  } catch (error) {
    console.error("Error uploading file:", error);
  }
}

export async function uploadRatingimages(
  files: string[],
  bucketNameData: string,
  productid: string
) {
  try {
    console.log(files, "files");
    return new Promise((resolve, reject) => {
      try {
        if (!files || !files || files.length === 0) {
          return resolve({
            success: false,
            message: "No files provided",
          });
        }
        console.log(files);
        files &&
          files &&
          files.forEach(async (file: any) => {
            console.log(file, "file");
            const bucket = storage.bucket(bucketNameData);
            let filename = file.originalname;
            // Build the folder path based on productId and size
            const folderPath = productid
              ? `${productid}/${filename}`
              : `${filename}`;
            console.log(folderPath, "folderPath");
            const blob = bucket.file(folderPath);

            const fileExtension = file.originalname
              .split(".")
              .pop()
              ?.toLowerCase();
            console.log(fileExtension, "fileExtension");
            const contentType = getContentType(fileExtension);
            console.log(contentType, "contentType");
            const blobStream = blob.createWriteStream({
              resumable: false,
              gzip: true,
              metadata: {
                contentType: contentType,
              },
            });

            blobStream.on("error", (error) => {
              console.error("Upload error:", error);
              resolve({
                success: false,
                message: "File upload failed",
                error: error.message,
              });
            });

            blobStream.on("finish", () => {
              resolve({
                success: true,
                message: "File uploaded successfully",
                filename: folderPath,
                url: `https://storage.googleapis.com/${bucketNameData}/${folderPath}`,
              });
            });

            // Use the proper way to handle the file based on its structure
            if (Buffer.isBuffer(file.buffer)) {
              blobStream.end(file.buffer);
            } else if (typeof file.createReadStream === "function") {
              file.createReadStream().pipe(blobStream);
            } else {
              throw new Error("Unsupported file format");
            }
          });
      } catch (error: any) {
        console.error("Error uploading file:", error);
        resolve({
          success: false,
          message: "File upload failed",
          error: error.message,
        });
      }
    });
  } catch (error) {
    console.error("Error uploading file:", error);
  }
}

//uploading product image  for revo
export async function uploadFile(
  filename: string,
  file: any,
  size: "large" | "medium" | "small",
  productId?: number,
  organisation?: string
): Promise<{
  success: boolean;
  message: string;
  filename?: string;
  error?: string;
  url?: string;
}> {
  return new Promise((resolve, reject) => {
    try {
      const bucket = storage.bucket(bucketName);

      // Build the folder path based on productId and size
      const folderPath = productId
        ? `${productId}/${size}/${filename}`
        : `${size}/${filename}`;
      console.log(folderPath, "folderPath");
      const blob = bucket.file(folderPath);

      const fileExtension = filename.split(".").pop()?.toLowerCase();
      const contentType = getContentType(fileExtension);

      const blobStream = blob.createWriteStream({
        resumable: false,
        gzip: true,
        metadata: {
          contentType: contentType,
        },
      });

      blobStream.on("error", (error) => {
        console.error("Upload error:", error);
        resolve({
          success: false,
          message: "File upload failed",
          error: error.message,
        });
      });

      blobStream.on("finish", () => {
        resolve({
          success: true,
          message: "File uploaded successfully",
          filename: folderPath,
          url: `https://storage.googleapis.com/${bucketName}/${folderPath}`,
        });
      });

      if (Buffer.isBuffer(file)) {
        blobStream.end(file);
      } else if (typeof file.pipe === "function") {
        file.pipe(blobStream);
      } else {
        throw new Error("Unsupported file format");
      }
    } catch (error: any) {
      console.error("Error uploading file:", error);
      resolve({
        success: false,
        message: "File upload failed",
        error: error.message,
      });
    }
  });
}

//uploading product image  for revo
export async function uploadProductImage(
  filename: string,
  file: any,
  size: "large" | "medium" | "small",
  productId?: number,
  organisation?: string
): Promise<{
  success: boolean;
  message: string;
  filename?: string;
  error?: string;
  url?: string;
}> {
  return new Promise((resolve, reject) => {
    try {
      const bucket = storage.bucket(bucketName);

      // Build the folder path based on productId and size
      const folderPath = productId
        ? `${productId}/${size}/${filename}`
        : `${size}/${filename}`;
      console.log(folderPath, "folderPath");
      const blob = bucket.file(folderPath);

      const fileExtension = filename.split(".").pop()?.toLowerCase();
      const contentType = getContentType(fileExtension);

      const blobStream = blob.createWriteStream({
        resumable: false,
        gzip: true,
        metadata: {
          contentType: contentType,
        },
      });

      blobStream.on("error", (error) => {
        console.error("Upload error:", error);
        resolve({
          success: false,
          message: "File upload failed",
          error: error.message,
        });
      });

      blobStream.on("finish", () => {
        resolve({
          success: true,
          message: "File uploaded successfully",
          filename: folderPath,
          url: `https://storage.googleapis.com/${bucketName}/${folderPath}`,
        });
      });

      if (Buffer.isBuffer(file)) {
        blobStream.end(file);
      } else if (typeof file.pipe === "function") {
        file.pipe(blobStream);
      } else {
        throw new Error("Unsupported file format");
      }
    } catch (error: any) {
      console.error("Error uploading file:", error);
      resolve({
        success: false,
        message: "File upload failed",
        error: error.message,
      });
    }
  });
}

export async function uploadFileToGcp(
  filename: string,
  file: any,
  organisation?: string
): Promise<{
  success: boolean;
  message: string;
  filename?: string;
  error?: string;
  url?: string;
}> {
  return new Promise(async (resolve, reject) => {
    try {
      if (!organisation) {
        throw new Error("Organisation name is required");
      }

      const bucketName = organisation.toLowerCase().replace(/[^a-z0-9-]/g, "-");

      const [bucketExists] = await storage.bucket(bucketName).exists();
      let bucket;

      if (!bucketExists) {
        [bucket] = await storage.createBucket(bucketName, {
          location: "US",
          storageClass: "STANDARD",
        });
        console.log(`Bucket ${bucketName} created.`);
      } else {
        bucket = storage.bucket(bucketName);
        console.log(`Using existing bucket ${bucketName}.`);
      }

      const blob = bucket.file(filename);

      const fileExtension = filename.split(".").pop()?.toLowerCase();
      const contentType = getContentType(fileExtension);

      const blobStream = blob.createWriteStream({
        resumable: false,
        gzip: true,
        metadata: { contentType: contentType },
      });
      blobStream.on("error", (error) => {
        console.error("Upload error:", error);
        resolve({
          success: false,
          message: "File upload failed",
          error: error.message,
        });
      });

      blobStream.on("finish", () => {
        resolve({
          success: true,
          message: "File uploaded successfully",
          filename,
          url: `https://storage.cloud.google.com/${bucketName}/${filename}`,
        });
      });

      if (Buffer.isBuffer(file)) {
        blobStream.end(file);
      } else if (typeof file.pipe === "function") {
        file.pipe(blobStream);
      } else {
        throw new Error("Unsupported file format");
      }
    } catch (error: any) {
      console.error("Error uploading file:", error);
      resolve({
        success: false,
        message: "File upload failed",
        error: error.message,
      });
    }
  });
}

// export async function getBucketFiles(
//   bucketName: string,
//   options?: {
//     prefix?: string;
//     maxResults?: number;
//     pageToken?: string;
//   }
// ): Promise<{
//   success: boolean;
//   message: string;
//   files?: any;
//   nextPageToken?: string;
//   error?: string;
// }> {
//   try {
//     if (!bucketName) {
//       throw new Error("Bucket name is required");
//     }

//     // Sanitize bucket name
//     const sanitizedBucketName = bucketName
//       .toLowerCase()
//       .replace(/[^a-z0-9-]/g, "-");

//     // Check if bucket exists
//     const [bucketExists] = await storage.bucket(sanitizedBucketName).exists();
//     if (!bucketExists) {
//       return {
//         success: false,
//         message: "Bucket not found",
//         error: `Bucket ${sanitizedBucketName} does not exist`,
//       };
//     }

//     const bucket = storage.bucket(sanitizedBucketName);

//     // Get files with options
//     const [files, nextPage] = await bucket.getFiles({
//       prefix: options?.prefix || "",
//       maxResults: options?.maxResults,
//       pageToken: options?.pageToken,
//     });

//     // Format file metadata
//     const formattedFiles = await Promise.all(
//       files.map(async (file) => {
//         const [metadata]: any = await file.getMetadata();

//         // Convert size to human-readable format
//         const size = formatFileSize(parseInt(metadata.size));

//         return {
//           name: file.name,
//           url: `https://storage.cloud.google.com/${sanitizedBucketName}/${file.name}`,
//           size: size,
//           contentType: metadata.contentType,
//           created: metadata.timeCreated,
//           updated: metadata.updated,
//         };
//       })
//     );

//     return {
//       success: true,
//       message: "Files retrieved successfully",
//       files: formattedFiles,
//       ...(nextPage && { nextPageToken: nextPage.pageToken }),
//     };
//   } catch (error: any) {
//     console.error("Error retrieving files:", error);
//     return {
//       success: false,
//       message: "Failed to retrieve files",
//       error: error.message,
//     };
//   }
// }

export async function getBucketFiles(
  bucketName: string,
  options?: {
    prefix?: string;
    maxResults?: number;
    pageToken?: string;
    urlExpiration?: number; // Duration in minutes for signed URL
  }
): Promise<{
  success: boolean;
  message: string;
  files?: any;
  nextPageToken?: string;
  error?: string;
}> {
  try {
    if (!bucketName) {
      throw new Error("Bucket name is required");
    }

    // Sanitize bucket name
    const sanitizedBucketName = bucketName
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "-");

    // Check if bucket exists
    const [bucketExists] = await storage.bucket(sanitizedBucketName).exists();
    if (!bucketExists) {
      return {
        success: false,
        message: "Bucket not found",
        error: `Bucket ${sanitizedBucketName} does not exist`,
      };
    }

    const bucket = storage.bucket(sanitizedBucketName);

    // Get files with options
    const [files, nextPage] = await bucket.getFiles({
      prefix: options?.prefix || "",
      maxResults: options?.maxResults,
      pageToken: options?.pageToken,
    });

    // Format file metadata and generate signed URLs
    const formattedFiles = await Promise.all(
      files.map(async (file) => {
        const [metadata]: any = await file.getMetadata();

        // Convert size to human-readable format
        const size = formatFileSize(parseInt(metadata.size));

        // Generate signed URL
        const [signedUrl] = await file.getSignedUrl({
          version: 'v4',
          action: 'read',
          expires: Date.now() + ((options?.urlExpiration || 15) * 60 * 1000), // Default 15 minutes
        });

        return {
          name: file.name,
          url: `https://storage.cloud.google.com/${sanitizedBucketName}/${file.name}`,
          signedUrl: signedUrl,
          size: size,
          contentType: metadata.contentType,
          created: metadata.timeCreated,
          updated: metadata.updated,
        };
      })
    );

    return {
      success: true,
      message: "Files retrieved successfully",
      files: formattedFiles,
      ...(nextPage && { nextPageToken: nextPage.pageToken }),
    };
  } catch (error: any) {
    console.error("Error retrieving files:", error);
    return {
      success: false,
      message: "Failed to retrieve files",
      error: error.message,
    };
  }
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

function getContentType(extension?: string): string {
  const contentTypes: { [key: string]: string } = {
    pdf: "application/pdf",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
    webp: "image/webp",
  };

  return contentTypes[extension || ""] || "application/octet-stream";
}


