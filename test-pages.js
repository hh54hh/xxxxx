#!/usr/bin/env node

// اختبار بسيط للتأكد من وجود جميع الصفحات المطلوبة
const fs = require("fs");
const path = require("path");

const requiredPages = [
  "src/pages/Index.tsx",
  "src/pages/Dashboard.tsx",
  "src/pages/Login.tsx",
  "src/pages/AddSubscriber.tsx",
  "src/pages/EditSubscriber.tsx",
  "src/pages/SubscriberDetail.tsx",
  "src/pages/Courses.tsx",
  "src/pages/Diet.tsx",
  "src/pages/Inventory.tsx",
  "src/pages/Sales.tsx",
  "src/pages/Settings.tsx",
  "src/pages/NotFound.tsx",
];

console.log("🔍 فحص الصفحات المطلوبة...\n");

let allPagesExist = true;

requiredPages.forEach((pagePath) => {
  if (fs.existsSync(pagePath)) {
    console.log(`✅ ${pagePath}`);
  } else {
    console.log(`❌ ${pagePath} - مفقود!`);
    allPagesExist = false;
  }
});

console.log("\n" + "=".repeat(40));

if (allPagesExist) {
  console.log("🎉 جميع الصفحات موجودة وجاهزة للنشر!");
  process.exit(0);
} else {
  console.log("⚠️ بعض الصفحات مفقودة!");
  process.exit(1);
}
