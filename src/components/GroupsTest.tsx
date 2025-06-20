import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { dbHelpers } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";
import {
  TestTube,
  User,
  Dumbbell,
  Apple,
  CheckCircle,
  XCircle,
  Loader2,
  AlertTriangle,
} from "lucide-react";

export default function GroupsTest() {
  const [isLoading, setIsLoading] = useState(false);
  const [testResults, setTestResults] = useState<{
    subscriber?: any;
    groups?: any[];
    coursePoints?: any[];
    dietItems?: any[];
    error?: string;
  }>({});

  const runCompleteTest = async () => {
    setIsLoading(true);
    setTestResults({});

    try {
      console.log("🧪 بدء اختبار شامل للمجموعات...");

      // 1. اختبار جلب الكورسات والأنظمة الغذائية
      const [coursesResponse, dietResponse] = await Promise.all([
        dbHelpers.getCoursePoints(),
        dbHelpers.getDietItems(),
      ]);

      if (coursesResponse.error || dietResponse.error) {
        throw new Error("فشل في جلب الكورسات أو الأنظمة الغذائية");
      }

      const coursePoints = coursesResponse.data || [];
      const dietItems = dietResponse.data || [];

      console.log(`✅ الكورسات المتاحة: ${coursePoints.length}`);
      console.log(`✅ الأنظمة الغذائية المتاحة: ${dietItems.length}`);

      if (coursePoints.length === 0 || dietItems.length === 0) {
        throw new Error("لا توجد كورسات أو أنظمة غذائية متاحة للاختبار");
      }

      // 2. إنشاء مشترك تجريبي مع مجموعات
      const testSubscriber = {
        name: `مشترك تجريبي ${Date.now()}`,
        age: 25,
        weight: 70,
        height: 175,
        phone: "1234567890",
        notes: "اختبار المجموعات",
      };

      const testCourseGroups = [
        {
          title: "برنامج تجريبي للتمارين",
          selectedCourses: coursePoints.slice(0, 2).map((c) => c.id),
        },
      ];

      const testDietGroups = [
        {
          title: "نظام غذائي تجريبي",
          selectedItems: dietItems.slice(0, 2).map((d) => d.id),
        },
      ];

      console.log("📝 إنشاء مشترك تجريبي...");
      const createResponse = await dbHelpers.createSubscriberWithGroups({
        subscriber: testSubscriber,
        courseGroups: testCourseGroups,
        dietGroups: testDietGroups,
      });

      if (createResponse.error || !createResponse.data) {
        throw (
          createResponse.error || new Error("فشل في إنشاء المشترك التجريبي")
        );
      }

      const subscriberId = createResponse.data.id;
      console.log(`✅ تم إنشاء المشترك التجريبي: ${subscriberId}`);

      // 3. جلب المشترك مع المجموعات
      console.log("🔍 جلب المشترك مع المجموعات...");
      const getResponse = await dbHelpers.getSubscriberWithGroups(subscriberId);

      if (getResponse.error || !getResponse.data) {
        throw getResponse.error || new Error("فشل في جلب المشترك مع المجموعات");
      }

      const subscriberWithGroups = getResponse.data;
      console.log(
        `✅ تم جلب المشترك مع ${subscriberWithGroups.groups?.length || 0} مجموعة`,
      );

      // 4. تنظيف - حذف المشترك التجريبي
      await dbHelpers.deleteSubscriber(subscriberId);
      console.log("🧹 تم حذف المشترك التجريبي");

      setTestResults({
        subscriber: subscriberWithGroups,
        groups: subscriberWithGroups.groups || [],
        coursePoints,
        dietItems,
      });

      toast({
        title: "✅ نجح الاختبار",
        description: `تم اختبار المجموعات بنجاح. المشترك كان له ${subscriberWithGroups.groups?.length || 0} مجموعة.`,
      });
    } catch (error: any) {
      console.error("❌ فشل الاختبار:", error);
      setTestResults({
        error: error.message || "خطأ غير معروف",
      });

      toast({
        title: "❌ فشل الاختبار",
        description: error.message || "حدث خطأ أثناء الاختبار",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const { subscriber, groups, coursePoints, dietItems, error } = testResults;

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TestTube className="h-5 w-5" />
          اختبار نظام المجموعات
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          onClick={runCompleteTest}
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              جاري تشغيل الاختبار...
            </>
          ) : (
            <>
              <TestTube className="mr-2 h-4 w-4" />
              تشغيل اختبار شامل
            </>
          )}
        </Button>

        {error && (
          <div className="bg-red-50 dark:bg-red-950 p-4 rounded-lg border border-red-200 dark:border-red-800">
            <div className="flex items-center gap-2 text-red-800 dark:text-red-200 mb-2">
              <XCircle className="h-4 w-4" />
              <span className="font-medium">فشل الاختبار</span>
            </div>
            <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>

            <div className="mt-3 bg-yellow-50 dark:bg-yellow-950 p-3 rounded border border-yellow-200 dark:border-yellow-800">
              <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200 mb-2">
                <AlertTriangle className="h-4 w-4" />
                <span className="font-medium">الحل المقترح</span>
              </div>
              <p className="text-yellow-700 dark:text-yellow-300 text-sm">
                يرجى تشغيل سكريبت <code>check-groups-tables.sql</code> في
                Supabase SQL Editor لإنشاء جداول المجموعات.
              </p>
            </div>
          </div>
        )}

        {subscriber && (
          <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg border border-green-200 dark:border-green-800">
            <div className="flex items-center gap-2 text-green-800 dark:text-green-200 mb-3">
              <CheckCircle className="h-4 w-4" />
              <span className="font-medium">نجح الاختبار!</span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span className="font-medium">المشترك التجريبي:</span>
                <span>{subscriber.name}</span>
              </div>

              <Separator />

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Dumbbell className="h-4 w-4" />
                  <span className="font-medium">مجموعات التمارين:</span>
                </div>
                {groups
                  ?.filter((g) => g.type === "course")
                  .map((group, index) => (
                    <div key={group.id} className="ml-6 mb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{group.title}</Badge>
                        <span className="text-sm text-muted-foreground">
                          {group.items?.length || 0} تمرين
                        </span>
                      </div>
                    </div>
                  ))}
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Apple className="h-4 w-4" />
                  <span className="font-medium">الأنظمة الغذائية:</span>
                </div>
                {groups
                  ?.filter((g) => g.type === "diet")
                  .map((group, index) => (
                    <div key={group.id} className="ml-6 mb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{group.title}</Badge>
                        <span className="text-sm text-muted-foreground">
                          {group.items?.length || 0} عنصر
                        </span>
                      </div>
                    </div>
                  ))}
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">الكورسات المتاحة:</span>
                  <Badge variant="secondary">{coursePoints?.length || 0}</Badge>
                </div>
                <div>
                  <span className="font-medium">الأنظمة المتاحة:</span>
                  <Badge variant="secondary">{dietItems?.length || 0}</Badge>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
