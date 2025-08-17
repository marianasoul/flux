import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Calendar, Clock, MapPin } from "lucide-react";
import type { ClassWithSubject } from "@shared/schema";
import ClassModal from "@/components/modals/class-modal";

const DAYS_OF_WEEK = [
  { name: "Segunda", color: "bg-blue-50 border-blue-200" },
  { name: "Terça", color: "bg-green-50 border-green-200" },
  { name: "Quarta", color: "bg-yellow-50 border-yellow-200" },
  { name: "Quinta", color: "bg-purple-50 border-purple-200" },
  { name: "Sexta", color: "bg-red-50 border-red-200" },
  { name: "Sábado", color: "bg-gray-50 border-gray-200" },
  { name: "Domingo", color: "bg-gray-50 border-gray-200" },
];

export default function Cronograma() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<ClassWithSubject | null>(null);
  
  const { data: classes, isLoading } = useQuery<ClassWithSubject[]>({
    queryKey: ['/api/classes'],
  });

  const getClassesForDay = (dayName: string) => {
    return classes?.filter(c => c.dayOfWeek === dayName).sort((a, b) => 
      a.startTime.localeCompare(b.startTime)
    ) || [];
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Aula Expositiva':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Laboratório':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'SBE':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'TBL':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-lg text-muted-foreground">Carregando cronograma...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background" data-testid="cronograma-container">
      <Sidebar />
      
      <div className="flex-1 ml-64">
        <Header />
        
        <main className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Cronograma de Aulas</h1>
              <p className="text-gray-600 mt-2">Visualize e gerencie seu cronograma semanal</p>
            </div>
            <Button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2"
              data-testid="button-add-class"
            >
              <Plus className="h-4 w-4" />
              Adicionar Aula
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {DAYS_OF_WEEK.map(day => {
              const dayClasses = getClassesForDay(day.name);
              
              return (
                <Card key={day.name} className={`${day.color} border-2`}>
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      {day.name}
                      <Badge variant="secondary" className="ml-auto">
                        {dayClasses.length} aulas
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {dayClasses.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Nenhuma aula agendada</p>
                      </div>
                    ) : (
                      dayClasses.map(classItem => (
                        <div 
                          key={classItem.id}
                          className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
                          data-testid={`class-card-${classItem.id}`}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-semibold text-gray-900">
                              {classItem.subject.name}
                            </h4>
                            <Badge className={`text-xs ${getTypeColor(classItem.type)}`}> 
                              {classItem.type}
                            </Badge>
                          </div>
                          <div className="space-y-1 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4" />
                              <span>{classItem.startTime} - {classItem.endTime}</span>
                            </div>
                            {classItem.location && (
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4" />
                                <span>{classItem.location}</span>
                              </div>
                            )}
                            {classItem.subject.code && (
                              <div className="text-xs text-gray-500">
                                Código: {classItem.subject.code}
                              </div>
                            )}
                          </div>
                          <div className="flex gap-2 mt-3">
                            <Button size="sm" variant="outline" onClick={() => { setSelectedClass(classItem); setIsModalOpen(true); }}>
                              Editar
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => { setSelectedClass(classItem); setIsModalOpen(true); }}>
                              Remover
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </main>
      </div>

      <ClassModal 
        isOpen={isModalOpen} 
        onClose={() => { setIsModalOpen(false); setSelectedClass(null); }} 
        classItem={selectedClass}
      />
    </div>
  );
}