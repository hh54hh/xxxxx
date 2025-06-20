import { createClient } from "@supabase/supabase-js";
import type {
  Subscriber,
  SubscriberFormData,
  SubscriberWithGroups,
  CoursePoint,
  CourseFormData,
  DietItem,
  DietFormData,
  Product,
  ProductFormData,
  Sale,
  SaleFormData,
  SaleWithItems,
} from "@/types";

// الحصول على معلومات الاتصال من متغيرات البيئة
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

// إنشاء اتصال مع Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// نوع الاستجابة من Supabase
interface SupabaseResponse<T> {
  data: T | null;
  error: Error | null;
}

// Helper function to extract error message
function getErrorMessage(error: any): string {
  if (typeof error === "string") return error;
  if (error?.message) return error.message;
  if (error?.error_description) return error.error_description;
  if (error?.details) return error.details;
  return error?.toString() || "خطأ غير معروف";
}

// Helper function to log and format errors
function handleDatabaseError(operation: string, error: any): Error {
  const message = getErrorMessage(error);
  console.error(`❌ خطأ في ${operation}:`, message);

  // تحسين رسائل الخطأ للمستخدم
  if (message.includes("does not exist")) {
    return new Error(
      "الجدول المطلوب غير موجود في قاعدة البيانات. يرجى إنشاء الجداول أولاً.",
    );
  }
  if (message.includes("permission denied")) {
    return new Error("ليس لديك صلاحية للوصول إلى هذه البيانات.");
  }
  if (message.includes("connection")) {
    return new Error("خطأ في الاتصال بقاعدة البيانات. تحقق من الإنترنت.");
  }

  return new Error(message);
}

/**
 * مساعدات قاعدة البيانات للعمل مع Supabase
 */
export const dbHelpers = {
  // ==================== العمليات على المشتركين ====================

  async getSubscribers(): Promise<SupabaseResponse<Subscriber[]>> {
    try {
      console.log("🔍 جلب قائمة المشتركين...");

      const { data, error } = await supabase
        .from("subscribers")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        throw handleDatabaseError("جلب المشتركين", error);
      }

      console.log(`✅ تم جلب ${data?.length || 0} مشترك`);
      return { data: data || [], error: null };
    } catch (error: any) {
      return { data: null, error: handleDatabaseError("جلب المشتركين", error) };
    }
  },

  async getSubscriberWithGroups(
    id: string,
  ): Promise<SupabaseResponse<SubscriberWithGroups>> {
    try {
      console.log("🔍 جلب بيانات المشترك:", id);

      // جلب بيانات المشترك
      const { data: subscriber, error: subscriberError } = await supabase
        .from("subscribers")
        .select("*")
        .eq("id", id)
        .single();

      if (subscriberError) {
        throw handleDatabaseError("جلب بيانات المشترك", subscriberError);
      }

      if (!subscriber) {
        throw new Error("لم يتم العثور على المشترك");
      }

      console.log("✅ تم جلب بيانات المشترك:", subscriber.name);

      // محاولة جلب المجموعات (مع معالجة حالة عدم وجود الجداول)
      let groups: any[] = [];

      try {
        console.log("🔍 جلب المجموعات للمشترك:", id);

        // جلب المجموعات مع عناصرها باستخدام الجداول الجديدة
        const { data: groupsData, error: groupsError } = await supabase
          .from("groups")
          .select("*")
          .eq("subscriber_id", id);

        if (groupsError) {
          throw groupsError;
        }

        // جلب عناصر كل مجموعة مع تفاصيلها
        const groupsWithItems = await Promise.all(
          (groupsData || []).map(async (group) => {
            let items: any[] = [];

            if (group.type === "course") {
              // جلب العناصر التدريبية
              const { data: courseItems } = await supabase
                .from("group_course_items")
                .select(
                  `
                  *,
                  course_points (*)
                `,
                )
                .eq("group_id", group.id);

              items = (courseItems || []).map((item) => ({
                id: item.id,
                group_id: item.group_id,
                item_id: item.course_point_id,
                created_at: item.created_at,
                course_point: item.course_points,
                diet_item: null,
              }));
            } else if (group.type === "diet") {
              // جلب العناصر الغذائية
              const { data: dietItems } = await supabase
                .from("group_diet_items")
                .select(
                  `
                  *,
                  diet_items (*)
                `,
                )
                .eq("group_id", group.id);

              items = (dietItems || []).map((item) => ({
                id: item.id,
                group_id: item.group_id,
                item_id: item.diet_item_id,
                created_at: item.created_at,
                course_point: null,
                diet_item: item.diet_items,
              }));
            }

            return {
              ...group,
              group_items: items,
            };
          }),
        );

        groups = groupsWithItems;

        if (groupsError) {
          const errorMessage = getErrorMessage(groupsError);
          console.warn("⚠️ تحذير في جلب المجموعات:", errorMessage);
          // إذا كان الخطأ بسبب عدم وجود الجداول، نتجاهله ونكمل
          if (errorMessage.includes("does not exist")) {
            console.warn(
              "⚠️ جدول المجموعات غير موجود - يرجى تشغيل سكريبت fix-groups-problem.sql",
            );
            groups = [];
          } else {
            console.error(
              "تفاصيل خطأ المجموعات:",
              JSON.stringify(
                {
                  message: errorMessage,
                  code: groupsError?.code,
                  details: groupsError?.details,
                  hint: groupsError?.hint,
                },
                null,
                2,
              ),
            );
            throw groupsError;
          }
        } else {
          groups = groupsData || [];
          console.log(`✅ تم جلب ${groups.length} مجموعة`);

          // تفاصيل المجموعات
          groups.forEach((group, index) => {
            console.log(`📋 مجموعة ${index + 1}:`, {
              id: group.id,
              type: group.type,
              title: group.title,
              items: group.group_items?.length || 0,
            });
          });
        }
      } catch (groupsError: any) {
        const errorMessage = getErrorMessage(groupsError);
        console.error("❌ خطأ في جلب المجموعات:", errorMessage);
        console.warn("⚠️ سيتم استخدام قائمة فارغة للمجموعات");
        console.error(
          "تفاصيل الخطأ:",
          JSON.stringify(
            {
              message: errorMessage,
              code: groupsError?.code,
              details: groupsError?.details,
              hint: groupsError?.hint,
            },
            null,
            2,
          ),
        );
        groups = [];
      }

      // تجميع البيانات
      const subscriberWithGroups: SubscriberWithGroups = {
        ...subscriber,
        groups: groups.map((group) => ({
          ...group,
          items:
            group.group_items?.map((item: any) => ({
              ...item,
              course_point: item.course_points,
              diet_item: item.diet_items,
            })) || [],
        })),
      };

      console.log("✅ تم تجميع البيانات بنجاح");
      return { data: subscriberWithGroups, error: null };
    } catch (error: any) {
      return {
        data: null,
        error: handleDatabaseError("جلب تفاصيل المشترك", error),
      };
    }
  },

  async createSubscriber(
    formData: SubscriberFormData,
  ): Promise<SupabaseResponse<Subscriber[]>> {
    try {
      console.log("📝 إنشاء مشترك جديد:", formData.name);

      const subscriberData = {
        ...formData,
        subscription_date: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from("subscribers")
        .insert([subscriberData])
        .select();

      if (error) {
        throw handleDatabaseError("إنشاء مشترك", error);
      }

      console.log("✅ تم إنشاء المشترك بنجاح");
      return { data: data || [], error: null };
    } catch (error: any) {
      return { data: null, error: handleDatabaseError("إنشاء مشترك", error) };
    }
  },

  async updateSubscriber(
    id: string,
    formData: SubscriberFormData,
  ): Promise<SupabaseResponse<Subscriber[]>> {
    try {
      console.log("📝 تحديث المشترك:", id);

      const updateData = {
        ...formData,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from("subscribers")
        .update(updateData)
        .eq("id", id)
        .select();

      if (error) {
        throw handleDatabaseError("تحديث المشترك", error);
      }

      console.log("✅ تم تحديث المشترك بنجاح");
      return { data: data || [], error: null };
    } catch (error: any) {
      return { data: null, error: handleDatabaseError("تحديث المشترك", error) };
    }
  },

  async checkSubscriberRelations(id: string): Promise<
    SupabaseResponse<{
      sales: number;
      groups: number;
      canDelete: boolean;
    }>
  > {
    try {
      console.log("🔍 فحص البيانات المرتبطة بالمشترك:", id);

      // فحص المبيعات
      const { data: sales, error: salesError } = await supabase
        .from("sales")
        .select("id")
        .eq("subscriber_id", id);

      // فحص المجموعات
      const { data: groups, error: groupsError } = await supabase
        .from("groups")
        .select("id")
        .eq("subscriber_id", id);

      const salesCount = sales?.length || 0;
      const groupsCount = groups?.length || 0;

      console.log(
        `📊 المبيعات المرتبطة: ${salesCount}, المجموعات: ${groupsCount}`,
      );

      return {
        data: {
          sales: salesCount,
          groups: groupsCount,
          canDelete: true, // يمكن الحذف دائماً مع التنظيف المناسب
        },
        error: null,
      };
    } catch (error: any) {
      return {
        data: null,
        error: handleDatabaseError("فحص البيانات المرتبطة", error),
      };
    }
  },

  async deleteSubscriber(id: string): Promise<SupabaseResponse<void>> {
    try {
      console.log("🗑️ التحقق من إمكانية حذف المشترك:", id);

      // أولاً، تحقق من وجود مبيعات مرتبطة بالمشترك
      const { data: relatedSales, error: salesCheckError } = await supabase
        .from("sales")
        .select("id")
        .eq("subscriber_id", id);

      if (salesCheckError) {
        console.warn("⚠️ خطأ في فحص المبيعات:", salesCheckError.message);
      }

      // إذا كان هناك مبيعات مرتبطة، نقوم بتحديث subscriber_id إلى null
      if (relatedSales && relatedSales.length > 0) {
        console.log(
          `📋 تم العثور على ${relatedSales.length} مبيعة مرتبطة، سيتم فصلها عن المشترك`,
        );

        const { error: updateSalesError } = await supabase
          .from("sales")
          .update({ subscriber_id: null })
          .eq("subscriber_id", id);

        if (updateSalesError) {
          console.warn("⚠️ خطأ في تحديث المبيعات:", updateSalesError.message);
        } else {
          console.log("✅ تم فصل ال��بيعات عن المشترك");
        }
      }

      // الآن حذف المجموعات المرتبطة (groups و group_items)
      const { error: groupsDeleteError } = await supabase
        .from("groups")
        .delete()
        .eq("subscriber_id", id);

      if (groupsDeleteError) {
        console.warn("⚠️ خطأ في حذف المجموعات:", groupsDeleteError.message);
      } else {
        console.log("✅ تم حذف المجموعات المرتبطة");
      }

      // أخيراً، حذف المشترك
      const { error } = await supabase
        .from("subscribers")
        .delete()
        .eq("id", id);

      if (error) {
        // إذا كان الخطأ بسبب foreign key constraint، نعطي رسالة واضحة
        if (error.message.includes("foreign key constraint")) {
          throw new Error(
            "لا يمكن حذف المشترك لأنه مرتبط ببيانات أخرى. يرجى المحاولة مرة أخرى أو الاتصال بالدعم الفني.",
          );
        }
        throw handleDatabaseError("حذف المشترك", error);
      }

      console.log("✅ تم حذف المشترك بنجاح");
      return { data: null, error: null };
    } catch (error: any) {
      console.error("❌ فشل في حذف المشترك:", error);

      // تحسين رسالة الخطأ للمستخدم
      if (
        error.message.includes("foreign key constraint") ||
        error.message.includes("violates")
      ) {
        return {
          data: null,
          error: new Error(
            "لا يمكن حذف المشترك لأنه مرتبط بمبيعات أو بيانات أخرى. تم تحديث قاع��ة البيانات، يرجى المحاولة مرة أخرى.",
          ),
        };
      }

      return { data: null, error: handleDatabaseError("حذف المشترك", error) };
    }
  },

  // ==================== العمليات على نقاط التمرين ====================

  async getCoursePoints(): Promise<SupabaseResponse<CoursePoint[]>> {
    try {
      console.log("🔍 جلب نقاط التمرين...");

      const { data, error } = await supabase
        .from("course_points")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        throw handleDatabaseError("جلب نقاط التمرين", error);
      }

      console.log(`✅ تم جلب ${data?.length || 0} نقطة تمرين`);
      return { data: data || [], error: null };
    } catch (error: any) {
      return {
        data: null,
        error: handleDatabaseError("جلب نقاط التمرين", error),
      };
    }
  },

  async createCoursePoint(
    formData: CourseFormData,
  ): Promise<SupabaseResponse<CoursePoint[]>> {
    try {
      console.log("📝 إنشاء نقطة تمرين:", formData.name);

      const courseData = {
        ...formData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from("course_points")
        .insert([courseData])
        .select();

      if (error) {
        throw handleDatabaseError("إنشاء نقطة تمرين", error);
      }

      console.log("✅ تم إنشاء نقطة التمرين بنجاح");
      return { data: data || [], error: null };
    } catch (error: any) {
      return {
        data: null,
        error: handleDatabaseError("إنشاء نقطة تمرين", error),
      };
    }
  },

  async updateCoursePoint(
    id: string,
    formData: CourseFormData,
  ): Promise<SupabaseResponse<CoursePoint[]>> {
    try {
      console.log("📝 تحديث نقطة التمرين:", id);

      const updateData = {
        ...formData,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from("course_points")
        .update(updateData)
        .eq("id", id)
        .select();

      if (error) {
        throw handleDatabaseError("تحديث نقطة التمرين", error);
      }

      console.log("✅ تم تحديث نقطة التمرين بنجاح");
      return { data: data || [], error: null };
    } catch (error: any) {
      return {
        data: null,
        error: handleDatabaseError("تحديث نقطة التمرين", error),
      };
    }
  },

  async deleteCoursePoint(id: string): Promise<SupabaseResponse<void>> {
    try {
      console.log("🗑️ حذف نقطة التمرين:", id);

      const { error } = await supabase
        .from("course_points")
        .delete()
        .eq("id", id);

      if (error) {
        throw handleDatabaseError("حذف نقطة التمرين", error);
      }

      console.log("✅ تم حذف نقطة التمرين بنجاح");
      return { data: null, error: null };
    } catch (error: any) {
      return {
        data: null,
        error: handleDatabaseError("حذف نقطة التمرين", error),
      };
    }
  },

  // ==================== الع��ليات على عناصر النظام الغذائي ====================

  async getDietItems(): Promise<SupabaseResponse<DietItem[]>> {
    try {
      console.log("🔍 جلب عناصر النظام الغذائي...");

      const { data, error } = await supabase
        .from("diet_items")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        throw handleDatabaseError("جلب عناصر النظام الغذائي", error);
      }

      console.log(`✅ تم جلب ${data?.length || 0} عنصر غذائي`);
      return { data: data || [], error: null };
    } catch (error: any) {
      return {
        data: null,
        error: handleDatabaseError("جلب عناصر النظام الغذائي", error),
      };
    }
  },

  async createDietItem(
    formData: DietFormData,
  ): Promise<SupabaseResponse<DietItem[]>> {
    try {
      console.log("📝 إنشاء عنصر غذائي:", formData.name);

      const dietData = {
        ...formData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from("diet_items")
        .insert([dietData])
        .select();

      if (error) {
        throw handleDatabaseError("إ��شاء عنصر غذائي", error);
      }

      console.log("✅ تم إنشاء العنصر الغذائي بنجاح");
      return { data: data || [], error: null };
    } catch (error: any) {
      return {
        data: null,
        error: handleDatabaseError("إنشاء عنصر غذائي", error),
      };
    }
  },

  async updateDietItem(
    id: string,
    formData: DietFormData,
  ): Promise<SupabaseResponse<DietItem[]>> {
    try {
      console.log("📝 تحديث العنصر الغذائي:", id);

      const updateData = {
        ...formData,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from("diet_items")
        .update(updateData)
        .eq("id", id)
        .select();

      if (error) {
        throw handleDatabaseError("تحديث العنصر الغذائي", error);
      }

      console.log("✅ تم تحديث العنصر الغذائي بنجاح");
      return { data: data || [], error: null };
    } catch (error: any) {
      return {
        data: null,
        error: handleDatabaseError("تحديث العنصر الغذائي", error),
      };
    }
  },

  async deleteDietItem(id: string): Promise<SupabaseResponse<void>> {
    try {
      console.log("🗑️ حذف ال��نصر الغذائي:", id);

      const { error } = await supabase.from("diet_items").delete().eq("id", id);

      if (error) {
        throw handleDatabaseError("حذف العنصر الغذائي", error);
      }

      console.log("✅ تم حذف العنصر الغذائي بنجاح");
      return { data: null, error: null };
    } catch (error: any) {
      return {
        data: null,
        error: handleDatabaseError("حذف العنصر الغذائي", error),
      };
    }
  },

  // ==================== العمليات على المنتجات ====================

  async getProducts(): Promise<SupabaseResponse<Product[]>> {
    try {
      console.log("🔍 جلب المنتجات...");

      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        throw handleDatabaseError("جلب المنتجات", error);
      }

      console.log(`✅ تم جلب ${data?.length || 0} منتج`);
      return { data: data || [], error: null };
    } catch (error: any) {
      return { data: null, error: handleDatabaseError("جلب المنتجات", error) };
    }
  },

  async createProduct(
    formData: ProductFormData,
  ): Promise<SupabaseResponse<Product[]>> {
    try {
      console.log("📝 إنشاء منتج:", formData.name);

      const productData = {
        ...formData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from("products")
        .insert([productData])
        .select();

      if (error) {
        throw handleDatabaseError("��نشاء منتج", error);
      }

      console.log("✅ تم إنشاء المنتج بنجاح");
      return { data: data || [], error: null };
    } catch (error: any) {
      return { data: null, error: handleDatabaseError("إنشاء منتج", error) };
    }
  },

  async updateProduct(
    id: string,
    formData: ProductFormData,
  ): Promise<SupabaseResponse<Product[]>> {
    try {
      console.log("📝 تحديث المنتج:", id);

      const updateData = {
        ...formData,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from("products")
        .update(updateData)
        .eq("id", id)
        .select();

      if (error) {
        throw handleDatabaseError("تحديث المنتج", error);
      }

      console.log("✅ تم تحديث المنتج بنجاح");
      return { data: data || [], error: null };
    } catch (error: any) {
      return { data: null, error: handleDatabaseError("تحديث المنتج", error) };
    }
  },

  async deleteProduct(id: string): Promise<SupabaseResponse<void>> {
    try {
      console.log("🗑�� حذف المنتج:", id);

      const { error } = await supabase.from("products").delete().eq("id", id);

      if (error) {
        throw handleDatabaseError("حذف المنتج", error);
      }

      console.log("✅ تم حذف المنتج بنجاح");
      return { data: null, error: null };
    } catch (error: any) {
      return { data: null, error: handleDatabaseError("حذف المنتج", error) };
    }
  },

  // ==================== العمليات على المبيعات ====================

  async getSales(): Promise<SupabaseResponse<SaleWithItems[]>> {
    try {
      console.log("🔍 جلب المبيعات...");

      const { data, error } = await supabase
        .from("sales")
        .select(
          `
          *,
          sale_items (
            *,
            products (*)
          ),
          subscribers (*)
        `,
        )
        .order("created_at", { ascending: false });

      if (error) {
        throw handleDatabaseError("جلب المبيعات", error);
      }

      // تحويل البيانات لتتطابق مع النوع المطلوب
      const salesWithItems: SaleWithItems[] = (data || []).map((sale) => ({
        ...sale,
        items:
          sale.sale_items?.map((item: any) => ({
            ...item,
            product: item.products,
          })) || [],
        subscriber: sale.subscribers,
      }));

      console.log(`✅ تم جلب ${salesWithItems.length} مبيعة`);
      return { data: salesWithItems, error: null };
    } catch (error: any) {
      return { data: null, error: handleDatabaseError("جلب المبيعات", error) };
    }
  },

  async createSale(
    formData: SaleFormData,
  ): Promise<SupabaseResponse<SaleWithItems[]>> {
    try {
      console.log("📝 إنشاء مبيعة جديدة");

      // حساب المجموع الكلي
      const totalAmount = formData.items.reduce(
        (sum, item) => sum + item.quantity * item.unit_price,
        0,
      );

      // إنشاء بيانات المبيعة
      const saleData = {
        subscriber_id: formData.subscriber_id || null,
        customer_name: formData.customer_name || null,
        total_amount: totalAmount,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // إنشاء المبيعة
      const { data: saleResult, error: saleError } = await supabase
        .from("sales")
        .insert([saleData])
        .select()
        .single();

      if (saleError) {
        throw handleDatabaseError("إنشاء المبيعة", saleError);
      }

      // إنشاء عناصر المبيعة
      const saleItems = formData.items.map((item) => ({
        sale_id: saleResult.id,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        created_at: new Date().toISOString(),
      }));

      const { error: itemsError } = await supabase
        .from("sale_items")
        .insert(saleItems);

      if (itemsError) {
        throw handleDatabaseError("إنشاء عناصر المبيعة", itemsError);
      }

      // تحديث مخزون المنتجات
      for (const item of formData.items) {
        try {
          const { error: stockError } = await supabase.rpc(
            "update_product_stock",
            {
              product_id: item.product_id,
              quantity_sold: item.quantity,
            },
          );

          if (stockError) {
            console.warn("⚠️ تحذير: لم يتم تحديث المخزون:", stockError.message);
          }
        } catch (stockError) {
          console.warn("⚠️ تحذير: خطأ في تحديث المخزون:", stockError);
        }
      }

      // جلب البيانات الكاملة للمبيعة
      const { data: fullSale, error: fetchError } = await supabase
        .from("sales")
        .select(
          `
          *,
          sale_items (
            *,
            products (*)
          ),
          subscribers (*)
        `,
        )
        .eq("id", saleResult.id)
        .single();

      if (fetchError) {
        throw handleDatabaseError("جلب بيانات المبيعة", fetchError);
      }

      const saleWithItems: SaleWithItems = {
        ...fullSale,
        items:
          fullSale.sale_items?.map((item: any) => ({
            ...item,
            product: item.products,
          })) || [],
        subscriber: fullSale.subscribers,
      };

      console.log("✅ تم إنشاء المبيعة بنجاح");
      return { data: [saleWithItems], error: null };
    } catch (error: any) {
      return { data: null, error: handleDatabaseError("إنشاء المبيعة", error) };
    }
  },

  // ==================== العمليات على المجموعات ====================

  async createGroup(data: {
    subscriber_id: string;
    type: "course" | "diet";
    title?: string;
  }): Promise<SupabaseResponse<any[]>> {
    try {
      console.log("📝 إنشاء مجموعة:", data.type);

      const groupData = {
        ...data,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data: result, error } = await supabase
        .from("groups")
        .insert([groupData])
        .select();

      if (error) {
        throw handleDatabaseError("إنشاء المجموعة", error);
      }

      console.log("✅ تم إنشاء المجموعة بنجاح");
      return { data: result || [], error: null };
    } catch (error: any) {
      return {
        data: null,
        error: handleDatabaseError("إنشاء المجموعة", error),
      };
    }
  },

  async createGroupItems(data: {
    group_id: string;
    item_ids: string[];
  }): Promise<SupabaseResponse<any[]>> {
    try {
      console.log("📝 إنشاء عناصر المجموعة:", data.item_ids.length);

      const groupItems = data.item_ids.map((item_id) => ({
        group_id: data.group_id,
        item_id,
        created_at: new Date().toISOString(),
      }));

      const { data: result, error } = await supabase
        .from("group_items")
        .insert(groupItems)
        .select();

      if (error) {
        throw handleDatabaseError("إنشاء عناصر المجموعة", error);
      }

      console.log("✅ تم إنشاء عناصر المجموعة بنجاح");
      return { data: result || [], error: null };
    } catch (error: any) {
      return {
        data: null,
        error: handleDatabaseError("إنشاء عناصر المجموعة", error),
      };
    }
  },

  async createSubscriberWithGroups(data: {
    subscriber: any;
    courseGroups: Array<{ title?: string; selectedCourses: string[] }>;
    dietGroups: Array<{ title?: string; selectedItems: string[] }>;
  }): Promise<SupabaseResponse<any>> {
    try {
      console.log("📝 إنشاء مشترك مع المجموعات:", data.subscriber.name);
      console.log("📋 مجموعات الكورسات:", data.courseGroups);
      console.log("📋 مجموعات الأنظمة الغذائية:", data.dietGroups);

      // إنشاء المشترك
      const subscriberResponse = await this.createSubscriber(data.subscriber);

      if (subscriberResponse.error || !subscriberResponse.data?.[0]) {
        throw subscriberResponse.error || new Error("فشل في إنشاء المشترك");
      }

      const subscriberId = subscriberResponse.data[0].id;
      console.log("✅ تم إنشاء المشترك، ID:", subscriberId);

      // إنشاء مجموعات الكورسات
      let courseGroupsCreated = 0;
      for (const [index, courseGroup] of data.courseGroups.entries()) {
        if (courseGroup.selectedCourses.length > 0) {
          console.log(
            `📝 إنشاء مجموعة كورسات ${index + 1}:`,
            courseGroup.title,
            "عدد الكورسات:",
            courseGroup.selectedCourses.length,
          );

          const groupResponse = await this.createGroup({
            subscriber_id: subscriberId,
            type: "course",
            title: courseGroup.title || `مجموعة تمارين ${index + 1}`,
          });

          if (groupResponse.error) {
            console.error(
              "❌ خطأ في إنشاء مجموعة الكورسات:",
              groupResponse.error,
            );
            throw groupResponse.error;
          }

          if (groupResponse.data?.[0]) {
            const groupId = groupResponse.data[0].id;
            console.log("✅ تم إنشاء مجموعة الكورسات، ID:", groupId);

            const itemsResponse = await this.createGroupItems({
              group_id: groupId,
              item_ids: courseGroup.selectedCourses,
            });

            if (itemsResponse.error) {
              console.error(
                "❌ خطأ في إنشاء عناصر مجموعة الكورسات:",
                itemsResponse.error,
              );
              throw itemsResponse.error;
            }

            console.log(
              `✅ تم إضافة ${courseGroup.selectedCourses.length} كورس للمجموعة`,
            );
            courseGroupsCreated++;
          }
        } else {
          console.log(`⚠️ مجموعة كورس��ت ${index + 1} فارغة، تم تجاهلها`);
        }
      }

      // إنشاء مجموعات الأنظمة الغذائية
      let dietGroupsCreated = 0;
      for (const [index, dietGroup] of data.dietGroups.entries()) {
        if (dietGroup.selectedItems.length > 0) {
          console.log(
            `📝 إنشاء مجموعة أنظمة غذائية ${index + 1}:`,
            dietGroup.title,
            "عدد العناصر:",
            dietGroup.selectedItems.length,
          );

          const groupResponse = await this.createGroup({
            subscriber_id: subscriberId,
            type: "diet",
            title: dietGroup.title || `نظام غذائي ${index + 1}`,
          });

          if (groupResponse.error) {
            console.error(
              "❌ خطأ في إنشاء مجموعة الأنظمة الغذائية:",
              groupResponse.error,
            );
            throw groupResponse.error;
          }

          if (groupResponse.data?.[0]) {
            const groupId = groupResponse.data[0].id;
            console.log("✅ تم إنشاء مجموعة الأنظمة الغذائية، ID:", groupId);

            const itemsResponse = await this.createGroupItems({
              group_id: groupId,
              item_ids: dietGroup.selectedItems,
            });

            if (itemsResponse.error) {
              console.error(
                "❌ خطأ في إنشاء عناصر مجموعة الأنظمة الغذائية:",
                itemsResponse.error,
              );
              throw itemsResponse.error;
            }

            console.log(
              `✅ تم إضافة ${dietGroup.selectedItems.length} عنصر غذائي للمجموعة`,
            );
            dietGroupsCreated++;
          }
        } else {
          console.log(`⚠️ مجموعة أنظمة غذائية ${index + 1} فارغة، تم تجاهلها`);
        }
      }

      console.log(
        `🎉 تم إنشاء المشترك مع ${courseGroupsCreated} مجموعة كورسات و ${dietGroupsCreated} مجموعة أنظمة غذائية`,
      );
      return { data: subscriberResponse.data[0], error: null };
    } catch (error: any) {
      console.error("❌ فشل في إنشاء المشترك مع المجموعات:", error);
      return {
        data: null,
        error: handleDatabaseError("إنشاء المشترك مع المجموعات", error),
      };
    }
  },

  // ==================== اختبار الاتصال ====================

  async testConnection(): Promise<SupabaseResponse<boolean>> {
    try {
      console.log("🔍 اختبار الاتصال بقاعدة البيانات...");

      // محاولة جلب عدد المشتركين
      const { data, error } = await supabase
        .from("subscribers")
        .select("id", { count: "exact", head: true });

      if (error) {
        // إذا كان الخطأ بسبب عدم وجود الجدول، فالاتصال يعمل لكن الجداول غير موجودة
        if (error.message.includes("does not exist")) {
          console.log("⚠️ الاتصال يعمل لكن جدول subscribers غير موجود");
          return {
            data: false,
            error: new Error(
              "الاتصال يعمل لكن الجداول غير موجودة. يرجى تشغيل سكريبت إنشاء الجداول.",
            ),
          };
        }
        throw error;
      }

      console.log("✅ اتصال قاعدة البيانات ناجح!");
      return { data: true, error: null };
    } catch (error: any) {
      return {
        data: false,
        error: handleDatabaseError("اختبار الاتصال", error),
      };
    }
  },

  // ==================== عمليات إضافية ====================

  async resetDatabase(): Promise<SupabaseResponse<void>> {
    try {
      console.warn(
        "⚠️ تحذير: عملية إعادة تعيين قاعدة البيانات غير مدعومة في الإنتاج",
      );
      return { data: null, error: new Error("عملية إعادة التعيين غير مدعومة") };
    } catch (error: any) {
      return {
        data: null,
        error: handleDatabaseError("إعادة تعيين قاعدة البيانات", error),
      };
    }
  },
};

// تصدير العميل مباشرة للاستخدامات المتقدمة
export default supabase;
