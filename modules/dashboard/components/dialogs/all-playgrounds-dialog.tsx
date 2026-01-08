"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Code2,
  Compass,
  Database,
  FlameIcon,
  Lightbulb,
  Terminal,
  Zap,
  type LucideIcon,
  Search,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Input } from "@/components/ui/input";

// Duplicate interface to avoid circular dependency if not in types file
// In a real refactor, move this to modules/dashboard/types.ts
interface PlaygroundData {
  id: string;
  name: string;
  icon: string;
  starred: boolean;
}

const lucideIconMap: Record<string, LucideIcon> = {
  Zap: Zap,
  Lightbulb: Lightbulb,
  Database: Database,
  Compass: Compass,
  FlameIcon: FlameIcon,
  Terminal: Terminal,
  Code2: Code2,
};

interface AllPlaygroundsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  playgrounds: PlaygroundData[];
}

export function AllPlaygroundsDialog({
  open,
  onOpenChange,
  playgrounds,
}: AllPlaygroundsDialogProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredPlaygrounds = playgrounds.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>All Playgrounds</DialogTitle>
          <DialogDescription>
            Browse and search through all your playgrounds.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center border rounded-md px-3 py-2 mt-2">
           <Search className="h-4 w-4 text-muted-foreground mr-2"/>
           <Input 
             placeholder="Search playgrounds..." 
             className="border-none shadow-none focus-visible:ring-0 p-0 h-auto"
             value={searchQuery}
             onChange={(e) => setSearchQuery(e.target.value)}
           />
        </div>

        <ScrollArea className="h-[300px] mt-4 pr-4">
          <div className="grid grid-cols-1 gap-2">
            {filteredPlaygrounds.length === 0 ? (
               <div className="text-center text-sm text-muted-foreground py-8">
                 No playgrounds found.
               </div>
            ) : (
                filteredPlaygrounds.map((playground) => {
                const IconComponent = lucideIconMap[playground.icon] || Code2;
                return (
                    <Link
                    key={playground.id}
                    href={`/playground/${playground.id}`}
                    onClick={() => onOpenChange(false)}
                    className="flex items-center gap-3 p-3 rounded-md hover:bg-muted transition-colors border border-transparent hover:border-border"
                    >
                    <div className="flex h-9 w-9 items-center justify-center rounded-md border bg-background">
                        <IconComponent className="h-5 w-5 text-foreground" />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-medium text-sm">{playground.name}</span>
                        <span className="text-xs text-muted-foreground truncate">
                        ID: {playground.id}
                        </span>
                    </div>
                    </Link>
                );
                })
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
