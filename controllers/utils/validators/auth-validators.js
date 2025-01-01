import { body, param } from "express-validator";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const defaultPhotoURL =
  "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg";

export const signupValidator = [
  body("name").trim().notEmpty().withMessage("Name CANNOT be empty"),
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email CANNOT be empty")
    .bail()
    .isEmail()
    .withMessage("Email is invalid")
    .bail()
    .custom(async (email) => {
      const emailExists = await prisma.user.findUnique({
        where: { email },
      });
      if (emailExists) {
        throw new Error("E-mail already in use");
      }
    }),
  body("password")
    .notEmpty()
    .withMessage("Password CANNOT be empty")
    .bail()
    .isLength({ min: 4 })
    .withMessage("Password MUST be at least 4 characters long"),
  body("photo").custom((value, { req }) => {
    if (!value) {
      req.body.photo = defaultPhotoURL;
    }
    return true;
  }),
];

export const loginValidator = [
  body("email").trim().notEmpty().withMessage("Email CANNOT be empty"),
  // .bail()
  // .isEmail()
  // .withMessage("Email is invalid"),

  body("password").notEmpty().withMessage("Password CANNOT be empty"),
];
export const googleLoginValidator = [
  body("email").trim().notEmpty().withMessage("Email CANNOT be empty"),
  // .bail()
  // .isEmail()
  // .withMessage("Email is invalid"),
  // body("password").notEmpty().withMessage("Password CANNOT be empty"),
];

export const forgotPasswordValidator = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email CANNOT be empty")
    .bail()
    .isEmail()
    .withMessage("Email is invalid"),
];

export const resetPasswordValidator = [
  param("resetToken").notEmpty().withMessage("Reset token missing"),
  body("password")
    .notEmpty()
    .withMessage("Password CANNOT be empty")
    .bail()
    .isLength({ min: 4 })
    .withMessage("Password MUST be at least 4 characters long"),
  body("passwordConfirm")
    .optional()
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Passwords DO NOT match");
      }

      return true;
    }),
];
