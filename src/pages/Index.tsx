import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function Index() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
      <div className="text-center max-w-md mx-auto p-6">
        <h1 className="text-3xl font-bold text-slate-800 mb-4">
          نظام إدارة صالة حسام جم
        </h1>
        <p className="text-slate-600 mb-8">
          نظام شامل لإدارة المشتركين والكورسات والمبيعات
        </p>
        <div className="space-y-4">
          <Button
            onClick={() => navigate("/dashboard")}
            className="w-full"
            size="lg"
          >
            الدخول إلى النظام
          </Button>
          <Button
            onClick={() => navigate("/login")}
            variant="outline"
            className="w-full"
            size="lg"
          >
            تسجيل الدخول
          </Button>
        </div>
      </div>
    </div>
  );
}

export default Index;
