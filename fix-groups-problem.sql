-- ============================================================
-- سكربت إصلاح مشكلة الأنظمة (البرامج التدريبية والأنظمة الغذائية)
-- Fix Groups Problem - Complete SQL Script
-- ============================================================

-- تفعيل UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. إنشاء جدول المجموعات (Groups Table)
-- ============================================================

CREATE TABLE IF NOT EXISTS groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subscriber_id UUID NOT NULL REFERENCES subscribers(id) ON DELETE CASCADE,
    type VARCHAR(10) NOT NULL CHECK (type IN ('course', 'diet')),
    title VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- 2. إنشاء جدول عناصر المجموعات (Group Items Table)
-- ============================================================

CREATE TABLE IF NOT EXISTS group_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    item_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- 3. إضافة الأعمدة المفقودة في الجداول الموجودة
-- ============================================================

-- إضافة عمود subscription_date إذا لم يكن موجوداً
ALTER TABLE subscribers ADD COLUMN IF NOT EXISTS subscription_date DATE DEFAULT CURRENT_DATE;

-- إضافة عمود stock للمنتجات إذا لم يك�� موجوداً
ALTER TABLE products ADD COLUMN IF NOT EXISTS stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0);

-- إنشاء جدول sale_items إذا لم يكن موجوداً
CREATE TABLE IF NOT EXISTS sale_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sale_id UUID NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(10,2) NOT NULL CHECK (unit_price >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- 4. إنشاء الفهارس لتحسين الأداء
-- ============================================================

-- فهارس جدول المجموعات
CREATE INDEX IF NOT EXISTS idx_groups_subscriber_id ON groups(subscriber_id);
CREATE INDEX IF NOT EXISTS idx_groups_type ON groups(type);
CREATE INDEX IF NOT EXISTS idx_groups_created_at ON groups(created_at);

-- فهارس جدول عناصر المجموعات
CREATE INDEX IF NOT EXISTS idx_group_items_group_id ON group_items(group_id);
CREATE INDEX IF NOT EXISTS idx_group_items_item_id ON group_items(item_id);

-- فهارس جدول المبيعات
CREATE INDEX IF NOT EXISTS idx_sale_items_sale_id ON sale_items(sale_id);
CREATE INDEX IF NOT EXISTS idx_sale_items_product_id ON sale_items(product_id);

-- ============================================================
-- 5. إنشاء الدوال المساعدة
-- ============================================================

-- دالة ��حديث updated_at تلقائياً
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- دالة تحديث المخزون عند البيع
CREATE OR REPLACE FUNCTION update_product_stock(
    product_id UUID,
    quantity_sold INTEGER
) RETURNS VOID AS $$
BEGIN
    UPDATE products 
    SET stock = stock - quantity_sold,
        updated_at = NOW()
    WHERE id = product_id AND stock >= quantity_sold;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'لا يوجد مخزون كافٍ للمنتج أو المنتج غير موجود';
    END IF;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- 6. إنشاء المحفزات (Triggers)
-- ============================================================

-- محفز تحديث updated_at للمجموعات
DROP TRIGGER IF EXISTS update_groups_updated_at ON groups;
CREATE TRIGGER update_groups_updated_at 
    BEFORE UPDATE ON groups 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- محفز تحديث updated_at للمنتجات (إذا لم يكن موجوداً)
DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at 
    BEFORE UPDATE ON products 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- محفز تحديث updated_at للمشتركين (إذا لم يكن موجوداً)
DROP TRIGGER IF EXISTS update_subscribers_updated_at ON subscribers;
CREATE TRIGGER update_subscribers_updated_at 
    BEFORE UPDATE ON subscribers 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- 7. إدراج بيانات تجريبية (اختياري)
-- ============================================================

-- إدراج نقاط التمارين إذا لم تكن موجودة
INSERT INTO course_points (name, description) VALUES
    ('تمرين الضغط', '3 مجموعات × 15 عدة'),
    ('تمرين العقلة', '3 مجموعات × 10 عدات'),
    ('تمرين القرفصاء', '3 مجموعات × 20 عدة'),
    ('تمرين البطن', '3 مجموعات × 25 عدة'),
    ('تمرين الجري', '30 دقيقة متواصلة'),
    ('تمرين الأوزان', 'تمارين الأوزان الحرة'),
    ('تمرين الكارديو', 'تمارين القلب والأوعية الدموية'),
    ('تمرين المقاومة', 'تمارين بناء العضلات')
ON CONFLICT (name) DO NOTHING;

-- إدراج عناصر النظام الغذائي إذا لم تكن موجودة
INSERT INTO diet_items (name, description) VALUES
    ('بروتين مسحوق', '30 جرام بعد التمرين مع الماء'),
    ('صدر دجاج مشوي', '200 جرام مع الغداء'),
    ('البيض المسلوق', '3 بيضات في الإفطار'),
    ('الشوفان', '50 جرام مع الحليب في الإفطار'),
    ('الأرز البني', '150 جرام مع الغداء'),
    ('السلمون المشوي', '150 جرام مع العشاء'),
    ('الخضروات الورقية', 'سلطة خضراء مع كل وجبة'),
    ('المكسرات الطبيعية', 'حفنة يد كوجبة خفيفة')
ON CONFLICT (name) DO NOTHING;

-- إدراج بعض المنتجات إذا لم تكن موجودة
INSERT INTO products (name, price, stock, description) VALUES
    ('بروتين واي', 45000, 20, 'بروتين واي عالي الجودة - 2 كيلو'),
    ('كرياتين', 25000, 15, 'كرياتين مونوهيدرات - 300 جرام'),
    ('فيتامينات متعددة', 15000, 30, 'فيتامينات ومعادن يومية'),
    ('زجاجة مياه رياضية', 5000, 50, 'زجاجة مياه 750 مل'),
    ('قفازات رياضية', 8000, 25, 'قفازات للتمرين - مقاسات مختلفة')
ON CONFLICT (name) DO NOTHING;

-- ============================================================
-- 8. التحقق من نجاح الإنشاء
-- ============================================================

-- فحص الجداول المنشأة
SELECT 
    'فحص الجداول المنشأة:' as info,
    table_name,
    CASE 
        WHEN table_name IN ('subscribers', 'course_points', 'diet_items', 'products', 'sales', 'groups', 'group_items', 'sale_items') 
        THEN '✅ موجود' 
        ELSE '❌ مفقود' 
    END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
    AND table_name IN ('subscribers', 'course_points', 'diet_items', 'products', 'sales', 'groups', 'group_items', 'sale_items')
ORDER BY table_name;

-- فحص الأعمدة المضافة
SELECT 
    'فحص الأعمدة:' as info,
    table_name,
    column_name,
    data_type,
    '✅ موجود' as status
FROM information_schema.columns 
WHERE table_schema = 'public' 
    AND ((table_name = 'subscribers' AND column_name = 'subscription_date')
         OR (table_name = 'products' AND column_name = 'stock'))
ORDER BY table_name, column_name;

-- عدد البيانات في كل جدول
SELECT 
    'إحصائيات البيانات:' as info,
    'course_points' as table_name,
    COUNT(*) as count
FROM course_points
UNION ALL
SELECT '', 'diet_items', COUNT(*) FROM diet_items
UNION ALL
SELECT '', 'products', COUNT(*) FROM products
UNION ALL
SELECT '', 'subscribers', COUNT(*) FROM subscribers
UNION ALL
SELECT '', 'groups', COUNT(*) FROM groups
UNION ALL
SELECT '', 'group_items', COUNT(*) FROM group_items;

-- ============================================================
-- رسالة النجاح
-- ============================================================

DO $$
BEGIN
    RAISE NOTICE '✅ تم إصلاح مشكلة الأنظمة بنجاح!';
    RAISE NOTICE '📊 تم إنشاء جداول المجموعات';
    RAISE NOTICE '🔧 تم إضافة الأعمدة المفقودة';
    RAISE NOTICE '⚡ تم إنشاء الفهارس والمحفزات';
    RAISE NOTICE '📝 تم إدراج البيانات التجريبية';
    RAISE NOTICE '🎉 النظام جاهز لحفظ الأنظمة مع المشتركين!';
    RAISE NOTICE '';
    RAISE NOTICE '💡 الآن يمكنك:';
    RAISE NOTICE '   • إضافة مشترك مع برامج تدريبية';
    RAISE NOTICE '   • إضافة مشترك مع أنظمة غذائية';
    RAISE NOTICE '   • عرض تفاصيل المشترك مع الأنظمة';
    RAISE NOTICE '   • طباعة بيانات المشترك مع الأنظمة';
    RAISE NOTICE '   • تعديل أنظمة المشترك';
END $$;
