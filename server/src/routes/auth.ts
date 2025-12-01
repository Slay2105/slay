import { Router } from "express";
import { z } from "zod";
import { authenticateUser, registerUser } from "../services/auth";
import { requireAuth, AuthedRequest } from "./middleware";

const router = Router();

const registerSchema = z.object({
  username: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(6)
});

router.post("/register", async (req, res) => {
  try {
    const data = registerSchema.parse(req.body);
    const profile = await registerUser(data);
    res.json({ profile });
  } catch (error: any) {
    res.status(400).json({ message: error.message || "Đăng ký thất bại" });
  }
});

const loginSchema = z.object({
  usernameOrEmail: z.string(),
  password: z.string()
});

router.post("/login", async (req, res) => {
  try {
    const data = loginSchema.parse(req.body);
    const result = await authenticateUser(data);
    if (!result) return res.status(401).json({ message: "Sai thông tin" });
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ message: error.message || "Đăng nhập thất bại" });
  }
});

router.get("/me", requireAuth, (req: AuthedRequest, res) => {
  res.json({ profile: req.user });
});

export default router;
