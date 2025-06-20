-- إصلاح قيود قاعدة البيانات لحل مشكلة حذف المشتركين
-- يجب تشغيل هذا في Supabase SQL Editor

-- 1. حذف القيد الحالي المقيد
ALTER TABLE sales DROP CONSTRAINT IF EXISTS sales_subscriber_id_fkey;

-- 2. إضافة القيد الجديد مع ON DELETE SET NULL
ALTER TABLE sales 
ADD CONSTRAINT sales_subscriber_id_fkey 
FOREIGN KEY (subscriber_id) 
REFERENCES subscribers(id) 
ON DELETE SET NULL;

-- 3. التحقق من القيود الأخرى وإصلاحها إذا لزم الأمر

-- قيد group_items (إذا كان موجوداً)
ALTER TABLE group_items DROP CONSTRAINT IF EXISTS group_items_group_id_fkey;
ALTER TABLE group_items 
ADD CONSTRAINT group_items_group_id_fkey 
FOREIGN KEY (group_id) 
REFERENCES groups(id) 
ON DELETE CASCADE;

-- قيد groups
ALTER TABLE groups DROP CONSTRAINT IF EXISTS groups_subscriber_id_fkey;
ALTER TABLE groups 
ADD CONSTRAINT groups_subscriber_id_fkey 
FOREIGN KEY (subscriber_id) 
REFERENCES subscribers(id) 
ON DELETE CASCADE;

-- قيد sale_items
ALTER TABLE sale_items DROP CONSTRAINT IF EXISTS sale_items_sale_id_fkey;
ALTER TABLE sale_items 
ADD CONSTRAINT sale_items_sale_id_fkey 
FOREIGN KEY (sale_id) 
REFERENCES sales(id) 
ON DELETE CASCADE;

ALTER TABLE sale_items DROP CONSTRAINT IF EXISTS sale_items_product_id_fkey;
ALTER TABLE sale_items 
ADD CONSTRAINT sale_items_product_id_fkey 
FOREIGN KEY (product_id) 
REFERENCES products(id) 
ON DELETE RESTRICT;

-- 4. عرض ملخص القيود الحالية
SELECT
    tc.table_name, 
    tc.constraint_name, 
    tc.constraint_type,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    rc.delete_rule
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
LEFT JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
LEFT JOIN information_schema.referential_constraints AS rc
    ON tc.constraint_name = rc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_schema = 'public'
ORDER BY tc.table_name, tc.constraint_name;

SELECT 'تم إصلاح قيود قاعدة البيانات بنجاح!' AS status;
