import { useEffect, useState } from "react";
import { readStorage, writeStorage } from "../utils/storage";
import { ThemeContext } from "./contexts";
const key = "parque-isla-san-lucas-theme";
export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    const saved = readStorage(key, "system");
    return ["light", "dark", "system"].includes(saved) ? saved : "system";
  });
  const [systemDark, setSystemDark] = useState(
    () => window.matchMedia("(prefers-color-scheme: dark)").matches,
  );
  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const change = (event) => setSystemDark(event.matches);
    media.addEventListener("change", change);
    return () => media.removeEventListener("change", change);
  }, []);
  useEffect(() => {
    writeStorage(key, theme);
  }, [theme]);
  const isDark = theme === "dark" || (theme === "system" && systemDark);
  return (
    <ThemeContext.Provider value={{ theme, setTheme, isDark }}>
      <div className="theme-root" data-theme={isDark ? "dark" : "light"}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}
