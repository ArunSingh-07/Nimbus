import { SidebarProvider } from "@/components/ui/sidebar";
import { getAllPlaygroundForUser } from "@/modules/dashboard/actions";
import { DashboardSidebar } from "@/modules/dashboard/components/dashboard-sidebar";
import React from "react";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const playgroundData = await getAllPlaygroundForUser();

  const technologyIconMap: Record<string, string> = {
    REACT: "Zap",
    NEXTJS: "Lightbuld",
    EXPRESS: "Database",
    VUE: "Compass",
    HONO: "FlameIcon",
    ANGULAR: "Terminal",
  };

  const formattedPlayegroundData = playgroundData?.map((item) => ({
    id: item.id,
    name: item.title,
    // Todo: star
    starred: item.Starmark?.[0]?.isMarked,
    icon: technologyIconMap[item.template] || "Code2",
  }));

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full overflow-hidden">
        {/* DashBoard sidebar */}
        {/* @ts-ignore */}
        <DashboardSidebar initialPlaygroundData={formattedPlayegroundData} />
        <main className="flex-1 ">{children}</main>
      </div>
    </SidebarProvider>
  );
}
