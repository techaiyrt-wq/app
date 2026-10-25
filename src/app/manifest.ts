import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Nexo — tarefas com IA",
    short_name: "Nexo",
    description:
      "Inbox de tarefas com ChatGPT, Claude e Gemini, sincronizada com o teu dashboard.",
    start_url: "/?source=pwa",
    display: "standalone",
    orientation: "portrait",
    background_color: "#f7f6f2",
    theme_color: "#0b1b26",
    lang: "pt-PT",
    categories: ["productivity", "utilities"],
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      {
        name: "Nova tarefa",
        url: "/?tab=tasks",
        description: "Criar uma tarefa na inbox",
      },
      {
        name: "Perguntar à IA",
        url: "/?tab=ai",
        description: "Conversar com o modelo escolhido",
      },
    ],
  };
}