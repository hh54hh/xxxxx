# 🔍 كيفية الحصول على Netlify Build Logs

## 📊 خطوات الحصول على الأخطاء

### الطريقة 1: من Netlify Dashboard

1. **اذهب إلى** [https://app.netlify.com/](https://app.netlify.com/)

2. **اختر موقعك** من القائمة

3. **انقر على "Deploys"** (في الشريط العلوي)

4. **اختر آخر Deploy فاشل** (يكون باللون الأحمر)

5. **انقر على "View build logs"** أو **"Show details"**

6. **انسخ النص الكامل** لرسائل الخطأ

### الطريقة 2: من Git Push

إذا كان النشر تلقائياً بعد Git push، ستحصل على:

```
❌ Deploy failed
View logs: https://app.netlify.com/sites/[site-name]/deploys/[deploy-id]
```

انقر على الرابط لرؤية التفاصيل.

## 🚨 أخطاء شائعة وحلولها

### 1. Build Command Error

```
Build command failed: npm run build
```

**الحل:**

```bash
# تحقق من البناء محلياً
npm run build

# إذا فشل، أصلح الأخطاء وارفع مرة أخرى
```

### 2. Node Version Error

```
Node version not supported
```

**الحل:** تحديث netlify.toml

```toml
[build.environment]
NODE_VERSION = "20"
```

### 3. Dependencies Error

```
Module not found: Can't resolve 'package-name'
```

**الحل:**

```bash
npm install package-name
git add package.json package-lock.json
git commit -m "إضافة dependency مفقود"
git push
```

### 4. Environment Variables Error

```
VITE_SUPABASE_URL is not defined
```

**الحل:** إضافة متغيرات البيئة في Netlify

- Site settings → Environment variables
- أضف المتغيرات المطلوبة

### 5. TypeScript Error

```
Type 'string' is not assignable to type 'number'
```

**الحل:**

```bash
npm run typecheck
# أصلح الأخطاء المعروضة
```

## 🛠️ خطوات التشخيص السريع

### 1. اختبر البناء محلياً

```bash
# نظف الكاش
npm run clean

# ثبت Dependencies مرة أخرى
npm install

# اختبر البناء
npm run build

# اختبر TypeScript
npm run typecheck
```

### 2. تحقق من الملفات

```bash
# تحقق من netlify.toml
cat netlify.toml

# تحقق من package.json
cat package.json | grep -A5 -B5 "scripts\|engines"

# تحقق من Git status
git status
```

### 3. إعادة النشر

```bash
# إذا كان كل شيء يعمل محلياً
git add .
git commit -m "إصلاح مشكلة النشر"
git push origin main
```

## 📞 نماذج رسائل خطأ شائعة

إذا رأيت أي من هذه الرسائل، أرسلها لي:

```
❌ Build failed due to a user error: Build script returned non-zero exit code: 1
❌ Error during build: Build was terminated
❌ Module build failed: SyntaxError: Unexpected token
❌ Cannot resolve dependency
❌ Command failed with exit code 1: npm run build
```

## ✅ علامات النجاح

عندما يعمل النشر بنجاح، ستراها:

```
✅ Build script returned zero exit code: 0
✅ Site is live ✨
✅ Unique Deploy URL: https://deploy-id--site-name.netlify.app
```

---

**أرسل لي رسائل الخطأ الكاملة وسأساعدك في حلها فوراً! 🚀**
