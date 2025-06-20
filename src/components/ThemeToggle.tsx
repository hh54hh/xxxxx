import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(() => {
    // Initialize from localStorage or system preference
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("theme");
      if (savedTheme) {
        return savedTheme === "dark";
      }
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    return false;
  });

  useEffect(() => {
    // Apply theme on mount and whenever isDark changes
    if (isDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="w-9 h-9 rounded-lg hover:bg-sidebar-accent transition-all duration-200 relative overflow-hidden"
      title={isDark ? "التبديل إلى الوضع النهاري" : "التبديل إلى الوضع المظلم"}
    >
      <div className="relative">
        {isDark ? (
          <Sun className="h-4 w-4 text-yellow-400 transition-transform duration-200 rotate-0" />
        ) : (
          <Moon className="h-4 w-4 text-blue-500 transition-transform duration-200 rotate-0" />
        )}
      </div>
    </Button>
  );
}
