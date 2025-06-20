# 🔧 إصلاح مشكلة قيد المبيعات | Fix Sales Constraint Issue

## 🚨 المشكلة

عند محاولة حذف مشترك، يظهر الخطأ التالي:

```
new row for relation "sales" violates check constraint "sales_check"
```

## 🔍 سبب المشكلة

جدول `sales` يحتوي على قيد يتطلب وجود إما `subscriber_id` أو `customer_name`:

```sql
CHECK (
    (subscriber_id IS NOT NULL AND customer_name IS NULL) OR
    (subscriber_id IS NULL AND customer_name IS NOT NULL)
)
```

عند حذف مشترك، النظام يحدث `subscriber_id` إلى `null` لكن لا يضع قيمة في `customer_name`، مما ينتهك القيد.

## ✅ الحل السريع

### الخطوة 1: تشغيل سكريپت الإصلاح

1. اذهب إلى [Supabase Dashboard](https://supabase.com)
2. اختر مشروعك: `nfccwjrneviidwljaeoq`
3. انقر على **SQL Editor**
4. انسخ والصق محتويات ملف `fix-sales-constraint.sql`
5. اضغط **Run**

### الخطوة 2: التحقق من الإصلاح

بعد تشغيل السكريپت، ستحصل على:

```
✅ تم إصلاح قيد المبيعات بنجاح!
🔧 تم إنشاء دالة safe_delete_subscriber()
🔍 تم إنشاء دالة check_sales_integrity()
🧹 تم تنظيف البيانات اليتيمة
📊 يمكنك الآن حذف المشتركين بأمان
```

## 🛠️ ما يقوم به السكريپت

### 1. إصلاح البيانات الموجودة

```sql
-- إصلاح المبيعات بدون مشترك أو اسم زبون
UPDATE sales
SET customer_name = 'زبون سابق'
WHERE subscriber_id IS NULL
  AND (customer_name IS NULL OR customer_name = '');
```

### 2. إنشاء دالة آمنة لحذف المشتركين

```sql
CREATE OR REPLACE FUNCTION safe_delete_subscriber(subscriber_id_param UUID)
RETURNS VOID AS $$
-- الدالة تحدث المبيعات أولاً ثم تحذف المشترك
$$;
```

### 3. إنشاء دالة فحص سلامة البيانات

```sql
CREATE OR REPLACE FUNCTION check_sales_integrity()
-- تفحص وجود بيانات يتيمة أو غير صحيحة
```

### 4. تنظيف البيانات اليتيمة

- حذف المجموعات المرتبطة بمشتركين محذوفين
- إصلاح المبيعات المرتبطة بمشتركين غير موجودين

## 🧪 اختبار الإصلاح

### 1. فحص سلامة البيانات

```sql
SELECT * FROM check_sales_integrity();
```

### 2. اختبار حذف مشترك

```sql
-- استخدام الدالة الآمنة
SELECT safe_delete_subscriber('subscriber-id-here');
```

### 3. التحقق من المبيعات

```sql
-- فحص المبيعات بعد الحذف
SELECT
  COUNT(*) as total_sales,
  COUNT(CASE WHEN subscriber_id IS NOT NULL THEN 1 END) as with_subscriber,
  COUNT(CASE WHEN customer_name IS NOT NULL THEN 1 END) as with_customer_name
FROM sales;
```

## 🔄 التحديثات في الكود

تم تحديث دالة `deleteSubscriber` في `src/lib/supabase.ts` لتتعامل مع هذه المشكلة:

### التحسينات المضافة:

1. **جلب اسم المشترك أولاً**

```typescript
const { data: subscriber } = await supabase
  .from("subscribers")
  .select("name")
  .eq("id", id)
  .single();
```

2. **تحديث المبيعات بالاسم**

```typescript
const { error: updateSalesError } = await supabase
  .from("sales")
  .update({
    subscriber_id: null,
    customer_name: subscriberName, // إضافة اسم المشترك
  })
  .eq("subscriber_id", id);
```

3. **استخدام الدالة الآمنة (إن وجدت)**

```typescript
const { error: safeDeleteError } = await supabase.rpc(
  "safe_delete_subscriber",
  { subscriber_id_param: id },
);
```

4. **دالة احتياطية للحذف اليدوي**

```typescript
async deleteSubscriberManually(id: string, subscriberName: string)
```

## 🚫 منع المشكلة مستقبلاً

### 1. في السكريپتات المستقبلية

```sql
-- دائماً تأكد من تحديث customer_name عند حذف subscriber_id
UPDATE sales
SET subscriber_id = NULL,
    customer_name = COALESCE(customer_name, 'زبون غير محدد')
WHERE condition;
```

### 2. في الكود

```typescript
// دائماً تحديث كلا الحقلين معاً
await supabase.from("sales").update({
  subscriber_id: null,
  customer_name: subscriberName || "زبون سابق",
});
```

## 📋 قائمة التحقق

- [ ] تم تشغيل سكريپت `fix-sales-constraint.sql`
- [ ] تم التحقق من نجاح الإصلاح
- [ ] تم ��ختبار حذف مشترك
- [ ] تم فحص سلامة البيانات
- [ ] تم التحقق من عدم وجود أخطاء في الكونسول

## 🆘 إذا استمرت المشكلة

### 1. فحص الجداول يدوياً

```sql
-- فحص جدول sales
SELECT subscriber_id, customer_name
FROM sales
WHERE subscriber_id IS NULL AND customer_name IS NULL;
```

### 2. فحص القيود

```sql
-- عرض قيود جدول sales
SELECT constraint_name, constraint_type
FROM information_schema.table_constraints
WHERE table_name = 'sales';
```

### 3. إعادة إنشاء القيد (إذا لزم الأمر)

```sql
-- حذف القيد القديم
ALTER TABLE sales DROP CONSTRAINT IF EXISTS sales_check;

-- إنشاء قيد جديد
ALTER TABLE sales ADD CONSTRAINT sales_check
CHECK (
    (subscriber_id IS NOT NULL AND customer_name IS NULL) OR
    (subscriber_id IS NULL AND customer_name IS NOT NULL)
);
```

---

**بعد تطبيق هذا الإصلاح، ستتمكن من حذف المشتركين بدون أخطاء! ✅**
