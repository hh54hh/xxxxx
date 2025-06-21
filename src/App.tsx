import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ErrorBoundary } from "react-error-boundary";

// Import pages
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import SubscriberDetail from "./pages/SubscriberDetail";
import EditSubscriber from "./pages/EditSubscriber";
import AddSubscriber from "./pages/AddSubscriber";
import Courses from "./pages/Courses";
import Diet from "./pages/Diet";
import Inventory from "./pages/Inventory";
import Sales from "./pages/Sales";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

// مكون للتعامل مع الأخطاء
function ErrorFallback({ error }: { error: Error }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6 text-center">
        <div className="text-red-500 text-6xl mb-4">⚠️</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          حدث خطأ في التطبيق
        </h2>
        <p className="text-gray-600 mb-6">
          عذراً، حدث خطأ غير متوقع. يرجى إعادة تحميل الصفحة.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          إعادة تحميل الصفحة
        </button>
        {import.meta.env.DEV && (
          <details className="mt-4 text-left">
            <summary className="cursor-pointer text-sm text-gray-500">
              تفاصيل الخطأ
            </summary>
            <pre className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded overflow-auto">
              {error.message}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}

const App = () => (
  <ErrorBoundary FallbackComponent={ErrorFallback}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Login page */}
          <Route path="/" element={<Login />} />

          {/* Main app routes */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/subscriber/:id" element={<SubscriberDetail />} />
          <Route path="/edit-subscriber/:id" element={<EditSubscriber />} />
          <Route path="/add-subscriber" element={<AddSubscriber />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/diet" element={<Diet />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/sales" element={<Sales />} />
          <Route path="/settings" element={<Settings />} />

          {/* Catch-all route for 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </ErrorBoundary>
);

export default App;
