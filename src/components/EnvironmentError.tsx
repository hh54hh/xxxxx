import { AlertTriangle, ExternalLink, Settings, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function EnvironmentError() {
  const handleOpenNetlify = () => {
    window.open("https://app.netlify.com/", "_blank");
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl border-red-200 bg-white shadow-lg">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-red-800">
            خطأ في إعدادات النشر
          </CardTitle>
          <CardDescription className="text-red-600 text-lg">
            متغيرات البيئة غير مُعرفة على Netlify
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800 font-medium">
              التطبيق لا يستطيع الاتصال بقاعدة البيانات لأن متغيرات Supabase غير
              موجودة
            </AlertDescription>
          </Alert>

          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Settings className="w-5 h-5" />
              الحل السريع:
            </h3>

            <ol className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                  1
                </span>
                <div>
                  <p className="font-medium">اذهب إلى Netlify Dashboard</p>
                  <p className="text-gray-600">افتح موقعك في Netlify</p>
                </div>
              </li>

              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                  2
                </span>
                <div>
                  <p className="font-medium">اذهب إلى إعدادات متغيرات البيئة</p>
                  <p className="text-gray-600">
                    Site settings → Environment variables
                  </p>
                </div>
              </li>

              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                  3
                </span>
                <div>
                  <p className="font-medium">أضف المتغيرات المطلوبة:</p>
                  <div className="mt-2 space-y-2">
                    <div className="bg-white p-2 rounded border font-mono text-xs">
                      <div className="text-blue-600">VITE_SUPABASE_URL</div>
                      <div className="text-gray-500">
                        https://nfccwjrneviidwljaeoq.supabase.co
                      </div>
                    </div>
                    <div className="bg-white p-2 rounded border font-mono text-xs">
                      <div className="text-blue-600">
                        VITE_SUPABASE_ANON_KEY
                      </div>
                      <div className="text-gray-500">
                        eyJhbGciOiJIUzI1NiIsInR5cCI6...
                      </div>
                    </div>
                  </div>
                </div>
              </li>

              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                  4
                </span>
                <div>
                  <p className="font-medium">أعد النشر</p>
                  <p className="text-gray-600">Deploys → Trigger deploy</p>
                </div>
              </li>
            </ol>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={handleOpenNetlify}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              فتح Netlify Dashboard
            </Button>

            <Button
              onClick={handleRefresh}
              variant="outline"
              className="flex-1"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              إعادة تحميل الصفحة
            </Button>
          </div>

          <div className="text-center text-sm text-gray-500">
            <p>بعد إضافة متغيرات البيئة وإعادة النشر، أعد تحميل هذه الصفحة</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
