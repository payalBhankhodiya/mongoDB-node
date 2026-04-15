import jwt from "jsonwebtoken";

export const verifyToken = (token) => {
  if (!token) throw new Error("No token");

  return jwt.verify(token, process.env.JWT_SECRET);
};
