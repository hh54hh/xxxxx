# 🔧 إصلاح مشكلة متغيرات البيئة على Netlify

## 🚨 الخطأ

```
Error: Missing Supabase environment variables
```

## 🔍 سبب المشكلة

التطبيق يعمل محلياً لأن ملف `.env` موجود، لكن على Netlify لا توجد متغيرات البيئ�� المطلوبة.

## ✅ الحل المفصل - خطوة بخطوة

### الخطوة 1: الدخول إلى Netlify Dashboard

1. اذهب إلى [https://app.netlify.com/](https://app.netlify.com/)
2. سجل دخولك
3. اختر موقعك من القائمة

### الخطوة 2: الوصول إلى إعدادات متغيرات البيئة

1. انقر على اسم موقعك
2. انقر على **"Site settings"** (في الشريط العلوي)
3. في الشريط الجانبي الأيسر، انقر على **"Environment variables"**
4. ستجد صفحة فارغة أو بها متغيرات قديمة

### الخطوة 3: إضافة متغيرات Supabase

انقر على **"Add a variable"** أو **"Add single variable"** وأضف المتغيرات التالية:

#### المتغير الأول:

- **Key:** `VITE_SUPABASE_URL`
- **Value:** `https://nfccwjrneviidwljaeoq.supabase.co`
- انقر **"Create variable"**

#### المتغير الثاني:

- **Key:** `VITE_SUPABASE_ANON_KEY`
- **Value:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5mY2N3anJuZXZpaWR3bGphZW9xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0Mzg0ODcsImV4cCI6MjA2NjAxNDQ4N30.X6ooPkivgB0gPB5OoMp_kodFX2kwGz8URqXT3FdFBeE`
- انقر **"Create variable"**

### الخطوة 4: إضافة متغيرات إضافية (اختياري)

#### المتغير الثالث:

- **Key:** `VITE_APP_NAME`
- **Value:** `نظام إدارة صالة حسام جم`

#### المتغير الرابع:

- **Key:** `NODE_VERSION`
- **Value:** `18`

### الخطوة 5: إعادة النشر

بعد إضافة المتغيرات:

1. اذهب إلى **"Deploys"** (في الشريط العلوي)
2. انقر على **"Trigger deploy"**
3. اختر **"Deploy site"**
4. انتظر انتهاء عملية البناء (2-5 دقائق)

### الخطوة 6: التحقق من النجاح

1. بعد انتهاء النشر، انقر على الرابط لفتح الموقع
2. يجب أن ترى صفحة تسجيل الدخول بدلاً من الخطأ
3. إذا ظهر خطأ، افتح Developer Tools (F12) وتحقق من Console

## 🎯 صورة توضيحية للخطوات

```
Netlify Dashboard
├── اختر موقعك
├── Site settings
├── Environment variables
├── Add single variable
│   ├── VITE_SUPABASE_URL = https://nfccwjrneviidwljaeoq.supabase.co
│   └── VITE_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6...
├── Save
├── Deploys
└── Trigger deploy
```

## 🔄 إذا استمر الخطأ

### فحص متغيرات البيئة

1. في Netlify، اذهب إلى **Site settings** → **Environment variables**
2. تأكد من وجود المتغيرين:
   - ✅ `VITE_SUPABASE_URL`
   - ✅ `VITE_SUPABASE_ANON_KEY`
3. تأكد من أن القيم صحيحة (بدون مسافات إضافية)

### فحص Deploy Logs

1. اذهب إلى **Deploys**
2. انقر على آخر deploy
3. انقر **"View function logs"** أو **"View build logs"**
4. ابحث عن رسائل خطأ تتعلق بمتغيرات البيئة

### فحص الموقع

1. افتح الموقع
2. اضغط F12 لفتح Developer Tools
3. انظر في **Console** للأخطاء
4. انظر في **Network** للطلبات الفاشلة

## ⚠️ ملاحظات مهمة

### 1. أسماء المتغيرات

تأكد من أن أسماء المتغيرات **بالضبط** كما هو مذكور:

- `VITE_SUPABASE_URL` (ليس `SUPABASE_URL`)
- `VITE_SUPABASE_ANON_KEY` (ليس `SUPABASE_ANON_KEY`)

### 2. قيم المتغيرات

- لا تضع مسافات في بداية أو نهاية القيم
- لا تضع علامات اقتباس حول القيم
- انسخ والصق القيم مباشرة

### 3. إعادة النشر مطلوبة

بعد إضافة أي متغير بيئة جديد، **يجب** إعادة النشر حتى تصبح المتغيرات فعالة.

## ✅ علامات النجاح

بعد إصلاح المشكلة، يجب أن ترى:

- ✅ صفحة تسجيل الدخول تظهر بشكل طبيعي
- ✅ لا توجد أخطاء في Console
- ✅ التطبيق يتصل بقاعدة البيانات
- ✅ يمكن تسجيل الدخول والتنقل

## 📋 قائمة التحقق السريعة

- [ ] دخلت إلى Netlify Dashboard
- [ ] اخترت الموقع الصحيح
- [ ] ذهبت إلى Site settings → Environment variables
- [ ] أضفت `VITE_SUPABASE_URL`
- [ ] أضفت `VITE_SUPABASE_ANON_KEY`
- [ ] تأكدت من صحة القيم
- [ ] ضغطت "Create variable" لكل متغير
- [ ] ذهبت إلى Deploys
- [ ] ضغطت "Trigger deploy"
- [ ] انتظرت انتهاء النشر
- [ ] فتحت الموقع للتأكد

---

**بعد تطبيق هذه الخطوات، موقعك يجب أن يعمل بشكل مثالي! 🎉**
