
import cloudinary from "../lib/cloudinaryClient.js";
import fs from "fs";
import logger from "../utils/logger.js";

class UploadService {

  async upload(filePath : string, folder = "chat_uploads") {
    try {
      const result = await cloudinary.uploader.upload(filePath, {
        resource_type: "auto",
        folder,
        quality: "auto",             
        fetch_format: "auto",        
        responsive: true,            
      });

      // Use async unlink to avoid blocking the event loop
      await fs.promises.unlink(filePath);

      return {
        url: result.secure_url,
        public_id: result.public_id,
        format: result.format,
        resource_type: result.resource_type,
      };
    } catch (err) {
      logger.error("UploadService error:", err);
      // Best-effort cleanup: if the temp file still exists, remove it
      try { await fs.promises.unlink(filePath); } catch { /* already gone */ }
      throw new Error("File upload failed");
    }
  }

  async uploadMultiple(filePaths : string[], folder = "chat_uploads") {
    try {
      const uploadPromises = filePaths.map((path) => this.upload(path, folder));
      return await Promise.all(uploadPromises);
    } catch (err) {
      logger.error("UploadService multiple error:", err);
      throw new Error("Multiple file upload failed");
    }
  }
}

export default new UploadService();
