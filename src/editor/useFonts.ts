/**
 * useFonts — Carrega fontes do Google Fonts dinamicamente no DOM.
 * Nenhuma API key necessária. Usa a CDN pública do Google Fonts v2.
 */
import { useEffect, useCallback } from "react";

const GOOGLE_FONTS_URL = "https://fonts.googleapis.com/css2?";

// Mapa de variantes disponíveis para as fontes mais usadas em rótulos
const FONT_VARIANTS: Record<string, string[]> = {
  "Bebas Neue":        ["400"],
  "Montserrat":        ["300","400","500","600","700","800","900"],
  "Inter":             ["300","400","500","600","700","800","900"],
  "Roboto":            ["300","400","500","700","900"],
  "Oswald":            ["300","400","500","600","700"],
  "Raleway":           ["300","400","500","600","700","800","900"],
  "Barlow Condensed":  ["300","400","500","600","700","800","900"],
  "Exo 2":             ["300","400","500","600","700","800","900"],
  "Orbitron":          ["400","500","600","700","800","900"],
  "Playfair Display":  ["400","500","600","700","800","900"],
  "Plus Jakarta Sans": ["300","400","500","600","700","800"],
  "Poppins":           ["300","400","500","600","700","800","900"],
  "Nunito":            ["300","400","500","600","700","800","900"],
  "Source Sans 3":     ["300","400","500","600","700","900"],
  "Lato":              ["300","400","700","900"],
  "Open Sans":         ["300","400","500","600","700","800"],
  "Ubuntu":            ["300","400","500","700"],
  "Titillium Web":     ["300","400","600","700","900"],
  "Russo One":         ["400"],
  "Black Han Sans":    ["400"],
  "Anton":             ["400"],
  "Abril Fatface":     ["400"],
  "Josefin Sans":      ["100","300","400","600","700"],
  "Kanit":             ["300","400","500","600","700","800","900"],
  "Noto Sans":         ["300","400","500","600","700","800","900"],
};

const loaded = new Set<string>();

/** Load a single Google Font into the document */
export function loadFont(family: string): void {
  if (loaded.has(family)) return;
  const variants = FONT_VARIANTS[family] ?? ["400","700"];
  const param = `family=${encodeURIComponent(family)}:wght@${variants.join(";")}`;
  const url = GOOGLE_FONTS_URL + param + "&display=swap";
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = url;
  document.head.appendChild(link);
  loaded.add(family);
}

/** React hook: pre-load a list of fonts on mount */
export function useFonts(families: string[]) {
  useEffect(() => {
    families.forEach(loadFont);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [families.join(",")]);
}

/** Hook: returns a function to load a font on demand */
export function useLoadFont() {
  return useCallback((family: string) => loadFont(family), []);
}

/** All font families available for the editor */
export const ALL_GOOGLE_FONTS = Object.keys(FONT_VARIANTS);

export default useFonts;
