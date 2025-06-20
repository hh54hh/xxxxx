#!/bin/bash

# نظام النسخ الاحتياطي الذكي للمشروع
# يحفظ نسخة كاملة من جميع الملفات قبل أي عملية رفع

echo "🛡️ نظام الحماية والنسخ الاحتياطي الذكي"
echo "==============================================="

# إنشاء مجلد النسخ الاحتياطية
BACKUP_DIR="project-backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_NAME="backup_${TIMESTAMP}"
FULL_BACKUP_PATH="${BACKUP_DIR}/${BACKUP_NAME}"

mkdir -p "$BACKUP_DIR"

echo "📦 إنشاء نسخة احتياطية: $BACKUP_NAME"

# نسخ جميع الملفات المهمة
echo "📁 نسخ الملفات..."

# إنشاء مجلد النسخة الاحتياطية
mkdir -p "$FULL_BACKUP_PATH"

# نسخ مجلد src كاملاً
cp -r src "$FULL_BACKUP_PATH/"
echo "✅ تم نسخ مجلد src"

# نسخ مجلد public
cp -r public "$FULL_BACKUP_PATH/"
echo "✅ تم نسخ مجلد public"

# نسخ الملفات الأساسية
important_files=(
    "package.json"
    "package-lock.json"
    "index.html"
    "vite.config.ts"
    "tailwind.config.ts"
    "tsconfig.json"
    "tsconfig.app.json"
    "tsconfig.node.json"
    "postcss.config.js"
    "components.json"
    "database_setup.sql"
    ".gitignore"
    ".gitattributes"
    "AGENTS.md"
    "UPLOAD_GUIDE.md"
)

for file in "${important_files[@]}"; do
    if [ -f "$file" ]; then
        cp "$file" "$FULL_BACKUP_PATH/"
        echo "✅ تم نسخ: $file"
    else
        echo "⚠️  ملف غير موجود: $file"
    fi
done

# إنشاء قائمة بجميع الملفات المنسوخة
echo "📋 إنشاء فهرس الملفات..."
find "$FULL_BACKUP_PATH" -type f > "${FULL_BACKUP_PATH}/file-list.txt"

# حساب عدد الملفات
file_count=$(find "$FULL_BACKUP_PATH" -type f | wc -l)
echo "📊 تم نسخ $file_count ملف"

# إنشاء ملف معلومات النسخة الاحتياطية
cat > "${FULL_BACKUP_PATH}/backup-info.txt" << EOF
نسخة احتياطية للمشروع
====================

التاريخ والوقت: $(date)
عدد الملفات: $file_count
مسار النسخة: $FULL_BACKUP_PATH

الملفات المشمولة:
- مجلد src كاملاً
- مجلد public كاملاً
- جميع ملفات التكوين
- قاعدة البيانات
- ملفات المشروع الأساسية

EOF

echo "🎉 تم إنشاء النسخة الاحتياطية بنجاح!"
echo "📍 المسار: $FULL_BACKUP_PATH"
echo ""

# إنشاء ملف restore script
cat > "${FULL_BACKUP_PATH}/restore.sh" << 'RESTORE_EOF'
#!/bin/bash
echo "🔄 استعادة النسخة الاحتياطية..."

# العودة إلى مجلد المشروع الأصلي
cd ../..

# نسخ الملفات من النسخة الاحتياطية
cp -r src/* src/ 2>/dev/null || cp -r src ./
cp -r public/* public/ 2>/dev/null || cp -r public ./

# نسخ الملفات الأساسية
for file in package.json package-lock.json index.html *.config.* tsconfig*.json *.md; do
    if [ -f "$file" ]; then
        cp "$file" ../.. 2>/dev/null
    fi
done

echo "✅ تم استعادة النسخة الاحتياطية بنجاح!"
RESTORE_EOF

chmod +x "${FULL_BACKUP_PATH}/restore.sh"

echo "💾 تم إنشاء سكريبت الاستعادة: ${FULL_BACKUP_PATH}/restore.sh"
echo ""
echo "للاستعادة اللاحقة، استخدم:"
echo "bash ${FULL_BACKUP_PATH}/restore.sh"
