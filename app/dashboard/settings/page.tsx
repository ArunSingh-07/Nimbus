import { Metadata } from "next";
import SettingsPageClient from "./settings-page-client";

export const metadata: Metadata = {
  title: "Settings - Nimbus",
};

export default function SettingsPage() {
  return <SettingsPageClient />;
}
