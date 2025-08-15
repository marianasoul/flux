import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { addDays, format, startOfWeek, isSameDay, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ChevronRight, Calendar, Clock, MapPin, CheckSquare, BookOpen, AlertTriangle } from "lucide-react";
import type { ClassWithSubject, TaskWithSubject } from "@shared/schema";
import { formatRelativeDate } from "@/lib/date-utils";

const HOURS = Array.from({ length: 14 }, (_, i) => i + 7); // 7h às 20h

export default function Agenda() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<"day" | "week">("week");
  
  const { data: classes } = useQuery<ClassWithSubject[]>({
    queryKey: ['/api/classes'],
  });

  const { data: tasks } = useQuery<TaskWithSubject[]>({
    queryKey: ['/api/tasks'],
  });

  // Get start of current week (Monday)
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const getDayName = (date: Date, index: number) => {
    const dayNames = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"];
    return dayNames[index];
  };

  const getClassesForDay = (date: Date) => {
    const dayIndex = date.getDay();
    const dayNames = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
    const dayName = dayNames[dayIndex];
    
    return classes?.filter(c => c.dayOfWeek === dayName).sort((a, b) => 
      a.startTime.localeCompare(b.startTime)
    ) || [];
  };

  const getTasksForDay = (date: Date) => {
    return tasks?.filter(task => {
      if (!task.dueDate) return false;
      const taskDate = typeof task.dueDate === 'string' ? parseISO(task.dueDate) : task.dueDate;
      return isSameDay(taskDate, date);
    }).sort((a, b) => {
      if (a.status !== b.status) {
        const statusOrder = { 'Pendente': 0, 'Em Andamento': 1, 'Concluído': 2 };
        return statusOrder[a.status as keyof typeof statusOrder] - statusOrder[b.status as keyof typeof statusOrder];
      }
      return a.title.localeCompare(b.title);
    }) || [];
  };

  const getClassAtTime = (date: Date, hour: number) => {
    const dayClasses = getClassesForDay(date);
    return dayClasses.find(c => {
      const startHour = parseInt(c.startTime.split(':')[0]);
      const endHour = parseInt(c.endTime.split(':')[0]);
      return hour >= startHour && hour < endHour;
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pendente':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'Em Andamento':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Concluído':
        return 'bg-secondary/10 text-secondary border-secondary/20';
      default:
        return 'bg-accent/10 text-accent border-accent/20';
    }
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => addDays(prev, direction === 'next' ? 7 : -7));
  };

  const navigateDay = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => addDays(prev, direction === 'next' ? 1 : -1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  if (viewMode === "day") {
    const dayClasses = getClassesForDay(currentDate);
    const dayTasks = getTasksForDay(currentDate);

    return (
      <div className="flex min-h-screen bg-background" data-testid="agenda-container">
        <Sidebar />
        
        <div className="flex-1 ml-64">
          <Header />
          
          <main className="p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Agenda Diária</h1>
                <p className="text-gray-600 mt-2">
                  {format(currentDate, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Button onClick={goToToday} variant="outline" size="sm">
                  Hoje
                </Button>
                <div className="flex items-center">
                  <Button onClick={() => navigateDay('prev')} variant="outline" size="sm">
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button onClick={() => navigateDay('next')} variant="outline" size="sm">
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
                <Select value={viewMode} onValueChange={(value: "day" | "week") => setViewMode(value)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="day">Dia</SelectItem>
                    <SelectItem value="week">Semana</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Classes */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Aulas do Dia
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {dayClasses.length === 0 ? (
                    <div className="text-center py-8">
                      <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p className="text-gray-500">Nenhuma aula agendada para hoje</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {dayClasses.map(classItem => (
                        <Card key={classItem.id} className="border border-gray-200">
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              <div 
                                className="w-4 h-4 rounded-full mt-1"
                                style={{ backgroundColor: classItem.subject.color }}
                              />
                              <div className="flex-1">
                                <h3 className="font-semibold text-gray-900 mb-1">
                                  {classItem.subject.name}
                                </h3>
                                <div className="flex items-center gap-4 text-sm text-gray-600">
                                  <div className="flex items-center gap-1">
                                    <Clock className="h-4 w-4" />
                                    <span>{classItem.startTime} - {classItem.endTime}</span>
                                  </div>
                                  <Badge variant="outline">{classItem.type}</Badge>
                                  {classItem.location && (
                                    <div className="flex items-center gap-1">
                                      <MapPin className="h-4 w-4" />
                                      <span>{classItem.location}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Tasks */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckSquare className="h-5 w-5" />
                    Tarefas do Dia
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {dayTasks.length === 0 ? (
                    <div className="text-center py-8">
                      <CheckSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p className="text-gray-500">Nenhuma tarefa para hoje</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {dayTasks.map(task => (
                        <Card key={task.id} className={`border ${getStatusColor(task.status)}`}>
                          <CardContent className="p-3">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h4 className="font-medium text-sm mb-1">{task.title}</h4>
                                {task.subject && (
                                  <div className="flex items-center gap-1 mb-1">
                                    <div 
                                      className="w-2 h-2 rounded-full"
                                      style={{ backgroundColor: task.subject.color }}
                                    />
                                    <span className="text-xs text-gray-600">{task.subject.name}</span>
                                  </div>
                                )}
                              </div>
                              <Badge variant="secondary" className="text-xs">
                                {task.status}
                              </Badge>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // Week View
  return (
    <div className="flex min-h-screen bg-background" data-testid="agenda-container">
      <Sidebar />
      
      <div className="flex-1 ml-64">
        <Header />
        
        <main className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Agenda Semanal</h1>
              <p className="text-gray-600 mt-2">
                {format(weekStart, "dd 'de' MMMM", { locale: ptBR })} - {format(addDays(weekStart, 6), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button onClick={goToToday} variant="outline" size="sm">
                Esta Semana
              </Button>
              <div className="flex items-center">
                <Button onClick={() => navigateWeek('prev')} variant="outline" size="sm">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button onClick={() => navigateWeek('next')} variant="outline" size="sm">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              <Select value={viewMode} onValueChange={(value: "day" | "week") => setViewMode(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">Dia</SelectItem>
                  <SelectItem value="week">Semana</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Card className="mb-6">
            <CardContent className="p-0">
              <div className="grid grid-cols-8 border-b">
                <div className="p-4 border-r bg-gray-50">
                  <span className="text-sm font-medium text-gray-600">Horário</span>
                </div>
                {weekDays.map((day, index) => {
                  const isToday = isSameDay(day, new Date());
                  return (
                    <div key={day.toISOString()} className={`p-4 border-r text-center ${isToday ? 'bg-blue-50' : 'bg-gray-50'}`}>
                      <div className="text-sm font-medium text-gray-900">
                        {getDayName(day, index)}
                      </div>
                      <div className={`text-xs ${isToday ? 'text-blue-600 font-semibold' : 'text-gray-500'}`}>
                        {format(day, "dd/MM")}
                      </div>
                    </div>
                  );
                })}
              </div>

              {HOURS.map(hour => (
                <div key={hour} className="grid grid-cols-8 border-b last:border-b-0">
                  <div className="p-2 border-r bg-gray-50 text-center">
                    <span className="text-sm text-gray-600">{hour}:00</span>
                  </div>
                  {weekDays.map((day) => {
                    const classAtTime = getClassAtTime(day, hour);
                    const isToday = isSameDay(day, new Date());
                    
                    return (
                      <div 
                        key={day.toISOString()} 
                        className={`p-2 border-r min-h-[60px] ${isToday ? 'bg-blue-25' : ''}`}
                      >
                        {classAtTime && (
                          <div 
                            className="rounded p-2 text-xs text-white font-medium shadow-sm"
                            style={{ backgroundColor: classAtTime.subject.color }}
                          >
                            <div className="font-semibold mb-1">{classAtTime.subject.name}</div>
                            <div className="opacity-90">{classAtTime.type}</div>
                            {classAtTime.location && (
                              <div className="opacity-75 flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                <span>{classAtTime.location}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Tasks Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckSquare className="h-5 w-5" />
                Tarefas da Semana
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {weekDays.map((day, index) => {
                  const dayTasks = getTasksForDay(day);
                  const isToday = isSameDay(day, new Date());
                  
                  return (
                    <Card key={day.toISOString()} className={`${isToday ? 'border-blue-200 bg-blue-50' : ''}`}>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm">
                          {getDayName(day, index)}
                          <div className="text-xs font-normal text-gray-500 mt-1">
                            {format(day, "dd/MM")}
                          </div>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0">
                        {dayTasks.length === 0 ? (
                          <p className="text-xs text-gray-500 text-center py-2">Nenhuma tarefa</p>
                        ) : (
                          <div className="space-y-2">
                            {dayTasks.slice(0, 3).map(task => (
                              <div key={task.id} className="text-xs">
                                <div className="flex items-center gap-2">
                                  {task.subject && (
                                    <div 
                                      className="w-2 h-2 rounded-full"
                                      style={{ backgroundColor: task.subject.color }}
                                    />
                                  )}
                                  <span className="truncate flex-1">{task.title}</span>
                                </div>
                              </div>
                            ))}
                            {dayTasks.length > 3 && (
                              <p className="text-xs text-gray-500">+{dayTasks.length - 3} mais</p>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}