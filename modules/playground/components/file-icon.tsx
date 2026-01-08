import {
  SiTypescript,
  SiJavascript,
  SiReact,
  SiHtml5,
  SiCss3,
  SiJson,
  SiMarkdown,
  SiNodedotjs,
  SiPython,
  SiGo,
  SiRust,
  SiVuedotjs,
  SiSvelte,
  SiAngular,
  SiNextdotjs,
  SiTailwindcss,
  SiSass,
  SiDocker,
  SiGit,
  SiYaml,
} from "react-icons/si";
import { File } from "lucide-react";

interface FileIconProps {
  filename: string;
  className?: string;
}

/* =========================
   Official brand colors
   ========================= */

const COLORS = {
  typescript: "#3178C6",
  javascript: "#F7DF1E",
  react: "#61DAFB",
  html: "#E34F26",
  css: "#1572B6",
  json: "#FBC02D",
  markdown: "#4A90E2",
  node: "#339933",
  python: "#3776AB",
  go: "#00ADD8",
  rust: "#DEA584",
  vue: "#42B883",
  svelte: "#FF3E00",
  angular: "#DD0031",
  nextjs: "#FFFFFF",
  tailwind: "#38BDF8",
  sass: "#CC6699",
  docker: "#2496ED",
  git: "#F05032",
  yaml: "#FFB300",
};

export function FileIcon({ filename, className, colored = true }: FileIconProps & { colored?: boolean }) {
  const name = filename.toLowerCase();
  
  const style = colored ? undefined : { color: undefined };
  const getStyle = (defaultColor: string) => colored ? { color: defaultColor } : undefined;


  /* ===== filename based ===== */

  if (name === "package.json")
    return <SiNodedotjs className={className} style={getStyle(COLORS.node)} />;

  if (name === "dockerfile")
    return <SiDocker className={className} style={getStyle(COLORS.docker)} />;

  /* ===== extension based ===== */

  if (name.endsWith(".ts"))
    return (
      <SiTypescript
        className={className}
        style={getStyle(COLORS.typescript)}
      />
    );

  if (name.endsWith(".tsx") || name.endsWith(".jsx"))
    return <SiReact className={className} style={getStyle(COLORS.react)} />;

  if (name.endsWith(".js"))
    return (
      <SiJavascript
        className={className}
        style={getStyle(COLORS.javascript)}
      />
    );

  if (name.endsWith(".html"))
    return <SiHtml5 className={className} style={getStyle(COLORS.html)} />;

  if (name.endsWith(".css"))
    return <SiCss3 className={className} style={getStyle(COLORS.css)} />;

  if (name.endsWith(".scss") || name.endsWith(".sass"))
    return <SiSass className={className} style={getStyle(COLORS.sass)} />;

  if (name.endsWith(".json"))
    return <SiJson className={className} style={getStyle(COLORS.json)} />;

  if (name.endsWith(".md"))
    return (
      <SiMarkdown className={className} style={getStyle(COLORS.markdown)} />
    );

  if (name.endsWith(".vue"))
    return <SiVuedotjs className={className} style={getStyle(COLORS.vue)} />;

  if (name.endsWith(".svelte"))
    return <SiSvelte className={className} style={getStyle(COLORS.svelte)} />;

  if (name.endsWith(".py"))
    return <SiPython className={className} style={getStyle(COLORS.python)} />;

  if (name.endsWith(".go"))
    return <SiGo className={className} style={getStyle(COLORS.go)} />;

  if (name.endsWith(".rs"))
    return <SiRust className={className} style={getStyle(COLORS.rust)} />;

  if (name.endsWith(".yml") || name.endsWith(".yaml"))
    return <SiYaml className={className} style={getStyle(COLORS.yaml)} />;

  /* ===== fallback ===== */

  return <File className={className} />;
}
