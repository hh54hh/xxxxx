import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { dbHelpers } from "@/lib/supabase";
import { CheckCircle, XCircle, Loader2, Database } from "lucide-react";

export default function DatabaseTest() {
  const [isLoading, setIsLoading] = useState(false);
  const [testResults, setTestResults] = useState<{
    connection: boolean | null;
    subscribers: number | null;
    courses: number | null;
    products: number | null;
    sales: number | null;
    error: string | null;
  }>({
    connection: null,
    subscribers: null,
    courses: null,
    products: null,
    sales: null,
    error: null,
  });

  const runDatabaseTest = async () => {
    setIsLoading(true);
    setTestResults({
      connection: null,
      subscribers: null,
      courses: null,
      products: null,
      sales: null,
      error: null,
    });

    try {
      // اختبار الاتصال
      const connectionTest = await dbHelpers.testConnection();
      if (connectionTest.error) {
        throw new Error(`فشل الاتصال: ${connectionTest.error.message}`);
      }

      // اختبار جلب البيانات
      const [subscribersResult, coursesResult, productsResult, salesResult] =
        await Promise.all([
          dbHelpers.getSubscribers(),
          dbHelpers.getCoursePoints(),
          dbHelpers.getProducts(),
          dbHelpers.getSales(),
        ]);

      setTestResults({
        connection: true,
        subscribers: subscribersResult.data?.length || 0,
        courses: coursesResult.data?.length || 0,
        products: productsResult.data?.length || 0,
        sales: salesResult.data?.length || 0,
        error: null,
      });
    } catch (error: any) {
      setTestResults({
        connection: false,
        subscribers: null,
        courses: null,
        products: null,
        sales: null,
        error: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: boolean | null) => {
    if (status === null) return null;
    return status ? (
      <CheckCircle className="h-5 w-5 text-green-600" />
    ) : (
      <XCircle className="h-5 w-5 text-red-600" />
    );
  };

  const getStatusBadge = (status: boolean | null) => {
    if (status === null) return null;
    return (
      <Badge variant={status ? "default" : "destructive"}>
        {status ? "متصل" : "فشل"}
      </Badge>
    );
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          اختبار قاعدة البيانات
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          onClick={runDatabaseTest}
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              جاري الاختبار...
            </>
          ) : (
            "اختبار الاتصال"
          )}
        </Button>

        {testResults.error && (
          <div className="text-red-600 text-sm bg-red-50 p-3 rounded">
            <strong>خطأ:</strong> {testResults.error}
          </div>
        )}

        {testResults.connection !== null && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span>الاتصال:</span>
              <div className="flex items-center gap-2">
                {getStatusIcon(testResults.connection)}
                {getStatusBadge(testResults.connection)}
              </div>
            </div>

            {testResults.connection && (
              <>
                <div className="border-t pt-3 space-y-2">
                  <div className="flex justify-between">
                    <span>المشتركين:</span>
                    <Badge variant="outline">{testResults.subscribers}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>نقاط التمرين:</span>
                    <Badge variant="outline">{testResults.courses}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>المنتجات:</span>
                    <Badge variant="outline">{testResults.products}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>المبيعات:</span>
                    <Badge variant="outline">{testResults.sales}</Badge>
                  </div>
                </div>

                <div className="text-green-600 text-sm bg-green-50 p-3 rounded">
                  ✅ قاعدة البيانات متصلة وتعمل بشكل صحيح!
                </div>
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
