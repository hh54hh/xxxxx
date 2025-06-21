// اختبار اتصال قاعدة البيانات
import { dbHelpers } from "./src/lib/supabase.ts";

console.log("🔍 اختبار اتصال قاعدة البيانات...");
console.log("================================");

async function testDatabase() {
  try {
    // اختبار الاتصال
    console.log("📡 اختبار الاتصال الأساسي...");
    const connectionTest = await dbHelpers.testConnection();

    if (connectionTest.error) {
      console.error("❌ فشل في الاتصال:", connectionTest.error.message);
      return;
    }

    console.log("✅ الاتصال بقاعدة البيانات ناجح!");

    // اختبار جلب المشتركين
    console.log("\n📋 اختبار جلب المشتركين...");
    const subscribersResult = await dbHelpers.getSubscribers();

    if (subscribersResult.error) {
      console.error(
        "❌ خطأ في جلب المشتركين:",
        subscribersResult.error.message,
      );
    } else {
      console.log(`✅ تم جلب ${subscribersResult.data?.length || 0} مشترك`);
    }

    // اختبار جلب نقاط التمرين
    console.log("\n🏋️ اختبار جلب نقاط التمرين...");
    const coursesResult = await dbHelpers.getCoursePoints();

    if (coursesResult.error) {
      console.error("❌ خطأ في جلب نقاط التمرين:", coursesResult.error.message);
    } else {
      console.log(`✅ تم جلب ${coursesResult.data?.length || 0} نقطة تمرين`);
    }

    // اختبار جلب المنتجات
    console.log("\n📦 اختبار جلب المنتجات...");
    const productsResult = await dbHelpers.getProducts();

    if (productsResult.error) {
      console.error("❌ خطأ في جلب المنتجات:", productsResult.error.message);
    } else {
      console.log(`✅ تم جلب ${productsResult.data?.length || 0} منتج`);
    }

    console.log("\n🎉 جميع الاختبارات نجحت! قاعدة البيانات جاهزة للعمل.");
  } catch (error) {
    console.error("❌ خطأ عام في الاختبار:", error);
  }
}

// تشغيل الاختبار
testDatabase();
