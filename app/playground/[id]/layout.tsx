import { SidebarProvider } from "@/components/ui/sidebar";
import { ModelProvider } from "@/components/model-context";
import React from "react";
import { db } from "@/lib/db";
import { Metadata } from "next";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const project = await db.playground.findUnique({
    where: { id },
    select: { title: true },
  });

  return {
    title: project?.title ? `${project.title} - Nimbus` : "Playground - Nimbus",
  };
}

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
