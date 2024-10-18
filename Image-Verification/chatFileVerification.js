import { fileTypeFromBuffer } from "file-type";
import fs from "fs/promises";
// import ImageKit from "imagekit";
import path from "path";
// import { imagekit } from "./fileVerification.js";

// Helper function to get the file's absolute path
export const getFilePath = (file) => {
  const __dirname = path.resolve();
  return path.join(__dirname, "../uploadsChat", file.filename);
};
export const validateImage = async (file) => {
  const filePath = getFilePath(file);
  const fileBuffer = await fs.readFile(filePath);
  const fileType = await fileTypeFromBuffer(fileBuffer);
  if (!fileType || !fileType.mime.startsWith("image/")) {
    await fs.unlink(filePath); // Delete invalid files
    return false;
  }
  return true;
};
// Upload image to ImageKit
export const uploadToImageKit = async (file) => {
  const filePath = getFilePath(file);
  const fileBuffer = await fs.readFile(filePath);
  // Upload the image to ImageKit
  const response = await imagekit.upload({
    file: fileBuffer, // Use the file buffer
    fileName: file.originalname, // Keep original file name
  });
  // Delete local file after successful upload
  await fs.unlink(filePath);

  return response; // Return ImageKit response
};
