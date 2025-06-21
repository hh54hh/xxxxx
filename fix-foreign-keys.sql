-- ========================================================
-- سكريبت إصلاح العلاقات (Foreign Keys) في قاعدة البيانات
-- Fix Foreign Key Relationships
-- ========================================================

-- 1. أولاً، دعنا نتحقق من الجداول الموجودة
SELECT 
    'الجداول الموجودة:' as info,
    table_name,
    '✅ موجود' as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
    AND table_name IN ('subscribers', 'course_points', 'diet_items', 'products', 'sales', 'groups', 'group_items', 'sale_items')
ORDER BY table_name;

-- 2. فحص العلاقات الموجودة حالياً
SELECT 
    'العلاقات الموجودة:' as info,
    tc.table_name, 
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_schema = 'public'
ORDER BY tc.table_name;

-- ========================================================
-- 3. إضافة Foreign Key Constraints المفقودة
-- ========================================================

-- إضافة foreign key لجدول groups إذا لم يكن موجوداً
DO $$
BEGIN
    -- التحقق من وجود العلاقة أولاً
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'groups' 
        AND constraint_type = 'FOREIGN KEY' 
        AND constraint_name LIKE '%subscriber%'
    ) THEN
        ALTER TABLE groups 
        ADD CONSTRAINT fk_groups_subscriber_id 
        FOREIGN KEY (subscriber_id) REFERENCES subscribers(id) ON DELETE CASCADE;
        RAISE NOTICE 'تم إضافة foreign key للمشتركين في جدول groups';
    ELSE
        RAISE NOTICE 'foreign key للمشتركين موجود مسبقاً في جدول groups';
    END IF;
END $$;

-- إضافة foreign key لجدول group_items إذا لم يكن موجوداً
DO $$
BEGIN
    -- التحقق من وجود العلاقة مع groups
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'group_items' 
        AND constraint_type = 'FOREIGN KEY' 
        AND constraint_name LIKE '%group%'
    ) THEN
        ALTER TABLE group_items 
        ADD CONSTRAINT fk_group_items_group_id 
        FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE;
        RAISE NOTICE 'تم إضافة foreign key للمجموعات في جدول group_items';
    ELSE
        RAISE NOTICE 'foreign key للمجموعات موجود مسبقاً في جدول group_items';
    END IF;
END $$;

-- إضافة foreign key لجدول sale_items إذا لم يكن موجوداً
DO $$
BEGIN
    -- للمبيعات
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'sale_items' 
        AND constraint_type = 'FOREIGN KEY' 
        AND constraint_name LIKE '%sale%'
    ) THEN
        ALTER TABLE sale_items 
        ADD CONSTRAINT fk_sale_items_sale_id 
        FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE;
        RAISE NOTICE 'تم إضافة foreign key للمبيعات في جدول sale_items';
    ELSE
        RAISE NOTICE 'foreign key للمبيعات موجود مسبقاً في جدول sale_items';
    END IF;

    -- للمنتجات
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'sale_items' 
        AND constraint_type = 'FOREIGN KEY' 
        AND constraint_name LIKE '%product%'
    ) THEN
        ALTER TABLE sale_items 
        ADD CONSTRAINT fk_sale_items_product_id 
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT;
        RAISE NOTICE 'تم إضافة foreign key للمنتجات في جدول sale_items';
    ELSE
        RAISE NOTICE 'foreign key للمنتجات موجود مسبقاً في جدول sale_items';
    END IF;
END $$;

-- ========================================================
-- 4. إنشاء جداول فرعية لحل مشكلة العلاقات المختلطة
-- ========================================================

-- إنشاء جدول منفصل لعناصر المجموعات التدريبية
CREATE TABLE IF NOT EXISTS group_course_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    course_point_id UUID NOT NULL REFERENCES course_points(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_group_course UNIQUE (group_id, course_point_id)
);

-- إنشاء جدول منفصل لعناصر المجموعات الغذائية  
CREATE TABLE IF NOT EXISTS group_diet_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    diet_item_id UUID NOT NULL REFERENCES diet_items(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_group_diet UNIQUE (group_id, diet_item_id)
);

-- إنشاء فهارس للجداول الجديدة
CREATE INDEX IF NOT EXISTS idx_group_course_items_group_id ON group_course_items(group_id);
CREATE INDEX IF NOT EXISTS idx_group_course_items_course_id ON group_course_items(course_point_id);
CREATE INDEX IF NOT EXISTS idx_group_diet_items_group_id ON group_diet_items(group_id);
CREATE INDEX IF NOT EXISTS idx_group_diet_items_diet_id ON group_diet_items(diet_item_id);

-- ========================================================
-- 5. نقل البيانات من group_items إلى الجداول الجديدة
-- ========================================================

-- نقل بيانات المجموعات التدريبية
INSERT INTO group_course_items (group_id, course_point_id, created_at)
SELECT DISTINCT 
    gi.group_id, 
    gi.item_id as course_point_id, 
    gi.created_at
FROM group_items gi
JOIN groups g ON gi.group_id = g.id
WHERE g.type = 'course'
    AND EXISTS (SELECT 1 FROM course_points WHERE id = gi.item_id)
ON CONFLICT (group_id, course_point_id) DO NOTHING;

-- نقل بيانات المجموعات الغذائية
INSERT INTO group_diet_items (group_id, diet_item_id, created_at)
SELECT DISTINCT 
    gi.group_id, 
    gi.item_id as diet_item_id, 
    gi.created_at
FROM group_items gi
JOIN groups g ON gi.group_id = g.id
WHERE g.type = 'diet'
    AND EXISTS (SELECT 1 FROM diet_items WHERE id = gi.item_id)
ON CONFLICT (group_id, diet_item_id) DO NOTHING;

-- ========================================================
-- 6. إنشاء Views للاستعلاما�� السهلة
-- ========================================================

-- عرض المجموعات مع عناصرها
CREATE OR REPLACE VIEW groups_with_items AS
SELECT 
    g.*,
    -- للمجموعات التدريبية
    CASE WHEN g.type = 'course' THEN (
        SELECT json_agg(
            json_build_object(
                'id', gci.id,
                'group_id', gci.group_id,
                'item_id', gci.course_point_id,
                'created_at', gci.created_at,
                'course_point', row_to_json(cp.*),
                'diet_item', null
            )
        )
        FROM group_course_items gci
        LEFT JOIN course_points cp ON gci.course_point_id = cp.id
        WHERE gci.group_id = g.id
    ) ELSE NULL END as course_items,
    
    -- للمجموعات الغذائية
    CASE WHEN g.type = 'diet' THEN (
        SELECT json_agg(
            json_build_object(
                'id', gdi.id,
                'group_id', gdi.group_id,
                'item_id', gdi.diet_item_id,
                'created_at', gdi.created_at,
                'course_point', null,
                'diet_item', row_to_json(di.*)
            )
        )
        FROM group_diet_items gdi
        LEFT JOIN diet_items di ON gdi.diet_item_id = di.id
        WHERE gdi.group_id = g.id
    ) ELSE NULL END as diet_items
    
FROM groups g;

-- ========================================================
-- 7. إنشاء دوال مساعدة للعمليات
-- ========================================================

-- دالة إضافة عنصر تدريبي لمجموعة
CREATE OR REPLACE FUNCTION add_course_to_group(
    p_group_id UUID,
    p_course_id UUID
) RETURNS VOID AS $$
BEGIN
    INSERT INTO group_course_items (group_id, course_point_id)
    VALUES (p_group_id, p_course_id)
    ON CONFLICT (group_id, course_point_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql;

-- دالة إضافة عنصر غذائي لمجموعة  
CREATE OR REPLACE FUNCTION add_diet_to_group(
    p_group_id UUID,
    p_diet_id UUID
) RETURNS VOID AS $$
BEGIN
    INSERT INTO group_diet_items (group_id, diet_item_id)
    VALUES (p_group_id, p_diet_id)
    ON CONFLICT (group_id, diet_item_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql;

-- دالة حذف عنصر من مجموعة
CREATE OR REPLACE FUNCTION remove_item_from_group(
    p_group_id UUID,
    p_item_id UUID,
    p_type VARCHAR(10)
) RETURNS VOID AS $$
BEGIN
    IF p_type = 'course' THEN
        DELETE FROM group_course_items 
        WHERE group_id = p_group_id AND course_point_id = p_item_id;
    ELSIF p_type = 'diet' THEN
        DELETE FROM group_diet_items 
        WHERE group_id = p_group_id AND diet_item_id = p_item_id;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- ========================================================
-- 8. التحقق من نجاح العملية
-- ========================================================

-- فحص العلاقات الجديدة
SELECT 
    'العلاقات بعد الإصلاح:' as info,
    tc.table_name, 
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_schema = 'public'
    AND tc.table_name IN ('groups', 'group_items', 'group_course_items', 'group_diet_items', 'sale_items')
ORDER BY tc.table_name;

-- إحصائيات البيانات المنقولة
SELECT 
    'إحصائيات البيانات:' as info,
    'group_course_items' as table_name,
    COUNT(*) as count
FROM group_course_items
UNION ALL
SELECT '', 'group_diet_items', COUNT(*) FROM group_diet_items
UNION ALL  
SELECT '', 'groups', COUNT(*) FROM groups
UNION ALL
SELECT '', 'group_items (قديم)', COUNT(*) FROM group_items;

-- ========================================================
-- رسالة النجاح
-- ========================================================

DO $$
BEGIN
    RAISE NOTICE '✅ تم إصلاح مشكلة العلاقات بنجاح!';
    RAISE NOTICE '🔗 تم إنشاء Foreign Key Constraints';
    RAISE NOTICE '📊 تم إنشاء جداول منفصلة للعلاقات';
    RAISE NOTICE '🔄 تم نقل البيانات للجداول الجديدة';
    RAISE NOTICE '📋 تم إنشاء Views مساعدة';
    RAISE NOTICE '⚡ تم إنشاء دوال للعمليات';
    RAISE NOTICE '';
    RAISE NOTICE '💡 الآن يمكن:';
    RAISE NOTICE '   • استخدام الجداول الجديدة للعلاقات الصحيحة';
    RAISE NOTICE '   • الاستعلام بسهولة باستخدام groups_with_items';
    RAISE NOTICE '   • إضافة/حذف العناصر باستخدام الدوال المساعدة';
END $$;
