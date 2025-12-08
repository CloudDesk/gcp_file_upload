// bannerImage.controller.js

import { blogImageService } from "../service/revoBlogs.service.js";


export const blogImageController = {
  async uploadBlogPdf(request, reply) {
    try {
      const result = await blogImageService.uploadBlog(request, reply);
      console.log('Blog upload result in controller:', result);
      if (result?.status === 200) {
        reply.status(200).send(result.data); // Success: send actual blog data with blogname
      } else {
        reply.status(404).send({ error: "Blog upload failed" });
      }
    } catch (error) {
      reply.status(500).send({ error: error.message || "Internal server error" });
    }
  }
};
