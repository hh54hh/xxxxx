import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Save,
  Plus,
  X,
  User,
  Dumbbell,
  Apple,
  ArrowRight,
  Check,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { dbHelpers } from "@/lib/supabase";
import type { SubscriberFormData, CoursePoint, DietItem, Group } from "@/types";
import Layout from "@/components/Layout";

interface CourseGroup {
  title: string;
  selectedCourses: string[];
}

interface DietGroup {
  title: string;
  selectedItems: string[];
}

export default function AddSubscriber() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [coursePoints, setCoursePoints] = useState<CoursePoint[]>([]);
  const [dietItems, setDietItems] = useState<DietItem[]>([]);

  // Form data
  const [formData, setFormData] = useState<SubscriberFormData>({
    name: "",
    age: 0,
    weight: 0,
    height: 0,
    phone: "",
    notes: "",
  });

  // Course groups
  const [courseGroups, setCourseGroups] = useState<CourseGroup[]>([]);
  const [isAddingCourseGroup, setIsAddingCourseGroup] = useState(false);
  const [newCourseGroup, setNewCourseGroup] = useState<CourseGroup>({
    title: "",
    selectedCourses: [],
  });
  const [courseSearchTerm, setCourseSearchTerm] = useState("");

  // Diet groups
  const [dietGroups, setDietGroups] = useState<DietGroup[]>([]);
  const [isAddingDietGroup, setIsAddingDietGroup] = useState(false);
  const [newDietGroup, setNewDietGroup] = useState<DietGroup>({
    title: "",
    selectedItems: [],
  });
  const [dietSearchTerm, setDietSearchTerm] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [coursesResponse, dietResponse] = await Promise.all([
        dbHelpers.getCoursePoints(),
        dbHelpers.getDietItems(),
      ]);

      if (coursesResponse.data) setCoursePoints(coursesResponse.data);
      if (dietResponse.data) setDietItems(dietResponse.data);
    } catch (error) {
      toast({
        title: "خطأ في تحميل البيانات",
        description: "لم نتمكن من تحميل قوائم التمارين والأنظمة الغذائية",
        variant: "destructive",
      });
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

  const handleAddCourseGroup = () => {
    if (newCourseGroup.selectedCourses.length === 0) {
      toast({
        title: "يرجى اختيار تمارين",
        description: "يجب اختيار تمرين واحد على الأقل",
        variant: "destructive",
      });
      return;
    }

    setCourseGroups((prev) => [...prev, { ...newCourseGroup }]);
    setNewCourseGroup({ title: "", selectedCourses: [] });
    setCourseSearchTerm("");
    setIsAddingCourseGroup(false);
    toast({
      title: "تمت الإضافة",
      description: "تم إضافة مجموعة الكورسات بنجاح",
    });
  };

  const filteredCoursePoints = coursePoints.filter(
    (course) =>
      course.name.toLowerCase().includes(courseSearchTerm.toLowerCase()) ||
      (course.description &&
        course.description
          .toLowerCase()
          .includes(courseSearchTerm.toLowerCase())),
  );

  const handleAddDietGroup = () => {
    if (newDietGroup.selectedItems.length === 0) {
      toast({
        title: "يرجى اختيار عناصر غذائية",
        description: "يجب اختيار عنصر غذائي واحد على الأقل",
        variant: "destructive",
      });
      return;
    }

    setDietGroups((prev) => [...prev, { ...newDietGroup }]);
    setNewDietGroup({ title: "", selectedItems: [] });
    setDietSearchTerm("");
    setIsAddingDietGroup(false);
    toast({
      title: "تمت الإضافة",
      description: "تم إضافة مجموعة النظام الغذائي بنجاح",
    });
  };

  const filteredDietItems = dietItems.filter(
    (item) =>
      item.name.toLowerCase().includes(dietSearchTerm.toLowerCase()) ||
      (item.description &&
        item.description.toLowerCase().includes(dietSearchTerm.toLowerCase())),
  );

  const handleRemoveCourseGroup = (index: number) => {
    setCourseGroups((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRemoveDietGroup = (index: number) => {
    setDietGroups((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.name ||
      !formData.age ||
      !formData.weight ||
      !formData.height ||
      !formData.phone
    ) {
      toast({
        title: "بيانات ناقصة",
        description: "يرجى ملء جميع الحقول المطلوبة",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // إنشاء المشترك مع جميع المجموعات
      const subscriberData = {
        ...formData,
        subscription_date: new Date().toISOString().split("T")[0],
      };

      const response = await dbHelpers.createSubscriberWithGroups({
        subscriber: subscriberData,
        courseGroups,
        dietGroups,
      });

      if (response.error || !response.data) {
        throw response.error || new Error("فشل في إنشاء المشترك");
      }

      toast({
        title: "تم الحفظ بنجاح",
        description: `تم إضافة المشترك ${formData.name} بنجاح`,
      });

      navigate("/dashboard");
    } catch (error) {
      toast({
        title: "خطأ في الحفظ",
        description: "لم نتمكن من حفظ بيانات المشترك",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
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
              إضافة مشترك جديد
            </h1>
            <p className="text-muted-foreground">
              إضافة مشترك جديد مع الكورسات والأنظمة الغذائية
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Personal Information */}
            <Card className="gym-card-elevated">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950 rounded-t-xl">
                <CardTitle className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
                  <div className="p-2 bg-blue-500 rounded-lg">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  المعلومات الشخصية
                </CardTitle>
                <CardDescription>البيانات الأساسية للمشترك</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">الاسم الكامل *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="أدخل الاسم الكامل"
                    className="text-right"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="age">العمر *</Label>
                    <Input
                      id="age"
                      type="number"
                      value={formData.age || ""}
                      onChange={(e) =>
                        handleInputChange("age", parseInt(e.target.value) || 0)
                      }
                      placeholder="25"
                      min="1"
                      max="100"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="weight">الوزن (كجم) *</Label>
                    <Input
                      id="weight"
                      type="number"
                      value={formData.weight || ""}
                      onChange={(e) =>
                        handleInputChange(
                          "weight",
                          parseFloat(e.target.value) || 0,
                        )
                      }
                      placeholder="70"
                      min="1"
                      step="0.1"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="height">الطول (سم) *</Label>
                    <Input
                      id="height"
                      type="number"
                      value={formData.height || ""}
                      onChange={(e) =>
                        handleInputChange(
                          "height",
                          parseInt(e.target.value) || 0,
                        )
                      }
                      placeholder="175"
                      min="1"
                      max="250"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">رقم الهاتف *</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) =>
                        handleInputChange("phone", e.target.value)
                      }
                      placeholder="01234567890"
                      className="text-right"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">ملاحظات</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => handleInputChange("notes", e.target.value)}
                    placeholder="أي ملاحظات إضافية..."
                    className="text-right min-h-[80px]"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full gym-button"
                  disabled={isLoading}
                >
                  <Save className="w-4 h-4 ml-2" />
                  {isLoading ? "جاري الحفظ..." : "حفظ المشترك"}
                </Button>
              </CardContent>
            </Card>

            {/* Courses */}
            <Card className="gym-card-elevated">
              <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950 dark:to-amber-950 rounded-t-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-orange-800 dark:text-orange-200">
                      <div className="p-2 bg-orange-500 rounded-lg">
                        <Dumbbell className="w-5 h-5 text-white" />
                      </div>
                      الكورسات
                    </CardTitle>
                    <CardDescription>مجموعات التمارين</CardDescription>
                  </div>
                  <Dialog
                    open={isAddingCourseGroup}
                    onOpenChange={setIsAddingCourseGroup}
                  >
                    <DialogTrigger asChild>
                      <Button size="sm" variant="outline">
                        <Plus className="w-4 h-4 ml-2" />
                        إضافة مجموعة
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>إضافة مجموعة كورسات</DialogTitle>
                        <DialogDescription>
                          اختر التمارين وأضف عنوان للمجموعة (اختياري)
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="courseGroupTitle">
                            عنوان المجموعة (اختياري)
                          </Label>
                          <Input
                            id="courseGroupTitle"
                            value={newCourseGroup.title}
                            onChange={(e) =>
                              setNewCourseGroup((prev) => ({
                                ...prev,
                                title: e.target.value,
                              }))
                            }
                            placeholder="مثل: برنامج تقوية العضلات"
                            className="text-right"
                          />
                        </div>

                        <div className="space-y-3">
                          <Label>البحث عن التمارين:</Label>
                          <div className="relative">
                            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <Input
                              placeholder="ابحث في التمارين..."
                              value={courseSearchTerm}
                              onChange={(e) =>
                                setCourseSearchTerm(e.target.value)
                              }
                              className="pr-10 text-right"
                            />
                          </div>
                        </div>

                        <div className="space-y-3">
                          <Label>اختر التمارين:</Label>
                          <div className="space-y-2 max-h-60 overflow-y-auto">
                            {filteredCoursePoints.map((course) => (
                              <div
                                key={course.id}
                                className="flex items-center space-x-2 space-x-reverse"
                              >
                                <Checkbox
                                  id={`course-${course.id}`}
                                  checked={newCourseGroup.selectedCourses.includes(
                                    course.id,
                                  )}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      setNewCourseGroup((prev) => ({
                                        ...prev,
                                        selectedCourses: [
                                          ...prev.selectedCourses,
                                          course.id,
                                        ],
                                      }));
                                    } else {
                                      setNewCourseGroup((prev) => ({
                                        ...prev,
                                        selectedCourses:
                                          prev.selectedCourses.filter(
                                            (id) => id !== course.id,
                                          ),
                                      }));
                                    }
                                  }}
                                />
                                <Label
                                  htmlFor={`course-${course.id}`}
                                  className="text-sm font-normal cursor-pointer"
                                >
                                  <div>
                                    <div className="font-medium">
                                      {course.name}
                                    </div>
                                    {course.description && (
                                      <div className="text-xs text-muted-foreground">
                                        {course.description}
                                      </div>
                                    )}
                                  </div>
                                </Label>
                              </div>
                            ))}
                            {filteredCoursePoints.length === 0 && (
                              <p className="text-center text-muted-foreground py-4">
                                لا توجد تمارين تطابق البحث
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setNewCourseGroup({
                              title: "",
                              selectedCourses: [],
                            });
                            setCourseSearchTerm("");
                            setIsAddingCourseGroup(false);
                          }}
                        >
                          إلغاء
                        </Button>
                        <Button onClick={handleAddCourseGroup}>
                          <Check className="w-4 h-4 ml-2" />
                          إضافة
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {courseGroups.map((group, index) => (
                    <div
                      key={index}
                      className="border rounded-lg p-3 bg-muted/50"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">
                          {group.title || `مجموعة ${index + 1}`}
                        </h4>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">
                            {group.selectedCourses.length} تمرين
                          </Badge>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleRemoveCourseGroup(index)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {group.selectedCourses
                          .map(
                            (courseId) =>
                              coursePoints.find((c) => c.id === courseId)?.name,
                          )
                          .filter(Boolean)
                          .join(", ")}
                      </div>
                    </div>
                  ))}

                  {courseGroups.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">
                      لم يتم إضافة مجموعات كورسات بعد
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Diet */}
            <Card className="gym-card-elevated">
              <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 rounded-t-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-green-800 dark:text-green-200">
                      <div className="p-2 bg-green-500 rounded-lg">
                        <Apple className="w-5 h-5 text-white" />
                      </div>
                      الأنظمة الغذائية
                    </CardTitle>
                    <CardDescription>مجموعات الغذاء</CardDescription>
                  </div>
                  <Dialog
                    open={isAddingDietGroup}
                    onOpenChange={setIsAddingDietGroup}
                  >
                    <DialogTrigger asChild>
                      <Button size="sm" variant="outline">
                        <Plus className="w-4 h-4 ml-2" />
                        إضافة مجموعة
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>إضافة مجموعة غذائية</DialogTitle>
                        <DialogDescription>
                          اختر العناصر الغذائية وأضف عنوان للمجموعة (اختياري)
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="dietGroupTitle">
                            عنوان المجموعة (اختياري)
                          </Label>
                          <Input
                            id="dietGroupTitle"
                            value={newDietGroup.title}
                            onChange={(e) =>
                              setNewDietGroup((prev) => ({
                                ...prev,
                                title: e.target.value,
                              }))
                            }
                            placeholder="مثل: نظام غذائي لزيادة الكتلة العضلية"
                            className="text-right"
                          />
                        </div>

                        <div className="space-y-3">
                          <Label>البحث عن العناصر الغذائية:</Label>
                          <div className="relative">
                            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <Input
                              placeholder="ابحث في العناصر الغذائية..."
                              value={dietSearchTerm}
                              onChange={(e) =>
                                setDietSearchTerm(e.target.value)
                              }
                              className="pr-10 text-right"
                            />
                          </div>
                        </div>

                        <div className="space-y-3">
                          <Label>اختر العناصر الغذائية:</Label>
                          <div className="space-y-2 max-h-60 overflow-y-auto">
                            {filteredDietItems.map((item) => (
                              <div
                                key={item.id}
                                className="flex items-center space-x-2 space-x-reverse"
                              >
                                <Checkbox
                                  id={`diet-${item.id}`}
                                  checked={newDietGroup.selectedItems.includes(
                                    item.id,
                                  )}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      setNewDietGroup((prev) => ({
                                        ...prev,
                                        selectedItems: [
                                          ...prev.selectedItems,
                                          item.id,
                                        ],
                                      }));
                                    } else {
                                      setNewDietGroup((prev) => ({
                                        ...prev,
                                        selectedItems:
                                          prev.selectedItems.filter(
                                            (id) => id !== item.id,
                                          ),
                                      }));
                                    }
                                  }}
                                />
                                <Label
                                  htmlFor={`diet-${item.id}`}
                                  className="text-sm font-normal cursor-pointer"
                                >
                                  <div>
                                    <div className="font-medium">
                                      {item.name}
                                    </div>
                                    {item.description && (
                                      <div className="text-xs text-muted-foreground">
                                        {item.description}
                                      </div>
                                    )}
                                  </div>
                                </Label>
                              </div>
                            ))}
                            {filteredDietItems.length === 0 && (
                              <p className="text-center text-muted-foreground py-4">
                                لا توجد عناصر غذائية تطابق البحث
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setNewDietGroup({ title: "", selectedItems: [] });
                            setDietSearchTerm("");
                            setIsAddingDietGroup(false);
                          }}
                        >
                          إلغاء
                        </Button>
                        <Button onClick={handleAddDietGroup}>
                          <Check className="w-4 h-4 ml-2" />
                          إضافة
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {dietGroups.map((group, index) => (
                    <div
                      key={index}
                      className="border rounded-lg p-3 bg-muted/50"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">
                          {group.title || `نظام غذائي ${index + 1}`}
                        </h4>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">
                            {group.selectedItems.length} عنصر
                          </Badge>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleRemoveDietGroup(index)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {group.selectedItems
                          .map(
                            (itemId) =>
                              dietItems.find((d) => d.id === itemId)?.name,
                          )
                          .filter(Boolean)
                          .join(", ")}
                      </div>
                    </div>
                  ))}

                  {dietGroups.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">
                      لم يتم إضافة مجموعات غذائية بعد
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </form>
      </div>
    </Layout>
  );
}
