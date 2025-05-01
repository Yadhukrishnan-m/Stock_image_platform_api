import jwt from "jsonwebtoken";
import ms from "ms";

// Generate Access Token
export const generateAccessToken = (_id: string): string => {
  const expiry = process.env.ACCESS_TOKEN_EXPIRY;
  console.log(expiry);

  return jwt.sign({ _id }, process.env.ACCESS_TOKEN_SECRET as string, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRY as ms.StringValue,
  });
};

// Generate Refresh Token
export const generateRefreshToken = (_id: string): string => {
  return jwt.sign({ _id }, process.env.REFRESH_TOKEN_SECRET as string, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRY as ms.StringValue,
  });
};

// Verify Token
export const verifyToken = (token: string, type: "access" | "refresh"): any => {
  try {
    const secret =
      type === "access"
        ? process.env.ACCESS_TOKEN_SECRET
        : process.env.REFRESH_TOKEN_SECRET;
    return jwt.verify(token, secret as string);
  } catch (error) {
    return null;
  }
};
