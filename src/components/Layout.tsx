import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Users,
  UserPlus,
  Dumbbell,
  Apple,
  Package,
  ShoppingCart,
  Settings,
  LogOut,
  Menu,
  X,
  Home,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import ThemeToggle from "./ThemeToggle";
import AppearanceSettings from "./AppearanceSettings";
import type { NavItem } from "@/types";

const navItems: NavItem[] = [
  { title: "المشتركين", href: "/dashboard", icon: Users },
  { title: "إضافة مشترك", href: "/add-subscriber", icon: UserPlus },
  { title: "الكورسات", href: "/courses", icon: Dumbbell },
  { title: "الأنظمة الغذائية", href: "/diet", icon: Apple },
  { title: "المخزن", href: "/inventory", icon: Package },
  { title: "المبيعات", href: "/sales", icon: ShoppingCart },
  { title: "الضبط", href: "/settings", icon: Settings },
];

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const handleLogout = () => {
    // Clear session and redirect to login
    sessionStorage.removeItem("gym_session");
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 right-0 z-50 h-full w-80 bg-sidebar backdrop-blur-lg border-l border-sidebar-border transform transition-all duration-300 ease-in-out lg:translate-x-0 shadow-2xl",
          sidebarOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0",
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-sidebar-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gym-primary rounded-xl flex items-center justify-center">
                <Dumbbell className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-sidebar-foreground">
                  صالة حسام جم
                </h1>
                <p className="text-sm text-sidebar-foreground/70">
                  نظام إدارة الصالة
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon || Home;
              const isActive = location.pathname === item.href;

              return (
                <NavLink
                  key={item.href}
                  to={item.href}
                  className={cn("sidebar-item", isActive && "active")}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.title}</span>
                  {item.badge && (
                    <span className="mr-auto bg-gym-primary text-white text-xs px-2 py-1 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-sidebar-border space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-sidebar-foreground/70">المظهر</span>
              <div className="flex items-center gap-1">
                <ThemeToggle />
                <AppearanceSettings />
              </div>
            </div>
            <Button
              variant="ghost"
              className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent"
              onClick={handleLogout}
            >
              <LogOut className="w-5 h-5 ml-3" />
              تسجيل الخروج
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:mr-80">
        {/* Mobile header */}
        <header className="lg:hidden bg-card/80 backdrop-blur-md border-b border-border p-4 flex items-center justify-between sticky top-0 z-40">
          <Button
            variant="ghost"
            size="icon"
            className="hover:bg-gym-primary/10 hover:text-gym-primary transition-colors"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-6 h-6" />
          </Button>
          <h2 className="text-lg font-semibold gradient-text">صالة حسام جم</h2>
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <AppearanceSettings />
          </div>
        </header>

        {/* Page content */}
        <main className="min-h-screen p-6 bg-gradient-to-br from-background via-background to-muted/30">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
