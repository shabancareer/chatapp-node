import jwt from "jsonwebtoken";
import AuthorizationError from "../config/errors/AuthorizationError.js";
import dotenv from "dotenv";
// const AuthorizationError = require("../config/errors/AuthorizationError.js");

dotenv.config();
// Pull in Environment variables
// console.log("ACCESS_TOKEN:=", ACCESS_TOKEN);
export const requireAuthentication = async (req, res, next) => {
  try {
    const authHeader = req.header("Authorization");
    // console.log(authHeader);
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.error(
        "Authorization header is missing or does not start with 'Bearer '"
      );
      throw new AuthorizationError(
        "Authentication Error",
        undefined,
        "You are unauthenticated!",
        {
          error: "invalid_access_token",
          error_description: "unknown authentication scheme",
        }
      );
    }
    const accessTokenParts = authHeader.split(" ");
    const aTkn = accessTokenParts[1];
    const decoded = jwt.verify(aTkn, process.env.AUTH_ACCESS_TOKEN_SECRET);
    // process.env.ACCESS_TOKEN_SECRET,
    // Attach authenticated user and Access Token to request object
    req.userId = decoded._id;
    req.token = aTkn;
    next();
  } catch (err) {
    const expParams = {
      error: "expired_access_token",
      error_description: "access token is expired",
    };
    if (err.name === "TokenExpiredError")
      return next(
        new AuthorizationError(
          "Authentication Error",
          undefined,
          "Token lifetime exceeded!",
          expParams
        )
      );

    next(err);
  }
};
