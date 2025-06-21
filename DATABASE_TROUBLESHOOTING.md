# 🔧 دليل استكشاف أخطاء قاعدة البيانات وحلها

## 🚨 **الخطأ الحالي: "خطأ في جلب تفاصيل المشترك: [object Object]"**

### السبب:

- قاعدة البيانات تحتوي فقط على `CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`
- الجداول الأساسية غير موجودة
- التطبيق يحاول الوصول إلى جداول غير موجودة

### الحل:

#### الخطوة 1: إنشاء الجداول في Supabase

1. **اذهب إلى Supabase Dashboard:**

   - افتح [https://supabase.com](https://supabase.com)
   - اختر مشروعك
   - اذهب إلى **SQL Editor**

2. **تشغيل سكريبت إنشاء الجداول:**
   - انسخ محتوى ملف `setup-database.sql`
   - الصق في SQL Editor
   - اضغط **Run**

#### الخطوة 2: التحقق من إنشاء الجداول

```sql
-- تشغيل هذا الاستعلام للتحقق من الجداول
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

**النتيجة المتوقعة:**

```
course_points
diet_items
group_items
groups
products
sale_items
sales
subscribers
```

#### الخطوة 3: اختبار الاتصال في التطبيق

1. **شغل التطبيق:**

   ```bash
   npm run dev
   ```

2. **اذهب لصفحة الإعدادات:**
   - انقر على **"اختبار الاتصال"**
   - يجب أن تحصل على رسالة نجاح

---

## 🔍 **أخطاء شائعة أخرى وحلولها:**

### 1. **"الجدول المطلوب غير موجود في قاعدة البيانات"**

**السبب:** لم يتم إنشاء الجداول بعد

**الحل:**

```sql
-- تشغيل سكريبت setup-database.sql كاملاً
```

### 2. **"ليس لديك صلاحية للوصول إلى هذه البيانات"**

**السبب:** إعدادات RLS (Row Level Security) مفعلة

**الحل:**

```sql
-- إلغاء RLS مؤقتاً للتطوير
ALTER TABLE subscribers DISABLE ROW LEVEL SECURITY;
ALTER TABLE course_points DISABLE ROW LEVEL SECURITY;
ALTER TABLE diet_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE groups DISABLE ROW LEVEL SECURITY;
ALTER TABLE group_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE sales DISABLE ROW LEVEL SECURITY;
ALTER TABLE sale_items DISABLE ROW LEVEL SECURITY;
```

### 3. **"خطأ في الاتصال بقاعدة البيانات"**

**السبب:** مشكلة في متغيرات البيئة

**الحل:**

1. تحقق من ملف `.env`:

   ```env
   VITE_SUPABASE_URL=https://nfccwjrneviidwljaeoq.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

2. إعادة تشغيل التطبيق:
   ```bash
   npm run dev
   ```

### 4. **"فشل في إنشاء المشترك"**

**السبب:** قيود البيانات أو حقول مفقودة

**الحل:**

- تأكد من ملء جميع الحقول المطلوبة
- تحقق من صحة البيانات (العمر > 0، الوزن > 0، إلخ)

---

## 🛠️ **أدوات التشخيص:**

### 1. **فحص حالة قاعدة الب��انات:**

```bash
# من التطبيق
npm run test-db

# أو
npm run check-connection
```

### 2. **فحص الجداول في Supabase:**

```sql
-- عرض جميع الجداول
SELECT
    schemaname,
    tablename,
    tableowner
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- عرض عدد السجلات في كل جدول
SELECT
    'subscribers' as table_name,
    COUNT(*) as record_count
FROM subscribers
UNION ALL
SELECT 'course_points', COUNT(*) FROM course_points
UNION ALL
SELECT 'diet_items', COUNT(*) FROM diet_items
UNION ALL
SELECT 'products', COUNT(*) FROM products;
```

### 3. **فحص معلومات الجداول:**

```sql
-- عرض بنية جدول معين
\d subscribers;

-- أو في SQL Editor:
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'subscribers'
ORDER BY ordinal_position;
```

---

## 📋 **قائمة فحص سريعة:**

- [ ] تم تشغيل `setup-database.sql` في Supabase
- [ ] جميع الجداول موجودة (8 جداول)
- [ ] متغيرات البيئة صحيحة في `.env`
- [ ] RLS معطل للتطوير
- [ ] التطبيق يعمل على `localhost:8080`
- [ ] اختبار الاتصال ناجح في صفحة الإعدادات

---

## 🆘 **في حالة استمرار المشاكل:**

### تحقق من Console Logs:

1. **افتح Developer Tools** (F12)
2. **اذهب لتبويب Console**
3. **ابحث عن رسائل تبدأ بـ:**
   - `❌ خطأ في...`
   - `⚠️ تحذير...`
   - `✅ تم...`

### أعد إنشاء قاعدة البيانات:

```sql
-- حذف جميع الجداول وإعادة إنشاؤها
DROP TABLE IF EXISTS sale_items CASCADE;
DROP TABLE IF EXISTS sales CASCADE;
DROP TABLE IF EXISTS group_items CASCADE;
DROP TABLE IF EXISTS groups CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS diet_items CASCADE;
DROP TABLE IF EXISTS course_points CASCADE;
DROP TABLE IF EXISTS subscribers CASCADE;

-- ثم تشغيل setup-database.sql مرة أخرى
```

---

## ✅ **التحقق من نجاح الإصلاح:**

بعد تطبيق الحلول، يجب أن ترى:

1. **في صفحة الإعدادات:**

   - اختبار الاتصال: ✅ نجح
   - عدد المشتركين: 0
   - عدد الكورسات: 5 (البيانات التجريبية)
   - عدد المنتجات: 7 (البيانات التجريبية)

2. **في Console:**

   - `✅ اتصال قاعدة البيانات ناجح!`
   - `✅ تم جلب X مشترك`

3. **في التطبيق:**
   - يمكن إضافة مشتركين جدد
   - يمكن عرض تفاصيل المشتركين
   - يمكن إدارة الكورسات والمنتجات

**🎉 عند رؤية هذه الرسائل، تكون قاعدة البيانات تعمل بشكل صحيح!**
