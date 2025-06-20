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
  Dumbbell,
  Apple,
  Plus,
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
import type { SubscriberWithGroups } from "@/types";
import Layout from "@/components/Layout";

export default function SubscriberDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [subscriber, setSubscriber] = useState<SubscriberWithGroups | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
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
      // In real implementation, this would fetch from Supabase with groups
      const mockSubscriber: SubscriberWithGroups = {
        id: id!,
        name: "أحمد محمد علي",
        age: 25,
        weight: 80,
        height: 175,
        phone: "01234567890",
        notes: "يريد تقوية عضلات الصدر والذراعين",
        subscription_date: "2024-01-15",
        created_at: "2024-01-15T10:00:00Z",
        updated_at: "2024-01-15T10:00:00Z",
        groups: [
          {
            id: "1",
            subscriber_id: id!,
            type: "course",
            title: "برنامج تقوية العضلات",
            created_at: "2024-01-15T10:00:00Z",
            updated_at: "2024-01-15T10:00:00Z",
            items: [
              {
                id: "1",
                group_id: "1",
                item_id: "1",
                created_at: "2024-01-15T10:00:00Z",
                course_point: {
                  id: "1",
                  name: "تمرين الضغط",
                  description: "20 عدة × 3 مجموعات",
                  created_at: "2024-01-01T00:00:00Z",
                  updated_at: "2024-01-01T00:00:00Z",
                },
              },
              {
                id: "2",
                group_id: "1",
                item_id: "2",
                created_at: "2024-01-15T10:00:00Z",
                course_point: {
                  id: "2",
                  name: "تمرين العقلة",
                  description: "10 عدات × 4 مجموعات",
                  created_at: "2024-01-01T00:00:00Z",
                  updated_at: "2024-01-01T00:00:00Z",
                },
              },
            ],
          },
          {
            id: "2",
            subscriber_id: id!,
            type: "diet",
            title: "نظام غذائي لزيادة الكتلة العضلية",
            created_at: "2024-01-15T10:00:00Z",
            updated_at: "2024-01-15T10:00:00Z",
            items: [
              {
                id: "3",
                group_id: "2",
                item_id: "1",
                created_at: "2024-01-15T10:00:00Z",
                diet_item: {
                  id: "1",
                  name: "بروتين مسحوق",
                  description: "30 جرام بعد التمرين",
                  created_at: "2024-01-01T00:00:00Z",
                  updated_at: "2024-01-01T00:00:00Z",
                },
              },
              {
                id: "4",
                group_id: "2",
                item_id: "2",
                created_at: "2024-01-15T10:00:00Z",
                diet_item: {
                  id: "2",
                  name: "صدر دجاج مشوي",
                  description: "200 جرام مع الغداء",
                  created_at: "2024-01-01T00:00:00Z",
                  updated_at: "2024-01-01T00:00:00Z",
                },
              },
            ],
          },
        ],
      };

      setSubscriber(mockSubscriber);
    } catch (error) {
      toast({
        title: "خطأ في تحميل البيانات",
        description: "لم نتمكن من تحميل بيانات المشترك",
        variant: "destructive",
      });
      navigate("/dashboard");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!subscriber) return;

    try {
      await dbHelpers.deleteSubscriber(subscriber.id);
      toast({
        title: "تم الحذف بنجاح",
        description: `تم حذف المشترك ${subscriber.name}`,
      });
      navigate("/dashboard");
    } catch (error) {
      toast({
        title: "خطأ في الحذف",
        description: "لم نتمكن من حذف المشترك",
        variant: "destructive",
      });
    }
  };

  const handlePrint = () => {
    if (subscriber) {
      printSubscriber(subscriber);
      toast({
        title: "تم إرسال الطباعة",
        description: `تم إرسال بيانات ${subscriber.name} للطباعة`,
      });
    }
  };

  const formatDate = (dateString: string) => {
    return formatArabicDate(dateString);
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gym-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">جاري تحميل البيانات...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!subscriber) {
    return (
      <Layout>
        <div className="text-center py-16">
          <h2 className="text-2xl font-bold mb-4">المشترك غير موجود</h2>
          <Button onClick={() => navigate("/dashboard")}>
            العودة إلى قائمة المشتركين
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/dashboard")}
            >
              <ArrowRight className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                {subscriber.name}
              </h1>
              <p className="text-muted-foreground">تفاصيل المشترك</p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={handlePrint}>
              <Printer className="w-4 h-4 ml-2" />
              طباعة
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate(`/edit-subscriber/${subscriber.id}`)}
            >
              <Edit className="w-4 h-4 ml-2" />
              تعديل
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2 className="w-4 h-4 ml-2" />
                  حذف
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
                  <AlertDialogDescription>
                    هل أنت متأكد من حذف المشترك "{subscriber.name}"؟ هذا الإجراء
                    لا يمكن التراجع عنه.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>إلغاء</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    className="bg-destructive hover:bg-destructive/90"
                  >
                    حذف
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
                        {bmiData.value}
                      </Badge>
                      <span className={`text-sm ${bmiData.color}`}>
                        {bmiData.category}
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

        {/* Courses */}
        <Card className="print-section">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Dumbbell className="w-5 h-5" />
                الكورسات والتمارين
              </CardTitle>
              <Button size="sm" variant="outline">
                <Plus className="w-4 h-4 ml-2" />
                إضافة مجموعة
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {subscriber.groups
              ?.filter((group) => group.type === "course")
              .map((group) => (
                <div key={group.id} className="avoid-break">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-lg">
                      {group.title || "مجموعة تمارين"}
                    </h4>
                    <Badge>{group.items?.length || 0} تمرين</Badge>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {group.items?.map((item) => (
                      <div
                        key={item.id}
                        className="border rounded-lg p-3 bg-muted/50"
                      >
                        <h5 className="font-medium">
                          {item.course_point?.name}
                        </h5>
                        {item.course_point?.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {item.course_point.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                  {group.items?.length === 0 && (
                    <p className="text-muted-foreground">
                      لم يتم إضافة تمارين لهذه المجموعة بعد
                    </p>
                  )}
                </div>
              ))}

            {subscriber.groups?.filter((group) => group.type === "course")
              .length === 0 && (
              <p className="text-muted-foreground text-center py-8">
                لم يتم إضافة كورسات لهذا المشترك بعد
              </p>
            )}
          </CardContent>
        </Card>

        {/* Diet */}
        <Card className="print-section">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Apple className="w-5 h-5" />
                الأنظمة الغذائية
              </CardTitle>
              <Button size="sm" variant="outline">
                <Plus className="w-4 h-4 ml-2" />
                إضافة نظام غذائي
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {subscriber.groups
              ?.filter((group) => group.type === "diet")
              .map((group) => (
                <div key={group.id} className="avoid-break">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-lg">
                      {group.title || "نظام غذائي"}
                    </h4>
                    <Badge variant="secondary">
                      {group.items?.length || 0} عنصر
                    </Badge>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {group.items?.map((item) => (
                      <div
                        key={item.id}
                        className="border rounded-lg p-3 bg-muted/50"
                      >
                        <h5 className="font-medium">{item.diet_item?.name}</h5>
                        {item.diet_item?.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {item.diet_item.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                  {group.items?.length === 0 && (
                    <p className="text-muted-foreground">
                      لم يتم إضافة عناصر غذائية لهذه المجموعة بعد
                    </p>
                  )}
                </div>
              ))}

            {subscriber.groups?.filter((group) => group.type === "diet")
              .length === 0 && (
              <p className="text-muted-foreground text-center py-8">
                لم يتم إضافة أنظمة غذائية لهذا المشترك بعد
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
