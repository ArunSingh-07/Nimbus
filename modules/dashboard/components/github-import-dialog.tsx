"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Github, Globe, Lock, Search, GitBranch } from "lucide-react";
import { useState, useEffect } from "react";
import Image from "next/image";

interface GithubRepo {
  id: number;
  name: string;
  full_name: string;
  private: boolean;
  html_url: string;
  description: string;
  language: string;
  updated_at: string;
  stars: number;
}

interface GithubImportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { title: string; url: string }) => void;
}

const GithubImportDialog = ({
  isOpen,
  onClose,
  onSubmit,
}: GithubImportDialogProps) => {
  const [activeTab, setActiveTab] = useState("public");
  const [publicUrl, setPublicUrl] = useState("");
  const [myRepos, setMyRepos] = useState<GithubRepo[]>([]);
  const [isLoadingRepos, setIsLoadingRepos] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRepo, setSelectedRepo] = useState<GithubRepo | null>(null);

  useEffect(() => {
    if (isOpen && activeTab === "personal" && myRepos.length === 0) {
      fetchRepos();
    }
  }, [isOpen, activeTab]);

  const fetchRepos = async () => {
    setIsLoadingRepos(true);
    try {
      const res = await fetch("/api/github/repos");
      if (res.ok) {
        const data = await res.json();
        setMyRepos(data);
      } else {
        console.error("Failed to fetch repos");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoadingRepos(false);
    }
  };

  const handleSubmit = () => {
    if (activeTab === "public" && publicUrl) {
      // Extract name from URL or use a default
      const name = publicUrl.split("/").pop()?.replace(".git", "") || "github-repo";
      onSubmit({ title: name, url: publicUrl });
      onClose();
    } else if (activeTab === "personal" && selectedRepo) {
      onSubmit({ title: selectedRepo.name, url: selectedRepo.html_url });
      onClose();
    }
  };

  const filteredRepos = myRepos.filter((repo) =>
    repo.full_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl font-bold">
            <Github className="h-6 w-6" />
            Import from GitHub
          </DialogTitle>
          <DialogDescription>
            Import a public repository or one of your own repositories.
          </DialogDescription>
        </DialogHeader>

        <Tabs
          defaultValue="public"
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full mt-4"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="public">Public Repository</TabsTrigger>
            <TabsTrigger value="personal">My Repositories</TabsTrigger>
          </TabsList>

          <TabsContent value="public" className="py-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="repo-url">Repository URL</Label>
              <Input
                id="repo-url"
                placeholder="https://github.com/username/repo"
                value={publicUrl}
                onChange={(e) => setPublicUrl(e.target.value)}
              />
              <p className="text-sm text-muted-foreground">
                Enter the full URL of the public repository you want to import.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="personal" className="py-4 space-y-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search your repositories..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="h-[300px] overflow-y-auto border rounded-md p-2 space-y-2">
              {isLoadingRepos ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : filteredRepos.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No repositories found.
                  {/* Suggest connecting GitHub if likely not connected */}
                </div>
              ) : (
                filteredRepos.map((repo) => (
                  <div
                    key={repo.id}
                    className={`flex items-start justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedRepo?.id === repo.id
                        ? "bg-accent border-primary"
                        : "hover:bg-muted"
                    }`}
                    onClick={() => setSelectedRepo(repo)}
                  >
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 font-medium">
                        {repo.private ? (
                          <Lock className="h-3 w-3 text-muted-foreground" />
                        ) : (
                          <Globe className="h-3 w-3 text-muted-foreground" />
                        )}
                        {repo.full_name}
                      </div>
                      <div className="text-xs text-muted-foreground line-clamp-1">
                        {repo.description || "No description"}
                      </div>
                      {repo.language && (
                         <div className="flex items-center gap-1 mt-1">
                            <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                            <span className="text-xs text-muted-foreground">{repo.language}</span>
                         </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-3 mt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={
              (activeTab === "public" && !publicUrl) ||
              (activeTab === "personal" && !selectedRepo)
            }
          >
            Import Repository
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GithubImportDialog;
