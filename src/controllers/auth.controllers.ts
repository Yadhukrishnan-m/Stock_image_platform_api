import { IUser, User } from "../models/user.model";
import bcrypt from "bcrypt";
import { NextFunction, Request, Response } from "express";
import { CustomError } from "../utils/customError";
import { MESSAGES } from "../config/constants/messages";
import { STATUS_CODES } from "../config/constants/status-code";
import { generateAccessToken, verifyToken } from "../utils/jwt";
import { generateRefreshToken } from "../utils/jwt";


interface AuthenticatedRequest extends Request {
  userId: string;
}

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { email, phone, password } = req.body;

  // Validate input data
  if (!email || !phone || !password) {
    throw new CustomError(MESSAGES.InvalidInput, 400);
  }
  try {
    const isEmailExists = await User.findOne({ email });
    if (isEmailExists) {
      throw new CustomError(MESSAGES.ALREADY_EXISTS, 400);
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      email,
      phone,
      password: hashedPassword,
    });

    // Save the user
    await user.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { email, password } = req.body;

  try {
    const userData: IUser | null = await User.findOne({ email });
    if (!userData) {
      throw new CustomError(
        MESSAGES.INVALID_CREDENTIALS,
        STATUS_CODES.UNAUTHORIZED
      );
    }
    if (!userData.password) {
      throw new CustomError(
        MESSAGES.INVALID_CREDENTIALS,
        STATUS_CODES.UNAUTHORIZED
      );
    }

    const isPasswordValid: boolean = await bcrypt.compare(
      password,
      userData.password
    );
    if (!isPasswordValid) {
      throw new CustomError(
        MESSAGES.INVALID_CREDENTIALS,
        STATUS_CODES.UNAUTHORIZED
      );
    }

    const accessToken = generateAccessToken(userData._id as unknown as string);
    const refreshToken = generateRefreshToken(
      userData._id as unknown as string
    );
    res.cookie("RefreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res
      .status(STATUS_CODES.OK)
      .json({ success: true, message: MESSAGES.LOGIN_SUCCESS, accessToken });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { currentPassword, newPassword } = req.body;

  try {
    const { userId } = req as AuthenticatedRequest;

    const userData: IUser | null = await User.findById(userId);
    if (!userData || !userData.password) {
      throw new CustomError(MESSAGES.NOT_FOUND, STATUS_CODES.NOT_FOUND);
    }

    const isPasswordValid: boolean = await bcrypt.compare(
      currentPassword,
      userData.password
    );
    if (!isPasswordValid) {
      throw new CustomError(
        MESSAGES.INVALID_CREDENTIALS,
        STATUS_CODES.UNAUTHORIZED
      );
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const updatedData = {
      password: hashedPassword,
    };

    await User.findByIdAndUpdate(userId, updatedData);

    res
      .status(STATUS_CODES.OK)
      .json({ success: true, message: MESSAGES.PASSWORD_RESET_SUCCESS });
  } catch (error) {
    next(error);
  }
};

export const refreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { currentPassword, newPassword } = req.body;
  const { userId } = req as AuthenticatedRequest;

  try {
    const refreshToken: string = req.cookies.RefreshToken;
    if (!refreshToken) {
      res.status(STATUS_CODES.BAD_REQUEST).json("no refresh token available");
      return;
    }

    const userId = verifyToken(refreshToken, "refresh");
    if (!userId) {
      throw new CustomError("refresh token is not valid", 400);
    }

    const accessToken = generateAccessToken(userId as unknown as string);

    res
      .status(STATUS_CODES.OK)
      .json({ message: "new token created", accessToken: accessToken });
  } catch (error) {
    next(error);
  }
};

export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  

  try {
     res.clearCookie("userRefreshToken", {
       httpOnly: true,
       secure: false,
     });
     res.status(STATUS_CODES.OK).json({
       success: true,
       message: MESSAGES.LOGOUT_SUCCESS,
     });
  } catch (error) {
    next(error);
  }
};


export const getUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
  const { userId } = req as AuthenticatedRequest;

    const user=await User.findById(userId).select("-password -__v")
   
    res.status(STATUS_CODES.OK).json({
      success: true,
      message: MESSAGES.DATA_FETCH_SUCCESS,
      user,
    });
  } catch (error) {
    next(error);
  }
};
