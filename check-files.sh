#!/bin/bash

echo "🔍 فحص الملفات قبل الرفع إلى GitHub..."

# تحقق من وجود الملفات المهمة
echo "📁 التحقق من وجود الملفات الأساسية..."

important_files=(
    "package.json"
    "src/App.tsx"
    "src/main.tsx"
    "src/lib/utils.ts"
    "src/lib/supabase.ts"
    "src/lib/utils-enhanced.ts"
    "index.html"
    "vite.config.ts"
    "tailwind.config.ts"
    "tsconfig.json"
)

missing_files=()

for file in "${important_files[@]}"; do
    if [ ! -f "$file" ]; then
        missing_files+=("$file")
        echo "❌ الملف مفقود: $file"
    else
        echo "✅ موجود: $file"
    fi
done

# تحقق من مجلدات ا��مصدر
echo ""
echo "📂 التحقق من المجلدات الأساسية..."

important_dirs=(
    "src/components"
    "src/components/ui"
    "src/pages"
    "src/lib"
    "src/types"
    "src/hooks"
    "public"
)

for dir in "${important_dirs[@]}"; do
    if [ ! -d "$dir" ]; then
        echo "❌ المجلد مفقود: $dir"
    else
        file_count=$(find "$dir" -type f | wc -l)
        echo "✅ موجود: $dir ($file_count ملف)"
    fi
done

# تحقق من ملفات الأنواع
echo ""
echo "📄 إحصائيات الملفات:"
echo "TypeScript files: $(find src -name "*.ts" -o -name "*.tsx" | wc -l)"
echo "Component files: $(find src/components -name "*.tsx" | wc -l)"
echo "Page files: $(find src/pages -name "*.tsx" | wc -l)"
echo "Library files: $(find src/lib -name "*.ts" | wc -l)"

if [ ${#missing_files[@]} -eq 0 ]; then
    echo ""
    echo "🎉 جميع الملفات المهمة موجودة! يمكنك الرفع بأمان."
    exit 0
else
    echo ""
    echo "⚠️  تم العثور على ملفات مفقودة. يرجى التحقق قبل الرفع."
    exit 1
fi
