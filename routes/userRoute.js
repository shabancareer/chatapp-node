import { Router } from "express";
import {
  singUp,
  login,
  logout,
  logoutAllDevices,
  refreshAccess,
  forgotPassword,
  resetPassword,
  fetchAllProfiles,
} from "../controllers/userController.js";
import {
  // fetchUserProfile,
  fetchAuthUserProfile,
} from "../controllers/authController.js";

// import { requireAuthentication } from "./controllers/utils/middlewares/authCheck.js";
import { requireAuthentication } from "../controllers/utils/middlewares/authCheck.js";
import validators from "../controllers/utils/validators/index.js";
const router = Router();
router.post("/singUp", validators.signupValidator, singUp);
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
