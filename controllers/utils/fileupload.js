import multer from "multer";
// import path from "path";
// import fs from "fs";
// import { fileTypeFromBuffer } from "file-type";
// import {
//   getFilePath,
//   // getFolderPath,
// } from "../../Image-Verification/fileVerification.js";

export const upload = multer({
  storage: multer.memoryStorage(),
}).single("file");

// Middleware to save the file to the appropriate subfolder
// export const saveFileToFolder = (req, res, next) => {
//   if (!req.file) {
//     return res.status(400).json({ message: "No file uploaded" });
//   }

//   // Determine the destination folder based on the mime type
//   const mimeType = req.file.mimetype;
//   let folder = "uploadsChat";

//   if (mimeType.startsWith("image/")) {
//     folder = "uploadsChat/images";
//   } else if (mimeType.startsWith("video/")) {
//     folder = "uploadsChat/videos";
//   } else if (
//     [
//       "application/pdf",
//       "application/msword",
//       "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
//     ].includes(mimeType)
//   ) {
//     folder = "uploadsChat/docs";
//   }

//   // Ensure the folder exists
//   fs.mkdirSync(folder, { recursive: true });

//   // Create a unique filename
//   const uniqueFilename = `${Date.now()}-${req.file.originalname}`;
//   const filePath = path.join(folder, uniqueFilename);

//   // Write the buffer to the appropriate folder
//   fs.writeFile(filePath, req.file.buffer, (err) => {
//     if (err) {
//       console.error("Error saving file:", err);
//       return next(new Error("Failed to save the file"));
//     }

//     // Attach the file path to the request object for further processing
//     req.file.path = filePath;
//     next();
//   });
// };
// export const upload = multer({
//   storage: storage,
//   fileFilter: (req, file, cb) => {
//     if (
//       file.mimetype.startsWith("image/") ||
//       file.mimetype.startsWith("video/") ||
//       [
//         "application/pdf",
//         "application/msword",
//         "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
//       ].includes(file.mimetype)
//     ) {
//       cb(null, true);
//     } else {
//       cb(new Error("Invalid file type"));
//     }
//   },
// }).single("file");
// Function to save the file after validation
// export const saveFile = async (file, folder) => {
//   try {
//     const folderPath = getFolderPath(__dirname, "..", folder);
//     // const folderPath = path.join(__dirname, "..", folder);
//     await fs.promises.mkdir(folderPath, { recursive: true });
//     const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
//     const filePath = path.join(
//       folderPath,
//       uniqueSuffix + path.extname(file.originalname)
//     );
//     // Write the file buffer to the destination folder
//     await fs.promises.writeFile(filePath, file.buffer);
//     return filePath;
//   } catch (error) {
//     console.error("Error saving file:", error);
//     throw new Error("Failed to save file");
//   }
// };
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
