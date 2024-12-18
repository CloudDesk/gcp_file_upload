import Jimp from "jimp";
import { uploadProductImage } from "../cloudstorge/cloudstorage.js";
// const imageResize = async (request: any) => {
//     try {
//         const resizedImageUrls = [];
//         const upsertFiles = request.files() as AsyncGenerator<{ file: NodeJS.ReadableStream; filename: string; mimetype: string; }>;
//         const productid = request.params.productid;
//         console.log(productid, 'productid');
//         for await (const file of upsertFiles) {
//             console.log(file ,'file is ====>>>');
//             const chunks: Uint8Array[] = [];
//             for await (const chunk of file.file) {
//                 chunks.push(chunk);
//             }
//             const fileBuffer = Buffer.concat(chunks);
//             const image = await Jimp.read(fileBuffer);
//             const largeBuffer = await image.clone().getBufferAsync(Jimp.MIME_JPEG);
//             const largeBase64 = `data:image/jpeg;base64,${largeBuffer.toString('base64')}`;
//             const largeUrl = await uploadFile(`large_${file.filename}`, largeBuffer, 'large', productid);
//             console.log(largeUrl, 'largeUrl');
//             resizedImageUrls.push({ Large: largeUrl.url });
//             const mediumImage = image.clone().resize(image.bitmap.width / 2, Jimp.AUTO);
//             const mediumBuffer = await mediumImage.getBufferAsync(Jimp.MIME_JPEG);
//             const mediumBase64 = `data:image/jpeg;base64,${mediumBuffer.toString('base64')}`;
//             const mediumUrl = await uploadFile(`medium_${file.filename}`, mediumBuffer, 'medium', productid);
//             resizedImageUrls.push({ Medium: mediumUrl.url });
//             const smallImage = image.clone().resize(100, Jimp.AUTO);
//             const smallBuffer = await smallImage.getBufferAsync(Jimp.MIME_JPEG);
//             const smallBase64 = `data:image/jpeg;base64,${smallBuffer.toString('base64')}`;
//             const smallUrl = await uploadFile(`small_${file.filename}`, smallBuffer, 'small', productid);
//             resizedImageUrls.push({ Small: smallUrl.url });
//         }
//         const groupedUrls = resizedImageUrls.reduce((acc, obj) => {
//             const key = Object.keys(obj)[0];
//             const value = obj[key];
//             if (acc[key]) {
//                 acc[key].push(value);
//             } else {
//                 acc[key] = [value];
//             }
//             return acc;
//         }, {});
//         return { url: groupedUrls };
//     } catch (error) {
//         return `${error.message} : Error in Resizing Images`;
//     }
// };
const imageResize = async (request) => {
    try {
        const resizedImageUrls = [];
        const upsertFiles = request.files();
        const productid = request.params.productid;
        console.log(productid, "productid");
        for await (const file of upsertFiles) {
            console.log(file, "file is ====>>>");
            const chunks = [];
            // Read file into buffer
            try {
                for await (const chunk of file.file) {
                    chunks.push(Buffer.from(chunk));
                }
            }
            catch (error) {
                console.error("Error reading file stream:", error);
                return { success: false, error: error.message || "Error reading file stream" };
            }
            const fileBuffer = Buffer.concat(chunks);
            try {
                const image = await Jimp.read(fileBuffer);
                console.log("Image loaded successfully", image);
                const largeBuffer = await image.clone().getBufferAsync(Jimp.MIME_JPEG);
                //const largeUrl = await uploadFile(`large_${file.filename}`, largeBuffer, 'large', productid);
                const largeUrl = await uploadProductImage(`large_${file.filename}`, largeBuffer, "large", productid);
                console.log(largeUrl, "largeUrl");
                resizedImageUrls.push({ Large: largeUrl.url });
                const mediumImage = image
                    .clone()
                    .resize(image.bitmap.width / 2, Jimp.AUTO);
                const mediumBuffer = await mediumImage.getBufferAsync(Jimp.MIME_JPEG);
                const mediumUrl = await uploadProductImage(`medium_${file.filename}`, mediumBuffer, "medium", productid);
                resizedImageUrls.push({ Medium: mediumUrl.url });
                const smallImage = image.clone().resize(100, Jimp.AUTO);
                const smallBuffer = await smallImage.getBufferAsync(Jimp.MIME_JPEG);
                const smallUrl = await uploadProductImage(`small_${file.filename}`, smallBuffer, "small", productid);
                resizedImageUrls.push({ Small: smallUrl.url });
            }
            catch (error) {
                console.error("Error processing image:", error);
                return { success: false, error: error.message || "Error processing image" };
            }
        }
        const groupedUrls = resizedImageUrls.reduce((acc, obj) => {
            const key = Object.keys(obj)[0];
            const value = obj[key];
            if (acc[key]) {
                acc[key].push(value);
            }
            else {
                acc[key] = [value];
            }
            return acc;
        }, {});
        return { url: groupedUrls };
    }
    catch (error) {
        console.error("Error in image resizing function:", error);
        return {
            success: false,
            statusCode: 500,
            error: "Internal Server Error",
            message: error.message || "Error in Resizing Images",
        };
    }
};
export default imageResize;
//# sourceMappingURL=imageresize.js.map