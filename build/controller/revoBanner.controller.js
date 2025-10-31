// bannerImage.controller.js
import { bannerImageService } from "../service/revoBanner.service.js";
export const bannerImageController = {
    async uploadBannerImage(request, reply) {
        try {
            const result = await bannerImageService.uploadBanner(request, reply);
            console.log('Banner upload result in controller:', result);
            if (result?.status === 200) {
                reply.status(200).send(result.status); // Success: send image data
            }
            else {
                reply.status(404).send({ error: "Banner upload failed" });
            }
        }
        catch (error) {
            reply.status(500).send({ error: error.message || "Internal server error" });
        }
    }
};
//# sourceMappingURL=revoBanner.controller.js.map