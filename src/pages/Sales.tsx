import { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Eye,
  Trash2,
  ShoppingCart,
  Save,
  Minus,
  X,
  MoreHorizontal,
  Printer,
  DollarSign,
  Calendar,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { dbHelpers } from "@/lib/supabase";
import { formatIQD, formatArabicDate } from "@/lib/utils-enhanced";
import type { SaleWithItems, Product, Subscriber } from "@/types";
import Layout from "@/components/Layout";

interface SaleItem {
  product_id: string;
  quantity: number;
  unit_price: number;
}

export default function Sales() {
  const [sales, setSales] = useState<SaleWithItems[]>([]);
  const [filteredSales, setFilteredSales] = useState<SaleWithItems[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState<SaleWithItems | null>(null);

  // Sale form data
  const [customerType, setCustomerType] = useState<"subscriber" | "guest">(
    "subscriber",
  );
  const [selectedSubscriber, setSelectedSubscriber] = useState<string>("");
  const [customerName, setCustomerName] = useState("");
  const [saleItems, setSaleItems] = useState<SaleItem[]>([]);

  // Mock sales data
  const mockSales: SaleWithItems[] = [
    {
      id: "1",
      subscriber_id: "1",
      customer_name: null,
      total_amount: 45000,
      created_at: "2024-01-15T14:30:00Z",
      updated_at: "2024-01-15T14:30:00Z",
      subscriber: {
        id: "1",
        name: "أحمد محمد علي",
        age: 25,
        weight: 80,
        height: 175,
        phone: "01234567890",
        notes: "",
        subscription_date: "2024-01-15",
        created_at: "2024-01-15T10:00:00Z",
        updated_at: "2024-01-15T10:00:00Z",
      },
      items: [
        {
          id: "1",
          sale_id: "1",
          product_id: "1",
          quantity: 1,
          unit_price: 45000,
          created_at: "2024-01-15T14:30:00Z",
          product: {
            id: "1",
            name: "بروتين واي",
            price: 45000,
            stock: 19,
            description: "مكمل غذائي بروتين واي عالي الجودة",
            created_at: "2024-01-01T00:00:00Z",
            updated_at: "2024-01-15T14:30:00Z",
          },
        },
      ],
    },
    {
      id: "2",
      subscriber_id: null,
      customer_name: "سارة أحمد",
      total_amount: 35000,
      created_at: "2024-01-16T10:15:00Z",
      updated_at: "2024-01-16T10:15:00Z",
      items: [
        {
          id: "2",
          sale_id: "2",
          product_id: "2",
          quantity: 1,
          unit_price: 20000,
          created_at: "2024-01-16T10:15:00Z",
          product: {
            id: "2",
            name: "كرياتين",
            price: 20000,
            stock: 14,
            description: "مكمل الكرياتين لزيادة القوة",
            created_at: "2024-01-01T00:00:00Z",
            updated_at: "2024-01-16T10:15:00Z",
          },
        },
        {
          id: "3",
          sale_id: "2",
          product_id: "3",
          quantity: 1,
          unit_price: 15000,
          created_at: "2024-01-16T10:15:00Z",
          product: {
            id: "3",
            name: "فيتامينات متعددة",
            price: 15000,
            stock: 29,
            description: "فيتامينات ومعادن أساسية",
            created_at: "2024-01-01T00:00:00Z",
            updated_at: "2024-01-16T10:15:00Z",
          },
        },
      ],
    },
  ];

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredSales(sales);
    } else {
      const filtered = sales.filter(
        (sale) =>
          (sale.subscriber?.name &&
            sale.subscriber.name
              .toLowerCase()
              .includes(searchTerm.toLowerCase())) ||
          (sale.customer_name &&
            sale.customer_name
              .toLowerCase()
              .includes(searchTerm.toLowerCase())) ||
          sale.id.toLowerCase().includes(searchTerm.toLowerCase()),
      );
      setFilteredSales(filtered);
    }
  }, [searchTerm, sales]);

  const loadData = async () => {
    try {
      const [productsResponse, subscribersResponse] = await Promise.all([
        dbHelpers.getProducts(),
        dbHelpers.getSubscribers(),
      ]);

      if (productsResponse.data) setProducts(productsResponse.data);
      if (subscribersResponse.data) setSubscribers(subscribersResponse.data);

      // Set mock sales data
      setSales(mockSales);
    } catch (error) {
      toast({
        title: "خطأ في تحميل البيانات",
        description: "لم نتمكن من تحميل البيانات المطلوبة",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addSaleItem = () => {
    setSaleItems((prev) => [
      ...prev,
      { product_id: "", quantity: 1, unit_price: 0 },
    ]);
  };

  const removeSaleItem = (index: number) => {
    setSaleItems((prev) => prev.filter((_, i) => i !== index));
  };

  const updateSaleItem = (
    index: number,
    field: keyof SaleItem,
    value: string | number,
  ) => {
    setSaleItems((prev) =>
      prev.map((item, i) => {
        if (i === index) {
          const updatedItem = { ...item, [field]: value };
          // Auto-update price when product is selected
          if (field === "product_id") {
            const product = products.find((p) => p.id === value);
            if (product) {
              updatedItem.unit_price = product.price;
            }
          }
          return updatedItem;
        }
        return item;
      }),
    );
  };

  const calculateTotal = () => {
    return saleItems.reduce(
      (sum, item) => sum + item.quantity * item.unit_price,
      0,
    );
  };

  const resetForm = () => {
    setCustomerType("subscriber");
    setSelectedSubscriber("");
    setCustomerName("");
    setSaleItems([]);
  };

  const handleCreateSale = async () => {
    if (saleItems.length === 0) {
      toast({
        title: "بيانات ناقصة",
        description: "يرجى إضافة منتجات للفاتورة",
        variant: "destructive",
      });
      return;
    }

    if (customerType === "subscriber" && !selectedSubscriber) {
      toast({
        title: "بيانات ناقصة",
        description: "يرجى اختيار مشترك",
        variant: "destructive",
      });
      return;
    }

    if (customerType === "guest" && !customerName.trim()) {
      toast({
        title: "بيانات ناقصة",
        description: "يرجى إدخال اسم الزبون",
        variant: "destructive",
      });
      return;
    }

    try {
      const newSale: SaleWithItems = {
        id: Date.now().toString(),
        subscriber_id:
          customerType === "subscriber" ? selectedSubscriber : null,
        customer_name: customerType === "guest" ? customerName : null,
        total_amount: calculateTotal(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        subscriber:
          customerType === "subscriber"
            ? subscribers.find((s) => s.id === selectedSubscriber)
            : undefined,
        items: saleItems.map((item, index) => ({
          id: `${Date.now()}-${index}`,
          sale_id: Date.now().toString(),
          ...item,
          created_at: new Date().toISOString(),
          product: products.find((p) => p.id === item.product_id),
        })),
      };

      setSales((prev) => [newSale, ...prev]);
      toast({
        title: "تم إنشاء الفاتورة بنجاح",
        description: `تم إنشاء فاتورة بقيمة ${formatIQD(calculateTotal())}`,
      });
      resetForm();
      setIsAddDialogOpen(false);
    } catch (error) {
      toast({
        title: "خطأ في إنشاء الفاتورة",
        description: "لم نتمكن من إنشاء الفاتورة",
        variant: "destructive",
      });
    }
  };

  const handleDeleteSale = async () => {
    if (!selectedSale) return;

    try {
      setSales((prev) => prev.filter((sale) => sale.id !== selectedSale.id));
      toast({
        title: "تم الحذف بنجاح",
        description: "تم حذف الفاتورة",
      });
      setIsDeleteDialogOpen(false);
      setSelectedSale(null);
    } catch (error) {
      toast({
        title: "خطأ في الحذف",
        description: "لم نتمكن من حذف الفاتورة",
        variant: "destructive",
      });
    }
  };

  const handlePrintSale = (sale: SaleWithItems) => {
    // This would trigger the print functionality
    toast({
      title: "طباعة الفاتورة",
      description: `سيتم طباعة فاتورة #${sale.id}`,
    });
  };

  const formatDate = (dateString: string) => {
    return formatArabicDate(dateString, true);
  };

  const totalRevenue = sales.reduce((sum, sale) => sum + sale.total_amount, 0);
  const todaySales = sales.filter(
    (sale) =>
      new Date(sale.created_at).toDateString() === new Date().toDateString(),
  );
  const subscriberSales = sales.filter((sale) => sale.subscriber_id);

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
            <h1 className="text-3xl font-bold text-foreground">المبيعات</h1>
            <p className="text-muted-foreground">إدارة المبيعات والفواتير</p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gym-button">
                <Plus className="w-5 h-5 ml-2" />
                إنشاء فاتورة جديدة
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>إنشاء فاتورة جديدة</DialogTitle>
                <DialogDescription>
                  اختر العميل والمنتجات لإنشاء فاتورة جديدة
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6">
                {/* Customer Selection */}
                <div className="space-y-4">
                  <Label>نوع العميل</Label>
                  <div className="flex gap-4">
                    <Button
                      type="button"
                      variant={
                        customerType === "subscriber" ? "default" : "outline"
                      }
                      onClick={() => {
                        setCustomerType("subscriber");
                        setCustomerName("");
                      }}
                    >
                      مشترك
                    </Button>
                    <Button
                      type="button"
                      variant={customerType === "guest" ? "default" : "outline"}
                      onClick={() => {
                        setCustomerType("guest");
                        setSelectedSubscriber("");
                      }}
                    >
                      زبون
                    </Button>
                  </div>

                  {customerType === "subscriber" ? (
                    <div className="space-y-2">
                      <Label>اختر المشترك</Label>
                      <Select
                        value={selectedSubscriber}
                        onValueChange={setSelectedSubscriber}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="اختر مشترك" />
                        </SelectTrigger>
                        <SelectContent>
                          {subscribers.map((subscriber) => (
                            <SelectItem
                              key={subscriber.id}
                              value={subscriber.id}
                            >
                              {subscriber.name} - {subscriber.phone}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Label htmlFor="customer-name">اسم الزبون</Label>
                      <Input
                        id="customer-name"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="أدخل اسم الزبون"
                        className="text-right"
                      />
                    </div>
                  )}
                </div>

                <Separator />

                {/* Products */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>المنتجات</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addSaleItem}
                    >
                      <Plus className="w-4 h-4 ml-2" />
                      إضافة منتج
                    </Button>
                  </div>

                  {saleItems.length === 0 ? (
                    <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                      <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-muted-foreground">
                        لم يتم إضافة منتجات بعد
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={addSaleItem}
                        className="mt-2"
                      >
                        إضافة أول منتج
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {saleItems.map((item, index) => (
                        <div
                          key={index}
                          className="flex items-end gap-3 p-3 border rounded-lg"
                        >
                          <div className="flex-1 space-y-2">
                            <Label>المنتج</Label>
                            <Select
                              value={item.product_id}
                              onValueChange={(value) =>
                                updateSaleItem(index, "product_id", value)
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="اختر منتج" />
                              </SelectTrigger>
                              <SelectContent>
                                {products.map((product) => (
                                  <SelectItem
                                    key={product.id}
                                    value={product.id}
                                  >
                                    {product.name} - {formatIQD(product.price)}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="w-20 space-y-2">
                            <Label>الكمية</Label>
                            <Input
                              type="number"
                              value={item.quantity}
                              onChange={(e) =>
                                updateSaleItem(
                                  index,
                                  "quantity",
                                  parseInt(e.target.value) || 1,
                                )
                              }
                              min="1"
                            />
                          </div>

                          <div className="w-24 space-y-2">
                            <Label>السعر</Label>
                            <Input
                              type="number"
                              value={item.unit_price}
                              onChange={(e) =>
                                updateSaleItem(
                                  index,
                                  "unit_price",
                                  parseFloat(e.target.value) || 0,
                                )
                              }
                              step="0.01"
                              min="0"
                            />
                          </div>

                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeSaleItem(index)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}

                      {/* Total */}
                      <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                        <span className="font-semibold">الإجمالي:</span>
                        <span className="text-xl font-bold text-gym-primary">
                          {formatIQD(calculateTotal())}
                        </span>
                      </div>
                    </div>
                  )}
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
                <Button
                  onClick={handleCreateSale}
                  disabled={saleItems.length === 0}
                >
                  <Save className="w-4 h-4 ml-2" />
                  إنشاء الفاتورة
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
                إجمالي المبيعات
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gym-primary">
                {formatIQD(totalRevenue)}
              </div>
              <p className="text-xs text-muted-foreground">إجمالي الإيرادات</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                مبيعات اليوم
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gym-secondary">
                {todaySales.length}
              </div>
              <p className="text-xs text-muted-foreground">فاتورة اليوم</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                مبيعات المشتركين
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gym-accent">
                {subscriberSales.length}
              </div>
              <p className="text-xs text-muted-foreground">مبيعة لمشتركين</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                متوسط الفاتورة
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gym-primary">
                {formatIQD(sales.length > 0 ? totalRevenue / sales.length : 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                متوسط قيمة الفاتورة
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Table */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <CardTitle>قائمة المبيعات</CardTitle>
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="البحث في المبيعات..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10 w-full sm:w-80"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredSales.length === 0 ? (
              <div className="text-center py-16">
                <ShoppingCart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  {searchTerm ? "لا توجد نتائج" : "لا توجد مبيعات"}
                </h3>
                <p className="text-muted-foreground">
                  {searchTerm
                    ? "لم نجد أي مبيعة تطابق بحثك"
                    : "ابدأ بإنشاء أول فاتورة"}
                </p>
                {!searchTerm && (
                  <Button
                    onClick={() => setIsAddDialogOpen(true)}
                    className="gym-button mt-4"
                  >
                    <Plus className="w-4 h-4 ml-2" />
                    إنشاء أول فاتورة
                  </Button>
                )}
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">رقم الفاتورة</TableHead>
                      <TableHead className="text-right">العميل</TableHead>
                      <TableHead className="text-right">المبلغ</TableHead>
                      <TableHead className="text-right">التاريخ</TableHead>
                      <TableHead className="text-center">الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSales.map((sale) => (
                      <TableRow key={sale.id}>
                        <TableCell className="font-medium">
                          #{sale.id}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {sale.subscriber?.name || sale.customer_name}
                            </div>
                            {sale.subscriber && (
                              <Badge variant="secondary" className="text-xs">
                                مشترك
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium text-gym-primary">
                          {formatIQD(sale.total_amount)}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatDate(sale.created_at)}
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
                                onClick={() => handlePrintSale(sale)}
                              >
                                <Printer className="w-4 h-4 ml-2" />
                                طباعة
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedSale(sale);
                                  setIsDeleteDialogOpen(true);
                                }}
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

        {/* Delete Dialog */}
        <AlertDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
              <AlertDialogDescription>
                هل أنت متأكد من حذف الفاتورة #{selectedSale?.id}؟ هذا الإجراء لا
                يمكن التراجع عنه.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel
                onClick={() => {
                  setIsDeleteDialogOpen(false);
                  setSelectedSale(null);
                }}
              >
                إلغاء
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteSale}
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
