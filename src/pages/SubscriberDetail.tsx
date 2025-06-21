import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Edit,
  Trash2,
  Printer,
  Phone,
  User,
  Weight,
  Ruler,
  Calendar,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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
import { toast } from "@/hooks/use-toast";
import { dbHelpers } from "@/lib/supabase";
import { formatArabicDate, calculateBMI } from "@/lib/utils-enhanced";
import { usePrintSubscriber } from "@/components/PrintSubscriber";
import CoursePrograms from "@/components/CoursePrograms";
import DietPrograms from "@/components/DietPrograms";
import type { SubscriberWithGroups } from "@/types";
import Layout from "@/components/Layout";

export default function SubscriberDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [subscriber, setSubscriber] = useState<SubscriberWithGroups | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteInfo, setDeleteInfo] = useState<{
    sales: number;
    groups: number;
  } | null>(null);
  const { printSubscriber } = usePrintSubscriber();

  useEffect(() => {
    if (!id) {
      navigate("/dashboard");
      return;
    }
    loadSubscriber();
  }, [id, navigate]);

  const loadSubscriber = async () => {
    try {
      setIsLoading(true);

      // جلب بيانات المشترك الحقيقية من قاعدة البيانات
      const response = await dbHelpers.getSubscriberWithGroups(id!);

      if (response.error) {
        throw response.error;
      }

      if (!response.data) {
        throw new Error("لم يتم العثور على المشترك");
      }

      // معلومات تصحيح للتأكد من البيانات
      console.log("📊 بيانات المشترك المستلمة:", {
        name: response.data.name,
        groups_count: response.data.groups?.length || 0,
        groups_details: response.data.groups?.map((g) => ({
          type: g.type,
          title: g.title,
          items_count: g.group_items?.length || 0,
          first_item: g.group_items?.[0]
            ? {
                course_point: g.group_items[0].course_point?.name,
                diet_item: g.group_items[0].diet_item?.name,
              }
            : null,
        })),
      });

      setSubscriber(response.data);
    } catch (error: any) {
      console.error("خطأ في تحميل بيانات المشترك:", error);
      toast({
        title: "خطأ",
        description: error.message || "حدث خطأ أثناء تحميل بيانات المشترك",
        variant: "destructive",
      });
      navigate("/dashboard");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClick = async () => {
    if (!subscriber) return;

    try {
      // فحص البيانات المرتبطة أولاً
      const response = await dbHelpers.checkSubscriberRelations(subscriber.id);

      if (response.data) {
        setDeleteInfo(response.data);
      } else {
        // إذا فشل الفحص، نتابع بدون معلومات إضافية
        setDeleteInfo({ sales: 0, groups: 0 });
      }
    } catch (error) {
      console.error("خطأ في فحص البيانات المرتبطة:", error);
      setDeleteInfo({ sales: 0, groups: 0 });
    }
  };

  const handleConfirmDelete = async () => {
    if (!subscriber) return;

    try {
      setIsDeleting(true);

      const response = await dbHelpers.deleteSubscriber(subscriber.id);

      if (response.error) {
        throw response.error;
      }

      toast({
        title: "تم الحذف بنجاح",
        description: "تم حذف المشترك وتنظيف جميع البيانات المرتبطة",
      });
      navigate("/dashboard");
    } catch (error: any) {
      console.error("خطأ في حذف المشترك:", error);
      toast({
        title: "خطأ في الحذف",
        description: error.message || "حدث خطأ أثناء حذف المشترك",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setDeleteInfo(null);
    }
  };

  const handlePrint = () => {
    if (subscriber) {
      printSubscriber(subscriber);
    }
  };

  const formatDate = (dateString: string) => {
    return formatArabicDate(dateString);
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin mx-auto" />
            <p className="text-muted-foreground">
              ��اري تحميل بيانات المشترك...
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!subscriber) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">المشترك غير موجود</h2>
          <p className="text-muted-foreground mb-6">
            لم يتم العثور على المشترك المطلوب
          </p>
          <Button onClick={() => navigate("/dashboard")}>
            <ArrowRight className="w-4 h-4 ml-2" />
            العودة للوحة التحكم
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/dashboard")}
            >
              <ArrowRight className="w-4 h-4 ml-2" />
              العودة
            </Button>
            <div>
              <h1 className="text-3xl font-bold">{subscriber.name}</h1>
              <p className="text-muted-foreground">
                تاريخ الاشتراك: {formatDate(subscriber.subscription_date)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button onClick={handlePrint} variant="outline">
              <Printer className="w-4 h-4 ml-2" />
              طباعة
            </Button>
            <Button
              onClick={() => navigate(`/edit-subscriber/${subscriber.id}`)}
              variant="outline"
            >
              <Edit className="w-4 h-4 ml-2" />
              تعديل
            </Button>
            <AlertDialog
              open={deleteInfo !== null}
              onOpenChange={() => setDeleteInfo(null)}
            >
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDeleteClick}
                >
                  <Trash2 className="w-4 h-4 ml-2" />
                  حذف
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>تأكيد حذف المشترك</AlertDialogTitle>
                  <AlertDialogDescription asChild>
                    <div className="space-y-3">
                      <p>هل أنت متأكد من حذف المشترك "{subscriber.name}"؟</p>

                      {deleteInfo && (
                        <div className="bg-yellow-50 dark:bg-yellow-950 p-3 rounded-lg border border-yellow-200 dark:border-yellow-800">
                          <p className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">
                            ⚠️ تحذير: البيانات المرتبطة
                          </p>
                          <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                            {deleteInfo.sales > 0 && (
                              <li>
                                • يوجد {deleteInfo.sales} فاتورة مبيعات مرتبطة -
                                سيتم فصلها عن المشترك
                              </li>
                            )}
                            {deleteInfo.groups > 0 && (
                              <li>
                                • يوجد {deleteInfo.groups} مجموعة تمارين/نظام
                                غذائي - سيتم حذفها
                              </li>
                            )}
                            {deleteInfo.sales === 0 &&
                              deleteInfo.groups === 0 && (
                                <li>
                                  • لا توجد بيانات مرتبطة - يمكن الحذف بأمان
                                </li>
                              )}
                          </ul>
                        </div>
                      )}

                      <p className="text-sm text-muted-foreground">
                        هذا الإجراء لا يمكن التراجع عنه.
                      </p>
                    </div>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={isDeleting}>
                    إلغاء
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleConfirmDelete}
                    disabled={isDeleting}
                    className="bg-destructive hover:bg-destructive/90"
                  >
                    {isDeleting ? (
                      <>
                        <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                        جاري الحذف...
                      </>
                    ) : (
                      "تأكيد الحذف"
                    )}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        {/* Personal Information */}
        <Card className="print-section">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              المعلومات الشخصية
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>العمر</span>
              </div>
              <p className="text-lg font-semibold">{subscriber.age} سنة</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Weight className="w-4 h-4" />
                <span>الوزن</span>
              </div>
              <p className="text-lg font-semibold">{subscriber.weight} كجم</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Ruler className="w-4 h-4" />
                <span>الطول</span>
              </div>
              <p className="text-lg font-semibold">{subscriber.height} سم</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="w-4 h-4" />
                <span>الهاتف</span>
              </div>
              <p className="text-lg font-semibold">{subscriber.phone}</p>
            </div>

            <div className="space-y-2 md:col-span-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>تاريخ الاشتراك</span>
              </div>
              <p className="text-lg font-semibold">
                {formatDate(subscriber.subscription_date)}
              </p>
            </div>

            <div className="space-y-2">
              <span className="text-muted-foreground">مؤشر كتلة الجسم</span>
              <div className="flex flex-col gap-1">
                {(() => {
                  const bmiData = calculateBMI(
                    subscriber.weight,
                    subscriber.height,
                  );
                  return (
                    <>
                      <Badge
                        variant="secondary"
                        className={`text-lg ${bmiData.color}`}
                      >
                        {bmiData.bmi}
                      </Badge>
                      <span className={`text-sm ${bmiData.color}`}>
                        {bmiData.status}
                      </span>
                    </>
                  );
                })()}
              </div>
            </div>
          </CardContent>

          {subscriber.notes && (
            <>
              <Separator />
              <CardContent>
                <div className="space-y-2">
                  <h4 className="font-semibold">ملاحظات:</h4>
                  <p className="text-muted-foreground">{subscriber.notes}</p>
                </div>
              </CardContent>
            </>
          )}
        </Card>

        {/* Course Programs */}
        <CoursePrograms groups={subscriber.groups || []} />

        {/* Diet Programs */}
        <DietPrograms groups={subscriber.groups || []} />

        {/* Empty State for No Programs */}
        {(!subscriber.groups || subscriber.groups.length === 0) && (
          <Card>
            <CardContent className="text-center py-12">
              <div className="space-y-4">
                <div className="w-24 h-24 mx-auto bg-muted rounded-full flex items-center justify-center">
                  <User className="w-12 h-12 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">
                    لا توجد برامج مضافة
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    لم يتم إضافة أي برامج تمرين أو أنظمة غذائية لهذا المشت��ك
                    بعد
                  </p>
                  <Button
                    onClick={() =>
                      navigate(`/edit-subscriber/${subscriber.id}`)
                    }
                  >
                    <Edit className="w-4 h-4 ml-2" />
                    إضافة برامج
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}
