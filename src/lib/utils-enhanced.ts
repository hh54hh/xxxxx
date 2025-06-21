/**
 * Format number as Iraqi Dinar currency
 */
export function formatIQD(amount: number): string {
  return new Intl.NumberFormat("ar-IQ", {
    style: "currency",
    currency: "IQD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format date in Arabic format
 */
export function formatArabicDate(
  dateString: string,
  includeTime = false,
): string {
  const date = new Date(dateString);

  if (includeTime) {
    return date.toLocaleDateString("ar-IQ", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return date.toLocaleDateString("ar-IQ", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Calculate BMI and return BMI data with status
 */
export function calculateBMI(weight: number, height: number) {
  if (!weight || !height || weight <= 0 || height <= 0) {
    return {
      bmi: 0,
      status: "غير محدد",
      color: "text-gray-500",
    };
  }

  // Convert height from cm to meters
  const heightInMeters = height / 100;
  const bmi = weight / (heightInMeters * heightInMeters);

  let status: string;
  let color: string;

  if (bmi < 18.5) {
    status = "نحيف";
    color = "text-blue-600";
  } else if (bmi < 25) {
    status = "طبيعي";
    color = "text-green-600";
  } else if (bmi < 30) {
    status = "زيادة وزن";
    color = "text-yellow-600";
  } else {
    status = "سمنة";
    color = "text-red-600";
  }

  return {
    bmi: Number(bmi.toFixed(1)),
    status,
    color,
  };
}

/**
 * Get stock status based on stock quantity
 */
export function getStockStatus(stock: number) {
  if (stock === 0) {
    return {
      status: "نفد",
      color: "text-red-600",
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
    };
  } else if (stock < 10) {
    return {
      status: "قليل",
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-200",
    };
  } else {
    return {
      status: "متوفر",
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
    };
  }
}

/**
 * Get color for statistics based on value type
 */
export function getStatColor(type: string): string {
  switch (type) {
    case "total":
      return "text-gym-primary";
    case "active":
      return "text-green-600";
    case "revenue":
      return "text-blue-600";
    case "average":
      return "text-purple-600";
    default:
      return "text-gray-600";
  }
}
