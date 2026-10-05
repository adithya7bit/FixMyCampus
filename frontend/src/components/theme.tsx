import { cn } from "@/utils/cn";
import { Moon, Sun, Type } from "lucide-react";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type Theme = "light" | "dark";
type TextSize = "md" | "lg" | "xl";

const Ctx = createContext<{
  theme: Theme;
  toggle: () => void;
  textSize: TextSize;
  setTextSize: (s: TextSize) => void;
} | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem("fmc-theme") as Theme) || "light");
  const [textSize, setTextSize] = useState<TextSize>(
    () => (localStorage.getItem("fmc-text") as TextSize) || "md",
  );

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("fmc-theme", theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.classList.remove("text-md", "text-lg", "text-xl");
    document.documentElement.classList.add(`text-${textSize}`);
    localStorage.setItem("fmc-text", textSize);
  }, [textSize]);

  return (
    <Ctx.Provider
      value={{
        theme,
        toggle: () => setTheme((t) => (t === "light" ? "dark" : "light")),
        textSize,
        setTextSize,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useTheme() {
  const c = useContext(Ctx);
  if (!c) throw new Error("theme");
  return c;
}

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggle } = useTheme();
  return (
    <button
      type="button"
      onClick={toggle}
      className={cn(
        "inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800",
        className,
      )}
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
    >
      {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}

export function TextSizeControl() {
  const { textSize, setTextSize } = useTheme();
  return (
    <div className="flex items-center gap-1" role="group" aria-label="Text size">
      <Type className="h-3.5 w-3.5 text-slate-400" />
      {(["md", "lg", "xl"] as TextSize[]).map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => setTextSize(s)}
          className={cn(
            "h-7 rounded-md px-2 text-xs font-semibold",
            textSize === s
              ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
              : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800",
          )}
        >
          {s === "md" ? "A" : s === "lg" ? "A+" : "A++"}
        </button>
      ))}
    </div>
  );
}
