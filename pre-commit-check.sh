#!/bin/bash

# ==============================================
# فحص ما قبل الرفع - يمنع رفع المشروع إذا كانت هناك مشاكل
# ==============================================

echo "🔒 فحص الحماية قبل الرفع"
echo "========================"

# تشغيل فحص الأمان أولاً
echo "🛡️ تشغيل نظام الحماية..."
if ! bash git-safety.sh; then
    echo ""
    echo "❌ فشل فحص الأمان! لا يمكن المتابعة"
    echo "🔧 يرجى حل المشاكل المذكورة أعلاه أولاً"
    exit 1
fi

echo ""
echo "🔍 فحص إضافي للملفات المهمة..."

# التحقق من ملفات package.json
if [ -f "package.json" ]; then
    echo "✅ package.json موجود"
    
    # التحقق من صحة JSON
    if jq empty package.json 2>/dev/null; then
        echo "✅ package.json صالح"
    else
        echo "⚠️  package.json قد يحتوي على أخطاء"
    fi
else
    echo "❌ package.json مفقود!"
    exit 1
fi

# التحقق من ملفات TypeScript
echo ""
echo "🔍 فحص ملفات TypeScript..."

ts_files=$(find src -name "*.ts" -o -name "*.tsx" 2>/dev/null | wc -l)
if [ $ts_files -eq 0 ]; then
    echo "❌ لم يتم العثور على ملفات TypeScript!"
    exit 1
else
    echo "✅ تم العثور على $ts_files ملف TypeScript"
fi

# التحقق من الملفات الأساسية للتطبيق
essential_files=(
    "src/App.tsx"
    "src/main.tsx"
    "index.html"
)

echo ""
echo "🎯 فحص الملفات الأساسية..."
for file in "${essential_files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file"
    else
        echo "❌ $file مفقود!"
        exit 1
    fi
done

# فحص مجلد المكونات
if [ -d "src/components" ]; then
    component_count=$(find src/components -name "*.tsx" 2>/dev/null | wc -l)
    echo "✅ مجلد المكونات: $component_count مكون"
else
    echo "❌ مجلد المكونات مفقود!"
    exit 1
fi

# فحص مجلد الصفحات
if [ -d "src/pages" ]; then
    page_count=$(find src/pages -name "*.tsx" 2>/dev/null | wc -l)
    echo "✅ مجلد الصفحات: $page_count صفحة"
else
    echo "❌ مجلد الصفحات مفقود!"
    exit 1
fi

# فحص مكتبة الأدوات
if [ -f "src/lib/utils.ts" ]; then
    echo "✅ مكتبة الأدوات موجودة"
else
    echo "❌ مكتبة الأدوات مفقودة!"
    exit 1
fi

# فحص ملفات قاعدة البيانات
if [ -f "src/lib/supabase.ts" ]; then
    echo "✅ إعدادات قاعدة البيانات موجودة"
else
    echo "❌ إعدادات قاعدة البيانات مفقودة!"
    exit 1
fi

# عرض الملفات التي ستتم إضافتها
echo ""
echo "📋 الملفات التي ستتم إضافتها:"
echo "============================="

# إضافة جميع الملفات المهمة
git add src/
git add public/
git add package.json
git add index.html
git add *.config.*
git add tsconfig*.json
git add *.md
git add .gitignore
git add .gitattributes

# عرض حالة Git
git status --porcelain | while read line; do
    echo "  $line"
done

echo ""
echo "🎉 جميع الفحوصات نجحت!"
echo "✅ المشروع جاهز للرفع بأمان"
echo ""
echo "💡 الخطوة التالية:"
echo "git commit -m 'تحديث المشروع - جميع الملفات محمية'"
echo "git push origin main"
