// backend/services/uploadService.js
import cloudinary from "../lib/cloudinaryClient.ts";
import fs from "fs";

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

      fs.unlinkSync(filePath);

      return {
        url: result.secure_url,
        public_id: result.public_id,
        format: result.format,
        resource_type: result.resource_type,
      };
    } catch (err) {
      console.error("UploadService error:", err);
      throw new Error("File upload failed");
    }
  }

  async uploadMultiple(filePaths : string[], folder = "chat_uploads") {
    try {
      const uploadPromises = filePaths.map((path) => this.upload(path, folder));
      return await Promise.all(uploadPromises);
    } catch (err) {
      console.error("UploadService multiple error:", err);
      throw new Error("Multiple file upload failed");
    }
  }
}

export default new UploadService();
