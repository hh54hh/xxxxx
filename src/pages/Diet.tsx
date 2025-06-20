import { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Apple,
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
import type { DietItem, DietFormData } from "@/types";
import Layout from "@/components/Layout";

export default function Diet() {
  const [dietItems, setDietItems] = useState<DietItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<DietItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<DietItem | null>(null);

  const [formData, setFormData] = useState<DietFormData>({
    name: "",
    description: "",
  });

  useEffect(() => {
    loadDietItems();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredItems(dietItems);
    } else {
      const filtered = dietItems.filter(
        (item) =>
          item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (item.description &&
            item.description.toLowerCase().includes(searchTerm.toLowerCase())),
      );
      setFilteredItems(filtered);
    }
  }, [searchTerm, dietItems]);

  const loadDietItems = async () => {
    try {
      const response = await dbHelpers.getDietItems();
      if (response.data) {
        setDietItems(response.data);
      }
    } catch (error) {
      toast({
        title: "خطأ في تحميل البيانات",
        description: "لم نتمكن من تحميل قائمة الأنظمة الغذائية",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof DietFormData, value: string) => {
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
        description: "يرجى إدخال اسم العنصر الغذائي",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await dbHelpers.createDietItem(formData);
      if (response.data?.[0]) {
        setDietItems((prev) => [...prev, response.data[0]]);
        toast({
          title: "تمت الإضافة بنجاح",
          description: `تم إضافة العنصر الغذائي ${formData.name}`,
        });
        resetForm();
        setIsAddDialogOpen(false);
      }
    } catch (error) {
      toast({
        title: "خطأ في الإضافة",
        description: "لم نتمكن من إضافة العنصر الغذائي",
        variant: "destructive",
      });
    }
  };

  const handleEdit = async () => {
    if (!selectedItem || !formData.name.trim()) {
      toast({
        title: "بيانات ناقصة",
        description: "يرجى إدخال اسم العنصر الغذائي",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await dbHelpers.updateDietItem(
        selectedItem.id,
        formData,
      );
      if (response.data?.[0]) {
        setDietItems((prev) =>
          prev.map((item) =>
            item.id === selectedItem.id ? response.data[0] : item,
          ),
        );
        toast({
          title: "تم التحديث بنجاح",
          description: `تم تحد��ث العنصر الغذائي ${formData.name}`,
        });
        resetForm();
        setIsEditDialogOpen(false);
        setSelectedItem(null);
      }
    } catch (error) {
      toast({
        title: "خطأ في التحديث",
        description: "لم نتمكن من تحديث العنصر الغذائي",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (!selectedItem) return;

    try {
      await dbHelpers.deleteDietItem(selectedItem.id);
      setDietItems((prev) =>
        prev.filter((item) => item.id !== selectedItem.id),
      );
      toast({
        title: "تم الحذف بنجاح",
        description: `تم حذف العنصر الغذائي ${selectedItem.name}`,
      });
      setIsDeleteDialogOpen(false);
      setSelectedItem(null);
    } catch (error) {
      toast({
        title: "خطأ في الحذف",
        description: "لم نتمكن من حذف العنصر الغذائي",
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (item: DietItem) => {
    setSelectedItem(item);
    setFormData({
      name: item.name,
      description: item.description || "",
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (item: DietItem) => {
    setSelectedItem(item);
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
            <h1 className="text-3xl font-bold text-foreground">
              الأنظمة الغذائية
            </h1>
            <p className="text-muted-foreground">
              إدارة العناصر الغذائية والأنظمة المتاحة
            </p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gym-button">
                <Plus className="w-5 h-5 ml-2" />
                إضافة عنصر غذائي
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>إضافة عنصر غذائي جديد</DialogTitle>
                <DialogDescription>
                  أضف عنصر غذائي جديد إلى قائمة العناصر المتاحة
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="add-name">اسم العنصر الغذائي *</Label>
                  <Input
                    id="add-name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="مثل: بروتين مسحوق"
                    className="text-right"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="add-description">الوصف والتعليمات</Label>
                  <Textarea
                    id="add-description"
                    value={formData.description}
                    onChange={(e) =>
                      handleInputChange("description", e.target.value)
                    }
                    placeholder="مثل: 30 جرام بعد التمرين مباشرة"
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
                إجمالي العناصر الغذائية
              </CardTitle>
              <Apple className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gym-primary">
                {dietItems.length}
              </div>
              <p className="text-xs text-muted-foreground">عنصر متاح</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                عناصر بتعليمات تفصيلية
              </CardTitle>
              <Apple className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gym-secondary">
                {dietItems.filter((item) => item.description).length}
              </div>
              <p className="text-xs text-muted-foreground">عنصر مفصل</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">نتائج البحث</CardTitle>
              <Search className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gym-accent">
                {filteredItems.length}
              </div>
              <p className="text-xs text-muted-foreground">عنصر ظاهر</p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Table */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <CardTitle>قائمة العناصر الغذائية</CardTitle>
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="البحث في العناصر الغذائية..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10 w-full sm:w-80"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredItems.length === 0 ? (
              <div className="text-center py-16">
                <Apple className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  {searchTerm ? "لا توجد نتائج" : "لا توجد عناصر غذائية"}
                </h3>
                <p className="text-muted-foreground">
                  {searchTerm
                    ? "لم نجد أي عنصر غذائي يطابق بحثك"
                    : "ابدأ بإضافة عناصر غذائية جديدة"}
                </p>
                {!searchTerm && (
                  <Button
                    onClick={() => setIsAddDialogOpen(true)}
                    className="gym-button mt-4"
                  >
                    <Plus className="w-4 h-4 ml-2" />
                    إضافة أول عنصر غذائي
                  </Button>
                )}
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">
                        اسم العنصر الغذائي
                      </TableHead>
                      <TableHead className="text-right">
                        الوصف والتعليمات
                      </TableHead>
                      <TableHead className="text-right">
                        تاريخ الإضافة
                      </TableHead>
                      <TableHead className="text-center">الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">
                          {item.name}
                        </TableCell>
                        <TableCell>
                          {item.description ? (
                            <span className="text-muted-foreground">
                              {item.description.length > 50
                                ? `${item.description.substring(0, 50)}...`
                                : item.description}
                            </span>
                          ) : (
                            <Badge variant="outline">بدون تعليمات</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatDate(item.created_at)}
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
                                onClick={() => openEditDialog(item)}
                              >
                                <Edit className="w-4 h-4 ml-2" />
                                تعديل
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => openDeleteDialog(item)}
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
              <DialogTitle>تعديل العنصر الغذائي</DialogTitle>
              <DialogDescription>
                تعديل بيانات العنصر الغذائي "{selectedItem?.name}"
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">اسم العنصر الغذائي *</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="مثل: بروتين مسحوق"
                  className="text-right"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">الوصف والتعليمات</Label>
                <Textarea
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  placeholder="مثل: 30 جرام بعد التمرين مباشرة"
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
                  setSelectedItem(null);
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
                هل أنت متأكد من حذف العنصر الغذائي "{selectedItem?.name}"؟ هذا
                الإجراء لا يمكن التراجع عنه.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel
                onClick={() => {
                  setIsDeleteDialogOpen(false);
                  setSelectedItem(null);
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
