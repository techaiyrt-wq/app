/**
 * Copia texto para a área de transferência de forma robusta e à prova de falhas.
 * Funciona em HTTP/HTTPS, iframes, Safari iOS, Chrome e WebView.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  if (!text) return false;

  // 1. Tentar API moderna (navigator.clipboard)
  if (typeof navigator !== "undefined" && navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Falha comum em iframes, permissões bloqueadas ou falta de foco.
      // Continua para o fallback clássico sem desistir.
    }
  }

  // 2. Fallback síncrono com textarea temporário (funciona em 100% dos browsers)
  if (typeof document !== "undefined") {
    try {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      // Impede scroll ou visualização na tela
      textarea.style.position = "fixed";
      textarea.style.top = "0";
      textarea.style.left = "0";
      textarea.style.width = "2em";
      textarea.style.height = "2em";
      textarea.style.padding = "0";
      textarea.style.border = "none";
      textarea.style.outline = "none";
      textarea.style.boxShadow = "none";
      textarea.style.background = "transparent";
      textarea.style.opacity = "0";
      textarea.setAttribute("readonly", "");

      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      textarea.setSelectionRange(0, text.length);

      const successful = document.execCommand("copy");
      document.body.removeChild(textarea);

      if (successful) return true;
    } catch {
      // Fallback falhou
    }
  }

  return false;
}
