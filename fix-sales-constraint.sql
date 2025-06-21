-- ===============================================
-- إصلاح قيد المبيعات وتنظيف البيانات
-- Fix Sales Constraint and Clean Data
-- ===============================================

-- 1. إصلا�� المبيعات التي لديها subscriber_id = null و customer_name = null
UPDATE sales 
SET customer_name = 'زبون سابق'
WHERE subscriber_id IS NULL 
  AND (customer_name IS NULL OR customer_name = '');

-- 2. التحقق من وجود مبيعات مع مشتركين محذوفين
UPDATE sales 
SET customer_name = COALESCE(
  (SELECT name FROM subscribers WHERE id = sales.subscriber_id), 
  'مشترك محذوف'
),
subscriber_id = NULL
WHERE subscriber_id IS NOT NULL 
  AND NOT EXISTS (
    SELECT 1 FROM subscribers WHERE id = sales.subscriber_id
  );

-- 3. التأكد من أن جميع المبيعات تحترم القيد
SELECT 
  'فحص قيد المبيعات:' as info,
  COUNT(*) as total_sales,
  COUNT(CASE WHEN subscriber_id IS NOT NULL AND customer_name IS NULL THEN 1 END) as with_subscriber,
  COUNT(CASE WHEN subscriber_id IS NULL AND customer_name IS NOT NULL THEN 1 END) as with_customer_name,
  COUNT(CASE WHEN subscriber_id IS NULL AND customer_name IS NULL THEN 1 END) as invalid_sales
FROM sales;

-- 4. إنشاء دالة لحذف المشترك بأمان
CREATE OR REPLACE FUNCTION safe_delete_subscriber(subscriber_id_param UUID)
RETURNS VOID AS $$
DECLARE
  subscriber_name TEXT;
  sales_count INTEGER;
BEGIN
  -- الحصول على اسم المشترك
  SELECT name INTO subscriber_name
  FROM subscribers 
  WHERE id = subscriber_id_param;
  
  IF subscriber_name IS NULL THEN
    RAISE EXCEPTION 'المشترك غير موجود: %', subscriber_id_param;
  END IF;
  
  -- تحديث المبيعات المرتبطة
  UPDATE sales 
  SET subscriber_id = NULL,
      customer_name = subscriber_name
  WHERE subscriber_id = subscriber_id_param;
  
  GET DIAGNOSTICS sales_count = ROW_COUNT;
  
  IF sales_count > 0 THEN
    RAISE NOTICE 'تم تحديث % مبيعة وفصلها عن المشترك', sales_count;
  END IF;
  
  -- حذف المجموعات المرتبطة
  DELETE FROM groups WHERE subscriber_id = subscriber_id_param;
  
  -- حذف المشترك
  DELETE FROM subscribers WHERE id = subscriber_id_param;
  
  RAISE NOTICE 'تم حذف المشترك % بنجاح', subscriber_name;
END;
$$ LANGUAGE plpgsql;

-- 5. إنشاء دالة للتحقق من سلامة البيانات
CREATE OR REPLACE FUNCTION check_sales_integrity()
RETURNS TABLE (
  issue_type TEXT,
  count BIGINT,
  description TEXT
) AS $$
BEGIN
  -- فحص المبيعات بدون مشترك أو اسم زبون
  RETURN QUERY
  SELECT 
    'invalid_sales'::TEXT,
    COUNT(*),
    'مبيعات بدون مشترك أو اسم زبون'::TEXT
  FROM sales 
  WHERE subscriber_id IS NULL AND (customer_name IS NULL OR customer_name = '');
  
  -- فحص المبيعات مع مشتركين غير موجودين
  RETURN QUERY
  SELECT 
    'orphaned_sales'::TEXT,
    COUNT(*),
    'مبيعات مع مشتركين محذوفين'::TEXT
  FROM sales s
  WHERE s.subscriber_id IS NOT NULL 
    AND NOT EXISTS (SELECT 1 FROM subscribers WHERE id = s.subscriber_id);
  
  -- فحص المجموعات مع مشتركين غير موجودين
  RETURN QUERY
  SELECT 
    'orphaned_groups'::TEXT,
    COUNT(*),
    'مجموعات مع مشتركين محذوفين'::TEXT
  FROM groups g
  WHERE NOT EXISTS (SELECT 1 FROM subscribers WHERE id = g.subscriber_id);
END;
$$ LANGUAGE plpgsql;

-- 6. تنظيف المجموعات اليتيمة
DELETE FROM groups 
WHERE NOT EXISTS (
  SELECT 1 FROM subscribers WHERE id = groups.subscriber_id
);

-- 7. فحص النتائج النهائية
SELECT * FROM check_sales_integrity();

-- رسالة النجاح
DO $$
BEGIN
  RAISE NOTICE '✅ تم إصلاح قيد المبيعات بنجاح!';
  RAISE NOTICE '🔧 تم إنشاء دالة safe_delete_subscriber()';
  RAISE NOTICE '🔍 تم إنشاء دالة check_sales_integrity()';
  RAISE NOTICE '🧹 تم تنظيف البيانات اليتيمة';
  RAISE NOTICE '📊 يمكنك الآن حذف المشتركين بأمان';
END $$;
