import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  User,
  Save,
  Plus,
  Trash2,
  Dumbbell,
  Apple,
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { dbHelpers } from "@/lib/supabase";
import { calculateBMI } from "@/lib/utils-enhanced";
import type {
  SubscriberWithGroups,
  SubscriberFormData,
  CoursePoint,
  DietItem,
} from "@/types";
import Layout from "@/components/Layout";

interface CourseGroup {
  id?: string;
  title: string;
  selectedCourses: string[];
}

interface DietGroup {
  id?: string;
  title: string;
  selectedItems: string[];
}

export default function EditSubscriber() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [subscriber, setSubscriber] = useState<SubscriberWithGroups | null>(
    null,
  );

  // Form data
  const [formData, setFormData] = useState<SubscriberFormData>({
    name: "",
    age: 0,
    weight: 0,
    height: 0,
    phone: "",
    notes: "",
  });

  // Available options
  const [coursePoints, setCoursePoints] = useState<CoursePoint[]>([]);
  const [dietItems, setDietItems] = useState<DietItem[]>([]);

  // Groups
  const [courseGroups, setCourseGroups] = useState<CourseGroup[]>([]);
  const [dietGroups, setDietGroups] = useState<DietGroup[]>([]);

  useEffect(() => {
    if (!id) {
      navigate("/dashboard");
      return;
    }
    loadData();
  }, [id, navigate]);

  const loadData = async () => {
    try {
      setIsLoading(true);

      const [coursesResponse, dietResponse, subscriberResponse] =
        await Promise.all([
          dbHelpers.getCoursePoints(),
          dbHelpers.getDietItems(),
          dbHelpers.getSubscriberWithGroups(id!),
        ]);

      if (coursesResponse.data) setCoursePoints(coursesResponse.data);
      if (dietResponse.data) setDietItems(dietResponse.data);

      if (subscriberResponse.error || !subscriberResponse.data) {
        throw (
          subscriberResponse.error || new Error("لم يتم العثور على المشترك")
        );
      }

      const subscriber = subscriberResponse.data;
      setSubscriber(subscriber);

      // ملء النموذج بالبيانات الموجودة
      setFormData({
        name: subscriber.name,
        age: subscriber.age,
        weight: subscriber.weight,
        height: subscriber.height,
        phone: subscriber.phone,
        notes: subscriber.notes || "",
      });

      // ملء المجموعات الموجودة
      const existingCourseGroups =
        subscriber.groups
          ?.filter((g) => g.type === "course")
          .map((group) => ({
            id: group.id,
            title: group.title || "",
            selectedCourses: group.items?.map((item) => item.item_id) || [],
          })) || [];

      const existingDietGroups =
        subscriber.groups
          ?.filter((g) => g.type === "diet")
          .map((group) => ({
            id: group.id,
            title: group.title || "",
            selectedItems: group.items?.map((item) => item.item_id) || [],
          })) || [];

      setCourseGroups(
        existingCourseGroups.length > 0
          ? existingCourseGroups
          : [{ title: "", selectedCourses: [] }],
      );
      setDietGroups(
        existingDietGroups.length > 0
          ? existingDietGroups
          : [{ title: "", selectedItems: [] }],
      );
    } catch (error: any) {
      console.error("خطأ في تحميل البيانات:", error);
      toast({
        title: "خطأ",
        description: error.message || "حدث خطأ أثناء تحميل البيانات",
        variant: "destructive",
      });
      navigate("/dashboard");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (
    field: keyof SubscriberFormData,
    value: string | number,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Course Groups Management
  const addCourseGroup = () => {
    setCourseGroups((prev) => [...prev, { title: "", selectedCourses: [] }]);
  };

  const removeCourseGroup = (index: number) => {
    setCourseGroups((prev) => prev.filter((_, i) => i !== index));
  };

  const updateCourseGroup = (
    index: number,
    field: keyof CourseGroup,
    value: string | string[],
  ) => {
    setCourseGroups((prev) =>
      prev.map((group, i) =>
        i === index ? { ...group, [field]: value } : group,
      ),
    );
  };

  const toggleCourseSelection = (groupIndex: number, courseId: string) => {
    setCourseGroups((prev) =>
      prev.map((group, i) => {
        if (i !== groupIndex) return group;
        const selected = group.selectedCourses.includes(courseId)
          ? group.selectedCourses.filter((id) => id !== courseId)
          : [...group.selectedCourses, courseId];
        return { ...group, selectedCourses: selected };
      }),
    );
  };

  // Diet Groups Management
  const addDietGroup = () => {
    setDietGroups((prev) => [...prev, { title: "", selectedItems: [] }]);
  };

  const removeDietGroup = (index: number) => {
    setDietGroups((prev) => prev.filter((_, i) => i !== index));
  };

  const updateDietGroup = (
    index: number,
    field: keyof DietGroup,
    value: string | string[],
  ) => {
    setDietGroups((prev) =>
      prev.map((group, i) =>
        i === index ? { ...group, [field]: value } : group,
      ),
    );
  };

  const toggleDietSelection = (groupIndex: number, itemId: string) => {
    setDietGroups((prev) =>
      prev.map((group, i) => {
        if (i !== groupIndex) return group;
        const selected = group.selectedItems.includes(itemId)
          ? group.selectedItems.filter((id) => id !== itemId)
          : [...group.selectedItems, itemId];
        return { ...group, selectedItems: selected };
      }),
    );
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast({
        title: "بيانات ناقصة",
        description: "يرجى إدخال اسم المشترك",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);

    try {
      // تحديث بيانات المشترك
      const updateResponse = await dbHelpers.updateSubscriber(id!, formData);

      if (updateResponse.error) {
        throw updateResponse.error;
      }

      // TODO: تحديث المجموعات - يتطلب إضافة دوال في قاعدة البيانات
      // في التطبيق الحقيقي، ستحتاج إلى:
      // 1. حذف المجموعات الموجودة
      // 2. إنشاء المجموعات الجديدة
      // 3. إضافة العناصر للمجموعات

      toast({
        title: "تم التحديث بنجاح",
        description: `تم تحديث بيانات المشترك ${formData.name}`,
      });

      navigate(`/subscriber/${id}`);
    } catch (error: any) {
      console.error("خطأ في حفظ البيانات:", error);
      toast({
        title: "خطأ في الحفظ",
        description: error.message || "لم نتمكن من حفظ التعديلات",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin mx-auto" />
            <p className="text-muted-foreground">جاري تحميل البيانات...</p>
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
          <Button onClick={() => navigate("/dashboard")}>
            <ArrowRight className="w-4 h-4 ml-2" />
            العودة للوحة التحكم
          </Button>
        </div>
      </Layout>
    );
  }

  const bmiData = calculateBMI(formData.weight, formData.height);

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(`/subscriber/${id}`)}
            >
              <ArrowRight className="w-4 h-4 ml-2" />
              العودة
            </Button>
            <div>
              <h1 className="text-3xl font-bold">تعديل المشترك</h1>
              <p className="text-muted-foreground">{subscriber.name}</p>
            </div>
          </div>

          <Button onClick={handleSubmit} disabled={isSaving}>
            {isSaving ? (
              <Loader2 className="w-4 h-4 ml-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 ml-2" />
            )}
            حفظ التعديلات
          </Button>
        </div>

        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              المعلومات الشخصية
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">الاسم الكامل</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="أدخل الاسم الكامل"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="age">العمر</Label>
              <Input
                id="age"
                type="number"
                value={formData.age}
                onChange={(e) =>
                  handleInputChange("age", parseInt(e.target.value))
                }
                placeholder="أدخل العمر"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="weight">الوزن (كجم)</Label>
              <Input
                id="weight"
                type="number"
                value={formData.weight}
                onChange={(e) =>
                  handleInputChange("weight", parseFloat(e.target.value))
                }
                placeholder="أدخل الوزن"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="height">الطول (سم)</Label>
              <Input
                id="height"
                type="number"
                value={formData.height}
                onChange={(e) =>
                  handleInputChange("height", parseFloat(e.target.value))
                }
                placeholder="أدخل الطول"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">رقم الهاتف</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                placeholder="أدخل رقم الهاتف"
              />
            </div>

            <div className="space-y-2">
              <Label>مؤشر كتلة الجسم</Label>
              <div className="flex flex-col gap-1">
                <Badge
                  variant="secondary"
                  className={`text-lg ${bmiData.color}`}
                >
                  {bmiData.bmi}
                </Badge>
                <span className={`text-sm ${bmiData.color}`}>
                  {bmiData.status}
                </span>
              </div>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="notes">ملاحظات</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                placeholder="أدخل أي ملاحظات إضافية..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Course Groups */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Dumbbell className="w-5 h-5" />
                مجموعات التمارين
              </CardTitle>
              <Button onClick={addCourseGroup} size="sm" variant="outline">
                <Plus className="w-4 h-4 ml-2" />
                إضافة مجموعة
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {courseGroups.map((group, groupIndex) => (
              <div key={groupIndex} className="border rounded-lg p-4 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <Label>اسم المجموعة</Label>
                    <Input
                      value={group.title}
                      onChange={(e) =>
                        updateCourseGroup(groupIndex, "title", e.target.value)
                      }
                      placeholder="مثال: تمارين الصدر والذراعين"
                    />
                  </div>
                  {courseGroups.length > 1 && (
                    <Button
                      onClick={() => removeCourseGroup(groupIndex)}
                      size="sm"
                      variant="destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>

                <div>
                  <Label className="mb-3 block">اختر التمارين:</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-48 overflow-y-auto">
                    {coursePoints.map((course) => (
                      <div
                        key={course.id}
                        className="flex items-center space-x-2 space-x-reverse"
                      >
                        <Checkbox
                          id={`course-${groupIndex}-${course.id}`}
                          checked={group.selectedCourses.includes(course.id)}
                          onCheckedChange={() =>
                            toggleCourseSelection(groupIndex, course.id)
                          }
                        />
                        <Label
                          htmlFor={`course-${groupIndex}-${course.id}`}
                          className="text-sm font-normal"
                        >
                          {course.name}
                          {course.description && (
                            <span className="text-muted-foreground block text-xs">
                              {course.description}
                            </span>
                          )}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {group.selectedCourses.length > 0 && (
                  <div>
                    <Label className="mb-2 block">التمارين المختارة:</Label>
                    <div className="flex flex-wrap gap-2">
                      {group.selectedCourses.map((courseId) => {
                        const course = coursePoints.find(
                          (c) => c.id === courseId,
                        );
                        return (
                          <Badge key={courseId} variant="secondary">
                            {course?.name}
                          </Badge>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Diet Groups */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Apple className="w-5 h-5" />
                مجموعات النظام الغذائي
              </CardTitle>
              <Button onClick={addDietGroup} size="sm" variant="outline">
                <Plus className="w-4 h-4 ml-2" />
                إضافة مجموعة
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {dietGroups.map((group, groupIndex) => (
              <div key={groupIndex} className="border rounded-lg p-4 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <Label>اسم المجموعة</Label>
                    <Input
                      value={group.title}
                      onChange={(e) =>
                        updateDietGroup(groupIndex, "title", e.target.value)
                      }
                      placeholder="مثال: نظام زيادة الكتلة العضلية"
                    />
                  </div>
                  {dietGroups.length > 1 && (
                    <Button
                      onClick={() => removeDietGroup(groupIndex)}
                      size="sm"
                      variant="destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>

                <div>
                  <Label className="mb-3 block">اختر العناصر الغذائية:</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-48 overflow-y-auto">
                    {dietItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center space-x-2 space-x-reverse"
                      >
                        <Checkbox
                          id={`diet-${groupIndex}-${item.id}`}
                          checked={group.selectedItems.includes(item.id)}
                          onCheckedChange={() =>
                            toggleDietSelection(groupIndex, item.id)
                          }
                        />
                        <Label
                          htmlFor={`diet-${groupIndex}-${item.id}`}
                          className="text-sm font-normal"
                        >
                          {item.name}
                          {item.description && (
                            <span className="text-muted-foreground block text-xs">
                              {item.description}
                            </span>
                          )}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {group.selectedItems.length > 0 && (
                  <div>
                    <Label className="mb-2 block">العناصر المختارة:</Label>
                    <div className="flex flex-wrap gap-2">
                      {group.selectedItems.map((itemId) => {
                        const item = dietItems.find((d) => d.id === itemId);
                        return (
                          <Badge key={itemId} variant="secondary">
                            {item?.name}
                          </Badge>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
