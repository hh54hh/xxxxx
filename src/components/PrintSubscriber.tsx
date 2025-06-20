import {
  formatArabicDate,
  calculateBMI,
  formatIQD,
} from "@/lib/utils-enhanced";
import type { SubscriberWithGroups } from "@/types";

interface PrintSubscriberProps {
  subscriber: SubscriberWithGroups;
  onPrint?: () => void;
}

export default function PrintSubscriber({
  subscriber,
  onPrint,
}: PrintSubscriberProps) {
  const handlePrint = () => {
    // Create a new window for printing
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const bmiData = calculateBMI(subscriber.weight, subscriber.height);
    const currentDate = new Date().toLocaleDateString("ar-IQ");

    const printContent = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>بيانات المشترك - ${subscriber.name}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@200;300;400;500;600;700;800;900&display=swap');
          
          body {
            font-family: 'Cairo', sans-serif;
            margin: 0;
            padding: 20px;
            line-height: 1.6;
            color: #333;
            direction: rtl;
          }
          
          .print-container {
            max-width: 800px;
            margin: 0 auto;
          }
          
          .header {
            text-align: center;
            border-bottom: 3px solid #4F46E5;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          
          .gym-logo {
            font-size: 2.5em;
            font-weight: bold;
            color: #4F46E5;
            margin-bottom: 10px;
          }
          
          .gym-subtitle {
            font-size: 1.2em;
            color: #666;
            margin-bottom: 10px;
          }
          
          .print-date {
            font-size: 0.9em;
            color: #888;
          }
          
          .section {
            margin-bottom: 25px;
            page-break-inside: avoid;
          }
          
          .section-title {
            font-size: 1.4em;
            font-weight: bold;
            color: #4F46E5;
            margin-bottom: 15px;
            padding-bottom: 5px;
            border-bottom: 2px solid #E5E7EB;
          }
          
          .info-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin-bottom: 20px;
          }
          
          .info-item {
            background: #F9FAFB;
            padding: 12px;
            border-radius: 8px;
            border-right: 4px solid #4F46E5;
          }
          
          .info-label {
            font-weight: 600;
            color: #374151;
            margin-bottom: 5px;
          }
          
          .info-value {
            font-size: 1.1em;
            color: #111827;
          }
          
          .group-container {
            margin-bottom: 20px;
            border: 1px solid #E5E7EB;
            border-radius: 8px;
            overflow: hidden;
          }
          
          .group-header {
            background: #F3F4F6;
            padding: 12px 15px;
            font-weight: 600;
            color: #374151;
          }
          
          .group-items {
            padding: 15px;
          }
          
          .item-list {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 10px;
          }
          
          .item {
            background: #F9FAFB;
            padding: 10px;
            border-radius: 6px;
            border-right: 3px solid #10B981;
          }
          
          .item-name {
            font-weight: 500;
            margin-bottom: 3px;
          }
          
          .item-description {
            font-size: 0.9em;
            color: #6B7280;
          }
          
          .notes-section {
            background: #FEF3C7;
            border: 1px solid #F59E0B;
            border-radius: 8px;
            padding: 15px;
            margin: 20px 0;
          }
          
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 2px solid #E5E7EB;
            text-align: center;
            color: #6B7280;
          }
          
          .signature-section {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 50px;
            margin-top: 40px;
            padding-top: 20px;
          }
          
          .signature-box {
            text-align: center;
            border-top: 1px solid #374151;
            padding-top: 10px;
          }
          
          @media print {
            body { margin: 0; }
            .print-container { max-width: none; }
          }
        </style>
      </head>
      <body>
        <div class="print-container">
          <div class="header">
            <div class="gym-logo">🏋️ صالة حسام جم</div>
            <div class="gym-subtitle">نظام إدارة الصالة الرياضية</div>
            <div class="print-date">تاريخ الطباعة: ${currentDate}</div>
          </div>

          <div class="section">
            <div class="section-title">البيانات الشخصية</div>
            <div class="info-grid">
              <div class="info-item">
                <div class="info-label">الاسم الكامل</div>
                <div class="info-value">${subscriber.name}</div>
              </div>
              <div class="info-item">
                <div class="info-label">العمر</div>
                <div class="info-value">${subscriber.age} سنة</div>
              </div>
              <div class="info-item">
                <div class="info-label">الوزن</div>
                <div class="info-value">${subscriber.weight} كجم</div>
              </div>
              <div class="info-item">
                <div class="info-label">الطول</div>
                <div class="info-value">${subscriber.height} سم</div>
              </div>
              <div class="info-item">
                <div class="info-label">رقم الهاتف</div>
                <div class="info-value">${subscriber.phone}</div>
              </div>
              <div class="info-item">
                <div class="info-label">تاريخ الاشتراك</div>
                <div class="info-value">${formatArabicDate(subscriber.subscription_date)}</div>
              </div>
              <div class="info-item">
                <div class="info-label">مؤشر كتلة الجسم</div>
                <div class="info-value">${bmiData.value} (${bmiData.category})</div>
              </div>
            </div>
          </div>

          ${
            subscriber.groups?.filter((g) => g.type === "course").length
              ? `
          <div class="section">
            <div class="section-title">📋 الكورسات والتمارين</div>
            ${
              subscriber.groups
                ?.filter((g) => g.type === "course")
                .map(
                  (group) => `
              <div class="group-container">
                <div class="group-header">
                  ${group.title || "مجموعة تمارين"} (${group.items?.length || 0} تمرين)
                </div>
                <div class="group-items">
                  <div class="item-list">
                    ${
                      group.items
                        ?.map(
                          (item) => `
                      <div class="item">
                        <div class="item-name">${item.course_point?.name || "تمرين"}</div>
                        ${item.course_point?.description ? `<div class="item-description">${item.course_point.description}</div>` : ""}
                      </div>
                    `,
                        )
                        .join("") || '<div class="item">لا توجد تمارين</div>'
                    }
                  </div>
                </div>
              </div>
            `,
                )
                .join("") || ""
            }
          </div>
          `
              : ""
          }

          ${
            subscriber.groups?.filter((g) => g.type === "diet").length
              ? `
          <div class="section">
            <div class="section-title">🍎 الأنظمة الغذائية</div>
            ${
              subscriber.groups
                ?.filter((g) => g.type === "diet")
                .map(
                  (group) => `
              <div class="group-container">
                <div class="group-header">
                  ${group.title || "نظام غذائي"} (${group.items?.length || 0} عنصر)
                </div>
                <div class="group-items">
                  <div class="item-list">
                    ${
                      group.items
                        ?.map(
                          (item) => `
                      <div class="item">
                        <div class="item-name">${item.diet_item?.name || "عنصر غذائي"}</div>
                        ${item.diet_item?.description ? `<div class="item-description">${item.diet_item.description}</div>` : ""}
                      </div>
                    `,
                        )
                        .join("") ||
                      '<div class="item">لا توجد عناصر غذائية</div>'
                    }
                  </div>
                </div>
              </div>
            `,
                )
                .join("") || ""
            }
          </div>
          `
              : ""
          }

          ${
            subscriber.notes
              ? `
          <div class="notes-section">
            <div class="section-title" style="color: #D97706; border-color: #F59E0B;">📝 ملاحظات إضافية</div>
            <p>${subscriber.notes}</p>
          </div>
          `
              : ""
          }

          <div class="signature-section">
            <div class="signature-box">
              <div>توقيع المدرب</div>
            </div>
            <div class="signature-box">
              <div>توقيع المشترك</div>
            </div>
          </div>

          <div class="footer">
            <p>📍 صالة حسام جم - نظام إدارة متكامل للصالات الرياضية</p>
            <p>© ${new Date().getFullYear()} جميع الحقوق محفوظة</p>
          </div>
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();

    // Wait for content to load then print
    printWindow.onload = () => {
      printWindow.print();
      printWindow.close();
    };

    if (onPrint) {
      onPrint();
    }
  };

  // Return the print function to be used by parent components
  return { handlePrint };
}

// Hook for using the print functionality
export function usePrintSubscriber() {
  const printSubscriber = (subscriber: SubscriberWithGroups) => {
    const printer = PrintSubscriber({ subscriber });
    printer.handlePrint();
  };

  return { printSubscriber };
}
