-- إنشاء جداول قاعدة البيانات لتطبيق إدارة الصالة الرياضية
-- يجب تشغيل هذا السكريبت في Supabase SQL Editor

-- تفعيل UUID extension إذا لم يكن مفعلاً
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- جدول المشتركين
CREATE TABLE IF NOT EXISTS subscribers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    age INTEGER NOT NULL CHECK (age > 0),
    weight DECIMAL(5,2) NOT NULL CHECK (weight > 0),
    height DECIMAL(5,2) NOT NULL CHECK (height > 0),
    phone VARCHAR(20) NOT NULL,
    notes TEXT,
    subscription_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- جدول نقاط التمرين
CREATE TABLE IF NOT EXISTS course_points (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- جدول عناصر النظام الغذائي
CREATE TABLE IF NOT EXISTS diet_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- جدول المنتجات
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
    stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- جدول المجموعات (للربط بين المشتركين والكورسات/الأنظمة الغذائية)
CREATE TABLE IF NOT EXISTS groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subscriber_id UUID NOT NULL REFERENCES subscribers(id) ON DELETE CASCADE,
    type VARCHAR(10) NOT NULL CHECK (type IN ('course', 'diet')),
    title VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- جدول عناصر المجموعات
CREATE TABLE IF NOT EXISTS group_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    item_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- إضافة قيود للتأكد من صحة العلاقات
    CONSTRAINT check_course_item 
        CHECK (
            EXISTS (
                SELECT 1 FROM groups g 
                WHERE g.id = group_id AND g.type = 'course'
                AND EXISTS (SELECT 1 FROM course_points WHERE id = item_id)
            ) OR
            EXISTS (
                SELECT 1 FROM groups g 
                WHERE g.id = group_id AND g.type = 'diet'
                AND EXISTS (SELECT 1 FROM diet_items WHERE id = item_id)
            )
        )
);

-- جدول المبيعات
CREATE TABLE IF NOT EXISTS sales (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subscriber_id UUID REFERENCES subscribers(id) ON DELETE SET NULL,
    customer_name VARCHAR(255),
    total_amount DECIMAL(10,2) NOT NULL CHECK (total_amount >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- يجب أن يكون هناك مشترك أو اسم زبون
    CHECK (subscriber_id IS NOT NULL OR customer_name IS NOT NULL)
);

-- جدول عناصر المبيعات
CREATE TABLE IF NOT EXISTS sale_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sale_id UUID NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(10,2) NOT NULL CHECK (unit_price >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- إنشاء فهارس لتحسين الأداء
CREATE INDEX IF NOT EXISTS idx_subscribers_phone ON subscribers(phone);
CREATE INDEX IF NOT EXISTS idx_subscribers_name ON subscribers(name);
CREATE INDEX IF NOT EXISTS idx_groups_subscriber_id ON groups(subscriber_id);
CREATE INDEX IF NOT EXISTS idx_groups_type ON groups(type);
CREATE INDEX IF NOT EXISTS idx_group_items_group_id ON group_items(group_id);
CREATE INDEX IF NOT EXISTS idx_group_items_item_id ON group_items(item_id);
CREATE INDEX IF NOT EXISTS idx_sales_subscriber_id ON sales(subscriber_id);
CREATE INDEX IF NOT EXISTS idx_sales_created_at ON sales(created_at);
CREATE INDEX IF NOT EXISTS idx_sale_items_sale_id ON sale_items(sale_id);
CREATE INDEX IF NOT EXISTS idx_sale_items_product_id ON sale_items(product_id);

-- إنشاء triggers لتحديث updated_at تلقائياً
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- تطبيق trigger على الجداول المناسبة
DROP TRIGGER IF EXISTS update_subscribers_updated_at ON subscribers;
CREATE TRIGGER update_subscribers_updated_at 
    BEFORE UPDATE ON subscribers 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_course_points_updated_at ON course_points;
CREATE TRIGGER update_course_points_updated_at 
    BEFORE UPDATE ON course_points 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_diet_items_updated_at ON diet_items;
CREATE TRIGGER update_diet_items_updated_at 
    BEFORE UPDATE ON diet_items 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at 
    BEFORE UPDATE ON products 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_groups_updated_at ON groups;
CREATE TRIGGER update_groups_updated_at 
    BEFORE UPDATE ON groups 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_sales_updated_at ON sales;
CREATE TRIGGER update_sales_updated_at 
    BEFORE UPDATE ON sales 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- إنشاء function لتحديث المخزون عند البيع
CREATE OR REPLACE FUNCTION update_product_stock(
    product_id UUID,
    quantity_sold INTEGER
) RETURNS VOID AS $$
BEGIN
    UPDATE products 
    SET stock = stock - quantity_sold,
        updated_at = NOW()
    WHERE id = product_id AND stock >= quantity_sold;
    
    -- التحقق من أن التحديث تم بنجاح
    IF NOT FOUND THEN
        RAISE EXCEPTION 'لا يوجد مخزون كافٍ للمنتج أو المنتج غير موجود';
    END IF;
END;
$$ LANGUAGE plpgsql;

-- إدراج بعض البيانات التجريبية
INSERT INTO course_points (name, description) VALUES
    ('تمرين الضغط', '3 مجموعات × 15 عدة'),
    ('تمرين العقلة', '3 مجموعات × 10 عدات'),
    ('تمرين القرفصاء', '3 مجموعات × 20 عدة'),
    ('تمرين البطن', '3 مجموعات × 25 عدة'),
    ('تمرين الجري', '30 دقيقة متواصلة')
ON CONFLICT DO NOTHING;

INSERT INTO diet_items (name, description) VALUES
    ('بروتين مسحوق', '30 جرام بعد التمرين مع الماء'),
    ('صدر دجاج مشوي', '200 جرام مع الغداء'),
    ('البيض المسلوق', '3 بيضات في الإفطار'),
    ('الشوفان', '50 جرام مع الحليب في الإفطار'),
    ('الأرز البني', '150 جرام مع الغداء'),
    ('السلمون المشوي', '150 جرام مع العشاء'),
    ('الخضروات الورقية', 'سلطة خضراء مع كل وجبة')
ON CONFLICT DO NOTHING;

INSERT INTO products (name, price, stock, description) VALUES
    ('بروتين واي', 45000, 20, 'بروتين واي عالي الجودة - 2 كيلو'),
    ('كرياتين', 25000, 15, 'كرياتين مونوهيدرات - 300 جرام'),
    ('فيتامينات متعددة', 15000, 30, 'فيتامينات ومعادن يومية'),
    ('زجاجة مياه رياضية', 5000, 50, 'زجاجة مياه 750 مل'),
    ('قفازات رياضية', 8000, 25, 'قفازات للتمرين - مقاسات مختلفة'),
    ('حزام رفع الأثقال', 20000, 10, 'حزام جلدي لرفع الأثقال'),
    ('منشفة رياضية', 3000, 40, 'منشفة قطنية للتمرين')
ON CONFLICT DO NOTHING;

-- عرض ملخص البيانات المدرجة
SELECT 'جداول تم إنشاؤها بنجاح!' AS status;
SELECT 'course_points' AS table_name, COUNT(*) AS records FROM course_points
UNION ALL
SELECT 'diet_items', COUNT(*) FROM diet_items
UNION ALL
SELECT 'products', COUNT(*) FROM products
UNION ALL
SELECT 'subscribers', COUNT(*) FROM subscribers;
