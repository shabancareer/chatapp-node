import { Router } from "express";
import multer from "multer";
import { fileTypeFromFile } from "file-type";
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

// Get the current directory equivalent to __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const upload = multer({
  dest: "uploads/",
  limits: {
    fileSize: Infinity, // Set file size limit as needed (Infinity is not recommended for production)
  },
  fileFilter: async (req, file, cb) => {
    // Get the full path to the uploaded file
    const filePath = path.join("uploads/", file.filename);
    // Read the file to get its buffer
    fs.readFile(filePath, async (err, fileBuffer) => {
      if (err) {
        return cb(new Error("Error reading file"));
      }

      // Use fileTypeFromFile to detect the actual file type
      const fileType = await fileTypeFromFile(filePath);
      if (!fileType) {
        return cb(new Error("Unable to determine file type"));
      }
      // Check if the file is an image (you can also restrict to specific types like 'jpg', 'png', etc.)
      if (!["image/jpeg", "image/png", "image/gif"].includes(fileType.mime)) {
        return cb(
          new Error("Please upload a valid image file (jpeg, png, gif)")
        );
      }

      // If everything is fine, accept the file
      cb(null, true);
    });
  },
  fileFilter: async (req, file, cb) => {
    const filePath = path.join("uploads/", file.filename);
    fs.readFile(filePath, async (err, fileBuffer) => {
      if (err) {
        return cb(new Error("Error reading file"));
      }
      const fileType = await fileTypeFromFile(fileBuffer);
      if (
        !fileType ||
        !["image/jpeg", "image/png", "image/gif"].includes(fileType.mime)
      ) {
        // Delete the invalid file
        fs.unlink(filePath, (unlinkErr) => {
          if (unlinkErr) {
            console.error("Error deleting file:", unlinkErr);
          }
        });
        return cb(
          new Error("Please upload a valid image file (jpeg, png, gif)")
        );
      }
      // If valid, accept the file
      cb(null, true);
    });
  },
});
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
