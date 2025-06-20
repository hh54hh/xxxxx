import { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Dumbbell,
  Save,
  X,
  MoreHorizontal,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { dbHelpers } from "@/lib/supabase";
import type { CoursePoint, CourseFormData } from "@/types";
import Layout from "@/components/Layout";

export default function Courses() {
  const [courses, setCourses] = useState<CoursePoint[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<CoursePoint[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<CoursePoint | null>(
    null,
  );

  const [formData, setFormData] = useState<CourseFormData>({
    name: "",
    description: "",
  });

  useEffect(() => {
    loadCourses();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredCourses(courses);
    } else {
      const filtered = courses.filter(
        (course) =>
          course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (course.description &&
            course.description
              .toLowerCase()
              .includes(searchTerm.toLowerCase())),
      );
      setFilteredCourses(filtered);
    }
  }, [searchTerm, courses]);

  const loadCourses = async () => {
    try {
      const response = await dbHelpers.getCoursePoints();
      if (response.data) {
        setCourses(response.data);
      }
    } catch (error) {
      toast({
        title: "خطأ في تحميل البيانات",
        description: "لم نتمكن من تحميل قائمة الكورسات",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof CourseFormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const resetForm = () => {
    setFormData({ name: "", description: "" });
  };

  const handleAdd = async () => {
    if (!formData.name.trim()) {
      toast({
        title: "بيانات ناقصة",
        description: "يرجى إدخال اسم التمرين",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await dbHelpers.createCoursePoint(formData);
      if (response.data?.[0]) {
        setCourses((prev) => [...prev, response.data[0]]);
        toast({
          title: "تمت الإضافة بنجاح",
          description: `تم إضافة التمرين ${formData.name}`,
        });
        resetForm();
        setIsAddDialogOpen(false);
      }
    } catch (error) {
      toast({
        title: "خطأ في الإضافة",
        description: "لم نتمكن من إضافة التمرين",
        variant: "destructive",
      });
    }
  };

  const handleEdit = async () => {
    if (!selectedCourse || !formData.name.trim()) {
      toast({
        title: "بيانات ناقصة",
        description: "يرجى إدخال اسم التمرين",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await dbHelpers.updateCoursePoint(
        selectedCourse.id,
        formData,
      );
      if (response.data?.[0]) {
        setCourses((prev) =>
          prev.map((course) =>
            course.id === selectedCourse.id ? response.data[0] : course,
          ),
        );
        toast({
          title: "تم التحديث بنجاح",
          description: `تم تحديث التمرين ${formData.name}`,
        });
        resetForm();
        setIsEditDialogOpen(false);
        setSelectedCourse(null);
      }
    } catch (error) {
      toast({
        title: "خطأ في التحديث",
        description: "لم نتمكن من تحديث التمرين",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (!selectedCourse) return;

    try {
      await dbHelpers.deleteCoursePoint(selectedCourse.id);
      setCourses((prev) => prev.filter((c) => c.id !== selectedCourse.id));
      toast({
        title: "تم الحذف بنجاح",
        description: `تم حذف التمرين ${selectedCourse.name}`,
      });
      setIsDeleteDialogOpen(false);
      setSelectedCourse(null);
    } catch (error) {
      toast({
        title: "خطأ في الحذف",
        description: "لم نتمكن من حذف التمرين",
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (course: CoursePoint) => {
    setSelectedCourse(course);
    setFormData({
      name: course.name,
      description: course.description || "",
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (course: CoursePoint) => {
    setSelectedCourse(course);
    setIsDeleteDialogOpen(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ar-EG", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
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
            <h1 className="text-3xl font-bold text-foreground">الكورسات</h1>
            <p className="text-muted-foreground">
              إدارة نقاط التمارين والكورسات المتاحة
            </p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gym-button">
                <Plus className="w-5 h-5 ml-2" />
                إضافة تمرين جديد
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>إضافة تمرين جديد</DialogTitle>
                <DialogDescription>
                  أضف تمرين جديد إلى قائمة التمارين المتاحة
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="add-name">اسم التمرين *</Label>
                  <Input
                    id="add-name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="مثل: تمرين الضغط"
                    className="text-right"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="add-description">الوصف</Label>
                  <Textarea
                    id="add-description"
                    value={formData.description}
                    onChange={(e) =>
                      handleInputChange("description", e.target.value)
                    }
                    placeholder="مثل: 20 عدة × 3 مجموعات"
                    className="text-right min-h-[80px]"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    resetForm();
                    setIsAddDialogOpen(false);
                  }}
                >
                  إلغاء
                </Button>
                <Button onClick={handleAdd}>
                  <Save className="w-4 h-4 ml-2" />
                  حفظ
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                إجمالي التمارين
              </CardTitle>
              <Dumbbell className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gym-primary">
                {courses.length}
              </div>
              <p className="text-xs text-muted-foreground">تمرين متاح</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                تمارين بوصف تفصيلي
              </CardTitle>
              <Dumbbell className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gym-secondary">
                {courses.filter((c) => c.description).length}
              </div>
              <p className="text-xs text-muted-foreground">تمرين مفصل</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">نتائج البحث</CardTitle>
              <Search className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gym-accent">
                {filteredCourses.length}
              </div>
              <p className="text-xs text-muted-foreground">تمرين ظاهر</p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Table */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <CardTitle>قائمة التمارين</CardTitle>
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="البحث في التمارين..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10 w-full sm:w-80"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredCourses.length === 0 ? (
              <div className="text-center py-16">
                <Dumbbell className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  {searchTerm ? "لا توجد نتائج" : "لا توجد تمارين"}
                </h3>
                <p className="text-muted-foreground">
                  {searchTerm
                    ? "لم نجد أي تمرين يطابق بحثك"
                    : "ابدأ بإضافة تمارين جديدة"}
                </p>
                {!searchTerm && (
                  <Button
                    onClick={() => setIsAddDialogOpen(true)}
                    className="gym-button mt-4"
                  >
                    <Plus className="w-4 h-4 ml-2" />
                    إضافة أول تمرين
                  </Button>
                )}
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">اسم التمرين</TableHead>
                      <TableHead className="text-right">الوصف</TableHead>
                      <TableHead className="text-right">
                        تاريخ الإضافة
                      </TableHead>
                      <TableHead className="text-center">الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCourses.map((course) => (
                      <TableRow key={course.id}>
                        <TableCell className="font-medium">
                          {course.name}
                        </TableCell>
                        <TableCell>
                          {course.description ? (
                            <span className="text-muted-foreground">
                              {course.description.length > 50
                                ? `${course.description.substring(0, 50)}...`
                                : course.description}
                            </span>
                          ) : (
                            <Badge variant="outline">بدون وصف</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatDate(course.created_at)}
                        </TableCell>
                        <TableCell className="text-center">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => openEditDialog(course)}
                              >
                                <Edit className="w-4 h-4 ml-2" />
                                تعديل
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => openDeleteDialog(course)}
                                className="text-destructive"
                              >
                                <Trash2 className="w-4 h-4 ml-2" />
                                حذف
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>تعديل التمرين</DialogTitle>
              <DialogDescription>
                تعديل بيانات التمرين "{selectedCourse?.name}"
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">اسم التمرين *</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="مثل: تمرين الضغط"
                  className="text-right"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">الوصف</Label>
                <Textarea
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  placeholder="مثل: 20 عدة × 3 مجموعات"
                  className="text-right min-h-[80px]"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  resetForm();
                  setIsEditDialogOpen(false);
                  setSelectedCourse(null);
                }}
              >
                إلغاء
              </Button>
              <Button onClick={handleEdit}>
                <Save className="w-4 h-4 ml-2" />
                حفظ التغييرات
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Dialog */}
        <AlertDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
              <AlertDialogDescription>
                هل أنت متأكد من حذف التمرين "{selectedCourse?.name}"؟ هذا
                الإجراء لا يمكن التراجع عنه.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel
                onClick={() => {
                  setIsDeleteDialogOpen(false);
                  setSelectedCourse(null);
                }}
              >
                إلغاء
              </AlertDialogCancel>
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
    </Layout>
  );
}
