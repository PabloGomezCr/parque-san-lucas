import { useContext } from "react";
import { ThemeContext } from "../context/contexts";
export function useTheme() {
  return useContext(ThemeContext);
}
