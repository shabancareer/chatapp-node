import multer from "multer";
import path from "path";
import fs from "fs";
import { fileTypeFromBuffer } from "file-type";
import {
  getFilePath,
  getFolderPath,
} from "../../Image-Verification/fileVerification.js";
// const FileType = require("file-type");

const storage = multer.memoryStorage();
export const upload = multer({
  storage: storage,
  // fileFilter: async (req, file, cb) => {
  //   console.log("File object:", file);
  //   try {
  //     // Access the file buffer directly
  //     const fileBuffer = file.buffer;
  //     // Check if the buffer is available
  //     if (!fileBuffer || fileBuffer.length === 0) {
  //       return cb(
  //         new Error("File buffer is undefined or file is empty"),
  //         false
  //       );
  //     }
  //     const fileTypeResult = await fileTypeFromBuffer(fileBuffer);
  //     if (
  //       fileTypeResult &&
  //       (fileTypeResult.mime.startsWith("image/") ||
  //         fileTypeResult.mime.startsWith("video/") ||
  //         [
  //           "application/pdf",
  //           "application/msword",
  //           "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  //         ].includes(fileTypeResult.mime))
  //     ) {
  //       cb(null, true);
  //     } else {
  //       cb(new Error("Invalid file type"), false);
  //     }
  //   } catch (error) {
  //     console.error("Error processing file:", error);
  //     cb(new Error("Failed to process file"), false);
  //   }

  // },
}).single("file");
// Function to save the file after validation
export const saveFile = async (file, folder) => {
  try {
    const folderPath = getFolderPath(__dirname, "..", folder);
    // const folderPath = path.join(__dirname, "..", folder);
    await fs.promises.mkdir(folderPath, { recursive: true });
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const filePath = path.join(
      folderPath,
      uniqueSuffix + path.extname(file.originalname)
    );
    // Write the file buffer to the destination folder
    await fs.promises.writeFile(filePath, file.buffer);
    return filePath;
  } catch (error) {
    console.error("Error saving file:", error);
    throw new Error("Failed to save file");
  }
};
// export const upload = multer({
//   dest: async (req, file, cb) => {
//     try {
//       const fileBuffer = await fs.promises.readFile(file.path);
//       const fileType = await fileTypeFromBuffer(fileBuffer);
//       console.log("File:=", fileType);
//       let folder = "uploads";
//       if (fileType) {
//         if (fileType.mime.startsWith("image/")) {
//           folder = "uploads/images";
//         } else if (fileType.mime.startsWith("video/")) {
//           folder = "uploads/videos";
//         } else if (
//           [
//             "application/pdf",
//             "application/msword",
//             "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
//           ].includes(fileType.mime)
//         ) {
//           folder = "uploads/docs";
//         }
//       }
//       // Ensure that the folder exists
//       await fs.promises.mkdir(folder, { recursive: true });
//       cb(null, folder);
//     } catch (error) {
//       cb(new Error("Failed to determine file type"), null);
//     }
//   },
//   filename: (req, file, cb) => {
//     const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
//     cb(null, uniqueSuffix + path.extname(file.originalname));
//   },
//   fileFilter: async (req, file, cb) => {
//     try {
//       const fileBuffer = await fs.promises.readFile(file.path);
//       // console.log("fileBuffer=:", fileBuffer);
//       const fileType = await fileType.fromBuffer(fileBuffer);
//       if (
//         fileType &&
//         (fileType.mime.startsWith("image/") ||
//           fileType.mime.startsWith("video/") ||
//           [
//             "application/pdf",
//             "application/msword",
//             "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
//           ].includes(fileType.mime))
//       ) {
//         cb(null, true);
//       } else {
//         cb(new Error("Invalid file type"), false);
//       }
//     } catch (error) {
//       console.log(error);
//       cb(new Error("Failed to process file"), false);
//     }
//   },
// }).single("file");
