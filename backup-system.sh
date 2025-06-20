#!/bin/bash

# ================================================
# نظام النسخ الاحتياطي التلقائي
# Automatic Backup System for Hossam Gym
# ================================================

# إعدادات النسخ الاحتياطي
BACKUP_DIR="backups"
DATE=$(date +"%Y%m%d_%H%M%S")
PROJECT_NAME="hossam-gym"
BACKUP_NAME="${PROJECT_NAME}_backup_${DATE}"

# إنشاء مجلد النسخ الاحتياطي
mkdir -p $BACKUP_DIR

echo "🔄 بدء عملية النسخ الاحتياطي..."
echo "📅 التاريخ: $(date)"
echo "📁 اسم النسخة: $BACKUP_NAME"
echo "=================================="

# قائمة الملفات والمجلدات المهمة للنسخ الاحتياطي
IMPORTANT_FILES=(
    "src"
    "public"
    "package.json"
    "package-lock.json"
    "tsconfig.json"
    "vite.config.ts"
    "tailwind.config.ts"
    "components.json"
    "index.html"
    "README.md"
    "CONTRIBUTING.md"
    "LICENSE"
    "*.sql"
    "*.md"
    ".gitignore"
)

# إنشاء مجلد النسخة الاحتياطية
BACKUP_PATH="$BACKUP_DIR/$BACKUP_NAME"
mkdir -p "$BACKUP_PATH"

# نسخ الملفات المهمة
echo "📋 نسخ الملفات الأساسية..."
for item in "${IMPORTANT_FILES[@]}"; do
    if [ -e "$item" ]; then
        echo "  ✅ نسخ: $item"
        cp -r "$item" "$BACKUP_PATH/" 2>/dev/null || echo "  ⚠️ تعذر نسخ: $item"
    else
        echo "  ⚠️ غير موجود: $item"
    fi
done

# نسخ ملفات الإعداد
echo ""
echo "⚙️ نسخ ملفات الإعداد..."
CONFIG_FILES=(
    ".env.example"
    ".eslintrc.json"
    ".prettierrc"
    "postcss.config.js"
)

for config in "${CONFIG_FILES[@]}"; do
    if [ -e "$config" ]; then
        echo "  ✅ نسخ: $config"
        cp "$config" "$BACKUP_PATH/" 2>/dev/null
    fi
done

# إنشاء ملف معلومات النسخة الاحتياطية
echo ""
echo "📄 إنشاء ملف معلومات النسخة..."
cat > "$BACKUP_PATH/backup_info.txt" << EOF
# معلومات النسخة الاحتياطية
# Backup Information

تاريخ النسخ: $(date)
اسم المشروع: $PROJECT_NAME
إصدار Node.js: $(node --version 2>/dev/null || echo "غير مثبت")
إصدار npm: $(npm --version 2>/dev/null || echo "غير مثبت")

# إحصائيات المشروع
عدد ملفات JavaScript/TypeScript: $(find src -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" | wc -l)
عدد ملفات CSS: $(find src -name "*.css" | wc -l)
عدد المكونات: $(find src/components -name "*.tsx" | wc -l)
عدد الصفحات: $(find src/pages -name "*.tsx" | wc -l)

# Git معلومات (إن وجدت)
Git Commit: $(git rev-parse HEAD 2>/dev/null || echo "غير متاح")
Git Branch: $(git branch --show-current 2>/dev/null || echo "غير متاح")

# حجم المشروع
حجم مجلد src: $(du -sh src 2>/dev/null || echo "غير متاح")
حجم node_modules: $(du -sh node_modules 2>/dev/null || echo "غير مثبت")
EOF

# ضغط النسخة الاحتياطية
echo ""
echo "🗜️ ضغط النسخة الاحتياطية..."
cd "$BACKUP_DIR"
tar -czf "${BACKUP_NAME}.tar.gz" "$BACKUP_NAME"

if [ $? -eq 0 ]; then
    echo "  ✅ تم ضغط النسخة بنجاح"
    
    # حذف المجلد غير المضغوط
    rm -rf "$BACKUP_NAME"
    
    # حجم الملف المضغوط
    BACKUP_SIZE=$(du -sh "${BACKUP_NAME}.tar.gz" | cut -f1)
    echo "  📦 حجم النسخة المضغوطة: $BACKUP_SIZE"
else
    echo "  ❌ فشل في ضغط النسخة"
fi

cd ..

# تنظيف النسخ القديمة (الاحتفاظ بآخر 10 نسخ)
echo ""
echo "🧹 تنظيف النسخ القديمة..."
cd "$BACKUP_DIR"
ls -t *.tar.gz | tail -n +11 | xargs -r rm -f
REMAINING_BACKUPS=$(ls *.tar.gz 2>/dev/null | wc -l)
echo "  📊 عدد النسخ المتبقية: $REMAINING_BACKUPS"
cd ..

echo ""
echo "=================================="
echo "✅ تمت عملية النسخ الاحتياطي بنجاح!"
echo "📁 مسار النسخة: $BACKUP_DIR/${BACKUP_NAME}.tar.gz"
echo "⏰ وقت الانتهاء: $(date)"
echo ""

# عرض قائمة النسخ الاحتياطية
echo "📋 النسخ الاحتياطية المتاحة:"
ls -lah "$BACKUP_DIR"/*.tar.gz 2>/dev/null || echo "  لا توجد نسخ احتياطية"

echo ""
echo "💡 نصائح:"
echo "  • لاستعادة النسخة: tar -xzf $BACKUP_DIR/${BACKUP_NAME}.tar.gz"
echo "  • لنسخ احتياطي منتظم: أضف هذا السكريبت إلى crontab"
echo "  • احفظ النسخ في مكان آمن خارج الخادم"
echo ""
echo "🎉 انتهت عملية النسخ الاحتياطي!"
