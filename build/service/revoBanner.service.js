import axios from "axios";
import { uploadRevoFiles } from "../cloudstorge/cloudstorage.js";
import { REVO_BANNER_IMAGES_API, REVO_BANNER_IMAGES_BUCKET } from "../utils/config.js";
export const bannerImageService = {
    async uploadBanner(request, reply) {
        try {
            console.log("Request received for banner upload");
            const files = request.files;
            let data;
            if (!files || files.length === 0) {
                reply.status(400).send({ status: "fail", message: "No file provided." });
                return;
            }
            // Upload files to cloud storage
            data = await uploadRevoFiles(files, REVO_BANNER_IMAGES_BUCKET, 'BannerImage');
            console.log('Upload result:', data);
            let bannerImageUrls = [];
            if (data.success && Array.isArray(data.files)) {
                data.files.forEach(file => {
                    bannerImageUrls.push(file.url);
                });
            }
            console.log('Banner Image URLs:', bannerImageUrls);
            // Send all image URLs as array [{url: ...}, ...]
            let insertBannerImages;
            if (bannerImageUrls.length > 0) {
                const imagesArray = bannerImageUrls.map(url => ({ url })); // Required format
                console.log('Images Array to send:', imagesArray);
                insertBannerImages = await axios.post(REVO_BANNER_IMAGES_API, imagesArray); // API receives array
            }
            console.log('Insert Banner Images Response:', insertBannerImages);
            return insertBannerImages; // Return result
        }
        catch (error) {
            console.error("Error uploading banner file:", error);
            reply.status(500).send({ status: "fail", message: "Banner file upload failed." });
        }
    }
};
//# sourceMappingURL=revoBanner.service.js.map