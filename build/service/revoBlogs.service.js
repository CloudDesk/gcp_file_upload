import axios from "axios";
import { uploadRevoFiles } from "../cloudstorge/cloudstorage.js";
import { REVO_BLOG_PDF_BUCKET, REVO_BLOGS_IMAGES_API } from "../utils/config.js";
export const blogImageService = {
    async uploadBlog(request, reply) {
        try {
            console.log("Request received for blog upload");
            const files = request.files;
            let data;
            if (!files || files.length === 0) {
                reply.status(400).send({ status: "fail", message: "No file provided." });
                return;
            }
            // Upload files to cloud storage
            data = await uploadRevoFiles(files, REVO_BLOG_PDF_BUCKET, 'BlogsImage');
            console.log('Upload result:', data);
            let blogsImageUrls = [];
            if (data.success && Array.isArray(data.files)) {
                data.files.forEach(file => {
                    blogsImageUrls.push(file.url);
                });
            }
            console.log('Blogs Image URLs:', blogsImageUrls);
            // Extract blogname from request body and wrap in array structure [{}]
            const blogname = request.body?.blogname || '';
            const blognameArray = [{ blogname }]; // Wrap in array structure as backend expects
            console.log('Blog Name Array:', blognameArray);
            // Send all image URLs as array [{url: ..., blogname: ...}, ...]
            let insertBlogImages;
            if (blogsImageUrls.length > 0) {
                const imagesArray = blogsImageUrls.map(url => ({
                    url,
                    blogname: blognameArray[0].blogname // Extract blogname from array structure
                }));
                console.log('Images Array to send:', imagesArray);
                insertBlogImages = await axios.post(REVO_BLOGS_IMAGES_API, imagesArray); // API receives array
            }
            console.log('Insert Blog Images Response:', insertBlogImages);
            return insertBlogImages; // Return result
        }
        catch (error) {
            console.error("Error uploading blog file:", error);
            reply.status(500).send({ status: "fail", message: "Blog file upload failed." });
        }
    }
};
//# sourceMappingURL=revoBlogs.service.js.map