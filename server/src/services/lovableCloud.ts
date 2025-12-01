import { config } from "../config";

export const postLovableCloud = async (path: string, payload: Record<string, unknown>) => {
  if (!config.lovableCloudKey) return;
  try {
    await fetch(`${config.lovableCloudEndpoint}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.lovableCloudKey}`
      },
      body: JSON.stringify(payload)
    });
  } catch (error) {
    console.warn("Lovable Cloud unavailable", error);
  }
};
