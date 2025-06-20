import { useState, useEffect } from "react";
import { Settings, Palette, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";

interface AppearanceSettingsProps {
  className?: string;
}

export default function AppearanceSettings({
  className,
}: AppearanceSettingsProps) {
  const [autoTheme, setAutoTheme] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [highContrast, setHighContrast] = useState(false);

  useEffect(() => {
    // Load saved preferences
    const savedAutoTheme = localStorage.getItem("autoTheme") === "true";
    const savedReducedMotion = localStorage.getItem("reducedMotion") === "true";
    const savedHighContrast = localStorage.getItem("highContrast") === "true";

    setAutoTheme(savedAutoTheme);
    setReducedMotion(savedReducedMotion);
    setHighContrast(savedHighContrast);

    // Apply settings
    if (savedReducedMotion) {
      document.documentElement.style.setProperty(
        "--transition-duration",
        "0ms",
      );
    }

    if (savedHighContrast) {
      document.documentElement.classList.add("high-contrast");
    }

    // Auto theme logic
    if (savedAutoTheme) {
      const hour = new Date().getHours();
      const isDarkTime = hour < 6 || hour > 18; // 6 PM to 6 AM is dark time

      if (isDarkTime) {
        document.documentElement.classList.add("dark");
        localStorage.setItem("theme", "dark");
      } else {
        document.documentElement.classList.remove("dark");
        localStorage.setItem("theme", "light");
      }
    }
  }, []);

  const handleAutoThemeChange = (enabled: boolean) => {
    setAutoTheme(enabled);
    localStorage.setItem("autoTheme", enabled.toString());

    if (enabled) {
      const hour = new Date().getHours();
      const isDarkTime = hour < 6 || hour > 18;

      if (isDarkTime) {
        document.documentElement.classList.add("dark");
        localStorage.setItem("theme", "dark");
      } else {
        document.documentElement.classList.remove("dark");
        localStorage.setItem("theme", "light");
      }
    }
  };

  const handleReducedMotionChange = (enabled: boolean) => {
    setReducedMotion(enabled);
    localStorage.setItem("reducedMotion", enabled.toString());

    if (enabled) {
      document.documentElement.style.setProperty(
        "--transition-duration",
        "0ms",
      );
    } else {
      document.documentElement.style.removeProperty("--transition-duration");
    }
  };

  const handleHighContrastChange = (enabled: boolean) => {
    setHighContrast(enabled);
    localStorage.setItem("highContrast", enabled.toString());

    if (enabled) {
      document.documentElement.classList.add("high-contrast");
    } else {
      document.documentElement.classList.remove("high-contrast");
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={`w-9 h-9 rounded-lg hover:bg-sidebar-accent transition-colors ${className}`}
          title="إعدادات المظهر"
        >
          <Palette className="h-4 w-4 text-sidebar-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">إعدادات المظهر</h4>
            <p className="text-sm text-muted-foreground">
              تخصيص مظهر التطبيق حسب احتياجاتك
            </p>
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium">المظهر التلقائي</Label>
                <p className="text-xs text-muted-foreground">
                  تغيير المظهر حسب الوقت (مظلم ليلاً، فاتح نهاراً)
                </p>
              </div>
              <Switch
                checked={autoTheme}
                onCheckedChange={handleAutoThemeChange}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium">تقليل الحركة</Label>
                <p className="text-xs text-muted-foreground">
                  إيقاف الانتقالات والحركات المتحركة
                </p>
              </div>
              <Switch
                checked={reducedMotion}
                onCheckedChange={handleReducedMotionChange}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium">التباين العالي</Label>
                <p className="text-xs text-muted-foreground">
                  زيادة التباين لسهولة القراءة
                </p>
              </div>
              <Switch
                checked={highContrast}
                onCheckedChange={handleHighContrastChange}
              />
            </div>
          </div>

          <Separator />

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Eye className="w-3 h-3" />
            <span>هذه الإعدادات تحسن تجربة الاستخدام</span>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
