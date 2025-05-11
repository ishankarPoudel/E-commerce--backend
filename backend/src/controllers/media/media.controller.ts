import { Controller, Post, Route, Tags, UploadedFile, FormField } from "tsoa";
import { MediaServices } from "../../services/media/media.services";
import fs from "fs/promises"; // For async file operations
import path from "path";

@Route("media")
@Tags("Media")
export class MediaController extends Controller {
  @Post("/upload")
  public async uploadMedia(
    @FormField() bagId: string,
    @UploadedFile() file: Express.Multer.File
  ) {
    console.log(
      "MediaController received file (first 50 bytes of buffer if present):",
      file && file.buffer ? file.buffer.slice(0, 50) : "No buffer",
      "Original Name:",
      file ? file.originalname : "N/A"
    );

    if (!file || !file.buffer) {
      // Check for buffer if using MemoryStorage
      this.setStatus(400);
      return {
        success: false,
        message: "No file uploaded or file buffer is missing.",
      };
    }

    let imagePath: string;
    let serverFilename: string;

    // --- Manual File Saving Logic (if TSOA uses MemoryStorage) ---
    try {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      const originalNameWithoutExt = path.parse(file.originalname).name;
      serverFilename =
        originalNameWithoutExt +
        "-" +
        uniqueSuffix +
        path.extname(file.originalname);

      const uploadsDir = path.join(
        __dirname,
        "../../../../backend/public/uploads"
      );
      // Ensure uploads directory exists
      await fs.mkdir(uploadsDir, { recursive: true });

      const fullPath = path.join(uploadsDir, serverFilename);
      await fs.writeFile(fullPath, file.buffer);
      imagePath = `/uploads/${serverFilename}`;
      console.log(`File manually saved to: ${fullPath}`);
    } catch (error) {
      console.error("Error manually saving file:", error);
      this.setStatus(500);
      return { success: false, message: "Failed to save uploaded file." };
    }
    // --- End Manual File Saving Logic ---

    const media = await new MediaServices().addMediaToBag(
      bagId,
      imagePath // Use the path from manual saving
    );

    return {
      success: true,
      message: "Media uploaded successfully",
      data: media,
    };
  }
}
