import express from "express";
import dotenv from "dotenv";
import session from "express-session";
// import cookieSession from "cookie-session";
import cookieParser from "cookie-parser";
import { fileURLToPath } from "url";
import path from "path";
import userRoute from "./routes/userRoute.js";
import chatRoute from "./routes/chatRoute.js";
import passport from "./controllers/utils/passport.js";
import CustomError from "./controllers/utils/config/errors/CustomError.js";
import { emailVerification } from "./controllers/userController.js";
import { generateToken } from "./controllers/utils/generateToken.js";

const ACCESS_TOKEN = {
  access: process.env.AUTH_ACCESS_TOKEN_SECRET,
  expiresIn: process.env.AUTH_ACCESS_TOKEN_EXPIRY,
};
dotenv.config();
const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));

app.use(cookieParser());
// Use JSON middleware to parse JSON bodies
app.use(express.json());
// use the session middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET, // session secret
    resave: false,
    saveUninitialized: false,
  })
);
// initialize passport and session
app.use(passport.initialize());
app.use(passport.session());
app.get("/", (req, res) => {
  try {
    res.render("pages/auth");
  } catch (error) {
    console.error("Error rendering page:", error); // Log the error to see what went wrong
    res.status(500).json({ message: "Internal Server Error" });
  }
});
//Home page Route
app.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);
app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/error" }),
  async (req, res) => {
    // Successful authentication, redirect success.
    const tokens = await generateToken(req.user, res);
    const { accessToken, refreshToken } = tokens;
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      sameSite: "None",
      secure: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      sameSite: "None",
      secure: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    // res.redirect(
    //   "/",
    //   "user registered successfully and Verification email sent. Please check your inbox!..."
    // );
    res.send(
      "user registered successfully and Verification email sent. Please check your inbox!..."
    );
  }
);
app.get("/error", (req, res) => res.send("error logging in"));

// app.get("/success", (req, res) => {
//   console.log(req.user);
//   if (req.user && req.user.length > 0) {
//     // Pass user data to the template
//     res.render("pages/success", { user: req.user[0] });
//   } else {
//     res.status(404).send("No user data found");
//   }
// });
app.get("/", (req, res) => {
  res.send("API Running!..");
});
app.use("/api/", userRoute);
app.use("/api/", chatRoute);
app.get("/verify-email", emailVerification);

app.use((err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }
  console.error("Error:=", err);
  const errorMessage = err.message || "Internal Server Error";
  if (err instanceof CustomError) {
    return res
      .status(err.status)
      .json({ message: err.feedback, errors: err.cause });
  }
  return res.status(500).json({ message: errorMessage });
});

// Get the directory name and file name
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 8080;
const url = `http://localhost:${PORT}`;
app.listen(PORT, () => {
  console.log(`Server is running on \x1b[34m${url}\x1b[0m`);
});
