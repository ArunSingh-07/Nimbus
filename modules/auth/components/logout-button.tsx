"use client";
import React from "react";
import { LogoutButtonProps } from "../types";
import { signOut } from "next-auth/react";

const LogoutButton = ({ children }: LogoutButtonProps) => {
  const onLogout = async () => {
    await signOut({ redirect: false });
    window.location.href = "/";
  };
  return (
    <span className="cursor-pointer" onClick={onLogout}>
      {children}
    </span>
  );
};

export default LogoutButton;
