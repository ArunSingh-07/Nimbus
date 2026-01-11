"use server";

import { headers } from "next/headers";
import { db } from "@/lib/db";
import { auth } from "@/auth";

/* -------------------------------
   Types
--------------------------------*/
export interface ClientTelemetry {
  screenResolution?: string;
  language?: string;
  timezone?: string;
  platform?: string;
}

/* -------------------------------
   Simple UA Parsing (No deps)
--------------------------------*/
function parseUserAgent(ua: string | null) {
  if (!ua) {
    return {
      browser: "Unknown",
      os: "Unknown",
      deviceType: "Unknown",
    };
  }

  const uaLower = ua.toLowerCase();

  const isMobile = /mobile|iphone|android/.test(uaLower);
  const isTablet = /ipad|tablet/.test(uaLower);

  let browser = "Unknown";
  if (uaLower.includes("chrome")) browser = "Chrome";
  else if (uaLower.includes("firefox")) browser = "Firefox";
  else if (uaLower.includes("safari")) browser = "Safari";
  else if (uaLower.includes("edge")) browser = "Edge";

  let os = "Unknown";
  if (uaLower.includes("windows")) os = "Windows";
  else if (uaLower.includes("mac os")) os = "macOS";
  else if (uaLower.includes("linux")) os = "Linux";
  else if (uaLower.includes("android")) os = "Android";
  else if (uaLower.includes("ios")) os = "iOS";

  return {
    browser,
    os,
    deviceType: isTablet ? "Tablet" : isMobile ? "Mobile" : "Desktop",
  };
}

/* -------------------------------
   Server Action
--------------------------------*/
export async function trackLogin(clientData: ClientTelemetry) {
  const session = await auth();
  const user = session?.user;

  if (!user || !user.id) return;

  const headersList = await headers();

  const forwardedFor = headersList.get("x-forwarded-for");
  const ipAddress = forwardedFor?.split(",")[0]?.trim() ?? "unknown";

  const userAgent = headersList.get("user-agent");
  const parsedUA = parseUserAgent(userAgent);

  await db.loginHistory.create({
    data: {
      userId: user.id,
      ipAddress,
      userAgent,
      browser: parsedUA.browser,
      os: parsedUA.os,
      deviceType: parsedUA.deviceType,
      screenResolution: clientData.screenResolution ?? "unknown",
      language: clientData.language,
      timezone: clientData.timezone,
      platform: clientData.platform,
    },
  });
}
