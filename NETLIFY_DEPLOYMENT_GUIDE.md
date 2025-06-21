# دليل النشر على Netlify - صالة حسام جم

## خطوات النشر من GitHub إلى Netlify

### 1. تحضير المشروع

✅ **مكتمل** - جميع الملفات جاهزة:

- `netlify.toml` - إعدادات البناء والتوجيه
- `public/_redirects` - قواعد إعادة التوجيه للـ SPA
- `.env.production` - متغيرات البيئة للإنتاج
- قاعدة البيانات Supabase محددة ومحمية

### 2. النشر على Netlify

#### أ. ربط المستودع:

1. اذهب إلى [netlify.com](https://netlify.com)
2. سجل الدخول واختر "New site from Git"
3. اختر GitHub واختر المستودع
4. فرع النشر: `main`

#### ب. إعدادات البناء:

```
Build command: npm run build
Publish directory: dist
Node version: 20
```

### 3. متغيرات البيئة المطلوبة

في لوحة تحكم Netlify، اذهب إلى **Site settings > Environment variables** وأضف:

```
VITE_SUPABASE_URL=https://nfccwjrneviidwljaeoq.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5mY2N3anJuZXZpaWR3bGphZW9xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0Mzg0ODcsImV4cCI6MjA2NjAxNDQ4N30.X6ooPkivgB0gPB5OoMp_kodFX2kwGz8URqXT3FdFBeE
VITE_APP_NAME=نظام إدارة صالة حسام جم
```

### 4. حماية قاعدة البيانات

✅ **محمية** - قاعدة البيانات Supabase:

- موجودة على خادم منفصل
- لا تتأثر بالنشر
- البيانات محفوظة بشكل دائم
- النسخ الاحتياطية تتم تلقائياً

### 5. إعدادات الأمان

تم تطبيق:

- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`

### 6. التحديثات التلقائية

✅ **مفعل** - كل push إلى main سيؤدي إلى:

1. بناء تلقائي جديد
2. نشر تلقائي للتحديثات
3. المحافظة على قاعدة البيانات

### 7. اختبار ما بعد النشر

بعد النشر، تأكد من:

- [ ] الصفحة الرئيسية تحمل بشكل صحيح
- [ ] التنقل بين الصفحات يعمل
- [ ] اتصال قاعدة البيانات يعمل
- [ ] النموذج وإضافة البيانات يعمل

### 8. استكشاف الأخطاء

إذا حدثت مشاكل:

1. تحقق من `Functions > Build logs` في Netlify
2. تأكد من متغيرات البيئة
3. تحقق من إعدادات Supabase

---

## معلومات مهمة

- **الدومين**: سيتم توفير رابط `.netlify.app` مجاني
- **SSL**: مفعل تلقائياً
- **CDN**: توزيع عالمي سريع
- **النسخ الاحتياطية**: GitHub + Netlify + Supabase

## الحد الأقصى المجاني لـ Netlify

- 100 GB عرض نطاق شهرياً
- 300 دقيقة بناء شهرياً
- نطاق فرعي مجاني

---

**✅ المشروع جاهز 100% للنشر!**
