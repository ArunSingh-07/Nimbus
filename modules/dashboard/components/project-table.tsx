"use client";

import Image from "next/image";
import { format } from "date-fns";
import type { Project } from "../types";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";
import { useState } from "react";
import {
  MoreHorizontal,
  Edit3,
  Trash2,
  ExternalLink,
  Copy,
  Download,
  Eye,
  Search,
  Filter,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { MarkedToggleButton } from "./marked-toggle";

interface ProjectTableProps {
  projects: Project[];
  onUpdateProject?: (
    id: string,
    data: { title: string; description: string }
  ) => Promise<void>;
  onDeleteProject?: (id: string) => Promise<void>;
  onDuplicateProject?: (id: string) => Promise<void>;
  onMarkasFavorite?: (id: string) => Promise<void>;
}

interface EditProjectData {
  title: string;
  description: string;
}

export default function ProjectTable({
  projects,
  onUpdateProject,
  onDeleteProject,
  onDuplicateProject,
  onMarkasFavorite,
}: ProjectTableProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [editData, setEditData] = useState<EditProjectData>({
    title: "",
    description: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [favoutrie, setFavourite] = useState(false);

  const handleEditClick = (project: Project) => {
    setSelectedProject(project);
    setEditData({
      title: project.title,
      description: project.description || "",
    });

    setEditDialogOpen(true);
  };

  const handleDeleteClick = async (project: Project) => {
    setSelectedProject(project);
    setDeleteDialogOpen(true);
  };

  const handleUpdateProject = async () => {
    if (!selectedProject || !onUpdateProject) return;

    setIsLoading(true);

    try {
      await onUpdateProject(selectedProject.id, editData);
      setEditDialogOpen(false);
      toast.success("Project updated successfully");
    } catch (error) {
      toast.error("Failed to update project");
      console.error("Error updating project", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkasFavorite = async (project: Project) => {
    //    Write your logic here
  };

  const handleDeleteProject = async () => {
    if (!selectedProject || !onDeleteProject) return;

    setIsLoading(true);

    try {
      await onDeleteProject(selectedProject.id);
      setDeleteDialogOpen(false);
      toast.success("Project deleted successfully");
    } catch (error) {
      toast.error("Failed to delete project");
      console.error("Error Deleting project", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDuplicateProject = async (project: Project) => {
    if (!onDuplicateProject) return;

    setIsLoading(true);

    try {
      await onDuplicateProject(project.id);
      toast.success("Project duplicated successfully");
    } catch (error) {
      toast.error("Failed to duplicate project");
      console.error("Error duplicating project", error);
    } finally {
      setIsLoading(false);
    }
  };

  const copyProjectUrl = (projectId: string) => {
    const url = `${window.location.origin}/playground${projectId}`;
    navigator.clipboard.writeText(url);
    toast.success("Project url copied!");
  };

  type SortOption = "recent" | "newest" | "oldest" | "title-asc" | "title-desc";

  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState<SortOption>("recent");

  const filteredProjects = projects
    .filter((project) => {
      const query = searchQuery.toLowerCase();
      return (
        project.title.toLowerCase().includes(query) ||
        project.description?.toLowerCase().includes(query)
      );
    })
    .sort((a, b) => {
      switch (sortOption) {
        case "recent":
          return (
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          );
        case "newest":
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );

        case "oldest":
          return (
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );

        case "title-asc":
          return a.title.localeCompare(b.title);
        case "title-desc":
          return b.title.localeCompare(a.title);
        default:
          return 0;
      }
    });

  const handleResetFilters = () => {
    setSearchQuery("");
    setSortOption("recent");
  };
  return (
    <>
      <div className=" rounded-lg overflow-hidden">
        {/* Controls row */}
        <div className="flex items-center justify-between px-4 py-3">
          {/* Left: Search */}
          <Input
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="sm:max-w-xs  "
          />

          {/* Right: Sort + Reset */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <Select
              value={sortOption}
              onValueChange={(value: any) => setSortOption(value)}
            >
              <SelectTrigger className="w-[180px]">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-muted-foreground" />
                  <SelectValue placeholder="Sort by" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Recently Active</SelectItem>
                <SelectItem value="newest">Newest Created</SelectItem>
                <SelectItem value="oldest">Oldest Created</SelectItem>
                <SelectItem value="title-asc">Title (A-Z)</SelectItem>
                <SelectItem value="title-desc">Title (Z-A)</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="ghost"
              onClick={handleResetFilters}
              disabled={!searchQuery && sortOption === "recent"}
            >
              Reset
            </Button>
          </div>
        </div>

        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project</TableHead>
                <TableHead>Template</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>User</TableHead>
                <TableHead className="w-[50px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProjects.length > 0 ? (
                filteredProjects.map((project) => (
                  <TableRow key={project.id}>
                    <TableCell>
                      <Link
                        href={`/playground/${project.id}`}
                        target="_blank"
                        className="font-semibold hover:underline"
                      >
                        {project.title}
                      </Link>
                      <div className="text-sm text-muted-foreground line-clamp-1">
                        {project.description}
                      </div>
                    </TableCell>

                    <TableCell>
                      <Badge variant="outline">{project.template}</Badge>
                    </TableCell>

                    <TableCell>
                      {format(new Date(project.createdAt), "MMM d, yyyy")}
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Image
                          src={project.user.image || "/placeholder.svg"}
                          alt={project.user.name || "User"}
                          width={32}
                          height={32}
                          className="rounded-full"
                        />
                        <span className="text-sm">{project.user.name}</span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <MarkedToggleButton
                              markedForRevision={project.Starmark[0]?.isMarked}
                              id={project.id}
                            />
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleEditClick(project)}
                          >
                            <Edit3 className="mr-2 h-4 w-4" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDuplicateProject(project)}
                          >
                            <Copy className="mr-2 h-4 w-4" /> Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => copyProjectUrl(project.id)}
                          >
                            <Download className="mr-2 h-4 w-4" /> Copy URL
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDeleteClick(project)}
                            className="text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="h-32 text-center text-muted-foreground"
                  >
                    No projects found. Try adjusting your search or sorting.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Edit Project Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
            <DialogDescription>
              Make changes to your project details here. Click save when you're
              done.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Project Title</Label>
              <Input
                id="title"
                value={editData.title}
                onChange={(e) =>
                  setEditData((prev) => ({ ...prev, title: e.target.value }))
                }
                placeholder="Enter project title"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={editData.description}
                onChange={(e) =>
                  setEditData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Enter project description"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setEditDialogOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleUpdateProject}
              disabled={isLoading || !editData.title.trim()}
            >
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Project</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedProject?.title}"? This
              action cannot be undone. All files and data associated with this
              project will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteProject}
              disabled={isLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isLoading ? "Deleting..." : "Delete Project"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
