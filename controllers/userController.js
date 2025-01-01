import prisma from "../DB/db.config.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
// import path from "path";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";
import { body, validationResult } from "express-validator";
import { sendEmail } from "../services/email/sendEmail.js";
import AuthorizationError from "./utils/config/errors/AuthorizationError.js";
import CustomError from "./utils/config/errors/CustomError.js";
import { generateToken, generateResetToken } from "./utils/generateToken.js";
import {
  validateImage,
  uploadToImageKit,
} from "../Image-Verification/fileVerification.js";
// import { upload } from "../routes/userRoute.js";
// import authValidators from "./utils/validators/index.js";
const JWT_SECRET = process.env.JWT_SECRET_EMAIL;
const TOKEN_EXPIRY = process.env.TOKEN_EXPIRY_EMAIL;

const ACCESS_TOKEN = {
  access: process.env.AUTH_ACCESS_TOKEN_SECRET,
  expiresIn: process.env.AUTH_ACCESS_TOKEN_EXPIRY,
};

const REFRESH_TOKEN = {
  refresh: process.env.AUTH_REFRESH_TOKEN_SECRET,
  secret: process.env.AUTH_REFRESH_TOKEN_SECRET,
};
// Setup Mailtrap Transporter
const transporter = nodemailer.createTransport({
  host: process.env.HOST,
  port: process.env.EPORT,
  auth: {
    user: process.env.USER,
    pass: process.env.PASS,
  },
});

export const singUp = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new CustomError(errors.array(), 422, errors.array()[0]?.msg);
    }
    // Check if user already exists in the database
    const existingUser = await prisma.user.findUnique({
      where: { email: req.body.email },
    });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }
    // Validate the uploaded image file
    if (!req.file) {
      return res.status(400).json({ message: "No image uploaded" });
    }
    // console.log(req.file);
    // Image validation using fileTypeFromBuffer
    const isValidImage = await validateImage(req.file);
    if (!isValidImage) {
      return res
        .status(400)
        .json({ message: "Please upload a valid image file" });
    }
    const imageKitResponse = await uploadToImageKit(req.file);
    const imageUrl = imageKitResponse.url;
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const newUser = await prisma.user.create({
      data: {
        name: req.body.name,
        email: req.body.email,
        password: hashedPassword,
        photo: imageUrl, // Store ImageKit URL in the database
        emailVerified: false,
      },
    });
    // Generate a email verification token
    const emailVerificationToken = jwt.sign(
      { userId: newUser.id },
      JWT_SECRET,
      {
        expiresIn: TOKEN_EXPIRY,
      }
    );
    await prisma.tokenEmailVerified.create({
      data: {
        token: emailVerificationToken,
        expiresAt: new Date(Date.now() + 3600000), // 1 hour from now
        // user: { connect: { userId: newUser.id } },
        user: { connect: { id: newUser.id } },
      },
    });
    // Send verification email
    const verificationLink = `http://localhost:3000/verify-email?token=${emailVerificationToken}`;
    await transporter.sendMail({
      from: '"Your Company" <noreply@yourcompany.com>',
      to: newUser.email,
      subject: "Email Verification",
      html: `Please verify your email by clicking on this link: <a href="${verificationLink}">Verify Email</a>`,
    });
    const tokens = await generateToken(newUser, res);
    // console.log("Token:-", token);
    const { accessToken, refreshToken } = tokens;
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      sameSite: "None",
      secure: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
    });
    return res.status(201).json({
      success: true,
      data: newUser,
      accessToken,
      msg: "user registered successfully and Verification email sent. Please check your inbox!...",
      // res.json({ message: "Verification email sent. Please check your inbox." });
    });
  } catch (error) {
    next(error);
    // console.log(error);
  } finally {
    await prisma.$disconnect();
  }
};
export const emailVerification = async (req, res) => {
  const { token } = req.query;
  // console.log("emailVerificationToken:-", token);
  try {
    if (!token) {
      return res
        .status(400)
        .json({ error: "Email Verification Token is required" });
    }
    // Verify the JWT token
    const decodedEmailVerificationToken = jwt.verify(token, JWT_SECRET);
    console.log(decodedEmailVerificationToken);
    // Find the token in the database
    const tokenRecord = await prisma.tokenEmailVerified.findFirst({
      where: { token },
      select: {
        userId: true,
        expiresAt: true,
      },
    });
    // console.log("tokenRecord:-", tokenRecord);
    if (!tokenRecord || tokenRecord.expiresAt < new Date()) {
      return res.status(400).json({ error: "Token is invalid or expired." });
    }

    // Mark the user as verified
    await prisma.user.update({
      where: { id: tokenRecord.userId },
      data: { emailVerified: true },
    });
    // Delete the token record after successful verification
    await prisma.tokenEmailVerified.delete({
      where: { token: token },
    });
    // res.send("Email verified successfully. You can now login.");
    // res.redirect(`http://localhost:5173`);
    res.redirect(`http://localhost:5173?emailVerified=true`);
  } catch (error) {
    console.error(error);
    res.json({
      message: "Email verified successfully.",
      redirectUrl: "/login",
    });
  }
};
export const login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    // console.log(errors);
    if (!errors.isEmpty()) {
      throw new CustomError(errors.array(), 422, errors.array()[0]?.msg);
    }
    const { email, password } = req.body;
    const userLogin = await prisma.user.findUnique({
      where: { email },
    });
    // console.log(userLogin);
    if (!userLogin) {
      throw new Error(
        "E-mail Cannot find user with these credentials. Please singUp first"
      );
    }
    // Check if the email is verified
    if (!userLogin.emailVerified) {
      return res
        .status(403)
        .json({ error: "Please verify your email before logging in." });
    }
    const isMatch = bcrypt.compare(password, userLogin.password);
    // const isMatch = await bcrypt.compare(password, userLogin.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    const userLoginTokens = await generateToken(userLogin, res);
    const { accessToken, refreshToken } = userLoginTokens;
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      sameSite: "None",
      secure: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
    });
    return res.status(201).json({
      success: true,
      data: userLogin,
      accessToken,
      msg: "User login.",
    });
  } catch (error) {
    next(error);
  } finally {
    await prisma.$disconnect();
  }
};
export const googleLogin = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new CustomError(errors.array(), 422, errors.array()[0]?.msg);
    }
    const { email } = req.body;
    const userLogin = await prisma.user.findUnique({
      where: { email },
    });
    if (!userLogin) {
      throw new Error(
        "E-mail Cannot find user with these credentials. Please singUp first"
      );
    }
    // Check if the email is verified
    if (!userLogin.emailVerified) {
      return res
        .status(403)
        .json({ error: "Please verify your email before logging in." });
    }
    const userLoginTokens = await generateToken(userLogin, res);
    const { accessToken, refreshToken } = userLoginTokens;
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      sameSite: "None",
      secure: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
    });
    return res.status(201).json({
      success: true,
      data: userLogin,
      accessToken,
      msg: "User login.",
    });
  } catch (error) {
    next(error);
  } finally {
    await prisma.$disconnect();
  }
};
export const fetchAllProfiles = async (req, res, next) => {
  try {
    const keyword = req.query.search || "";
    const userId = req.userId;
    const users = await prisma.user.findMany({
      where: {
        AND: [
          {
            OR: [
              { name: { contains: keyword, mode: "insensitive" } },
              { email: { contains: keyword, mode: "insensitive" } },
            ],
          },
          { id: { not: userId } }, // Exclude the current user
        ],
      },
    });
    if (users.length === 0) {
      return res
        .status(404)
        .json({ message: "No users found matching the query." });
    }
    res.json(users);
  } catch (error) {
    console.log(error);
    next(error);
  }
};
export const logout = async (req, res, next) => {
  try {
    const userId = req.userId;
    if (!userId) {
      throw new AuthorizationError(
        "Authentication Error",
        undefined,
        "User is not authenticated"
      );
    }
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
    if (!user) {
      throw new CustomError(
        "User Not Found",
        404,
        "Cannot find user with the provided ID"
      );
    }
    const cookies = req.cookies;
    const refreshToken = cookies["refreshToken"];
    if (!refreshToken) {
      throw new AuthorizationError(
        "Token Error",
        undefined,
        "Refresh token is missing"
      );
    }
    res.clearCookie("refreshToken", {
      httpOnly: true,
      sameSite: "None",
      secure: true,
    });

    return res.status(200).json({
      success: true,
      msg: "User Logout...!",
    });
  } catch (error) {
    console.log(error);
    next(error);
  } finally {
    await prisma.$disconnect();
  }
};
export const logoutAllDevices = async (req, res, next) => {
  try {
    const userId = req.userId;
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    const cookies = req.cookies;
    const userRefreshToken = cookies["refreshToken"];
    if (!userRefreshToken) {
      return res.status(400).json({
        success: false,
        message: "No refresh token found",
      });
    }
    res.clearCookie("refreshToken", {
      httpOnly: true,
      sameSite: "None",
      secure: true,
    });
    return res.status(200).json({
      success: true,
      message: "Logged out from all devices",
    });
  } catch (error) {
    next(error);
  } finally {
    await prisma.$disconnect();
  }
};
export const refreshAccess = async (req, res, next) => {
  try {
    const cookies = req.cookies;
    const authHeader = req.header("Authorization");
    if (!cookies.refreshToken) {
      throw new AuthorizationError(
        "Authentication error!",
        "You are unauthenticated",
        {
          realm: "reauth",
          error: "no_rft",
          error_description: "Refresh Token is missing!",
        }
      );
    }
    if (!authHeader?.startsWith("Bearer ")) {
      throw new AuthorizationError(
        "Authentication Error",
        "You are unauthenticated!",
        {
          realm: "reauth",
          error: "invalid_access_token",
          error_description: "access token error",
        }
      );
    }
    const rfTkn = cookies.refreshToken;
    let decodedRefreshTkn;
    try {
      if (!process.env.AUTH_REFRESH_TOKEN_SECRET) {
        throw new Error(
          "Refresh token secret is not set in environment variables!"
        );
      }
      decodedRefreshTkn = jwt.verify(
        rfTkn,
        process.env.AUTH_REFRESH_TOKEN_SECRET
      );
    } catch (error) {
      throw new AuthorizationError(
        "Authentication Error",
        "You are unauthenticated!",
        {
          realm: "reauth",
          error: "invalid_refresh_token",
          error_description: "Invalid refresh token!",
        }
      );
    }

    const userId = decodedRefreshTkn._id;
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new AuthorizationError(
        "Authentication Error",
        "You are unauthenticated!",
        {
          realm: "reauth",
        }
      );
    }
    const tokens = await generateToken(user);
    const newAccessToken = tokens.accessToken;
    const newRefreshToken = tokens.refreshToken;

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      sameSite: "None",
      secure: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
    });

    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      sameSite: "None",
      secure: true,
      maxAge: 15 * 60 * 1000, // 15 minutes in milliseconds
    });
    return res.status(200).json({
      success: true,
      accessToken: newAccessToken,
      msg: "Tokens refreshed successfully.",
    });
  } catch (error) {
    next(error);
  } finally {
    await prisma.$disconnect();
  }
};
export const forgotPassword = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new CustomError(errors.array(), 422, errors.array(), 422);
    }
    const { email } = req.body;
    const user = await prisma.user.findUnique({
      where: { email },
    });
    if (!user) throw new CustomError("Email not sent!.", 404);
    let resetToken = await generateResetToken(user);
    resetToken = encodeURIComponent(resetToken);
    // console.log(resetToken);
    const resetPath =
      req.header("X-reset-base") || "http://localhost:5173/resetpass";
    const origin = req.header("Origin") || "http://localhost:5173/";

    const resetUrl = resetPath
      ? `${resetPath}/${resetToken}`
      : `${origin}/resetpass/${resetToken}`;
    // console.log(resetUrl);
    const message = `
            <h1>You have requested to change your password</h1>
            <p>You are receiving this because someone(hopefully you) has requested to reset password for your account.<br/>
              Please click on the following link, or paste in your browser to complete the password reset.
            </p>
            <p>
              <a href=${resetUrl} clicktracking=off>${resetUrl}</a>
            </p>
            <p>
              <em>
                If you did not request this, you can safely ignore this email and your password will remain unchanged.
              </em>
            </p>
            <p>
            <strong>DO NOT share this link with anyone else!</strong><br />
              <small>
                <em>
                  This password reset link will <strong>expire after ${
                    process.env.RESET_PASSWORD_TOKEN_EXPIRY_MINS || 10
                  } minutes.</strong>
                </em>
              <small/>
            </p>
        `;
    try {
      await sendEmail({
        to: user.email,
        html: message,
        subject: "Reset password",
      });

      res.json({
        message:
          "An email has been sent to your email address. Check your email, and visit the link to reset your password",
        success: true,
      });
    } catch (error) {
      await prisma.user.update({
        where: { email },
        data: { resetpasswordtoken: null, resetpasswordtokenexpiry: null },
      });
      throw new CustomError("Email not sent!...", 500);
    }
  } catch (error) {
    next(error);
  } finally {
    await prisma.$disconnect();
  }
};

export const resetPassword = async (req, res, next) => {
  console.log(req.body);
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new CustomError(errors.array(), 422);
    }
    const resetToken = new String(req.params.resetToken);
    const [tokenValue, tokenSecret] = decodeURIComponent(resetToken).split("+");

    const resetTokenHash = crypto
      .createHmac("sha256", tokenSecret)
      .update(tokenValue)
      .digest("hex");
    const user = await prisma.user.findFirst({
      where: {
        resetpasswordtoken: resetTokenHash,
        resetpasswordtokenexpiry: {
          gt: new Date(),
        },
      },
    });
    if (!user) throw new CustomError("The reset link is invalid", 400);
    const newPassword = req.body.password;
    if (!newPassword || newPassword.length < 4) {
      // Example validation
      throw new CustomError("Password must be at least 4 characters long", 400);
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetpasswordtoken: null,
        resetpasswordtokenexpiry: null,
      },
    });

    // Email to notify owner of the account
    const message = `<h3>This is a confirmation that you have changed Password for your account.</h3>`;
    // No need to await
    await sendEmail({
      to: user.email,
      html: message,
      subject: "Password changed",
    });
    res.json({
      message: "Password reset successful",
      success: true,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
