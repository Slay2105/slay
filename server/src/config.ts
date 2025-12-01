import dotenv from "dotenv";

dotenv.config();

export const config = {
  port: Number(process.env.PORT || 4000),
  jwtSecret: process.env.JWT_SECRET || "dev-secret-key",
  jwtExpiresInHours: Number(process.env.JWT_EXPIRES || 24),
  lovableCloudEndpoint:
    process.env.LOVABLE_CLOUD_ENDPOINT || "https://api.lovable.cloud",
  lovableCloudKey: process.env.LOVABLE_CLOUD_KEY || "",
  allowGuestBots: process.env.ALLOW_BOTS !== "false"
};
