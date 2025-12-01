import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../services/auth";
import { PlayerProfile } from "../types";

export interface AuthedRequest extends Request {
  user?: PlayerProfile;
}

export const requireAuth = (
  req: AuthedRequest,
  res: Response,
  next: NextFunction
) => {
  const header = req.headers.authorization;
  if (!header) {
    return res.status(401).json({ message: "Missing token" });
  }
  const token = header.replace("Bearer ", "");
  const profile = verifyToken(token);
  if (!profile) {
    return res.status(401).json({ message: "Token không hợp lệ" });
  }
  req.user = profile;
  return next();
};

export const requireAdmin = (
  req: AuthedRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return res.status(401).json({ message: "Chưa đăng nhập" });
  }
  if (!req.user.isAdmin) {
    return res.status(403).json({ message: "Không có quyền admin" });
  }
  return next();
};
