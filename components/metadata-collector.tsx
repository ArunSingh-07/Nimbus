"use client";

import { trackLogin } from "@/modules/auth/actions/telemetry";
import { useEffect } from "react";

const SESSION_KEY = "login_telemetry_sent";

export default function MetadataCollector() {
  useEffect(() => {
    const alreadySent = sessionStorage.getItem(SESSION_KEY);
    if (alreadySent) return;

    const screenResolution = `${window.screen.width}x${window.screen.height}`;
    const language = navigator.language;
    const platform = navigator.platform ?? "unknown";
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    trackLogin({
      screenResolution,
      language,
      platform,
      timezone,
    });

    sessionStorage.setItem(SESSION_KEY, "true");
  }, []);

  return null;
}
