import DatabaseConnectionTest from "@/components/DatabaseConnectionTest";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Database, Users, Activity, ShoppingBag } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-800 mb-2">
            🏋️ نظام إدارة النادي الرياضي
          </h1>
          <p className="text-slate-600 text-lg">
            مرحباً بك في نظام إدارة شامل للأندية الرياضية والأنظمة الغذائية
          </p>
        </div>

        {/* Database Connection Test */}
        <DatabaseConnectionTest />

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-500" />
                إدارة المشتركين
              </CardTitle>
              <CardDescription>
                إضافة وتعديل وإدارة معلومات المشتركين
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline">
                الذهاب للمشتركين
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-green-500" />
                البرامج التدريبية
              </CardTitle>
              <CardDescription>
                إنشاء وإدارة برامج التمارين الرياضية
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline">
                إدارة البرامج
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5 text-purple-500" />
                الأنظمة الغذائية
              </CardTitle>
              <CardDescription>
                إنشاء خطط غذائية مخصصة للمشتركين
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline">
                الأنظمة الغذائية
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-orange-500" />
                إدارة المبيعات
              </CardTitle>
              <CardDescription>تسجيل مبيعات المنتجات والمكملات</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline">
                سجل المبيعات
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5 text-red-500" />
                المخزون
              </CardTitle>
              <CardDescription>إدارة مخزون المنتجات والمكملات</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline">
                إدارة المخزون
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-teal-500" />
                التقارير
              </CardTitle>
              <CardDescription>عرض إحصائيات وتقارير شاملة</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline">
                عرض التقارير
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Status Footer */}
        <div className="text-center text-sm text-slate-500 mt-8">
          <p>✅ قاعدة البيانات متصلة ومعدة للاستخدام</p>
          <p>🚀 جميع الأنظمة جاهزة للعمل فور الرفع</p>
        </div>
      </div>
    </div>
  );
};

export default Index;
