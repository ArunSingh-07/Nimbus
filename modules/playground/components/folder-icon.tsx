import { SiGithub, SiNodedotjs, SiCypress, SiStorybook } from "react-icons/si";
import { Folder, FolderOpen } from "lucide-react";

interface FolderIconProps {
  folderName: string;
  className?: string;
  isOpen?: boolean;
  colored?: boolean;
}

/* =========================
   VS Code Material Theme
   (Ocean / Palenight)
   ========================= */

const COLORS = {
  // brand / tooling
  github: "#C792EA",
  node: "#7BE495",
  cypress: "#89DDFF",
  storybook: "#FF5370",

  // core frontend
  src: "#82AAFF",
  components: "#89DDFF",
  pages: "#82AAFF",
  app: "#7BE495",
  layouts: "#C792EA",
  views: "#89DDFF",
  screens: "#89DDFF",

  // backend
  api: "#FF5370",
  server: "#F78C6C",
  backend: "#F78C6C",
  controllers: "#FF5370",
  routes: "#FF5370",
  services: "#7BE495",
  middlewares: "#C792EA",

  // assets / styling
  public: "#FFCB6B",
  assets: "#FFCB6B",
  images: "#FFCB6B",
  styles: "#82AAFF",
  themes: "#C792EA",
  fonts: "#F78C6C",

  // utilities
  utils: "#F78C6C",
  types: "#82AAFF",
  hooks: "#C792EA",
  i18n: "#7BE495",

  // tooling / config
  config: "#FFCB6B",
  vscode: "#82AAFF",
  husky: "#7BE495",
  scripts: "#89DDFF",

  // build output
  dist: "#FFCB6B",
};

export function FolderIcon({ folderName, className, isOpen, colored = true }: FolderIconProps) {
  const name = folderName.toLowerCase();
  const Icon = isOpen ? FolderOpen : Folder;

  const baseClass =
    "transition-colors duration-200 ease-out group-hover:brightness-110";

  const style = (color: string) =>
    colored
      ? ({
          "--icon-color": color,
          color: color, // Also setting color directly as fallback/primary if --icon-color isn't used globally
        } as React.CSSProperties)
      : {};

  /* =========================
     Brand folders
     ========================= */

  if (name === ".github" || name === ".git")
    return (
      <SiGithub
        className={`${className} ${baseClass}`}
        style={style(COLORS.github)}
      />
    );

  if (name === "node_modules")
    return (
      <SiNodedotjs
        className={`${className} ${baseClass}`}
        style={style(COLORS.node)}
      />
    );

  if (name === "cypress")
    return (
      <SiCypress
        className={`${className} ${baseClass}`}
        style={style(COLORS.cypress)}
      />
    );

  if (name === ".storybook" || name === "storybook")
    return (
      <SiStorybook
        className={`${className} ${baseClass}`}
        style={style(COLORS.storybook)}
      />
    );

  /* =========================
     Frontend structure
     ========================= */

  if (["src", "source"].includes(name))
    return (
      <Icon className={`${className} ${baseClass}`} style={style(COLORS.src)} />
    );

  if (name === "components")
    return (
      <Icon
        className={`${className} ${baseClass}`}
        style={style(COLORS.components)}
      />
    );

  if (["pages", "views", "screens"].includes(name))
    return (
      <Icon
        className={`${className} ${baseClass}`}
        style={style(COLORS.pages)}
      />
    );

  if (name === "app")
    return (
      <Icon className={`${className} ${baseClass}`} style={style(COLORS.app)} />
    );

  if (name === "layouts")
    return (
      <Icon
        className={`${className} ${baseClass}`}
        style={style(COLORS.layouts)}
      />
    );

  /* =========================
     Backend
     ========================= */

  if (["api", "server", "backend"].includes(name))
    return (
      <Icon
        className={`${className} ${baseClass}`}
        style={style(COLORS.server)}
      />
    );

  if (["controllers", "routes"].includes(name))
    return (
      <Icon
        className={`${className} ${baseClass}`}
        style={style(COLORS.controllers)}
      />
    );

  if (name === "services")
    return (
      <Icon
        className={`${className} ${baseClass}`}
        style={style(COLORS.services)}
      />
    );

  if (["middleware", "middlewares"].includes(name))
    return (
      <Icon
        className={`${className} ${baseClass}`}
        style={style(COLORS.middlewares)}
      />
    );

  /* =========================
     Assets / styling
     ========================= */

  if (["public", "assets", "images"].includes(name))
    return (
      <Icon
        className={`${className} ${baseClass}`}
        style={style(COLORS.public)}
      />
    );

  if (["styles", "themes"].includes(name))
    return (
      <Icon
        className={`${className} ${baseClass}`}
        style={style(COLORS.styles)}
      />
    );

  if (name === "fonts")
    return (
      <Icon
        className={`${className} ${baseClass}`}
        style={style(COLORS.fonts)}
      />
    );

  if (["i18n", "locales"].includes(name))
    return (
      <Icon
        className={`${className} ${baseClass}`}
        style={style(COLORS.i18n)}
      />
    );

  /* =========================
     Tooling / config
     ========================= */

  if (["config", "configs"].includes(name))
    return (
      <Icon
        className={`${className} ${baseClass}`}
        style={style(COLORS.config)}
      />
    );

  if (name === ".vscode")
    return (
      <Icon
        className={`${className} ${baseClass}`}
        style={style(COLORS.vscode)}
      />
    );

  if (name === ".husky")
    return (
      <Icon
        className={`${className} ${baseClass}`}
        style={style(COLORS.husky)}
      />
    );

  if (name === "scripts")
    return (
      <Icon
        className={`${className} ${baseClass}`}
        style={style(COLORS.scripts)}
      />
    );

  /* =========================
     Build output
     ========================= */

  if (["dist", "build", "out"].includes(name))
    return (
      <Icon
        className={`${className} ${baseClass}`}
        style={style(COLORS.dist)}
      />
    );

  /* =========================
     Fallback
     ========================= */

  return <Icon className={`${className} transition-colors duration-200`} />;
}
