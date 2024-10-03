import { Router } from "express";
import multer, { memoryStorage } from "multer";
import { fileTypeFromFile, fileTypeFromBuffer } from "file-type";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import ImageKit from "imagekit";
// import { requireAuthentication } from "./controllers/utils/middlewares/authCheck.js";
import { requireAuthentication } from "../controllers/utils/middlewares/authCheck.js";
import validators from "../controllers/utils/validators/index.js";
import {
  singUp,
  login,
  logout,
  logoutAllDevices,
  refreshAccess,
  forgotPassword,
  resetPassword,
  fetchAllProfiles,
  // emailVerification,
} from "../controllers/userController.js";
import {
  // fetchUserProfile,
  fetchAuthUserProfile,
} from "../controllers/authController.js";
const upload = multer({
  dest: "uploads",
  limits: {
    fileSize: 2 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Please upload an image"));
    }
    cb(null, true);
  },
});

// Get the current directory equivalent to __dirname
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);
// const storage = multer.memoryStorage();
// const upload = multer({
//   storage: storage, // Use memory storage for accessing file buffer
//   limits: {
//     fileSize: 1024 * 1024 * 5, // 5MB limit
//   },
//   fileFilter: async (req, file, cb) => {
//     // Log the file object for debugging
//     // console.log("File received: ", file);
//     try {
//       if (!file || !file.buffer) {
//         // return cb(new Error("No file or file buffer available"));
//         // console.log(cb(new Error("No file or file buffer available")));
//         console.log(file.buffer);
//       }
//       // Detect the file type from the buffer
//       const fileType = await fileTypeFromBuffer(file.buffer);
//       console.log("File type:", fileType);
//       if (!fileType) {
//         return cb(new Error("Unable to determine file type"));
//       }

//       // Validate the file type (allowing jpeg, png, gif)
//       if (!["image/jpeg", "image/png", "image/gif"].includes(fileType.mime)) {
//         return cb(
//           new Error("Please upload a valid image file (jpeg, png, gif)")
//         );
//       }

//       cb(null, true);
//     } catch (error) {
//       return cb(new Error("Error processing file"));
//     }
//   },
// });

// var imagekit = new ImageKit({
//   publicKey: "public_xq1sEkV2QjbvRD1jNCxRLClYzgM=",
//   privateKey: "private_1tgoUN84u8TC2YZY4s/QPXUZNtA=",
//   urlEndpoint: "https://ik.imagekit.io/eaaq3vb8d",
// });
// const filePath = path.join(__dirname, "../uploads/", "my_file_name.jpg"); // Replace with your actual file name
// // Read the file from the uploads folder
// fs.readFile(filePath, (err, fileBuffer) => {
//   if (err) {
//     return console.error("Error reading the file:", err);
//   }
//   imagekit
//     .upload({
//       // file: fileBuffer // File content to upload
//       //   ? fileName
//       //   : "my_file_name.jpg", // Desired file name
//       file: fileBuffer, // File content (Buffer)
//       fileName: __filename,
//       // extensions: [
//       //   {
//       //     name: "google-auto-tagging",
//       //     maxTags: 5,
//       //     minConfidence: 95,
//       //   },
//       //   {
//       //     name: "remove-bg",
//       //     options: {
//       //       add_shadow: true,
//       //       bg_color: "green",
//       //     },
//       //   },
//       // ],
//       transformation: {
//         pre: "l-text,i-Imagekit,fs-50,l-end",
//         post: [
//           // {
//           //   // type: "abs",
//           //   value: "sr-240_360_480_720_1080",
//           //   // protocol: "dash",
//           // },
//           {
//             type: "transformation",
//             value: "h-3000",
//           },
//         ],
//       },
//     })
//     .then((response) => {
//       console.log(response);
//     })
//     .catch((error) => {
//       console.log(error);
//     });
// });

const router = Router();
router.post(
  "/singUp",
  upload.single("file"),
  validators.signupValidator,
  singUp
);
router.post("/login", validators.loginValidator, login);
router.post("/logout", requireAuthentication, logout);
router.post("/master-logout", requireAuthentication, logoutAllDevices);
router.post("/reauth", refreshAccess);
router.post("/forgotpass", validators.forgotPasswordValidator, forgotPassword);
router.patch(
  "/resetpass/:resetToken",
  validators.resetPasswordValidator,
  resetPassword
);
router.get("/me", requireAuthentication, fetchAuthUserProfile);
router.get("/allusers", requireAuthentication, fetchAllProfiles);

// router.get(
//   "/:id",
//   requireAuthentication,
//   validators.fetchUserProfileValidator,
//   fetchUserProfile
// );

// router.get("/protected-route", authCheck, (req, res) => {
//   res
//     .status(200)
//     .json({ message: "This is a protected route", user: req.user });
// });

// router.get("/user", (req, res) => {
//   console.log("Received a GET request to /user");
//   res.send("GET request received");
// });

export default router;
