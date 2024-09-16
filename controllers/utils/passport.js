import passport from "passport";
import prisma from "../../DB/db.config.js";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import dotenv from "dotenv";
dotenv.config();

if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  throw new Error(
    "Google OAuth Client ID and Secret must be set in environment variables."
  );
}
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
        if (userProfile.length === 0) {
          await prisma.user.create({
            data: {
              email: profile["emails"][0].value,
              name: profile["displayName"],
              photo: profile["photos"][0].value,
              googleId: profile.id,
              // verified: true,
            },
          });
        }
        return done(null, userProfile);
        // const user = await prisma.user.findMany({
        //   where: {
        //     email: profile["emails"][0].value,
        //     // googleId: profile.id,
        //   },
        // });
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
