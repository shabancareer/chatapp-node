import multer from "multer";
import path from "path";
import fs from "fs";
import { fileTypeFromBuffer } from "file-type";
// const FileType = require("file-type");

export const upload = multer({
  dest: async (req, file, cb) => {
    try {
      const fileBuffer = await fs.promises.readFile(file.path);
      const fileType = await fileTypeFromBuffer(fileBuffer);
      let folder = "uploads";
      if (fileType) {
        if (fileType.mime.startsWith("image/")) {
          folder = "uploads/images";
        } else if (fileType.mime.startsWith("video/")) {
          folder = "uploads/videos";
        } else if (
          [
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          ].includes(fileType.mime)
        ) {
          folder = "uploads/docs";
        }
      }
      // Ensure that the folder exists
      await fs.promises.mkdir(folder, { recursive: true });
      cb(null, folder);
    } catch (error) {
      cb(new Error("Failed to determine file type"), null);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
  fileFilter: async (req, file, cb) => {
    try {
      const fileBuffer = await fs.promises.readFile(file.path);
      const fileType = await fileType.fromBuffer(fileBuffer);
      if (
        fileType &&
        (fileType.mime.startsWith("image/") ||
          fileType.mime.startsWith("video/") ||
          [
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          ].includes(fileType.mime))
      ) {
        cb(null, true);
      } else {
        cb(new Error("Invalid file type"), false);
      }
    } catch (error) {
      cb(new Error("Failed to process file"), false);
    }
  },
}).single("file");
