"use client";

import { useEffect } from "react";
import { signOut, useSession } from "next-auth/react";

export const LogoutSynchronizer = () => {
  const { status } = useSession();

  useEffect(() => {
    // Only set up the listener if the user is authenticated
    if (status !== "authenticated") return;

    const channel = new BroadcastChannel("nimbus-auth");

    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === "LOGOUT") {
        // Force sign out and redirect to home/login
        signOut({ redirect: true, callbackUrl: "/auth/sign-in" });
      }
    };

    channel.addEventListener("message", handleMessage);

    return () => {
      channel.removeEventListener("message", handleMessage);
      channel.close();
    };
  }, [status]);

  return null;
};
