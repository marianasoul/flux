import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { ClassWithSubject } from "@shared/schema";

interface WeeklyCalendarProps {
  classes: ClassWithSubject[];
}

const DAYS_OF_WEEK = [
  { short: 'SEG', full: 'Segunda', date: 16 },
  { short: 'TER', full: 'Terça', date: 17 },
  { short: 'QUA', full: 'Quarta', date: 18 },
  { short: 'QUI', full: 'Quinta', date: 19 },
  { short: 'SEX', full: 'Sexta', date: 20 },
];

const TIME_SLOTS = ['08:00', '10:00', '14:00', '16:00'];

export default function WeeklyCalendar({ classes }: WeeklyCalendarProps) {
  const getClassesForDay = (dayName: string) => {
    return classes.filter(c => c.dayOfWeek === dayName);
  };

  const getColorForSubject = (color: string) => {
    return {
      backgroundColor: `${color}1A`, // 10% opacity
      borderColor: color,
      color: color,
    };
  };

  return (
    <div className="lg:col-span-2">
      <Card className="bg-white shadow-sm border border-gray-100">
        <CardHeader className="border-b border-gray-200">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-gray-800">
              Cronograma da Semana
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="icon" className="p-2 text-gray-600 hover:text-primary">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium text-gray-600" data-testid="text-selectedweek">
                15-21 Out
              </span>
              <Button variant="ghost" size="icon" className="p-2 text-gray-600 hover:text-primary">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-6 gap-4">
            {/* Time Column */}
            <div className="space-y-16">
              <div className="text-xs font-medium text-gray-500 h-8"></div>
              {TIME_SLOTS.map(time => (
                <div key={time} className="text-xs font-medium text-gray-500">
                  {time}
                </div>
              ))}
            </div>

            {/* Days Columns */}
            {DAYS_OF_WEEK.map(day => {
              const dayClasses = getClassesForDay(day.full);
              
              return (
                <div key={day.short} className="space-y-2">
                  <div className="text-center">
                    <div className="text-xs font-medium text-gray-500">{day.short}</div>
                    <div className="text-lg font-semibold text-gray-800">{day.date}</div>
                  </div>
                  
                  {/* Classes for this day */}
                  <div className="space-y-2 min-h-[300px]">
                    {dayClasses.map(classItem => (
                      <div
                        key={classItem.id}
                        className="border-l-4 p-3 rounded-r-lg cursor-pointer hover:shadow-sm transition-shadow"
                        style={getColorForSubject(classItem.subject.color)}
                        data-testid={`class-${classItem.subject.name.toLowerCase()}-${day.short.toLowerCase()}`}
                      >
                        <div className="text-xs font-medium" style={{ color: classItem.subject.color }}>
                          {classItem.subject.name}
                        </div>
                        <div className="text-xs text-gray-600">
                          {classItem.type}
                        </div>
                        <div className="text-xs text-gray-500">
                          {classItem.startTime}-{classItem.endTime}
                        </div>
                        {classItem.location && (
                          <div className="text-xs text-gray-500">
                            {classItem.location}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
