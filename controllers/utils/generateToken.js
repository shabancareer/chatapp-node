import jwt from "jsonwebtoken";
import prisma from "../../DB/db.config.js";
import crypto from "crypto";

// const RESET_PASSWORD_TOKEN = {
//   expiry: process.env.RESET_PASSWORD_TOKEN_EXPIRY_MINS,
// };
export const generateToken = async (user) => {
  try {
    // console.log("G:-", user);
    if (!user || !user.id) {
      throw new Error("Invalid user object or missing user ID");
    }
    const payload = { _id: user.id, email: user.email };

    const accessToken = jwt.sign(
      payload,
      process.env.AUTH_ACCESS_TOKEN_SECRET,
      { expiresIn: process.env.AUTH_ACCESS_TOKEN_EXPIRY.trim() }
    );

    const refreshToken = jwt.sign(
      payload,
      // process.env.AUTH_REFRESH_TOKEN_SECRET,
      process.env.AUTH_REFRESH_TOKEN_SECRET,
      { expiresIn: process.env.AUTH_REFRESH_TOKEN_EXPIRY.trim() }
    );
    // Set refresh token as a cookie
    //Add one more generateResetToken function here
    return { accessToken, refreshToken };
    // const expiresAt = new Date();
    // expiresAt.setDate(expiresAt.getDate() + 30);
  } catch (err) {
    return Promise.reject(err);
  } finally {
    await prisma.$disconnect();
  }
};
export const refreshAccessToken = async (refreshToken) => {
  try {
    // Verify the provided refresh token
    const decoded = jwt.verify(
      refreshToken,
      process.env.AUTH_REFRESH_TOKEN_SECRET
    );
    // If token is valid, generate a new access token
    const accessToken = jwt.sign(
      { userId: decoded.userId },
      process.env.ACCESS_TOKEN_SECRET,
      // process.env.AUTH_REFRESH_TOKEN_SECRET,
      { expiresIn: process.env.AUTH_ACCESS_TOKEN_EXPIRY.trim() }
    );
    console.log(accessToken);
    return Promise.resolve({ accessToken });
  } catch (err) {
    return Promise.reject(err);
  }
};
export const generateResetToken = async (user) => {
  try {
    const resetTokenValue = crypto.randomBytes(20).toString("base64url");
    const resetTokenSecret = crypto.randomBytes(10).toString("hex");
    const resetToken = `${resetTokenValue}+${resetTokenSecret}`;
    const resetTokenHash = crypto
      .createHmac("sha256", resetTokenSecret)
      .update(resetTokenValue)
      .digest("hex");

    const resetTokenExpiryMins =
      parseInt(process.env.RESET_PASSWORD_TOKEN_EXPIRY_MINS, 10) || 5;
    const resetTokenExpiry = new Date(
      Date.now() + resetTokenExpiryMins * 60 * 1000
    );

    if (isNaN(resetTokenExpiry)) {
      throw new Error("Invalid reset token expiry date");
    }
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetpasswordtoken: resetTokenHash,
        resetpasswordtokenexpiry: resetTokenExpiry,
      },
    });
    return resetToken;
  } catch (error) {
    console.error("Error generating reset token:", error);
    throw new Error("Failed to generate reset token");
  } finally {
    await prisma.$disconnect();
  }
};
