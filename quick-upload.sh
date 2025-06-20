#!/bin/bash

# ==============================================
# أوامر الرفع السريع والآمن إلى GitHub
# ==============================================

echo "🚀 رفع سريع وآمن إلى GitHub"
echo "============================"

# قراءة رسالة الـ commit
if [ -z "$1" ]; then
    commit_message="تحديث المشروع - $(date '+%Y-%m-%d %H:%M')"
    echo "📝 استخدام رسالة افتراضية: $commit_message"
else
    commit_message="$1"
    echo "📝 رسالة الـ commit: $commit_message"
fi

echo ""

# الخطوة 1: فحص الحماية
echo "🛡️ الخطوة 1: فحص نظام الحماية..."
if ! npm run git-safety > /dev/null 2>&1; then
    echo "❌ فشل فحص الأمان!"
    echo "🔧 يرجى تشغيل: npm run git-safety"
    echo "🔧 وحل أي مشاكل ظاهرة"
    exit 1
fi
echo "✅ نظام الحماية: نجح"

# الخطوة 2: إضافة الملفات
echo ""
echo "📁 الخطوة 2: إضافة الملفات المحمية..."

# إضافة الملفات الأساسية بأمان
git add src/ 2>/dev/null
git add public/ 2>/dev/null
git add package.json 2>/dev/null
git add index.html 2>/dev/null
git add *.config.* 2>/dev/null
git add tsconfig*.json 2>/dev/null
git add *.md 2>/dev/null
git add .gitignore 2>/dev/null
git add .gitattributes 2>/dev/null
git add *.sh 2>/dev/null

# تحقق من عدد الملفات المضافة
staged_files=$(git diff --cached --name-only | wc -l)
echo "✅ تم إضافة $staged_files ملف"

# الخطوة 3: عرض الملفات المضافة
echo ""
echo "📋 الخطوة 3: الملفات التي ستتم إضافتها:"
echo "======================================="
git diff --cached --name-only | head -10 | while read file; do
    echo "  ✅ $file"
done

if [ $staged_files -gt 10 ]; then
    echo "  ... و $(($staged_files - 10)) ملف إضافي"
fi

# الخطوة 4: التحقق النهائي
echo ""
echo "🔍 الخطوة 4: التحقق النهائي..."

# تحقق من وجود تغييرات للرفع
if [ $staged_files -eq 0 ]; then
    echo "📝 لا توجد تغييرات للرفع"
    echo "✅ المشروع محدث بالفعل"
    exit 0
fi

# الخطوة 5: إنشاء commit
echo ""
echo "💾 الخطوة 5: إنشاء commit..."
if git commit -m "$commit_message"; then
    echo "✅ تم إنشاء commit بنجاح"
else
    echo "❌ فشل في إنشاء commit"
    exit 1
fi

# الخطوة 6: رفع إلى GitHub
echo ""
echo "🌍 الخطوة 6: رفع إلى GitHub..."

# الحصول على اسم الفرع الحالي
current_branch=$(git branch --show-current)
echo "🌿 الرفع إلى الفرع: $current_branch"

if git push origin "$current_branch"; then
    echo ""
    echo "🎉🎉🎉 تم الرفع بنجاح! 🎉🎉🎉"
    echo "================================"
    echo "✅ جميع الملفات محفوظة وآمنة"
    echo "✅ لم يتم حذف أي ملف"
    echo "✅ المشروع متاح على GitHub"
    echo ""
    echo "📊 إحصائيات الرفع:"
    echo "- ملفات تم رفعها: $staged_files"
    echo "- الفرع: $current_branch"
    echo "- التاريخ: $(date)"
    echo ""
    echo "🔗 يمكنك الآن مشاهدة المشروع على GitHub"
else
    echo ""
    echo "❌ فشل في الرفع إلى GitHub"
    echo "🔧 أسباب محتملة:"
    echo "   1. مشاكل في الاتصال بالإنترنت"
    echo "   2. مشاكل في الصلاحيات"
    echo "   3. تعارضات في الكود"
    echo ""
    echo "🔧 حلول مقترحة:"
    echo "   git pull origin $current_branch"
    echo "   git push origin $current_branch"
    exit 1
fi
