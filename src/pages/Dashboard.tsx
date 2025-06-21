import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Eye,
  Trash2,
  Printer,
  Search,
  Users,
  Calendar,
  Phone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import {
  formatArabicDate,
  calculateBMI,
  getStatColor,
} from "@/lib/utils-enhanced";
import { usePrintSubscriber } from "@/components/PrintSubscriber";
import type { Subscriber } from "@/types";
import Layout from "@/components/Layout";

export default function Dashboard() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [filteredSubscribers, setFilteredSubscribers] = useState<Subscriber[]>(
    [],
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { printSubscriber } = usePrintSubscriber();

  useEffect(() => {
    // Check authentication
    const session = sessionStorage.getItem("gym_session");
    if (!session) {
      navigate("/");
      return;
    }

    loadSubscribers();
  }, [navigate]);

  useEffect(() => {
    // Filter subscribers based on search term
    if (searchTerm.trim() === "") {
      setFilteredSubscribers(subscribers);
    } else {
      const filtered = subscribers.filter(
        (subscriber) =>
          subscriber.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          subscriber.phone.includes(searchTerm),
      );
      setFilteredSubscribers(filtered);
    }
  }, [searchTerm, subscribers]);

  const loadSubscribers = async () => {
    try {
      const response = await dbHelpers.getSubscribers();
      if (response.data) {
        setSubscribers(response.data);
      }
    } catch (error) {
      toast({
        title: "خطأ في تحميل البيانات",
        description: "لم نتمكن من تحميل قائمة المشتركين",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSubscriber = async (id: string, name: string) => {
    try {
      await dbHelpers.deleteSubscriber(id);
      setSubscribers((prev) => prev.filter((s) => s.id !== id));
      toast({
        title: "تم الحذف بنجاح",
        description: `تم حذف المشترك ${name}`,
      });
    } catch (error) {
      toast({
        title: "خطأ في الحذف",
        description: "لم نتمكن من حذف المشترك",
        variant: "destructive",
      });
    }
  };

  const handlePrintSubscriber = (subscriber: Subscriber) => {
    // Convert to SubscriberWithGroups for printing
    const subscriberWithGroups = {
      ...subscriber,
      groups: [], // In real implementation, this would be loaded from database
    };

    printSubscriber(subscriberWithGroups);

    toast({
      title: "تم إرسال الطباعة",
      description: `تم إرسال بيانات ${subscriber.name} للطباعة`,
    });
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

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">المشتركين</h1>
            <p className="text-muted-foreground">
              إدارة قائمة المشتركين في صالة حسام جم
            </p>
          </div>
          <Button
            onClick={() => navigate("/add-subscriber")}
            className="gym-button"
          >
            <Plus className="w-5 h-5 ml-2" />
            إضافة مشترك جديد
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="stats-card bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950 dark:to-amber-950 border-orange-200 dark:border-orange-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-orange-900 dark:text-orange-100">
                إجمالي المشتركين
              </CardTitle>
              <div className="p-2 bg-orange-500 rounded-lg">
                <Users className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-1">
                {subscribers.length}
              </div>
              <p className="text-sm text-orange-700 dark:text-orange-300">
                مشترك نشط
              </p>
            </CardContent>
          </Card>

          <Card className="stats-card bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border-green-200 dark:border-green-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-green-900 dark:text-green-100">
                مشتركين هذا الشهر
              </CardTitle>
              <div className="p-2 bg-green-500 rounded-lg">
                <Calendar className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-1">
                {
                  subscribers.filter(
                    (s) =>
                      new Date(s.subscription_date).getMonth() ===
                      new Date().getMonth(),
                  ).length
                }
              </div>
              <p className="text-sm text-green-700 dark:text-green-300">
                مشترك جديد
              </p>
            </CardContent>
          </Card>

          <Card className="stats-card bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950 border-blue-200 dark:border-blue-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-blue-900 dark:text-blue-100">
                ��توسط العمر
              </CardTitle>
              <div className="p-2 bg-blue-500 rounded-lg">
                <Users className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                {subscribers.length > 0
                  ? Math.round(
                      subscribers.reduce((sum, s) => sum + s.age, 0) /
                        subscribers.length,
                    )
                  : 0}
              </div>
              <p className="text-sm text-blue-700 dark:text-blue-300">سنة</p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <CardTitle>قائمة المشتركين</CardTitle>
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="البحث بالاسم أو رقم الهاتف..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10 w-full sm:w-80"
                />
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Subscribers Grid */}
        {filteredSubscribers.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Users className="w-16 h-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {searchTerm ? "لا توجد نتائج" : "لا توجد مشتركين"}
              </h3>
              <p className="text-muted-foreground text-center">
                {searchTerm
                  ? "لم نجد أي مشترك يطابق بحثك"
                  : "ابدأ بإضافة مشتركين جدد إلى النظام"}
              </p>
              {!searchTerm && (
                <Button
                  onClick={() => navigate("/add-subscriber")}
                  className="gym-button mt-4"
                >
                  <Plus className="w-4 h-4 ml-2" />
                  إضافة أول مشترك
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSubscribers.map((subscriber) => {
              const bmiData = calculateBMI(
                subscriber.weight,
                subscriber.height,
              );
              return (
                <Card
                  key={subscriber.id}
                  className="gym-card-elevated hover:scale-[1.02] transition-all duration-300"
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-xl mb-2 text-foreground">
                          {subscriber.name}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-2 text-muted-foreground">
                          <Phone className="w-4 h-4" />
                          {subscriber.phone}
                        </CardDescription>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Badge
                          variant="outline"
                          className={`text-xs ${bmiData.color} border-current`}
                        >
                          BMI: {bmiData.value}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {bmiData.category}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-muted/50 rounded-lg p-3 text-center">
                        <div className="text-xs text-muted-foreground mb-1">
                          العمر
                        </div>
                        <div className="text-lg font-bold text-foreground">
                          {subscriber.age}{" "}
                          <span className="text-sm font-normal">سنة</span>
                        </div>
                      </div>
                      <div className="bg-muted/50 rounded-lg p-3 text-center">
                        <div className="text-xs text-muted-foreground mb-1">
                          الوزن
                        </div>
                        <div className="text-lg font-bold text-foreground">
                          {subscriber.weight}{" "}
                          <span className="text-sm font-normal">كجم</span>
                        </div>
                      </div>
                      <div className="bg-muted/50 rounded-lg p-3 text-center">
                        <div className="text-xs text-muted-foreground mb-1">
                          الطول
                        </div>
                        <div className="text-lg font-bold text-foreground">
                          {subscriber.height}{" "}
                          <span className="text-sm font-normal">سم</span>
                        </div>
                      </div>
                      <div className="bg-muted/50 rounded-lg p-3 text-center">
                        <div className="text-xs text-muted-foreground mb-1">
                          الاشتراك
                        </div>
                        <div className="text-xs font-medium text-foreground">
                          {formatDate(subscriber.subscription_date)}
                        </div>
                      </div>
                    </div>

                    {subscriber.notes && (
                      <div className="bg-gym-gradient-soft rounded-lg p-3">
                        <div className="text-xs text-muted-foreground mb-1">
                          ملاحظات:
                        </div>
                        <p className="text-sm text-foreground line-clamp-2">
                          {subscriber.notes}
                        </p>
                      </div>
                    )}

                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 hover:bg-gym-primary hover:text-white transition-colors"
                        onClick={() => navigate(`/subscriber/${subscriber.id}`)}
                      >
                        <Eye className="w-4 h-4 ml-1" />
                        عرض
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="hover:bg-blue-500 hover:text-white transition-colors"
                        onClick={() => handlePrintSubscriber(subscriber)}
                      >
                        <Printer className="w-4 h-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="hover:bg-destructive hover:text-white transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
                            <AlertDialogDescription>
                              هل أنت متأكد من حذف المشترك "{subscriber.name}"؟
                              هذا الإجراء لا يمكن التراجع عنه.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>إلغاء</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() =>
                                handleDeleteSubscriber(
                                  subscriber.id,
                                  subscriber.name,
                                )
                              }
                              className="bg-destructive hover:bg-destructive/90"
                            >
                              حذف
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}
