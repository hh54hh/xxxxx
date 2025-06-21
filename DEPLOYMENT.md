# 🚀 دليل النشر | Deployment Guide

دليل شامل لنشر نظام إدارة صالة حسام جم على منصات مختلفة.

## 📋 قائمة التحقق قبل النشر

### ✅ إعداد البيئة

- [ ] تم إعداد متغيرات البيئة (.env)
- [ ] تم اختبار الاتصال بقاعدة البيانات
- [ ] تم تشغيل جميع الاختبارات
- [ ] تم فحص الأمان
- [ ] تم تشغيل البناء النهائي

### ✅ قاعدة البيانات

- [ ] تم إنشاء جميع الجداول المطلوبة
- [ ] تم تشغيل سكريبتات الإعداد
- [ ] تم إدراج البيانات الافتراضية
- [ ] تم إعداد النسخ الاحتياطي

### ✅ الأمان

- [ ] تم حذف جميع كلمات المرور من الكود
- [ ] تم تشفير المعلومات الحساسة
- [ ] تم إعداد HTTPS
- [ ] تم تحديث مفاتيح API

## 🌐 النشر على Vercel

### الخطوة 1: إعداد المشروع

```bash
# تثبيت Vercel CLI
npm i -g vercel

# تسجيل الدخول
vercel login
```

### الخطوة 2: إعداد متغيرات البيئة

```bash
# في لوحة تحكم Vercel
# Settings > Environment Variables
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### الخطوة 3: النشر

```bash
# النشر
vercel

# النشر للإنتاج
vercel --prod
```

### إعدادات إضافية لـ Vercel

قم بإنشاء ملف `vercel.json`:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

## 🚀 النشر على Netlify

### الخطوة 1: إعداد البناء

قم بإنشاء ملف `netlify.toml`:

```toml
[build]
  publish = "dist"
  command = "npm run build"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[context.production.environment]
  VITE_SUPABASE_URL = "your_production_supabase_url"
  VITE_SUPABASE_ANON_KEY = "your_production_anon_key"
```

### الخطوة 2: النشر

```bash
# تثبيت Netlify CLI
npm install -g netlify-cli

# تسجيل الدخول
netlify login

# النشر
netlify deploy

# النشر للإنتاج
netlify deploy --prod
```

## 🐳 النشر باستخدام Docker

### إنشاء Dockerfile

```dockerfile
# Dockerfile
FROM node:18-alpine as builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### إعداد Nginx

```nginx
# nginx.conf
events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    server {
        listen 80;
        server_name localhost;
        root /usr/share/nginx/html;
        index index.html;

        location / {
            try_files $uri $uri/ /index.html;
        }

        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
}
```

### بناء ونشر Docker

```bash
# بناء الصورة
docker build -t hossam-gym .

# تشغيل الحاوية
docker run -p 80:80 hossam-gym
```

## ☁️ النشر على AWS

### استخدام AWS S3 + CloudFront

```bash
# تثبيت AWS CLI
aws configure

# بناء المشروع
npm run build

# رفع إلى S3
aws s3 sync dist/ s3://your-bucket-name --delete

# إنشاء CloudFront distribution
aws cloudfront create-distribution --distribution-config file://cloudfront-config.json
```

### إعداد CloudFront

```json
{
  "CallerReference": "hossam-gym-2024",
  "DefaultCacheBehavior": {
    "TargetOriginId": "S3-hossam-gym",
    "ViewerProtocolPolicy": "redirect-to-https",
    "TrustedSigners": {
      "Enabled": false,
      "Quantity": 0
    },
    "ForwardedValues": {
      "QueryString": false,
      "Cookies": {
        "Forward": "none"
      }
    },
    "MinTTL": 0
  },
  "Origins": {
    "Quantity": 1,
    "Items": [
      {
        "Id": "S3-hossam-gym",
        "DomainName": "your-bucket.s3.amazonaws.com",
        "S3OriginConfig": {
          "OriginAccessIdentity": ""
        }
      }
    ]
  },
  "Comment": "Hossam Gym Management System",
  "Enabled": true
}
```

## 🔧 إعداد النطاق المخصص

### Vercel

```bash
# إضافة نطاق
vercel domains add example.com
vercel domains add www.example.com

# ربط بالمشروع
vercel alias your-deployment-url.vercel.app example.com
```

### Netlify

```bash
# إضافة نطاق مخصص
netlify sites:create --name hossam-gym
netlify domains:add example.com
```

## 📊 مراقبة الأداء

### إعداد مراقبة Uptime

```javascript
// monitoring.js
const checkEndpoint = async () => {
  try {
    const response = await fetch("https://your-domain.com/api/health");
    if (response.ok) {
      console.log("✅ الموقع يعمل بشكل طبيعي");
    } else {
      console.error("❌ مشكلة في الموقع");
    }
  } catch (error) {
    console.error("❌ خطأ في الاتصال:", error);
  }
};

// فحص كل 5 دقائق
setInterval(checkEndpoint, 5 * 60 * 1000);
```

## 🔄 إعداد CI/CD

### GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: 🚀 Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "18"
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm test

      - name: Build
        run: npm run build
        env:
          VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: "--prod"
```

## 🔒 الأمان في الإنتاج

### إعدادات HTTPS

```javascript
// في vite.config.ts للإنتاج
export default defineConfig({
  server: {
    https: true,
    headers: {
      "Strict-Transport-Security": "max-age=63072000",
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "DENY",
      "X-XSS-Protection": "1; mode=block",
    },
  },
});
```

### متغيرات البيئة الآمنة

```bash
# متغيرات الإنتاج فقط
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_secure_anon_key
VITE_APP_ENV=production
```

## 🧪 اختبار ما بعد النشر

### اختبارات سريعة

```bash
# فحص الموقع
curl -I https://your-domain.com

# فحص API
curl https://your-domain.com/api/health

# فحص الأداء
lighthouse https://your-domain.com --view
```

### قائمة الفحص النهائي

- [ ] الموقع يحمل بشكل صحيح
- [ ] جميع الروابط تعمل
- [ ] قاعدة البيانات متصلة
- [ ] المميزات الأساسية تعمل
- [ ] الموقع سريع (< 3 ثواني)
- [ ] متجاوب على جميع الأجهزة
- [ ] HTTPS مفعل
- [ ] SEO محسن

## 🔧 استكشاف الأخطاء

### مشاكل شائعة

**المشكلة:** فشل البناء

```bash
# الحل
npm ci
npm run typecheck
npm run build
```

**المشكلة:** متغيرات البيئة لا تعمل

```bash
# التأكد من البادئة VITE_
VITE_SUPABASE_URL=...
```

**المشكلة:** مسارات لا تعمل

```javascript
// إضافة في vite.config.ts
export default {
  base: "./",
};
```

## 📞 الدعم بعد النشر

### مراقبة السجلات

```bash
# Vercel
vercel logs

# Netlify
netlify logs

# Docker
docker logs container-name
```

### النسخ الاحتياطي

```bash
# تشغيل النسخ الاحتياطي يومياً
0 2 * * * /path/to/backup-system.sh
```

---

**تم النشر بنجاح! 🎉**

للدعم: راجع Issues في GitHub أو اتصل بفريق ��لتطوير.
