import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Plus, BookOpen, Calendar, CheckSquare, TrendingUp } from "lucide-react";
import type { SubjectWithStats } from "@shared/schema";
import SubjectModal from "@/components/modals/subject-modal";

export default function Disciplinas() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const { data: subjects, isLoading } = useQuery<SubjectWithStats[]>({
    queryKey: ['/api/subjects/stats'],
  });

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-secondary';
    if (progress >= 60) return 'bg-warning';
    return 'bg-accent';
  };

  const getAverageColor = (average: number | null) => {
    if (!average) return 'text-gray-500';
    if (average >= 8) return 'text-secondary';
    if (average >= 7) return 'text-warning';
    return 'text-accent';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-lg text-muted-foreground">Carregando disciplinas...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background" data-testid="disciplinas-container">
      <Sidebar />
      
      <div className="flex-1 ml-64">
        <Header />
        
        <main className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Minhas Disciplinas</h1>
              <p className="text-gray-600 mt-2">Gerencie suas matérias e acompanhe o progresso</p>
            </div>
            <Button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2"
              data-testid="button-add-subject"
            >
              <Plus className="h-4 w-4" />
              Nova Disciplina
            </Button>
          </div>

          {/* Overview Stats */}
          {subjects && subjects.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total de Disciplinas</p>
                      <p className="text-2xl font-bold">{subjects.length}</p>
                    </div>
                    <BookOpen className="h-8 w-8 text-primary" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total de Aulas/Semana</p>
                      <p className="text-2xl font-bold">{subjects.reduce((acc, s) => acc + s.weeklyClasses, 0)}</p>
                    </div>
                    <Calendar className="h-8 w-8 text-secondary" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Tarefas Totais</p>
                      <p className="text-2xl font-bold">{subjects.reduce((acc, s) => acc + s.totalTasks, 0)}</p>
                    </div>
                    <CheckSquare className="h-8 w-8 text-warning" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Média Geral</p>
                      <p className="text-2xl font-bold">
                        {subjects.filter(s => s.averageGrade !== null).length > 0
                          ? (subjects.reduce((acc, s) => acc + (s.averageGrade || 0), 0) / subjects.filter(s => s.averageGrade !== null).length).toFixed(1)
                          : 'N/A'
                        }
                      </p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-accent" />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Subjects Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subjects?.length === 0 ? (
              <div className="col-span-full">
                <Card>
                  <CardContent className="p-12 text-center">
                    <BookOpen className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-xl font-semibold text-gray-600 mb-2">
                      Nenhuma disciplina cadastrada
                    </h3>
                    <p className="text-gray-500 mb-6">
                      Comece adicionando suas primeiras disciplinas do semestre
                    </p>
                    <Button onClick={() => setIsModalOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar Primeira Disciplina
                    </Button>
                  </CardContent>
                </Card>
              </div>
            ) : (
              subjects?.map(subject => {
                const progressPercentage = subject.totalTasks > 0 
                  ? Math.round((subject.completedTasks / subject.totalTasks) * 100) 
                  : 0;
                
                return (
                  <Card 
                    key={subject.id} 
                    className="hover:shadow-lg transition-shadow cursor-pointer"
                    data-testid={`subject-card-${subject.id}`}
                  >
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-4 h-4 rounded-full flex-shrink-0"
                            style={{ backgroundColor: subject.color }}
                          />
                          <div>
                            <CardTitle className="text-lg">{subject.name}</CardTitle>
                            {subject.code && (
                              <p className="text-sm text-gray-500 mt-1">{subject.code}</p>
                            )}
                          </div>
                        </div>
                        <Badge variant="outline">
                          {subject.semester}º Semestre
                        </Badge>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      {/* Progress Section */}
                      <div>
                        <div className="flex justify-between text-sm text-gray-600 mb-2">
                          <span>Progresso das Tarefas</span>
                          <span>{progressPercentage}%</span>
                        </div>
                        <Progress value={progressPercentage} className="h-2" />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>{subject.completedTasks} concluídas</span>
                          <span>{subject.totalTasks} total</span>
                        </div>
                      </div>

                      {/* Stats Grid */}
                      <div className="grid grid-cols-2 gap-4 pt-2">
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center justify-center mb-1">
                            <Calendar className="h-4 w-4 text-gray-600 mr-1" />
                          </div>
                          <p className="text-lg font-semibold text-gray-900">
                            {subject.weeklyClasses}
                          </p>
                          <p className="text-xs text-gray-600">aulas/semana</p>
                        </div>
                        
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center justify-center mb-1">
                            <TrendingUp className="h-4 w-4 text-gray-600 mr-1" />
                          </div>
                          <p className={`text-lg font-semibold ${getAverageColor(subject.averageGrade)}`}>
                            {subject.averageGrade?.toFixed(1) || 'N/A'}
                          </p>
                          <p className="text-xs text-gray-600">média</p>
                        </div>
                      </div>

                      {/* Task Summary */}
                      {subject.totalTasks > 0 && (
                        <div className="pt-2 border-t border-gray-100">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Tarefas Pendentes:</span>
                            <span className="font-medium text-warning">
                              {subject.totalTasks - subject.completedTasks}
                            </span>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </main>
      </div>

      <SubjectModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
}