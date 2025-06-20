import { useState } from "react";
import {
  Settings as SettingsIcon,
  Database,
  Trash2,
  Users,
  Package,
  ShoppingCart,
  Dumbbell,
  Apple,
  AlertTriangle,
  RotateCcw,
  Shield,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { dbHelpers } from "@/lib/supabase";
import Layout from "@/components/Layout";
import DatabaseTest from "@/components/DatabaseTest";
import GroupsTest from "@/components/GroupsTest";

export default function Settings() {
  const [isResetting, setIsResetting] = useState(false);

  const handleResetDatabase = async () => {
    setIsResetting(true);

    try {
      // In real implementation, this would reset all tables
      await dbHelpers.resetDatabase();

      toast({
        title: "تم تفريغ قاعدة البيانات بنجاح",
        description:
          "تم حذف جميع البيانات من الجداول المحددة. سيتم إعادة تحميل الصفحة.",
      });

      // Reload the page after a short delay
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      toast({
        title: "خطأ في تفريغ قاعدة البيانات",
        description: "لم نتمكن من تفريغ قاعدة البيانات",
        variant: "destructive",
      });
    } finally {
      setIsResetting(false);
    }
  };

  const systemInfo = {
    version: "1.0.0",
    buildDate: new Date().toLocaleDateString("ar-IQ"),
    environment: "Development",
    database: "Supabase (متصل)",
  };

  const databaseTables = [
    {
      name: "المشتركين",
      table: "subscribers",
      icon: Users,
      description: "بيانات المشتركين الشخصية",
      willBeDeleted: true,
    },
    {
      name: "مجموعات البرامج",
      table: "groups",
      icon: Database,
      description: "مجموعات الكورسات والأنظمة الغذائية",
      willBeDeleted: true,
    },
    {
      name: "عناصر المجموعات",
      table: "group_items",
      icon: Database,
      description: "التمارين والعناصر الغذائية في كل مجموعة",
      willBeDeleted: true,
    },
    {
      name: "المنتجات",
      table: "products",
      icon: Package,
      description: "منتجات المخزن",
      willBeDeleted: true,
    },
    {
      name: "المبيعات",
      table: "sales",
      icon: ShoppingCart,
      description: "فواتير المبيعات",
      willBeDeleted: true,
    },
    {
      name: "تفاصيل المبيعات",
      table: "sale_items",
      icon: ShoppingCart,
      description: "المنتجات المباعة في كل فاتورة",
      willBeDeleted: true,
    },
    {
      name: "نقاط الكورسات",
      table: "course_points",
      icon: Dumbbell,
      description: "التمارين المتاحة",
      willBeDeleted: false,
    },
    {
      name: "العناصر الغذائية",
      table: "diet_items",
      icon: Apple,
      description: "العناصر الغذائية المتاحة",
      willBeDeleted: false,
    },
  ];

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">الضبط</h1>
          <p className="text-muted-foreground">
            إعدادات النظام وإدارة قاعدة البيانات
          </p>
        </div>

        {/* System Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="w-5 h-5" />
              معلومات النظام
            </CardTitle>
            <CardDescription>معلومات عن إصدار النظام والبيئة</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">
                  إصدار النظام
                </div>
                <div className="font-semibold">{systemInfo.version}</div>
              </div>
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">
                  تاريخ البناء
                </div>
                <div className="font-semibold">{systemInfo.buildDate}</div>
              </div>
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">البيئة</div>
                <Badge variant="outline">{systemInfo.environment}</Badge>
              </div>
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">
                  قاعدة البيانات
                </div>
                <Badge variant="secondary">{systemInfo.database}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Database Management with Test */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  إدارة قاعدة البيانات
                </CardTitle>
                <CardDescription>
                  أدوات إدارة وصيانة قاعدة البيانات
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Database Tables Overview */}
                <div>
                  <h4 className="font-semibold mb-4">جد��ول قاعدة البيانات</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {databaseTables.map((table) => {
                      const Icon = table.icon;
                      return (
                        <div
                          key={table.table}
                          className={`flex items-center gap-3 p-3 rounded-lg border ${
                            table.willBeDeleted
                              ? "bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800"
                              : "bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800"
                          }`}
                        >
                          <Icon className="w-5 h-5" />
                          <div className="flex-1">
                            <div className="font-medium">{table.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {table.description}
                            </div>
                          </div>
                          <Badge
                            variant={
                              table.willBeDeleted ? "destructive" : "default"
                            }
                            className="text-xs"
                          >
                            {table.willBeDeleted ? "سيتم حذفه" : "سيبقى"}
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <Separator />

                {/* Reset Database Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-destructive" />
                    <h4 className="font-semibold text-destructive">
                      تفريغ قاعدة البيانات
                    </h4>
                  </div>

                  <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 space-y-3">
                    <div className="flex items-start gap-3">
                      <Shield className="w-5 h-5 text-destructive mt-0.5" />
                      <div className="space-y-2">
                        <h5 className="font-medium text-destructive">
                          تحذير مهم
                        </h5>
                        <p className="text-sm text-muted-foreground">
                          هذا الإجراء سيحذف جميع البيانات الموضحة أعلاه باللون
                          الأحمر بشكل نهائي ولا يمكن التراجع عنه. سيتم الاحتفاظ
                          فقط بالتمارين والعناصر الغذائية المتاحة.
                        </p>
                        <div className="text-sm">
                          <strong>سيتم حذف:</strong>
                          <ul className="list-disc list-inside mt-1 space-y-1">
                            <li>جميع بيانات المشتركين</li>
                            <li>جميع برامج الكورسات والأنظمة الغذائية</li>
                            <li>جميع المنتجات في المخزن</li>
                            <li>جميع فواتير المبيعات</li>
                          </ul>
                        </div>
                        <div className="text-sm">
                          <strong>سيتم الاحتفاظ بـ:</strong>
                          <ul className="list-disc list-inside mt-1 space-y-1">
                            <li>قائمة التمارين المتاحة</li>
                            <li>قائمة العناصر الغذائية المتاحة</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="destructive"
                          disabled={isResetting}
                          className="w-full sm:w-auto"
                        >
                          {isResetting ? (
                            <>
                              <RotateCcw className="w-4 h-4 ml-2 animate-spin" />
                              جاري تفريغ قاعدة البيانات...
                            </>
                          ) : (
                            <>
                              <Trash2 className="w-4 h-4 ml-2" />
                              تفريغ قاعدة البيانات
                            </>
                          )}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle className="flex items-center gap-2 text-destructive">
                            <AlertTriangle className="w-5 h-5" />
                            تأكيد تفريغ قاعدة البيانات
                          </AlertDialogTitle>
                          <AlertDialogDescription className="space-y-3">
                            <p>
                              <strong>تحذير نهائي:</strong> هذا الإجراء سيحذف
                              جميع البيانات التالية بشكل نهائي:
                            </p>
                            <ul className="list-disc list-inside space-y-1 text-sm">
                              <li>جميع المشتركين وبياناتهم</li>
                              <li>جميع برامج التدريب والأنظمة الغذائية</li>
                              <li>جميع منتجات المخزن</li>
                              <li>جميع فواتير المبيعات</li>
                            </ul>
                            <p className="text-destructive font-medium">
                              هل أنت متأكد بنسبة 100% من رغبتك في المتابعة؟
                            </p>
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>
                            إلغاء - لا أريد المتابعة
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={handleResetDatabase}
                            className="bg-destructive hover:bg-destructive/90"
                          >
                            نعم، تفريغ قاعدة البيانات
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Future Features */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <SettingsIcon className="w-5 h-5" />
                  ميزات مستقبلية
                </CardTitle>
                <CardDescription>
                  ميزات وإعدادات ستكون متاحة في الإصدارات القادمة
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <h5 className="font-medium">إدارة المستخدمين</h5>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• إضافة مستخدمين جدد</li>
                      <li>• تحديد صلاحيات المستخدمين</li>
                      <li>• كلمات مرور متقدمة</li>
                    </ul>
                  </div>
                  <div className="space-y-3">
                    <h5 className="font-medium">النسخ الاحتياطية</h5>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• نسخ احتياطية تلقائية</li>
                      <li>• استعادة النسخ الاحتياطية</li>
                      <li>• تصدير البيانات</li>
                    </ul>
                  </div>
                  <div className="space-y-3">
                    <h5 className="font-medium">إعدادات الطباعة</h5>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• تخصيص تخطيط الطباعة</li>
                      <li>• شعارات مخصصة</li>
                      <li>• قوالب طباعة متعددة</li>
                    </ul>
                  </div>
                  <div className="space-y-3">
                    <h5 className="font-medium">الإحصائيات المتقدمة</h5>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• تقارير مفصلة</li>
                      <li>• رسوم بيانية تفاعلية</li>
                      <li>• تحليلات الأداء</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="space-y-6">
            <DatabaseTest />
            <GroupsTest />
          </div>
        </div>

        {/* Future Features Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              مميزات قادمة
            </CardTitle>
            <CardDescription>
              مميزات سيتم إضافتها في الإصدارات القادمة
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h5 className="font-medium">إدارة المستخدمين</h5>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• إضافة مستخدمين جدد</li>
                  <li>• تحديد صلاحيات المستخدمين</li>
                  <li>• كلمات مرور متقدمة</li>
                </ul>
              </div>
              <div className="space-y-3">
                <h5 className="font-medium">النسخ الاحتياطية</h5>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• نسخ احتياطية تلقائية</li>
                  <li>• استعادة النسخ الاحتياطية</li>
                  <li>• تصدير البيانات</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
