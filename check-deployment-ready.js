#!/usr/bin/env node

/**
 * سكريبت التحقق من جاهزية المشروع للنشر
 * يتحقق من جميع الملفات والإعدادات المطلوبة
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log("🔍 فحص جاهزية المشروع للنشر...\n");

const checks = [];

// فحص الملفات المطلوبة
const requiredFiles = [
  "package.json",
  "vite.config.ts",
  "netlify.toml",
  "src/lib/config.ts",
  "src/lib/supabase.ts",
  "src/App.tsx",
  "index.html",
];

console.log("📁 فحص الملفات المطلوبة:");
requiredFiles.forEach((file) => {
  const exists = fs.existsSync(file);
  console.log(`   ${exists ? "✅" : "❌"} ${file}`);
  checks.push({ name: `ملف ${file}`, status: exists });
});

// فحص ملف package.json
console.log("\n📦 فحص إعدادات package.json:");
try {
  const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));

  const hasReact = packageJson.dependencies?.["react"];
  const hasSupabase = packageJson.dependencies?.["@supabase/supabase-js"];
  const hasBuildScript = packageJson.scripts?.["build"];
  const hasDevScript = packageJson.scripts?.["dev"];

  console.log(`   ${hasReact ? "✅" : "❌"} React dependency`);
  console.log(`   ${hasSupabase ? "✅" : "❌"} Supabase dependency`);
  console.log(`   ${hasBuildScript ? "✅" : "❌"} Build script`);
  console.log(`   ${hasDevScript ? "✅" : "❌"} Dev script`);

  checks.push({ name: "React dependency", status: hasReact });
  checks.push({ name: "Supabase dependency", status: hasSupabase });
  checks.push({ name: "Build script", status: hasBuildScript });
} catch (error) {
  console.log("   ❌ خطأ في قراءة package.json");
  checks.push({ name: "package.json صحيح", status: false });
}

// فحص ملف config.ts
console.log("\n⚙️ فحص ملف الإعدادات:");
try {
  const configContent = fs.readFileSync("src/lib/config.ts", "utf8");

  const hasSupabaseUrl = configContent.includes(
    "nfccwjrneviidwljaeoq.supabase.co",
  );
  const hasSupabaseKey = configContent.includes("eyJhbGciOiJIUzI1NiI");
  const hasValidation = configContent.includes("validateEnvironment");

  console.log(`   ${hasSupabaseUrl ? "✅" : "❌"} Supabase URL صحيح`);
  console.log(`   ${hasSupabaseKey ? "✅" : "❌"} Supabase Key صحيح`);
  console.log(`   ${hasValidation ? "✅" : "❌"} نظام التحقق موجود`);

  checks.push({
    name: "إعدادات Supabase",
    status: hasSupabaseUrl && hasSupabaseKey,
  });
  checks.push({ name: "نظام التحقق", status: hasValidation });
} catch (error) {
  console.log("   ❌ خطأ في قراءة ملف الإعدادات");
  checks.push({ name: "ملف الإعدادات صحيح", status: false });
}

// فحص ملف netlify.toml
console.log("\n🌐 فحص إعدادات Netlify:");
try {
  const netlifyContent = fs.readFileSync("netlify.toml", "utf8");

  const hasBuildCommand = netlifyContent.includes("npm run build");
  const hasPublishDir = netlifyContent.includes('publish = "dist"');
  const hasRedirects = netlifyContent.includes("[[redirects]]");

  console.log(`   ${hasBuildCommand ? "✅" : "❌"} Build command صحيح`);
  console.log(`   ${hasPublishDir ? "✅" : "❌"} Publish directory صحيح`);
  console.log(`   ${hasRedirects ? "✅" : "❌"} SPA redirects موجود`);

  checks.push({
    name: "إعدادات Netlify",
    status: hasBuildCommand && hasPublishDir && hasRedirects,
  });
} catch (error) {
  console.log("   ❌ خطأ في قراءة ملف netlify.toml");
  checks.push({ name: "إعدادات Netlify صحيحة", status: false });
}

// فحص التحديثات الأخيرة
console.log("\n🔄 فحص التحديثات الأخيرة:");
try {
  const supabaseContent = fs.readFileSync("src/lib/supabase.ts", "utf8");

  const hasConfigImport = supabaseContent.includes('from "./config"');
  const hasSupabaseConfig = supabaseContent.includes("supabaseConfig.url");
  const hasCreateClient = supabaseContent.includes(
    "createClient(supabaseConfig.url",
  );

  console.log(`   ${hasConfigImport ? "✅" : "❌"} استيراد ملف الإعدادات`);
  console.log(
    `   ${hasSupabaseConfig ? "✅" : "❌"} استخدام إعدادات supabaseConfig`,
  );
  console.log(
    `   ${hasCreateClient ? "✅" : "❌"} إنشاء اتصال آمن مع Supabase`,
  );

  checks.push({
    name: "تحديثات supabase.ts",
    status: hasConfigImport && hasSupabaseConfig && hasCreateClient,
  });
} catch (error) {
  console.log("   ❌ خطأ في فحص التحديثات");
  checks.push({ name: "التحديثات مطبقة", status: false });
}

// النتيجة النهائية
console.log("\n📊 ملخص الفحص:");
const passedChecks = checks.filter((check) => check.status).length;
const totalChecks = checks.length;

console.log(`✅ نجح: ${passedChecks}/${totalChecks} فحص`);

if (passedChecks === totalChecks) {
  console.log("\n🎉 مبروك! المشروع جاهز للنشر بشكل كامل!");
  console.log("\n🚀 خطوات النشر:");
  console.log("1. git add .");
  console.log('2. git commit -m "مشروع جاهز للنشر"');
  console.log("3. git push origin main");
  console.log("4. اربط مع Netlify/Vercel");
  console.log("5. انتظر النشر (2-3 دقائق)");
  console.log("\n✨ التطبيق سيعمل فوراً بدون إعدادات إضافية!");
} else {
  console.log("\n⚠️ يوجد بعض المشاكل التي تحتاج إصلاح:");
  checks.forEach((check) => {
    if (!check.status) {
      console.log(`   ❌ ${check.name}`);
    }
  });
  console.log("\nيرجى إصلاح هذه المشاكل قبل النشر.");
}

console.log("\n" + "=".repeat(50));
