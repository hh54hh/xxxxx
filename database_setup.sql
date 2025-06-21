-- ======================================================
-- سكريبت إنشاء قاعدة البيانات الكاملة لنظام إدارة صالة حسام جم
-- Hossam Gym Management System - Complete Database Setup
-- ======================================================

-- تفعيل امتداد UUID لـ PostgreSQL
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ======================================================
-- 1. إنشاء الجداول الأساسية (Core Tables)
-- ======================================================

-- جدول المستخدمين (Users Table)
-- يجب إنشاؤه أولاً لأنه مرجع للجداول الأخرى
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'employee' CHECK (role IN ('admin', 'manager', 'trainer', 'employee')),
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- جدول المشتركين (Subscribers Table)
CREATE TABLE IF NOT EXISTS subscribers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    age INTEGER NOT NULL CHECK (age > 0 AND age <= 120),
    weight DECIMAL(5,2) NOT NULL CHECK (weight > 0 AND weight <= 999.99),
    height DECIMAL(5,2) NOT NULL CHECK (height > 0 AND height <= 999.99),
    phone VARCHAR(20) NOT NULL,
    notes TEXT,
    subscription_date DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- جدول نقاط التمارين (Course Points Table)
CREATE TABLE IF NOT EXISTS course_points (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- جدول العناصر الغذائية (Diet Items Table)
CREATE TABLE IF NOT EXISTS diet_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- جدول المنتجات (Products Table)
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    price INTEGER NOT NULL CHECK (price >= 0),
    stock INTEGER NOT NULL CHECK (stock >= 0),
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ======================================================
-- 2. إنشاء جداول المجموعات والعلاقات
-- ======================================================

-- جدول المجموعات (Groups Table)
CREATE TABLE IF NOT EXISTS groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subscriber_id UUID NOT NULL REFERENCES subscribers(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('course', 'diet')),
    title VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- جدول عناصر المجموعات (Group Items Table)
CREATE TABLE IF NOT EXISTS group_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    item_id UUID NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ======================================================
-- 3. إنشاء جداول المبيعات
-- ======================================================

-- جدول المبيعات (Sales Table)
CREATE TABLE IF NOT EXISTS sales (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subscriber_id UUID REFERENCES subscribers(id),
    customer_name VARCHAR(255),
    total_amount INTEGER NOT NULL CHECK (total_amount >= 0),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CHECK (
        (subscriber_id IS NOT NULL AND customer_name IS NULL) OR
        (subscriber_id IS NULL AND customer_name IS NOT NULL)
    )
);

-- جدول عناصر المبيعات (Sale Items Table)
CREATE TABLE IF NOT EXISTS sale_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sale_id UUID NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price INTEGER NOT NULL CHECK (unit_price >= 0),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ======================================================
-- 4. إنشاء جداول النظام والتتبع
-- ======================================================

-- جدول سجل العمليات (Activity Logs Table)
CREATE TABLE IF NOT EXISTS activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    table_name VARCHAR(50) NOT NULL,
    record_id UUID,
    old_data JSONB,
    new_data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- جدول إعدادات النظام (System Settings Table)
CREATE TABLE IF NOT EXISTS system_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key VARCHAR(100) UNIQUE NOT NULL,
    value TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- جدول الجلسات (User Sessions Table)
CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ======================================================
-- 5. إنشاء الفهارس للأداء (Performance Indexes)
-- ======================================================

-- فهارس جدول المشتركين
CREATE INDEX IF NOT EXISTS idx_subscribers_name ON subscribers(name);
CREATE INDEX IF NOT EXISTS idx_subscribers_phone ON subscribers(phone);
CREATE INDEX IF NOT EXISTS idx_subscribers_subscription_date ON subscribers(subscription_date);
CREATE INDEX IF NOT EXISTS idx_subscribers_created_at ON subscribers(created_at);

-- فهارس جدول المجموعات
CREATE INDEX IF NOT EXISTS idx_groups_subscriber_id ON groups(subscriber_id);
CREATE INDEX IF NOT EXISTS idx_groups_type ON groups(type);
CREATE INDEX IF NOT EXISTS idx_groups_created_at ON groups(created_at);

-- فهارس جدول عناصر المجموعات
CREATE INDEX IF NOT EXISTS idx_group_items_group_id ON group_items(group_id);
CREATE INDEX IF NOT EXISTS idx_group_items_item_id ON group_items(item_id);

-- فهارس جدول المبيعات
CREATE INDEX IF NOT EXISTS idx_sales_subscriber_id ON sales(subscriber_id);
CREATE INDEX IF NOT EXISTS idx_sales_created_at ON sales(created_at);
CREATE INDEX IF NOT EXISTS idx_sales_total_amount ON sales(total_amount);

-- فهارس جدول عناصر المبيعات
CREATE INDEX IF NOT EXISTS idx_sale_items_sale_id ON sale_items(sale_id);
CREATE INDEX IF NOT EXISTS idx_sale_items_product_id ON sale_items(product_id);

-- فهارس جدول المنتجات
CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);
CREATE INDEX IF NOT EXISTS idx_products_stock ON products(stock);
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);

-- فهارس جدول نقاط التمارين
CREATE INDEX IF NOT EXISTS idx_course_points_name ON course_points(name);

-- فهارس جدول العناصر الغذائية
CREATE INDEX IF NOT EXISTS idx_diet_items_name ON diet_items(name);

-- فهارس جدول المستخدمين
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);

-- فهارس جدول سجل العمليات
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_table_name ON activity_logs(table_name);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at);

-- فهارس جدول الجلسات
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires_at ON user_sessions(expires_at);

-- فهارس جدول إعدادات النظام
CREATE INDEX IF NOT EXISTS idx_system_settings_key ON system_settings(key);

-- ======================================================
-- 6. إنشاء الوظائف (Functions)
-- ======================================================

-- وظيفة تحديث updated_at تلقائياً
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- وظيفة بسيطة لتسجيل العمليات (اختيارية)
CREATE OR REPLACE FUNCTION log_simple_action(
    action_name VARCHAR(100),
    table_name VARCHAR(50),
    record_id UUID
) RETURNS VOID AS $$
BEGIN
    INSERT INTO activity_logs (action, table_name, record_id)
    VALUES (action_name, table_name, record_id);
END;
$$ language 'plpgsql';

-- ======================================================
-- 7. إنشاء المحفزات (Triggers)
-- ======================================================

-- محفزات تحديث updated_at
CREATE TRIGGER update_subscribers_updated_at
    BEFORE UPDATE ON subscribers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_course_points_updated_at
    BEFORE UPDATE ON course_points
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_diet_items_updated_at
    BEFORE UPDATE ON diet_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_groups_updated_at
    BEFORE UPDATE ON groups
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sales_updated_at
    BEFORE UPDATE ON sales
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_system_settings_updated_at
    BEFORE UPDATE ON system_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- محفزات تسجيل العمليات (اختيارية - يمكن تفعيلها حسب الحاجة)
-- CREATE TRIGGER log_subscribers_changes
--     AFTER INSERT OR UPDATE OR DELETE ON subscribers
--     FOR EACH ROW EXECUTE FUNCTION log_table_changes();

-- ======================================================
-- 8. إدراج البيانات الأولية (Seed Data)
-- ======================================================

-- إدراج المستخدم الافتراضي (بدون تشفير معقد)
INSERT INTO users (name, username, password_hash, role) VALUES
('مدير النظام', 'admin', 'admin123', 'admin')
ON CONFLICT (username) DO NOTHING;

-- إدراج إعدادات النظام الافتراضية
INSERT INTO system_settings (key, value, description) VALUES
('gym_name', 'صالة حسام جم', 'اسم الصالة الرياضية'),
('currency', 'IQD', 'العملة المستخدمة'),
('timezone', 'Asia/Baghdad', 'المنطقة الزمنية'),
('max_subscribers', '1000', 'الحد الأقصى للمشتركين'),
('subscription_duration_days', '30', 'مدة الاشتراك بالأيام'),
('low_stock_threshold', '10', 'حد التنبيه لنقص المخزون')
ON CONFLICT (key) DO NOTHING;

-- إدراج نقاط التمارين الافتراضية
INSERT INTO course_points (name, description) VALUES
('تمرين الضغط', '20 عدة × 3 مجموعات'),
('تمرين العقلة', '10 عدات × 4 مجموعات'),
('تمرين الجري', '30 دقيقة يومياً'),
('تمرين البطن', '50 عدة × 3 مجموعات'),
('تمرين الأوزان', 'تمارين الأوزان الحرة'),
('تمرين الكارديو', 'تمارين القلب والأوعية الدموية'),
('تمرين المقاومة', 'تمارين بناء العضلات'),
('تمرين المرونة', 'تمارين التمدد والمرونة');

-- إدراج العناصر الغذائية الافتراضية
INSERT INTO diet_items (name, description) VALUES
('بروتين مسحوق', '30 جرام بعد التمرين'),
('صدر دجاج مشوي', '200 جرام مع الغداء'),
('أرز بني', 'كوب واحد مع الغداء'),
('خضروات مشكلة', 'طبق كبير مع كل وجبة'),
('سمك مشوي', '150 جرام مع العشاء'),
('بيض مسلوق', '2-3 بيضات في الإفطار'),
('مكسرات طبيعية', 'حفنة يد كوجبة خفيفة'),
('فواكه طازجة', 'تفاحة أو موزة بين الوجبات');

-- إدراج المنتجات الافتراضية
INSERT INTO products (name, price, stock, description) VALUES
('بروتين واي', 45000, 20, 'مكمل غذائي بروتين واي عالي الجودة'),
('كرياتين', 20000, 15, 'مكمل الكرياتين لزيادة القوة'),
('فيتامينات متعددة', 15000, 30, 'فيتامينات ومعادن أساسية'),
('أحماض أمينية BCAA', 35000, 12, 'أحماض أمينية لتعافي العضلات'),
('مشروب طاقة', 3000, 50, 'مشروب طاقة طبيعي لزيادة النشاط'),
('مكمل الكالسيوم', 18000, 25, 'مكمل الكالسيوم لصحة العظام'),
('أوميغا 3', 22000, 18, 'مكمل أوميغا 3 لصحة القلب'),
('مكمل الزنك', 12000, 40, 'مكمل الزنك لتقوية المناعة');

-- إدراج مشتركين تجريبيين (تطابق مع البيانات المزيفة في الكود)
INSERT INTO subscribers (name, age, weight, height, phone, notes, subscription_date) VALUES
('أحمد محمد علي', 25, 80.00, 175.00, '01234567890', 'يريد تقوية عضلات الصدر والذراعين', CURRENT_DATE - INTERVAL '5 days'),
('فاطمة حسن إبراهيم', 28, 65.00, 165.00, '01987654321', 'تركز على تمارين الكارديو وإنقاص الوزن', CURRENT_DATE - INTERVAL '10 days'),
('محمد أحمد السيد', 35, 90.00, 180.00, '01122334455', 'لاعب كرة قدم سابق، يريد الحفاظ على اللياقة', CURRENT_DATE - INTERVAL '15 days'),
('سارة أحمد محمود', 22, 55.00, 160.00, '01556677889', 'ترغب في زيادة الوزن بطريقة صحية', CURRENT_DATE - INTERVAL '3 days'),
('علي حسين كاظم', 30, 85.00, 178.00, '01998877665', 'يهدف لبناء العضلات وزيادة القوة', CURRENT_DATE - INTERVAL '7 days');

-- ======================================================
-- 9. ��نشاء طرق عرض مفيدة (Useful Views)
-- ======================================================

-- عرض المشتركين مع معلومات إضافية
CREATE OR REPLACE VIEW subscribers_with_stats AS
SELECT
    s.*,
    ROUND((s.weight / ((s.height/100) * (s.height/100))), 2) as bmi,
    CASE
        WHEN ROUND((s.weight / ((s.height/100) * (s.height/100))), 2) < 18.5 THEN 'نقص في الوزن'
        WHEN ROUND((s.weight / ((s.height/100) * (s.height/100))), 2) BETWEEN 18.5 AND 24.9 THEN 'وزن طبيعي'
        WHEN ROUND((s.weight / ((s.height/100) * (s.height/100))), 2) BETWEEN 25 AND 29.9 THEN 'زيادة في الوزن'
        ELSE 'سمنة'
    END as bmi_category,
    (SELECT COUNT(*) FROM groups WHERE subscriber_id = s.id AND type = 'course') as course_groups_count,
    (SELECT COUNT(*) FROM groups WHERE subscriber_id = s.id AND type = 'diet') as diet_groups_count
FROM subscribers s;

-- عرض المنتجات مع حالة المخزون
CREATE OR REPLACE VIEW products_with_stock_status AS
SELECT
    p.*,
    CASE
        WHEN p.stock = 0 THEN 'نفذ المخزون'
        WHEN p.stock <= 10 THEN 'مخزون منخفض'
        WHEN p.stock <= 50 THEN 'مخزون متوسط'
        ELSE 'مخزون جيد'
    END as stock_status,
    (p.price * p.stock) as total_value
FROM products p;

-- عرض المبيعات مع التفاصيل
CREATE OR REPLACE VIEW sales_with_details AS
SELECT
    s.*,
    COALESCE(sub.name, s.customer_name) as customer_display_name,
    sub.phone as customer_phone,
    (SELECT COUNT(*) FROM sale_items WHERE sale_id = s.id) as items_count,
    TO_CHAR(s.created_at, 'YYYY-MM-DD') as sale_date,
    TO_CHAR(s.created_at, 'HH24:MI') as sale_time
FROM sales s
LEFT JOIN subscribers sub ON s.subscriber_id = sub.id;

-- ======================================================
-- 10. إنشاء وظائف مساعدة (Helper Functions)
-- ======================================================

-- وظيفة حساب إجمالي المبيعات لفترة معينة
CREATE OR REPLACE FUNCTION get_sales_total(
    start_date DATE DEFAULT NULL,
    end_date DATE DEFAULT NULL
) RETURNS INTEGER AS $$
DECLARE
    total INTEGER := 0;
BEGIN
    SELECT COALESCE(SUM(total_amount), 0) INTO total
    FROM sales
    WHERE (start_date IS NULL OR DATE(created_at) >= start_date)
    AND (end_date IS NULL OR DATE(created_at) <= end_date);

    RETURN total;
END;
$$ LANGUAGE plpgsql;

-- وظيفة عدد المشتركين النشطين
CREATE OR REPLACE FUNCTION get_active_subscribers_count() RETURNS INTEGER AS $$
DECLARE
    count INTEGER := 0;
BEGIN
    SELECT COUNT(*) INTO count
    FROM subscribers
    WHERE subscription_date >= CURRENT_DATE - INTERVAL '30 days';

    RETURN count;
END;
$$ LANGUAGE plpgsql;

-- وظيفة تنظيف الجلسات المنتهية الصلاحية
CREATE OR REPLACE FUNCTION cleanup_expired_sessions() RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER := 0;
BEGIN
    DELETE FROM user_sessions WHERE expires_at < NOW();
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- ======================================================
-- 11. إنشاء قيود إضافية للبيانات (Additional Constraints)
-- ======================================================

-- قيود بسيطة للبيانات
-- تأكد من أن أسماء نقاط التمارين فريدة
ALTER TABLE course_points ADD CONSTRAINT unique_course_name UNIQUE (name);

-- تأكد من أن أسماء العناصر الغذائية فريدة
ALTER TABLE diet_items ADD CONSTRAINT unique_diet_name UNIQUE (name);

-- تأكد من أن أسماء المنتجات فريدة
ALTER TABLE products ADD CONSTRAINT unique_product_name UNIQUE (name);

-- ======================================================
-- 12. إجراءات الصيانة البسيطة (Simple Maintenance)
-- ======================================================

-- تنظيف الجلسات المنتهية الصلاحية يومياً (اختياري)
-- يمكن جدولة هذا الأمر ليعمل تلقائياً
-- SELECT cleanup_expired_sessions();

-- ======================================================
-- إنتهاء السكريبت - تم إنشاء قاعدة البيانات بنجاح
-- ======================================================

-- رسالة تأكيد
DO $$
BEGIN
    RAISE NOTICE '✅ تم إنشاء قاعدة بيانات صالة حسام جم بنجاح!';
    RAISE NOTICE '📊 تم إنشاء 12 جدول أساسي';
    RAISE NOTICE '🚀 تم إنشاء الفهارس والمحفزات';
    RAISE NOTICE '📝 تم إدراج البيانات الأولية';
    RAISE NOTICE '🔒 تم إعداد أدوار الأمان';
    RAISE NOTICE '✨ النظام جاهز للاستخدام!';
END $$;
