#!/bin/bash

# ==============================================
# نظام الحماية الذكي من حذف الملفات في Git
# ==============================================

echo "🛡️ نظام الحماية الذكي لـ GitHub"
echo "================================"

# قائمة الملفات الحرجة التي يجب عدم حذفها أبداً
declare -a CRITICAL_FILES=(
    "src/App.tsx"
    "src/main.tsx" 
    "src/lib/utils.ts"
    "src/lib/supabase.ts"
    "src/lib/utils-enhanced.ts"
    "package.json"
    "index.html"
    "vite.config.ts"
    "tailwind.config.ts"
    "tsconfig.json"
)

# قائمة المجلدات الحرجة
declare -a CRITICAL_DIRS=(
    "src/components"
    "src/components/ui" 
    "src/pages"
    "src/lib"
    "src/types"
    "src/hooks"
    "public"
)

# فحص وجود الملف��ت الحرجة
echo "🔍 فحص الملفات الحرجة..."
missing_files=0

for file in "${CRITICAL_FILES[@]}"; do
    if [ ! -f "$file" ]; then
        echo "❌ خطر: الملف مفقود - $file"
        missing_files=$((missing_files + 1))
    else
        echo "✅ محمي: $file"
    fi
done

# فحص وجود المجلدات الحرجة
echo ""
echo "📁 فحص المجلدات الحرجة..."
missing_dirs=0

for dir in "${CRITICAL_DIRS[@]}"; do
    if [ ! -d "$dir" ]; then
        echo "❌ خطر: المجلد مفقود - $dir"
        missing_dirs=$((missing_dirs + 1))
    else
        file_count=$(find "$dir" -type f 2>/dev/null | wc -l)
        echo "✅ محمي: $dir ($file_count ملف)"
    fi
done

# إحصائيات تفصيلية
echo ""
echo "📊 إحصائيات المشروع:"
echo "====================="

if [ -d "src" ]; then
    echo "📄 ملفات TypeScript: $(find src -name "*.ts" -o -name "*.tsx" 2>/dev/null | wc -l)"
    echo "🎨 ملفات CSS: $(find src -name "*.css" 2>/dev/null | wc -l)"
    echo "📱 مكونات UI: $(find src/components/ui -name "*.tsx" 2>/dev/null | wc -l)"
    echo "📄 صفحات التطبيق: $(find src/pages -name "*.tsx" 2>/dev/null | wc -l)"
    echo "🔧 ملفات المكتبات: $(find src/lib -name "*.ts" 2>/dev/null | wc -l)"
fi

# التحقق من حالة Git
echo ""
echo "🔄 حالة Git:"
echo "============"

# التحقق من الفروع
current_branch=$(git branch --show-current 2>/dev/null || echo "غير محدد")
echo "🌿 الفرع الحالي: $current_branch"

# التحقق من التغييرات غير المحفوظة
unstaged_changes=$(git diff --name-only 2>/dev/null | wc -l)
staged_changes=$(git diff --cached --name-only 2>/dev/null | wc -l)

echo "📝 تغييرات غير محفوظة: $unstaged_changes"
echo "📋 تغييرات محفوظة: $staged_changes"

# التحقق من الملفات المتجاهلة بالخطأ
echo ""
echo "🔍 فحص الملفات المتجاهلة..."
ignored_critical=0

for file in "${CRITICAL_FILES[@]}"; do
    if git check-ignore "$file" >/dev/null 2>&1; then
        echo "⚠️  تحذير: الملف متجاهل في Git - $file"
        ignored_critical=$((ignored_critical + 1))
    fi
done

# النتيجة النهائية
echo ""
echo "📋 تقرير الحماية النهائي:"
echo "=========================="

if [ $missing_files -eq 0 ] && [ $missing_dirs -eq 0 ] && [ $ignored_critical -eq 0 ]; then
    echo "🎉 مبروك! جميع الملفات محمية وآمنة"
    echo "✅ يمكنك الرفع إلى GitHub بأمان"
    
    # عرض الأوامر المقترحة
    echo ""
    echo "🚀 أوامر الرفع الآمن:"
    echo "==================="
    echo "git add ."
    echo "git commit -m 'تحديث المشروع - جميع الملفات محمية'"
    echo "git push origin $current_branch"
    
    exit 0
else
    echo "⛔ خطر! توجد مشاكل يجب حلها:"
    echo "📊 ملفات مفقودة: $missing_files"
    echo "📊 مجلدات مفقودة: $missing_dirs" 
    echo "📊 ملفات متجاهلة بالخطأ: $ignored_critical"
    echo ""
    echo "🔧 احرص على حل هذه المشاكل قبل الرفع!"
    
    exit 1
fi
