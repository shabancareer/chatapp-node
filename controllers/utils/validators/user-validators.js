import { param } from "express-validator";

export const fetchUserProfileValidator = [
  param("id").notEmpty().withMessage("User id missing"),
];
