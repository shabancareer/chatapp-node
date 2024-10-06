import { Router } from "express";
import multer from "multer";
import { fileTypeFromBuffer, fileTypeFromFile } from "file-type";
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

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const upload = multer({
  dest: "uploads/",
  limits: {
    fileSize: 2 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    cb(null, true);
  },
}).single("file");
// }).single("image");

// // Assuming Multer saved the file and you have access to req.file
// const filePath = path.join(__dirname, "../uploads/");
// console.log("File path:", filePath);
// const fileBuffer = fs.readFileSync(filePath);
// imagekit
//   .upload({
//     // file: fileBuffer // File content to upload
//     //   ? fileName
//     //   : "my_file_name.jpg", // Desired file name
//     file: fileBuffer, // File content (Buffer)
//     fileName: __filename,
//     extensions: [
//       {
//         name: "google-auto-tagging",
//         maxTags: 5,
//         minConfidence: 95,
//       },
//     ],
//     transformation: {
//       pre: "l-text,i-Imagekit,fs-50,l-end",
//       post: [
//         {
//           type: "transformation",
//           value: "h-3000",
//         },
//       ],
//     },
//   })
//   .then((response) => {
//     console.log(response);
//   })
//   .catch((error) => {
//     console.log(error);
//   });

const router = Router();
router.post("/singUp", upload, validators.signupValidator, singUp);
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
