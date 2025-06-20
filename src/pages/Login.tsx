import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dumbbell, Lock, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";

export default function Login() {
  const [credentials, setCredentials] = useState({
    name: "",
    code: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simple authentication check
    if (credentials.name && credentials.code === "112233") {
      // Set session
      sessionStorage.setItem(
        "gym_session",
        JSON.stringify({
          name: credentials.name,
          loginTime: new Date().toISOString(),
        }),
      );

      toast({
        title: "تم تسجيل الدخول بنجاح",
        description: `مرحباً ${credentials.name}`,
      });

      navigate("/dashboard");
    } else {
      toast({
        title: "خطأ في تسجيل الدخول",
        description: "يرجى التأكد من الاسم والرمز",
        variant: "destructive",
      });
    }

    setIsLoading(false);
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden"
      dir="rtl"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-orange-500 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-blue-500 to-orange-500 rounded-full shadow-2xl mb-6 border-4 border-white/20">
            <Dumbbell className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-5xl font-bold text-white mb-3 drop-shadow-lg">
            صالة حسام جم
          </h1>
          <p className="text-white/90 text-xl">نظام إدارة الصالة الرياضية</p>
        </div>

        {/* Login Form */}
        <Card className="backdrop-blur-md bg-white/95 dark:bg-slate-800/95 shadow-2xl border border-white/20">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-3xl font-bold text-slate-800 dark:text-white">
              تسجيل الدخول
            </CardTitle>
            <CardDescription className="text-lg">
              أدخل بياناتك للوصول إلى النظام
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-right">
                  الاسم
                </Label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gym-primary w-5 h-5" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="أدخل اسمك"
                    value={credentials.name}
                    onChange={(e) =>
                      setCredentials((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    className="pl-12 text-right h-12 border-2 border-slate-200 dark:border-slate-600 focus:border-gym-primary rounded-xl bg-white/80 dark:bg-slate-700/80 backdrop-blur-sm"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="code"
                  className="text-right text-slate-700 dark:text-slate-300 font-medium"
                >
                  الرمز
                </Label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gym-primary w-5 h-5" />
                  <Input
                    id="code"
                    type="password"
                    placeholder="112233"
                    value={credentials.code}
                    onChange={(e) =>
                      setCredentials((prev) => ({
                        ...prev,
                        code: e.target.value,
                      }))
                    }
                    className="pl-12 text-right h-12 border-2 border-slate-200 dark:border-slate-600 focus:border-gym-primary rounded-xl bg-white/80 dark:bg-slate-700/80 backdrop-blur-sm"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full gym-button text-xl py-4 mt-6 shadow-lg hover:shadow-xl"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white ml-2"></div>
                    جاري تسجيل الدخول...
                  </>
                ) : (
                  "دخول"
                )}
              </Button>
            </form>

            {/* Help text */}
            <div className="mt-8 text-center">
              <div className="bg-gym-gradient-soft rounded-xl p-4 border border-gym-primary/20">
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  الرمز الافتراضي:{" "}
                  <span className="font-mono font-bold text-gym-primary bg-gym-primary/10 px-3 py-1 rounded-lg">
                    112233
                  </span>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-10 text-white/80">
          <p className="text-lg drop-shadow">
            © 2024 صالة حسام جم - جميع الحقوق محفوظة
          </p>
          <p className="text-sm mt-2 text-white/60">
            نظام إدارة متكامل للصالات الرياضية
          </p>
        </div>
      </div>
    </div>
  );
}
