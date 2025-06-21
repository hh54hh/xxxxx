import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Apple, Utensils, Clock, ChefHat } from "lucide-react";
import type { Group } from "@/types";

interface DietProgramsProps {
  groups: Group[];
}

export default function DietPrograms({ groups }: DietProgramsProps) {
  const dietGroups = groups.filter((group) => group.type === "diet");

  if (dietGroups.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Apple className="h-5 w-5" />
            الأنظمة الغذائية
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Apple className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">لا توجد أنظمة غذائية</p>
            <p className="text-sm">لم يتم إضافة أي أنظمة غذائية لهذا المشترك</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {dietGroups.map((group, groupIndex) => (
        <Card key={group.id} className="overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950">
            <CardTitle className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 bg-green-600 text-white rounded-full">
                <Apple className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-green-900 dark:text-green-100">
                  {group.title || `نظام غذائي ${groupIndex + 1}`}
                </h3>
                <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                  {group.group_items?.length || 0} عنصر غذائي
                </p>
              </div>
              <Badge
                variant="secondary"
                className="bg-green-100 text-green-800"
              >
                نشط
              </Badge>
            </CardTitle>
          </CardHeader>

          <CardContent className="p-6">
            {group.group_items && group.group_items.length > 0 ? (
              <div className="space-y-4">
                {group.group_items.map((item, itemIndex) => {
                  const dietItem = item.diet_item;
                  if (!dietItem) {
                    console.warn("عنصر بدون تفاصيل نظام غذائي:", item);
                    return null;
                  }

                  return (
                    <div key={item.id} className="group">
                      <div className="flex items-start gap-4 p-4 rounded-lg border bg-gradient-to-r from-white to-green-50 dark:from-gray-900 dark:to-green-900 hover:shadow-md transition-all duration-200">
                        {/* رقم العنصر */}
                        <div className="flex items-center justify-center w-8 h-8 bg-green-600 text-white rounded-full text-sm font-bold flex-shrink-0">
                          {itemIndex + 1}
                        </div>

                        {/* محتوى العنصر الغذائي */}
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <Utensils className="h-4 w-4 text-green-600" />
                            <h4 className="font-bold text-lg text-gray-900 dark:text-gray-100">
                              {dietItem.name}
                            </h4>
                          </div>

                          {dietItem.description && (
                            <div className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                              <div className="flex items-center gap-1 text-sm">
                                <ChefHat className="h-4 w-4 text-orange-600" />
                                <span className="font-medium">الإرشادات:</span>
                              </div>
                              <p className="text-sm leading-relaxed">
                                {dietItem.description}
                              </p>
                            </div>
                          )}

                          {/* معلومات إضافية */}
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>عنصر رقم {itemIndex + 1}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* فاصل بين العناصر */}
                      {itemIndex < group.group_items!.length - 1 && (
                        <Separator className="my-3" />
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <Utensils className="h-8 w-8 mx-auto mb-3 opacity-50" />
                <p>لا توجد عناصر في هذا النظام الغذائي</p>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
