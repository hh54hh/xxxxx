import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";

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

const App = () => (
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
);

export default App;
