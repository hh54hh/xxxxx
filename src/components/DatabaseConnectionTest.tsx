import { useState, useEffect } from "react";
import { dbHelpers } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle, RefreshCw, Database } from "lucide-react";

export const DatabaseConnectionTest = () => {
  const [connectionStatus, setConnectionStatus] = useState<
    "idle" | "testing" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState<string>("");
  const [subscribersCount, setSubscribersCount] = useState<number>(0);

  const testConnection = async () => {
    setConnectionStatus("testing");
    setMessage("جارٍ اختبار الاتصال...");

    try {
      // اختبار الاتصال الأساسي
      const connectionResult = await dbHelpers.testConnection();

      if (connectionResult.error) {
        setConnectionStatus("error");
        setMessage(connectionResult.error.message);
        return;
      }

      // إذا نجح الاتصال، جرب جلب بيانات المشتركين
      try {
        const subscribersResult = await dbHelpers.getSubscribers();

        if (subscribersResult.error) {
          setConnectionStatus("error");
          setMessage(subscribersResult.error.message);
          return;
        }

        setSubscribersCount(subscribersResult.data?.length || 0);
        setConnectionStatus("success");
        setMessage(
          `✅ الاتصال ناجح! تم العثور على ${subscribersResult.data?.length || 0} مشترك في قاعدة البيانات.`,
        );
      } catch (error: any) {
        setConnectionStatus("error");
        setMessage(`خطأ في جلب البيانات: ${error?.message || "خطأ غير معروف"}`);
      }
    } catch (error: any) {
      setConnectionStatus("error");
      setMessage(`فشل الاتصال: ${error?.message || "خطأ غير معروف"}`);
    }
  };

  useEffect(() => {
    // اختبار الاتصال تلقائياً عند تحميل المكون
    testConnection();
  }, []);

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case "testing":
        return <RefreshCw className="h-5 w-5 animate-spin text-blue-500" />;
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "error":
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Database className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = () => {
    switch (connectionStatus) {
      case "testing":
        return "border-blue-200 bg-blue-50";
      case "success":
        return "border-green-200 bg-green-50";
      case "error":
        return "border-red-200 bg-red-50";
      default:
        return "border-gray-200 bg-gray-50";
    }
  };

  return (
    <Card className={`${getStatusColor()} transition-colors duration-300`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getStatusIcon()}
          حالة الاتصال بقاعدة البيانات
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-gray-700">
          <p>{message}</p>
          {connectionStatus === "success" && (
            <div className="mt-2 space-y-1">
              <p>📊 عدد المشتركين: {subscribersCount}</p>
              <p>🌐 الخادم: Supabase</p>
              <p>✅ جميع الأنظمة تعمل بشكل طبيعي</p>
            </div>
          )}
        </div>

        <Button
          onClick={testConnection}
          disabled={connectionStatus === "testing"}
          variant={connectionStatus === "success" ? "secondary" : "default"}
          size="sm"
          className="w-full"
        >
          {connectionStatus === "testing" ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              جارٍ الاختبار...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              إعادة اختبار الاتصال
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default DatabaseConnectionTest;
