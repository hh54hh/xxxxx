import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dumbbell, Target, Clock, Repeat } from "lucide-react";
import type { Group } from "@/types";

interface CourseProgramsProps {
  groups: Group[];
}

export default function CoursePrograms({ groups }: CourseProgramsProps) {
  const courseGroups = groups.filter((group) => group.type === "course");

  if (courseGroups.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Dumbbell className="h-5 w-5" />
            برامج التمرين
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Dumbbell className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">لا توجد برامج تمرين</p>
            <p className="text-sm">لم يتم إضافة أي برامج تمرين لهذا المشترك</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {courseGroups.map((group, groupIndex) => (
        <Card key={group.id} className="overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
            <CardTitle className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 bg-blue-600 text-white rounded-full">
                <Dumbbell className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-blue-900 dark:text-blue-100">
                  {group.title || `برنامج التمرين ${groupIndex + 1}`}
                </h3>
                <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                  {group.items?.length || 0} تمرين
                </p>
              </div>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                نشط
              </Badge>
            </CardTitle>
          </CardHeader>

          <CardContent className="p-6">
            {group.items && group.items.length > 0 ? (
              <div className="space-y-4">
                {group.items.map((item, itemIndex) => {
                  const exercise = item.course_point;
                  if (!exercise) return null;

                  return (
                    <div key={item.id} className="group">
                      <div className="flex items-start gap-4 p-4 rounded-lg border bg-gradient-to-r from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 hover:shadow-md transition-all duration-200">
                        {/* رقم التمرين */}
                        <div className="flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full text-sm font-bold flex-shrink-0">
                          {itemIndex + 1}
                        </div>

                        {/* محتوى التمرين */}
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <Target className="h-4 w-4 text-blue-600" />
                            <h4 className="font-bold text-lg text-gray-900 dark:text-gray-100">
                              {exercise.name}
                            </h4>
                          </div>

                          {exercise.description && (
                            <div className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                              <div className="flex items-center gap-1 text-sm">
                                <Repeat className="h-4 w-4 text-green-600" />
                                <span className="font-medium">التفاصيل:</span>
                              </div>
                              <p className="text-sm leading-relaxed">
                                {exercise.description}
                              </p>
                            </div>
                          )}

                          {/* معلومات إضافية */}
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>تمرين رقم {itemIndex + 1}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* فاصل بين التمارين */}
                      {itemIndex < group.items!.length - 1 && (
                        <Separator className="my-3" />
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <Target className="h-8 w-8 mx-auto mb-3 opacity-50" />
                <p>لا توجد تمارين في هذا البرنامج</p>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
