import { Storage } from "@google-cloud/storage";
import path from "path";
import fs, { createReadStream } from "fs";
import { promisify } from "util";
import { REVO_PRODUCT_IMAGES_BUCKET } from "../utils/config.js";
const readFile = promisify(fs.readFile);
const storage = new Storage();
// const bucketName = "revo_product_images";
const bucketName = REVO_PRODUCT_IMAGES_BUCKET;
console.log(bucketName, 'BUCKET NAME ====>>>>');
export async function uploadPDF(filePath) {
    try {
        const fileName = path.basename(filePath);
        await storage.bucket(bucketName).upload(filePath, {
            destination: fileName,
            metadata: {
                contentType: "application/pdf",
            },
        });
    }
    catch (error) {
        console.error("Error uploading file:", error);
    }
}
export async function uploadDynamicFiles(filePath, bucketnamedata) {
    try {
        const filename = path.basename(filePath);
        const fileExtension = filename.split(".").pop()?.toLowerCase();
        const contentType = getContentType(fileExtension);
        await storage.bucket(bucketnamedata).upload(filePath, {
            destination: filename,
            metadata: {
                contentType: contentType,
            },
        });
    }
    catch (error) {
        console.error("Error uploading file:", error);
    }
}
export async function uploadRevoFiles(files, bucketNameData, foldername) {
    try {
        if (!files || files.length === 0) {
            return {
                success: false,
                message: "No files provided",
            };
        }
        // Process each file upload as a promise and gather all results
        const uploadPromises = files.map((file) => new Promise((resolve) => {
            const bucket = storage.bucket(bucketNameData);
            const folderPath = foldername
                ? `${foldername}/${file.originalname}`
                : file.originalname;
            const blob = bucket.file(folderPath);
            const blobStream = blob.createWriteStream({
                resumable: false,
                gzip: true,
                metadata: {
                    contentType: file.mimetype,
                },
            });
            blobStream.on("error", (error) => {
                console.error("Upload error:", error);
                resolve({
                    success: false,
                    message: "File upload failed",
                    filename: file.originalname,
                    error: error.message,
                });
            });
            blobStream.on("finish", () => {
                resolve({
                    success: true,
                    message: "File uploaded successfully",
                    filename: folderPath,
                    url: `https://storage.cloud.google.com/${bucketNameData}/${folderPath}`,
                });
            });
            try {
                const fileStream = createReadStream(file.path);
                fileStream.on("error", (error) => {
                    console.error("File read error:", error);
                    resolve({
                        success: false,
                        message: "File read failed",
                        filename: file.originalname,
                        error: error.message,
                    });
                });
                fileStream.pipe(blobStream);
            }
            catch (error) {
                console.error("Error creating file stream:", error);
                resolve({
                    success: false,
                    message: "File stream creation failed",
                    filename: file.originalname,
                    error: error.message,
                });
            }
        }));
        const uploadResults = await Promise.all(uploadPromises);
        return {
            success: true,
            message: "Files processed",
            files: uploadResults, // Contains an array of all file upload results
        };
    }
    catch (error) {
        console.error("Error uploading files:", error);
        return {
            success: false,
            message: "File upload failed",
            error: error.message,
        };
    }
}
export async function uploadFile(filename, file, size, productId, organisation) {
    return new Promise((resolve, reject) => {
        try {
            const bucket = storage.bucket(bucketName);
            // Build the folder path based on productId and size
            const folderPath = productId
                ? `${productId}/${size}/${filename}`
                : `${size}/${filename}`;
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
                    url: `https://storage.cloud.google.com/${bucketName}/${folderPath}`,
                });
            });
            if (Buffer.isBuffer(file)) {
                blobStream.end(file);
            }
            else if (typeof file.pipe === "function") {
                file.pipe(blobStream);
            }
            else {
                throw new Error("Unsupported file format");
            }
        }
        catch (error) {
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
export async function uploadProductImage(filename, file, size, productId, organisation) {
    return new Promise((resolve, reject) => {
        try {
            const bucket = storage.bucket(bucketName);
            // Build the folder path based on productId and size
            const folderPath = productId
                ? `${productId}/${size}/${filename}`
                : `${size}/${filename}`;
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
                    url: `https://storage.cloud.google.com/${bucketName}/${folderPath}`,
                });
            });
            if (Buffer.isBuffer(file)) {
                blobStream.end(file);
            }
            else if (typeof file.pipe === "function") {
                file.pipe(blobStream);
            }
            else {
                throw new Error("Unsupported file format");
            }
        }
        catch (error) {
            console.error("Error uploading file:", error);
            resolve({
                success: false,
                message: "File upload failed",
                error: error.message,
            });
        }
    });
}
export async function uploadPoInvoice(bucketName, filename, file, foldername) {
    return new Promise((resolve, reject) => {
        try {
            const bucket = storage.bucket(bucketName);
            // Build the folder path based on productId and size
            const folderPath = foldername
                ? `${foldername}/${filename}`
                : `${filename}`;
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
                    url: `https://storage.cloud.google.com/${bucketName}/${folderPath}`,
                });
            });
            if (Buffer.isBuffer(file)) {
                blobStream.end(file);
            }
            else if (typeof file.pipe === "function") {
                file.pipe(blobStream);
            }
            else {
                throw new Error("Unsupported file format");
            }
        }
        catch (error) {
            console.error("Error uploading file:", error);
            resolve({
                success: false,
                message: "File upload failed",
                error: error.message,
            });
        }
    });
}
export async function uploadFileToGcp(filename, file, organisation) {
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
            }
            else {
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
            }
            else if (typeof file.pipe === "function") {
                file.pipe(blobStream);
            }
            else {
                throw new Error("Unsupported file format");
            }
        }
        catch (error) {
            console.error("Error uploading file:", error);
            resolve({
                success: false,
                message: "File upload failed",
                error: error.message,
            });
        }
    });
}
export async function getBucketFiles(bucketName, options) {
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
        const formattedFiles = await Promise.all(files.map(async (file) => {
            const [metadata] = await file.getMetadata();
            // Convert size to human-readable format
            const size = formatFileSize(parseInt(metadata.size));
            // Generate signed URL
            const [signedUrl] = await file.getSignedUrl({
                version: "v4",
                action: "read",
                expires: Date.now() + (options?.urlExpiration || 15) * 60 * 1000, // Default 15 minutes
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
        }));
        return {
            success: true,
            message: "Files retrieved successfully",
            files: formattedFiles,
            ...(nextPage && { nextPageToken: nextPage.pageToken }),
        };
    }
    catch (error) {
        console.error("Error retrieving files:", error);
        return {
            success: false,
            message: "Failed to retrieve files",
            error: error.message,
        };
    }
}
function formatFileSize(bytes) {
    if (bytes === 0)
        return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}
function getContentType(extension) {
    const contentTypes = {
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
const validateFileBuffer = (fileBuffer) => {
    // Check if buffer is empty or invalid
    if (!fileBuffer || fileBuffer.length === 0) {
        return false;
    }
    return true;
};
export async function uploadFilesToGcs2(bucketName, filename, file, foldername) {
    return new Promise((resolve, reject) => {
        try {
            const bucket = storage.bucket(bucketName);
            const folderPath = foldername
                ? `${foldername}/${filename}`
                : `${filename}`;
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
                    url: `https://storage.cloud.google.com/${bucketName}/${folderPath}`,
                });
            });
            blobStream.end(file);
        }
        catch (error) {
            console.error("Error uploading file:", error);
            resolve({
                success: false,
                message: "File upload failed",
                error: error.message,
            });
        }
    });
}
//# sourceMappingURL=cloudstorage.js.map