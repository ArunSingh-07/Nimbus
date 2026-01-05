import { SidebarProvider } from "@/components/ui/sidebar";
import { ModelProvider } from "@/components/model-context";
import React from "react";

export default function PlaygroundLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <ModelProvider>{children}</ModelProvider>
    </SidebarProvider>
  );
}
