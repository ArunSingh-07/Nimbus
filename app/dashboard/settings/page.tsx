"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Laptop, Moon, Palette, Sun, Type } from "lucide-react";
import { toast } from "sonner";
import { useTheme } from "next-themes";

export default function SettingsPage() {
  const { setTheme, theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [editorTheme, setEditorTheme] = useState("modern-dark");
  const [editorFont, setEditorFont] = useState<"default" | "cascadia">(
    "default"
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch("/api/user/settings");
        if (res.ok) {
          const data = await res.json();
          if (data.editorTheme) setEditorTheme(data.editorTheme);
          if (data.editorFont) setEditorFont(data.editorFont);
        }
      } catch (error) {
        console.error("Failed to fetch user settings:", error);
      }
    };
    fetchSettings();
  }, []);

  const saveSettings = async (settings: {
    editorTheme?: string;
    editorFont?: string;
  }) => {
    try {
      const res = await fetch("/api/user/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        toast.success("Settings saved");
      } else {
        toast.error("Failed to save settings");
      }
    } catch (error) {
      console.error("Failed to save user settings:", error);
      toast.error("Failed to save settings");
    }
  };

  const handleThemeChange = (theme: string) => {
    setEditorTheme(theme);
    saveSettings({ editorTheme: theme });
  };

  const handleEditorFontChange = (font: "default" | "cascadia") => {
    setEditorFont(font);
    saveSettings({ editorFont: font });
  };

  return (
    <div className="container max-w-4xl px-4 py-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Editor Preferences</CardTitle>
          <CardDescription>
            Customize your coding environment preferences.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Website Theme */}
          <div className="flex items-center justify-between space-x-4">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-muted rounded-full">
                <Laptop className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="flex flex-col space-y-1">
                <Label htmlFor="website-theme" className="text-base">
                  Website Theme
                </Label>
                <span className="text-sm text-muted-foreground">
                  Select the appearance for the dashboard
                </span>
              </div>
            </div>

            {mounted ? (
              <Select value={theme} onValueChange={setTheme}>
                <SelectTrigger className="w-[200px]" id="website-theme">
                  <SelectValue placeholder="Select a theme" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">
                    <div className="flex items-center gap-2">
                      <Sun className="h-4 w-4" />
                      <span>Light</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="dark">
                    <div className="flex items-center gap-2">
                      <Moon className="h-4 w-4" />
                      <span>Dark</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="system">
                    <div className="flex items-center gap-2">
                      <Laptop className="h-4 w-4" />
                      <span>System</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <div className="w-[200px] h-10 border rounded-md bg-muted/10 animate-pulse" />
            )}
          </div>

          <div className="h-[1px] bg-muted w-full" />

          {/* Editor Theme */}
          <div className="flex items-center justify-between space-x-4">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-muted rounded-full">
                <Palette className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="flex flex-col space-y-1">
                <Label htmlFor="theme" className="text-base">
                  Editor Theme
                </Label>
                <span className="text-sm text-muted-foreground">
                  Select your preferred color theme for the code editor
                </span>
              </div>
            </div>

            <Select value={editorTheme} onValueChange={handleThemeChange}>
              <SelectTrigger className="w-[200px]" id="theme">
                <SelectValue placeholder="Select a theme" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="modern-dark">Modern Dark</SelectItem>
                <SelectItem value="one-dark-pro">One Dark Pro</SelectItem>
                <SelectItem value="vs-dark">VS Dark</SelectItem>
                <SelectItem value="vs">Light</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="h-[1px] bg-muted w-full" />

          {/* Editor Font */}
          <div className="flex items-center justify-between space-x-4">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-muted rounded-full">
                <Type className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="flex flex-col space-y-1">
                <Label htmlFor="font" className="text-base">
                  Editor Font
                </Label>
                <span className="text-sm text-muted-foreground">
                  Choose the font family for the code editor
                </span>
              </div>
            </div>

            <Select
              value={editorFont}
              onValueChange={(v) =>
                handleEditorFontChange(v as "default" | "cascadia")
              }
            >
              <SelectTrigger className="w-[200px]" id="font">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Default</SelectItem>
                <SelectItem value="cascadia">Cascadia Code</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
