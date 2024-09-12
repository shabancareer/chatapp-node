import { validationResult } from "express-validator";
import CustomError from "./utils/config/errors/CustomError.js";
import prisma from "../DB/db.config.js";

export const fetchUserProfile = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new CustomError(errors.array(), 422, errors.array()[0]?.msg);
    }
    const userId = req.params.id;
    const retrievedUser = await prisma.user.findUnique({
      where: { id: parseInt(userId, 10) },
    });
    if (!retrievedUser) {
      throw new CustomError("User not found", 404);
    }
    res.json({
      success: true,
      user: retrievedUser,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

export const fetchAuthUserProfile = async (req, res, next) => {
  try {
    const userId = req.userId;
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId, 10) },
    });

    if (!user) {
      throw new CustomError("User not found", 404);
    }

    res.json({
      success: true,
      user,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
