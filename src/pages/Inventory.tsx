import { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Package,
  Save,
  AlertTriangle,
  MoreHorizontal,
  TrendingUp,
  TrendingDown,
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
import {
  formatIQD,
  formatArabicDate,
  getStockStatus,
} from "@/lib/utils-enhanced";
import type { Product, ProductFormData } from "@/types";
import Layout from "@/components/Layout";

export default function Inventory() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    price: 0,
    stock: 0,
    description: "",
  });

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter(
        (product) =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (product.description &&
            product.description
              .toLowerCase()
              .includes(searchTerm.toLowerCase())),
      );
      setFilteredProducts(filtered);
    }
  }, [searchTerm, products]);

  const loadProducts = async () => {
    try {
      const response = await dbHelpers.getProducts();
      if (response.data) {
        setProducts(response.data);
      }
    } catch (error) {
      toast({
        title: "خطأ في تحميل البيانات",
        description: "لم نتمكن من تحميل قائمة المنتجات",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (
    field: keyof ProductFormData,
    value: string | number,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const resetForm = () => {
    setFormData({ name: "", price: 0, stock: 0, description: "" });
  };

  const handleAdd = async () => {
    if (!formData.name.trim() || formData.price <= 0) {
      toast({
        title: "بيانات ناقصة",
        description: "يرجى إدخال اسم المنتج وسعر صحيح",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await dbHelpers.createProduct(formData);
      if (response.data?.[0]) {
        setProducts((prev) => [...prev, response.data[0]]);
        toast({
          title: "تمت الإضافة بنجاح",
          description: `تم إضافة المنتج ${formData.name}`,
        });
        resetForm();
        setIsAddDialogOpen(false);
      }
    } catch (error) {
      toast({
        title: "خطأ في الإضافة",
        description: "لم نتمكن من إضافة المنتج",
        variant: "destructive",
      });
    }
  };

  const handleEdit = async () => {
    if (!selectedProduct || !formData.name.trim() || formData.price <= 0) {
      toast({
        title: "بيانات ناقصة",
        description: "يرجى إدخال اسم المنتج وسعر صحيح",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await dbHelpers.updateProduct(
        selectedProduct.id,
        formData,
      );
      if (response.data?.[0]) {
        setProducts((prev) =>
          prev.map((product) =>
            product.id === selectedProduct.id ? response.data[0] : product,
          ),
        );
        toast({
          title: "تم التحديث بنجاح",
          description: `تم تحديث المنتج ${formData.name}`,
        });
        resetForm();
        setIsEditDialogOpen(false);
        setSelectedProduct(null);
      }
    } catch (error) {
      toast({
        title: "خطأ في التحديث",
        description: "لم نتمكن من تحديث المنتج",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (!selectedProduct) return;

    try {
      await dbHelpers.deleteProduct(selectedProduct.id);
      setProducts((prev) =>
        prev.filter((product) => product.id !== selectedProduct.id),
      );
      toast({
        title: "تم الحذف بنجاح",
        description: `تم حذف المنتج ${selectedProduct.name}`,
      });
      setIsDeleteDialogOpen(false);
      setSelectedProduct(null);
    } catch (error) {
      toast({
        title: "خطأ في الحذف",
        description: "لم نتمكن من حذف المنتج",
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (product: Product) => {
    setSelectedProduct(product);
    setFormData({
      name: product.name,
      price: product.price,
      stock: product.stock,
      description: product.description || "",
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (product: Product) => {
    setSelectedProduct(product);
    setIsDeleteDialogOpen(true);
  };

  const formatDate = (dateString: string) => {
    return formatArabicDate(dateString);
  };

  const totalValue = products.reduce(
    (sum, product) => sum + product.price * product.stock,
    0,
  );
  const lowStockProducts = products.filter((p) => p.stock <= 5);
  const outOfStockProducts = products.filter((p) => p.stock <= 0);

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
            <h1 className="text-3xl font-bold text-foreground">المخزن</h1>
            <p className="text-muted-foreground">إدارة المنتجات والمخزون</p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gym-button">
                <Plus className="w-5 h-5 ml-2" />
                إضافة منتج جديد
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>إضافة منتج جديد</DialogTitle>
                <DialogDescription>
                  أضف منتج جديد إلى مخزون الصالة
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="add-name">اسم المنتج *</Label>
                  <Input
                    id="add-name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="مثل: بروتين واي"
                    className="text-right"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="add-price">السعر (د.ع) *</Label>
                    <Input
                      id="add-price"
                      type="number"
                      value={formData.price || ""}
                      onChange={(e) =>
                        handleInputChange(
                          "price",
                          parseFloat(e.target.value) || 0,
                        )
                      }
                      placeholder="450"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="add-stock">الكمية</Label>
                    <Input
                      id="add-stock"
                      type="number"
                      value={formData.stock || ""}
                      onChange={(e) =>
                        handleInputChange(
                          "stock",
                          parseInt(e.target.value) || 0,
                        )
                      }
                      placeholder="20"
                      min="0"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="add-description">الوصف</Label>
                  <Textarea
                    id="add-description"
                    value={formData.description}
                    onChange={(e) =>
                      handleInputChange("description", e.target.value)
                    }
                    placeholder="مكمل غذائي بروتين واي عالي الجودة"
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                إجمالي المنتجات
              </CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gym-primary">
                {products.length}
              </div>
              <p className="text-xs text-muted-foreground">منتج في المخزن</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                قيمة المخزون
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gym-secondary">
                {formatIQD(totalValue)}
              </div>
              <p className="text-xs text-muted-foreground">إجمالي القيمة</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">مخزون قليل</CardTitle>
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {lowStockProducts.length}
              </div>
              <p className="text-xs text-muted-foreground">منتج يحتاج تجديد</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">نفد المخزون</CardTitle>
              <TrendingDown className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">
                {outOfStockProducts.length}
              </div>
              <p className="text-xs text-muted-foreground">منتج غير متوفر</p>
            </CardContent>
          </Card>
        </div>

        {/* Low Stock Alert */}
        {lowStockProducts.length > 0 && (
          <Card className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
                <AlertTriangle className="w-5 h-5" />
                تنبيه: منتجات تحتاج إعادة تخزين
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {lowStockProducts.map((product) => (
                  <Badge
                    key={product.id}
                    variant="secondary"
                    className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                  >
                    {product.name} ({product.stock} متبقي)
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Search and Table */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <CardTitle>قائمة المنتجات</CardTitle>
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="البحث في المنتجات..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10 w-full sm:w-80"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredProducts.length === 0 ? (
              <div className="text-center py-16">
                <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  {searchTerm ? "لا توجد نتائج" : "لا توجد منتجات"}
                </h3>
                <p className="text-muted-foreground">
                  {searchTerm
                    ? "لم نجد أي منتج يطابق بحثك"
                    : "ابدأ بإضافة منتجات جديدة للمخزن"}
                </p>
                {!searchTerm && (
                  <Button
                    onClick={() => setIsAddDialogOpen(true)}
                    className="gym-button mt-4"
                  >
                    <Plus className="w-4 h-4 ml-2" />
                    إضافة أول منتج
                  </Button>
                )}
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">اسم المنتج</TableHead>
                      <TableHead className="text-right">السعر</TableHead>
                      <TableHead className="text-right">المخزون</TableHead>
                      <TableHead className="text-right">الحالة</TableHead>
                      <TableHead className="text-right">
                        تاريخ الإضافة
                      </TableHead>
                      <TableHead className="text-center">الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProducts.map((product) => {
                      const stockStatus = getStockStatus(product.stock);
                      return (
                        <TableRow key={product.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{product.name}</div>
                              {product.description && (
                                <div className="text-sm text-muted-foreground">
                                  {product.description.length > 40
                                    ? `${product.description.substring(0, 40)}...`
                                    : product.description}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="font-medium text-gym-primary">
                            {formatIQD(product.price)}
                          </TableCell>
                          <TableCell>{product.stock}</TableCell>
                          <TableCell>
                            <Badge variant={stockStatus.variant}>
                              {stockStatus.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {formatDate(product.created_at)}
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
                                  onClick={() => openEditDialog(product)}
                                >
                                  <Edit className="w-4 h-4 ml-2" />
                                  تعديل
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => openDeleteDialog(product)}
                                  className="text-destructive"
                                >
                                  <Trash2 className="w-4 h-4 ml-2" />
                                  حذف
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })}
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
              <DialogTitle>تعديل المنتج</DialogTitle>
              <DialogDescription>
                تعديل بيانات المنتج "{selectedProduct?.name}"
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">اسم المنتج *</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="مثل: بروتين واي"
                  className="text-right"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-price">السعر (د.ع) *</Label>
                  <Input
                    id="edit-price"
                    type="number"
                    value={formData.price || ""}
                    onChange={(e) =>
                      handleInputChange(
                        "price",
                        parseFloat(e.target.value) || 0,
                      )
                    }
                    placeholder="450"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-stock">الكمية</Label>
                  <Input
                    id="edit-stock"
                    type="number"
                    value={formData.stock || ""}
                    onChange={(e) =>
                      handleInputChange("stock", parseInt(e.target.value) || 0)
                    }
                    placeholder="20"
                    min="0"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">الوصف</Label>
                <Textarea
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  placeholder="مكمل غذائي بروتين واي عالي الج��دة"
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
                  setSelectedProduct(null);
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
                هل أنت متأكد من حذف المنتج "{selectedProduct?.name}"؟ هذا
                الإجراء لا يمكن التراجع عنه.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel
                onClick={() => {
                  setIsDeleteDialogOpen(false);
                  setSelectedProduct(null);
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
