import React, { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { initializeGymData } from "@/lib/initializeData";
import { toast } from "sonner";

// Layout
import Layout from "./components/Layout";

// Pages
import Login from "./pages/Login";
import Subscribers from "./pages/Subscribers";
import AddSubscriber from "./pages/AddSubscriber";
import Courses from "./pages/Courses";
import Diet from "./pages/Diet";
import Store from "./pages/Store";
import Sales from "./pages/Sales";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  const [isInitialized, setIsInitialized] = React.useState(false);
  const [initError, setInitError] = React.useState<string | null>(null);

  useEffect(() => {
    const initApp = async () => {
      try {
        await initializeGymData();
        setIsInitialized(true);
      } catch (error) {
        console.error("Failed to initialize gym data:", error);
        setInitError(
          error instanceof Error ? error.message : "فشل في تهيئة البيانات",
        );
        toast.error("فشل في تهيئة البيانات");
      }
    };

    initApp();

    // Service Worker message listener
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.addEventListener("message", (event) => {
        const { type, message } = event.data;

        switch (type) {
          case "SYNC_START":
            toast.info(message, {
              description: "جاري مزامنة البيانات مع الخادم...",
              duration: 2000,
            });
            break;
          case "SYNC_COMPLETE":
            toast.success(message, {
              description: "تم تحديث جميع البيانات بنجاح",
              duration: 3000,
            });
            break;
          case "SYNC_ERROR":
            toast.error(message, {
              description: "سيتم المحاولة مرة أخرى تلقائياً",
              duration: 4000,
            });
            break;
          default:
            break;
        }
      });

      // Request background sync when app loads
      navigator.serviceWorker.ready.then((registration) => {
        if (registration.active) {
          registration.active.postMessage({
            type: "REQUEST_SYNC",
          });
        }
      });
    }
  }, []);

  // Show loading screen while initializing
  if (!isInitialized && !initError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <h2 className="text-xl font-semibold">
            جاري تحميل نظام صالة حسام جم
          </h2>
          <p className="text-muted-foreground">يرجى الانتظار...</p>
        </div>
      </div>
    );
  }

  // Show error screen if initialization failed
  if (initError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4 max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <span className="text-2xl">❌</span>
          </div>
          <h2 className="text-xl font-semibold text-red-600">
            فشل في تحميل التطبيق
          </h2>
          <p className="text-muted-foreground">{initError}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Login route */}
            <Route path="/login" element={<Login />} />

            {/* Protected routes with layout */}
            <Route path="/" element={<Layout />}>
              <Route index element={<Navigate to="/subscribers" replace />} />
              <Route path="subscribers" element={<Subscribers />} />
              <Route path="add-subscriber" element={<AddSubscriber />} />
              <Route path="courses" element={<Courses />} />
              <Route path="diet" element={<Diet />} />
              <Route path="store" element={<Store />} />
              <Route path="sales" element={<Sales />} />
              <Route path="settings" element={<Settings />} />
            </Route>

            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
