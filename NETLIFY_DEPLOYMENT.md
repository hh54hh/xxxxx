# 🚀 دليل النشر على Netlify | Netlify Deployment Guide

## 🔧 إصلاح مشكلة الشاشة البيضاء

إذا كان موقعك يعمل على Netlify لكن يظهر شاشة بيضاء، اتبع هذه الخطوات:

### ✅ الملفات المطلوبة (تم إنشاؤها):

#### 1. `netlify.toml` - إعدادات النشر

```toml
[build]
  publish = "dist"
  command = "npm run build"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

#### 2. `public/_redirects` - إعادة التوجيه لـ SPA

```
/*    /index.html   200
```

#### 3. تحديث `vite.config.ts`

- إضافة `base: "./"`
- تحسين إعدادات البناء

#### 4. إضافة Error Boundary

- حماية من الأخطاء
- عرض رسائل واضحة بدلاً من الشاشة البيضاء

### 🔄 خطوات إعادة النشر:

#### الطريقة 1: من GitHub Desktop

1. **Commit** التغييرات الجديدة:
   - الرسالة: `🚀 إصلاح مشكلة النشر على Netlify`
2. **Push** إلى GitHub
3. Netlify سيعيد البناء تلقائياً

#### الطريقة 2: من Netlify Dashboard

1. اذهب إلى [Netlify Dashboard](https://app.netlify.com/)
2. اختر موقعك
3. انقر **"Deploys"**
4. انقر **"Trigger deploy"** > **"Deploy site"**

### 🔍 فحص إعدادات البناء على Netlify:

#### تأكد من الإعدادات التالية:

```
Build command: npm run build
Publish directory: dist
Node.js version: 18
```

#### إذا كانت الإعدادات خاطئة:

1. اذهب إلى **Site settings**
2. انقر **Build & deploy**
3. انقر **Edit settings**
4. حدث الإعدادات

### 🌐 إعداد متغيرات البيئة على Netlify:

#### الخطوة 1: إضافة متغيرات البيئة

1. اذهب إلى **Site settings**
2. انقر **Environment variables**
3. أضف المتغيرات التالية:

```
VITE_SUPABASE_URL=https://nfccwjrneviidwljaeoq.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_APP_NAME=نظام إدارة صالة حسام جم
```

#### الخطوة 2: إعادة النشر

بعد إضافة المتغيرات، انقر **"Redeploy"**

### 🛠️ استكشاف الأخطاء:

#### مشكلة: لا تزال الشاشة بيضاء

**الحل:**

1. افتح **Developer Tools** (F12)
2. انظر في **Console** للأخطاء
3. تحقق من **Network** tab للطلبات الفاشلة

#### مشكلة: خطأ في الروابط

**الحل:**

1. تأكد من وجود ملف `public/_redirects`
2. تحقق من إعدادات `netlify.toml`

#### مشكلة: خطأ في البناء

**الحل:**

1. فحص **Deploy logs** في Netlify
2. تأكد من أن `npm run build` يعمل محلياً

### 📋 قائمة التحقق النهائية:

- [ ] ملف `netlify.toml` موجود
- [ ] ملف `public/_redirects` موجود
- [ ] تم تحديث `vite.config.ts`
- [ ] تم إضافة Error Boundary
- [ ] متغيرات البيئة مضبوطة على Netlify
- [ ] إعدادات البناء صحيحة
- [ ] تم إعادة النشر

### 🎯 النتيجة المتوقعة:

بعد تطبيق هذه الإصلاحات:

- ✅ الموقع يحمل بشكل صحيح
- ✅ لا توجد شاشة بيضاء
- ✅ الروابط تعمل
- ✅ التطبيق يعمل كما هو محلياً

### 📞 إذا استمرت المشكلة:

#### فحص سجلات النشر:

1. انقر **"Deploys"** في Netlify
2. انقر على آخر deploy
3. انقر **"View deploy logs"**
4. ابحث عن أخطاء البناء

#### فحص أخطاء المتصفح:

1. افتح الموقع
2. اضغط F12
3. انظر في **Console** للأخطاء
4. انظر في **Network** للطلبات الفاشلة

---

**بعد تطبيق هذه الإصلاحات، موقعك يجب أن يعمل بشكل مثالي على Netlify! 🎉**

### 🔗 روابط مفيدة:

- [Netlify Docs - SPA redirects](https://docs.netlify.com/routing/redirects/rewrites-proxies/#history-pushstate-and-single-page-apps)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html#netlify)
