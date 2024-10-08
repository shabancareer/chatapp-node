import passport from "passport";
import prisma from "../../DB/db.config.js";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import axios from "axios";
import path from "path";
import fs from "fs";
// import { generateToken } from "./generateToken.js";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import dotenv from "dotenv";
import { imagekit } from "../../Image-Verification/fileverification.js";
dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET_EMAIL;
const TOKEN_EXPIRY = process.env.TOKEN_EXPIRY_EMAIL;
if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  throw new Error(
    "Google OAuth Client ID and Secret must be set in environment variables."
  );
}
// Setup Mailtrap Transporter
const transporter = nodemailer.createTransport({
  host: process.env.HOST,
  port: process.env.EPORT,
  auth: {
    user: process.env.USER,
    pass: process.env.PASS,
  },
});
const downloadImage = async (url, filename) => {
  if (!filename) {
    throw new Error("Filename is required for downloading the image.");
  }
  const filePath = path.join(process.cwd(), "uploads", filename);
  const writer = fs.createWriteStream(filePath);

  const response = await axios({
    url,
    method: "GET",
    responseType: "stream",
  });

  response.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on("finish", () => resolve(filePath));
    writer.on("error", reject);
  });
};
// Function to upload the downloaded image to ImageKit
const uploadToImageKit = async (filePath, fileName) => {
  if (!filePath) {
    throw new Error("File path is required for uploading to ImageKit.");
  }

  const fileBuffer = fs.readFileSync(filePath);
  const result = await imagekit.upload({
    file: fileBuffer,
    fileName: fileName,
  });
  return result.url; // Return the ImageKit URL
};
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID, // google client id
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:3000/auth/google/callback",
      // callbackURL: "http://myapp.localhost:3000/auth/google/callback",
      // passReqToCallback: true,
      //   accessToken: process.env.accessToken,
    },
    async function (request, accessToken, refreshToken, profile, done) {
      try {
        const userProfile = await prisma.user.findMany({
          where: {
            email: profile["emails"][0].value,
            // googleId: profile.id,
          },
        });
        let newUser;
        if (userProfile.length === 0) {
          const filename = `google_${profile.id}.jpg`;
          const filePath = await downloadImage(
            profile["photos"][0].value,
            filename
          );
          // Upload the image to ImageKit
          const imageKitUrl = await uploadToImageKit(filePath, filename);
          console.log("imageKitUrl:=", imageKitUrl);
          newUser = await prisma.user.create({
            data: {
              email: profile["emails"][0].value,
              name: profile["displayName"],
              // photo: profile["photos"][0].value,
              photo: imageKitUrl, // Save the ImageKit URL in the database
              googleId: profile.id,
              emailVerified: false,
              // verified: true,
            },
          });
          // Cleanup: Optionally, delete the local file after uploading to ImageKit
          fs.unlinkSync(filePath);
          // let userPhoto = newUser.photo;
          // console.log("GUser:=", userPhoto);
          // https://lh3.googleusercontent.com/a/ACg8ocLrm5tEh66s9kDmWA7P9DRbVSCiVdUx0MJuCoDK0FqSdJzPuuo=s96-c
          // const vImg = await validateImage(newUser.photo);
          // console.log(vImg);
          // const imageKitResponse = await uploadToImageKit(newUser.photo);
          // console.log("Google Photo:=", imageKitResponse);
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
              user: { connect: { id: newUser.id } },
              // user: { connect: { id: userProfile.id } },
              // user: { connect: { email: profile["emails"][0].value } },
            },
          });
          const verificationLink = `http://localhost:3000/verify-email?token=${emailVerificationToken}`;
          await transporter.sendMail({
            from: '"Your Company" <noreply@yourcompany.com>',
            to: profile["emails"][0].value,
            subject: "Email Verification",
            html: `Please verify your email by clicking on this link: <a href="${verificationLink}">Verify Email</a>`,
          });
          // console.log("verificationLink:-", verificationLink);
        } else {
          newUser = userProfile[0];
        }
        return done(null, newUser);
      } catch (error) {
        console.error("Error during user processing:", error); // Log the error for debugging
        return done(error);
      }
    }
  )
);
passport.serializeUser(function (user, done) {
  done(null, user);
});
passport.deserializeUser(function (user, done) {
  done(null, user);
});
export default passport;
