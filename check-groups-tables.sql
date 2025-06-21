-- فحص وإصلاح جداول المجموعات
-- تشغيل هذا في Supabase SQL Editor

-- 1. فحص الجداول الموجودة
SELECT 
    table_name,
    CASE 
        WHEN table_name IN ('groups', 'group_items') THEN '✅ موجود'
        ELSE '❌ مفقود'
    END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
    AND table_name IN ('groups', 'group_items', 'subscribers', 'course_points', 'diet_items')
ORDER BY table_name;

-- 2. إنشاء جدول المجموعات إذا لم يكن موجوداً
CREATE TABLE IF NOT EXISTS groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subscriber_id UUID NOT NULL REFERENCES subscribers(id) ON DELETE CASCADE,
    type VARCHAR(10) NOT NULL CHECK (type IN ('course', 'diet')),
    title VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. إنشاء جدول عناصر المجموعات إذا لم يكن موجوداً
CREATE TABLE IF NOT EXISTS group_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    item_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. إنشاء فهارس لتحسين الأداء
CREATE INDEX IF NOT EXISTS idx_groups_subscriber_id ON groups(subscriber_id);
CREATE INDEX IF NOT EXISTS idx_groups_type ON groups(type);
CREATE INDEX IF NOT EXISTS idx_group_items_group_id ON group_items(group_id);
CREATE INDEX IF NOT EXISTS idx_group_items_item_id ON group_items(item_id);

-- 5. إنشاء trigger لتحديث updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_groups_updated_at ON groups;
CREATE TRIGGER update_groups_updated_at 
    BEFORE UPDATE ON groups 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 6. فحص البيانات الموجودة
SELECT 'فحص البيانات الموجودة:' as info;

SELECT 
    'subscribers' as table_name,
    COUNT(*) as count
FROM subscribers
UNION ALL
SELECT 'course_points', COUNT(*) FROM course_points
UNION ALL
SELECT 'diet_items', COUNT(*) FROM diet_items
UNION ALL
SELECT 'groups', COUNT(*) FROM groups
UNION ALL
SELECT 'group_items', COUNT(*) FROM group_items;

-- 7. اختبار إنشاء مجموعة تجريبية (سيتم حذفها)
DO $$
DECLARE
    test_subscriber_id UUID;
    test_group_id UUID;
    test_course_id UUID;
BEGIN
    -- البحث عن مشترك موجود
    SELECT id INTO test_subscriber_id FROM subscribers LIMIT 1;
    
    -- البحث عن كورس موجود
    SELECT id INTO test_course_id FROM course_points LIMIT 1;
    
    IF test_subscriber_id IS NOT NULL AND test_course_id IS NOT NULL THEN
        -- إنشاء مجموعة تجريبية
        INSERT INTO groups (subscriber_id, type, title) 
        VALUES (test_subscriber_id, 'course', 'اختبار المجموعة')
        RETURNING id INTO test_group_id;
        
        -- إضافة عنصر للمجموعة
        INSERT INTO group_items (group_id, item_id) 
        VALUES (test_group_id, test_course_id);
        
        -- حذف البيانات التجريبية
        DELETE FROM groups WHERE id = test_group_id;
        
        RAISE NOTICE 'تم اختبار إنشاء المجموعات بنجاح ✅';
    ELSE
        RAISE NOTICE 'لا توجد بيانات كافية للاختبار';
    END IF;
END $$;

-- 8. عرض هيكل الجداول
SELECT 
    'هيكل جدول groups:' as info,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'groups' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT 
    'هيكل جدول group_items:' as info,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'group_items' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT 'تم إعداد جداول المجموعات بنجاح! ✅' as result;
