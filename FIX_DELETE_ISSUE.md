# 🔧 حل مشكلة حذف المشتركين

## 🚨 **المشكلة:**

```
❌ خطأ في حذف المشترك: update or delete on table "subscribers" violates foreign key constraint "sales_subscriber_id_fkey" on table "sales"
```

## 🔍 **السبب:**

- **قيود قاعدة البيانات (Foreign Key Constraints)** تمنع حذف المشترك إذا كان له مبيعات مرتبطة
- القيد الحالي مضبوط على `RESTRICT` بدلاً من `SET NULL`
- المطلوب تعديل القيود للسماح بحذف المشتركين مع الحفاظ على البيانات

---

## ✅ **الحل (خطوتين):**

### **الخطوة 1: إصلاح قيود قاعدة البيانات**

1. **اذهب إلى Supabase Dashboard:**

   - [https://supabase.com](https://supabase.com)
   - اختر مشروعك
   - اذهب إلى **SQL Editor**

2. **تشغيل سكريبت الإصلاح:**

   ```sql
   -- انسخ والصق هذا في SQL Editor

   -- إصلاح قيد المبيعات
   ALTER TABLE sales DROP CONSTRAINT IF EXISTS sales_subscriber_id_fkey;
   ALTER TABLE sales
   ADD CONSTRAINT sales_subscriber_id_fkey
   FOREIGN KEY (subscriber_id)
   REFERENCES subscribers(id)
   ON DELETE SET NULL;

   -- إصلاح قيد المجموعات
   ALTER TABLE groups DROP CONSTRAINT IF EXISTS groups_subscriber_id_fkey;
   ALTER TABLE groups
   ADD CONSTRAINT groups_subscriber_id_fkey
   FOREIGN KEY (subscriber_id)
   REFERENCES subscribers(id)
   ON DELETE CASCADE;

   SELECT 'تم إصلاح القيود بنجاح!' AS status;
   ```

   **أو استخدم الملف الكامل:**

   - انسخ محتوى `fix-database-constraints.sql`
   - الصق في SQL Editor
   - اضغط **Run**

### **الخطوة 2: إعادة تشغيل التطبيق**

```bash
# إعادة تشغيل التطبيق لتطبيق التحديثات الجديدة
npm run dev
```

---

## 🎯 **ما تم إصلاحه في التطبيق:**

### **1. معالجة ذكية للحذف:**

- **فحص البيانات المرتبطة** قبل الحذف
- **فصل المبيعات** عن المشترك بدلاً من حذفها
- **حذف المجموعات** (تمارين وأنظمة غذائية) المرتبطة
- **رسائل واضحة** للمستخدم

### **2. واجهة محسنة:**

- **تحذير مسبق** يظهر البيانات المرتبطة
- **معلومات تفصيلية** عن المبيعات والمجموعات
- **تأكيد واضح** قبل الحذف
- **مؤشر تحميل** أثناء عملية الحذف

### **3. أمان إضافي:**

- **فحص العلاقات** قبل الحذف
- **تنظيف البيانات** بالترتيب الصحيح
- **استرجاع رسائل خطأ واضحة**

---

## 📋 **سلوك الحذف الجديد:**

### **إذا كان للمشترك مبيعات:**

```
⚠️ تحذير: البيانات المرتبطة
• يوجد 3 فاتورة مبيعات مرتبطة - سيتم فصلها عن المشترك
• يوجد 2 مجموعة تمارين/نظام غذائي - سيتم حذفها
```

**ما يحدث:**

1. المبيعات تبقى موجودة لكن `subscriber_id` يصبح `null`
2. المجموعات (تمارين وأنظمة غذائية) تُحذف
3. المشترك يُحذف

### **إذا لم يكن للمشترك مبيعات:**

```
✅ لا توجد بيانات مرتبطة - يمكن الحذف بأمان
```

**ما يحدث:**

1. المجموعات تُحذف (إن وجدت)
2. المشترك يُحذف

---

## 🧪 **اختبار الحل:**

### **1. حذف مشترك بدون مبيعات:**

1. أضف مشترك جديد
2. احذفه مباشرة
3. يجب أن يُحذف بدون مشاكل ✅

### **2. حذف مشترك له مبيعات:**

1. أضف مشترك
2. أنشئ له فاتورة مبيعات
3. احذف المشترك
4. يجب أن تظهر رسالة التحذير ✅
5. بعد التأكيد، يُحذف المشترك وتبقى الفاتورة ✅

### **3. فحص قاعدة البيانات:**

```sql
-- فحص المبيعات بعد حذف مشترك
SELECT
    id,
    customer_name,
    subscriber_id,  -- يجب أن يكون null
    total_amount
FROM sales
WHERE customer_name IS NULL;

-- فحص المشتركين
SELECT COUNT(*) FROM subscribers;
```

---

## 🚨 **إذا استمرت المشكلة:**

### **1. تحقق من القيود:**

```sql
-- عرض جميع القيود الحالية
SELECT
    tc.table_name,
    tc.constraint_name,
    tc.constraint_type,
    rc.delete_rule
FROM information_schema.table_constraints AS tc
LEFT JOIN information_schema.referential_constraints AS rc
    ON tc.constraint_name = rc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_schema = 'public'
    AND tc.table_name IN ('sales', 'groups', 'group_items', 'sale_items')
ORDER BY tc.table_name;
```

### **2. إعادة إنشاء القيود يدوياً:**

```sql
-- حذف جميع القيود المشكلة
ALTER TABLE sales DROP CONSTRAINT IF EXISTS sales_subscriber_id_fkey;
ALTER TABLE groups DROP CONSTRAINT IF EXISTS groups_subscriber_id_fkey;

-- إعادة إنشاؤها بالشكل الصحيح
ALTER TABLE sales
ADD CONSTRAINT sales_subscriber_id_fkey
FOREIGN KEY (subscriber_id) REFERENCES subscribers(id) ON DELETE SET NULL;

ALTER TABLE groups
ADD CONSTRAINT groups_subscriber_id_fkey
FOREIGN KEY (subscriber_id) REFERENCES subscribers(id) ON DELETE CASCADE;
```

### **3. في حالة الطوارئ - حذف يدوي:**

```sql
-- حذف المبيعات المرتبطة أولاً (إذا لزم الأمر)
UPDATE sales SET subscriber_id = NULL WHERE subscriber_id = 'SUBSCRIBER_ID_HERE';

-- ثم حذف المشترك
DELETE FROM subscribers WHERE id = 'SUBSCRIBER_ID_HERE';
```

---

## ✅ **النتيجة النهائية:**

بعد تطبيق الحل:

- ✅ **حذف آمن للمشتركين** مع أو بدون مبيعات
- ✅ **حفظ بيانات المبيعات** (مع فصلها عن المشترك)
- ✅ **تحذيرات واضحة** للمستخدم
- ✅ **واجهة محسنة** مع معلومات مفصلة
- ✅ **لا مزيد من أخطاء القيود**

**🎉 المشكلة محلولة بالكامل!**
