"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Palette, Type } from "lucide-react";

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  theme: string;
  onThemeChange: (theme: string) => void;


  editorFont: "default" | "cascadia";
  onEditorFontChange: (font: "default" | "cascadia") => void;
}

export function SettingsDialog({
  open,
  onOpenChange,
  theme,
  onThemeChange,

  editorFont,
  onEditorFontChange,
}: SettingsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Playground Settings</DialogTitle>
          <DialogDescription>
            Customize your coding environment preferences.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Editor Theme */}
          <div className="flex items-center justify-between space-x-4">
            <div className="flex items-center space-x-4">
              <Palette className="w-5 h-5 text-muted-foreground" />
              <div className="flex flex-col space-y-1">
                <Label htmlFor="theme">Editor Theme</Label>
                <span className="text-xs text-muted-foreground">
                  Select your preferred color theme
                </span>
              </div>
            </div>

            <Select value={theme} onValueChange={onThemeChange}>
              <SelectTrigger className="w-[180px]" id="theme">
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

          {/* Editor Font */}
          <div className="flex items-center justify-between space-x-4">
            <div className="flex items-center space-x-4">
              <Type className="w-5 h-5 text-muted-foreground" />
              <div className="flex flex-col space-y-1">
                <Label>Editor Font</Label>
                <span className="text-xs text-muted-foreground">
                  Font used in code editor
                </span>
              </div>
            </div>

            <Select
              value={editorFont}
              onValueChange={(v) =>
                onEditorFontChange(v as "default" | "cascadia")
              }
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Default</SelectItem>
                <SelectItem value="cascadia">Cascadia Code</SelectItem>
              </SelectContent>
            </Select>
          </div>


        </div>



      </DialogContent>
    </Dialog>
  );
}
