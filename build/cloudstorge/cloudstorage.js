import { Storage } from "@google-cloud/storage";
import path from "path";
const storage = new Storage({
    keyFilename: "src/cloudstorge/docblitz-437213-d99f2718bd72.json",
});
const bucketName = "pdfgenfile";
console.log(storage);
export async function uploadPDF(filePath) {
    try {
        const fileName = path.basename(filePath);
        await storage.bucket(bucketName).upload(filePath, {
            destination: fileName,
            metadata: {
                contentType: "application/pdf",
            },
        });
        console.log(`File ${fileName} uploaded to ${bucketName} successfully.`);
    }
    catch (error) {
        console.error("Error uploading file:", error);
    }
}
export async function uploadPDFtwo(filename, file) {
    try {
        const bucket = storage.bucket(bucketName);
        console.log(bucketName, "bucketname");
        const blob = bucket.file(filename);
        const blobStream = blob.createWriteStream({
            resumable: false,
            gzip: true,
        });
        await file
            .pipe(blobStream)
            .on("finish", () => {
            console.log("FInihsed");
            return {
                success: true,
                message: "File uploaded successfully",
                filename,
            };
        })
            .on("error", (err) => {
            console.log("FInihsed error");
            console.log(err);
            return {
                success: false,
                message: "File upload failed",
                error: err.message,
            };
        });
    }
    catch (error) {
        console.error("Error uploading file:", error);
    }
}
export async function uploadFile(filename, file, organisation) {
    return new Promise((resolve, reject) => {
        try {
            const bucket = storage.bucket(bucketName);
            const blob = bucket.file(filename);
            // Set appropriate content type based on file extension
            const fileExtension = filename.split(".").pop()?.toLowerCase();
            const contentType = getContentType(fileExtension);
            const blobStream = blob.createWriteStream({
                resumable: false,
                gzip: true,
                metadata: {
                    contentType: contentType,
                },
            });
            // Handle stream events
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
export async function uploadFileToGcp(filename, file, organisation) {
    return new Promise(async (resolve, reject) => {
        try {
            if (!organisation) {
                throw new Error("Organisation name is required");
            }
            // Convert organisation name to valid bucket name (lowercase, no special chars)
            const bucketName = organisation.toLowerCase().replace(/[^a-z0-9-]/g, "-");
            // Check if bucket exists
            const [bucketExists] = await storage.bucket(bucketName).exists();
            let bucket;
            if (!bucketExists) {
                // Create new bucket
                [bucket] = await storage.createBucket(bucketName, {
                    location: "US", // Specify your desired location
                    storageClass: "STANDARD",
                });
                console.log(`Bucket ${bucketName} created.`);
            }
            else {
                bucket = storage.bucket(bucketName);
                console.log(`Using existing bucket ${bucketName}.`);
            }
            const blob = bucket.file(filename);
            // Set appropriate content type based on file extension
            const fileExtension = filename.split(".").pop()?.toLowerCase();
            const contentType = getContentType(fileExtension);
            const blobStream = blob.createWriteStream({
                resumable: false,
                gzip: true,
                metadata: {
                    contentType: contentType,
                },
            });
            // Handle stream events
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
        // Format file metadata
        const formattedFiles = await Promise.all(files.map(async (file) => {
            const [metadata] = await file.getMetadata();
            // Convert size to human-readable format
            const size = formatFileSize(parseInt(metadata.size));
            return {
                name: file.name,
                url: `https://storage.cloud.google.com/${sanitizedBucketName}/${file.name}`,
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
//# sourceMappingURL=cloudstorage.js.map