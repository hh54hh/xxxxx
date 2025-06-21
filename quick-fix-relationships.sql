-- ========================================
-- إصلاح سريع لمشكلة العلاقات
-- Quick Fix for Relationships Problem
-- ========================================

-- 1. إنشاء الجداول الجديدة للعلاقات الصحيحة
CREATE TABLE IF NOT EXISTS group_course_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    course_point_id UUID NOT NULL REFERENCES course_points(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_group_course UNIQUE (group_id, course_point_id)
);

CREATE TABLE IF NOT EXISTS group_diet_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    diet_item_id UUID NOT NULL REFERENCES diet_items(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_group_diet UNIQUE (group_id, diet_item_id)
);

-- 2. إنشاء الفهارس
CREATE INDEX IF NOT EXISTS idx_group_course_items_group_id ON group_course_items(group_id);
CREATE INDEX IF NOT EXISTS idx_group_course_items_course_id ON group_course_items(course_point_id);
CREATE INDEX IF NOT EXISTS idx_group_diet_items_group_id ON group_diet_items(group_id);
CREATE INDEX IF NOT EXISTS idx_group_diet_items_diet_id ON group_diet_items(diet_item_id);

-- 3. نقل البيانات الموجودة (إن وجدت)
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

-- 4. رسالة النجاح
SELECT 'تم إصلاح العلاقات بنجاح! ✅' as result;
SELECT 
    'إحصائيات:' as info,
    'group_course_items' as table_name,
    COUNT(*) as count
FROM group_course_items
UNION ALL
SELECT '', 'group_diet_items', COUNT(*) FROM group_diet_items;
