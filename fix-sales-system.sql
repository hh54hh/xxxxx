-- ===============================================
-- إصلاح نظام المبيعات والفواتير
-- Fix Sales System and Invoices
-- ===============================================

-- 1. التأكد من وجود جدول sale_items
CREATE TABLE IF NOT EXISTS sale_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sale_id UUID NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(10,2) NOT NULL CHECK (unit_price >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. إضافة فهارس لتحسين الأداء
CREATE INDEX IF NOT EXISTS idx_sale_items_sale_id ON sale_items(sale_id);
CREATE INDEX IF NOT EXISTS idx_sale_items_product_id ON sale_items(product_id);

-- 3. التأكد من وجود عمود stock في جدول products
ALTER TABLE products ADD COLUMN IF NOT EXISTS stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0);

-- 4. إنشاء دالة تحديث المخزون
CREATE OR REPLACE FUNCTION update_product_stock(
    product_id UUID,
    quantity_sold INTEGER
) RETURNS VOID AS $$
BEGIN
    -- تحديث المخزون
    UPDATE products 
    SET stock = stock - quantity_sold,
        updated_at = NOW()
    WHERE id = product_id;
    
    -- التحقق من نجاح التحديث
    IF NOT FOUND THEN
        RAISE EXCEPTION 'المنتج غير موجود: %', product_id;
    END IF;
    
    -- التحقق من كفاية المخزون
    IF (SELECT stock FROM products WHERE id = product_id) < 0 THEN
        RAISE EXCEPTION 'المخزون غير كافي للمنتج: %', product_id;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- 5. إنشاء دالة لحساب إجمالي المبيعة
CREATE OR REPLACE FUNCTION calculate_sale_total(sale_id_param UUID)
RETURNS DECIMAL(10,2) AS $$
DECLARE
    total_amount DECIMAL(10,2) := 0;
BEGIN
    SELECT COALESCE(SUM(quantity * unit_price), 0)
    INTO total_amount
    FROM sale_items
    WHERE sale_id = sale_id_param;
    
    RETURN total_amount;
END;
$$ LANGUAGE plpgsql;

-- 6. إنشاء trigger لتحديث إجمالي المبيعة تلقائياً
CREATE OR REPLACE FUNCTION update_sale_total()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE sales 
    SET total_amount = calculate_sale_total(
        CASE 
            WHEN TG_OP = 'DELETE' THEN OLD.sale_id
            ELSE NEW.sale_id
        END
    ),
    updated_at = NOW()
    WHERE id = (
        CASE 
            WHEN TG_OP = 'DELETE' THEN OLD.sale_id
            ELSE NEW.sale_id
        END
    );
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- 7. إنشاء triggers للجدول sale_items
DROP TRIGGER IF EXISTS trigger_update_sale_total_insert ON sale_items;
CREATE TRIGGER trigger_update_sale_total_insert
    AFTER INSERT ON sale_items
    FOR EACH ROW
    EXECUTE FUNCTION update_sale_total();

DROP TRIGGER IF EXISTS trigger_update_sale_total_update ON sale_items;
CREATE TRIGGER trigger_update_sale_total_update
    AFTER UPDATE ON sale_items
    FOR EACH ROW
    EXECUTE FUNCTION update_sale_total();

DROP TRIGGER IF EXISTS trigger_update_sale_total_delete ON sale_items;
CREATE TRIGGER trigger_update_sale_total_delete
    AFTER DELETE ON sale_items
    FOR EACH ROW
    EXECUTE FUNCTION update_sale_total();

-- 8. إنشاء view للمبيعات مع التفاصيل
CREATE OR REPLACE VIEW sales_with_details AS
SELECT 
    s.*,
    COALESCE(sub.name, s.customer_name) as customer_display_name,
    sub.phone as customer_phone,
    (SELECT COUNT(*) FROM sale_items si WHERE si.sale_id = s.id) as items_count,
    (SELECT SUM(si.quantity) FROM sale_items si WHERE si.sale_id = s.id) as total_items,
    TO_CHAR(s.created_at, 'YYYY-MM-DD') as sale_date,
    TO_CHAR(s.created_at, 'HH24:MI') as sale_time,
    TO_CHAR(s.created_at, 'Day, DD Month YYYY') as formatted_date
FROM sales s
LEFT JOIN subscribers sub ON s.subscriber_id = sub.id;

-- 9. إنشاء دالة للبحث عن المنتجات مع المخزون
CREATE OR REPLACE FUNCTION search_products_with_stock(search_term TEXT DEFAULT '')
RETURNS TABLE (
    id UUID,
    name VARCHAR,
    price INTEGER,
    stock INTEGER,
    description TEXT,
    stock_status TEXT,
    created_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.name,
        p.price,
        p.stock,
        p.description,
        CASE 
            WHEN p.stock = 0 THEN 'نفذ المخزون'
            WHEN p.stock <= 5 THEN 'مخزون منخفض'
            WHEN p.stock <= 20 THEN 'مخزون متوسط'
            ELSE 'مخزون جيد'
        END as stock_status,
        p.created_at
    FROM products p
    WHERE search_term = '' OR LOWER(p.name) LIKE LOWER('%' || search_term || '%')
    ORDER BY p.name;
END;
$$ LANGUAGE plpgsql;

-- 10. إضافة بعض المنتجات الافتراضية إذا لم تكن موجودة
INSERT INTO products (name, price, stock, description) VALUES
    ('بروتين واي', 45000, 20, 'بروتين واي عالي الجودة - 2 كيلو'),
    ('كرياتين', 25000, 15, 'كرياتين مونوهيدرات - 300 جرام'),
    ('فيتامينات متعددة', 15000, 30, 'فيتامينات ومعادن يومية'),
    ('زجاجة مياه رياضية', 5000, 50, 'زجاجة مياه 750 مل'),
    ('قفازات رياضية', 8000, 25, 'قفازات للتمرين - مقاسات مختلفة'),
    ('حزام رفع الأثقال', 20000, 10, 'حزام جلدي لرفع الأثقال'),
    ('منشفة رياضية', 3000, 40, 'منشفة قطنية للتمرين'),
    ('مكمل أوميغا 3', 22000, 18, 'مكمل أوميغا 3 لصحة القلب')
ON CONFLICT (name) DO NOTHING;

-- 11. التحقق من الإعداد
SELECT 
    'فحص نظام المبيعات:' as info,
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'sale_items') as sale_items_table,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'stock') as products_stock_column,
    (SELECT COUNT(*) FROM information_schema.routines WHERE routine_name = 'update_product_stock') as update_stock_function,
    (SELECT COUNT(*) FROM products) as total_products;

-- 12. إنشاء فهارس إضافية للأداء
CREATE INDEX IF NOT EXISTS idx_sales_created_at ON sales(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sales_total_amount ON sales(total_amount);
CREATE INDEX IF NOT EXISTS idx_products_stock ON products(stock);
CREATE INDEX IF NOT EXISTS idx_products_name_search ON products USING gin(to_tsvector('arabic', name));

-- رسالة النجاح
DO $$
BEGIN
    RAISE NOTICE '✅ تم إصلاح نظام المبيعات بنجاح!';
    RAISE NOTICE '📦 تم إعداد جدول sale_items';
    RAISE NOTICE '📊 تم إضافة عمود المخزون للمنتجات';
    RAISE NOTICE '⚡ تم إنشاء الدوال والمحفزات';
    RAISE NOTICE '🔍 تم إنشاء views للاستعلامات';
    RAISE NOTICE '📝 تم إضافة منتجات افتراضية';
    RAISE NOTICE '🎉 نظام الفواتير جاهز للعمل!';
END $$;
