import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, TrendingUp, Calendar, Award, Target } from "lucide-react";
import type { GradeWithSubject, Subject } from "@shared/schema";
import GradeModal from "@/components/modals/grade-modal";
import { formatDate } from "@/lib/date-utils";

export default function Notas() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<string>("all");
  
  const { data: grades, isLoading: gradesLoading } = useQuery<GradeWithSubject[]>({
    queryKey: ['/api/grades'],
  });

  const { data: subjects } = useQuery<Subject[]>({
    queryKey: ['/api/subjects'],
  });

  const { data: overallAverage } = useQuery<{ average: number | null }>({
    queryKey: ['/api/grades/average/overall'],
  });

  const getGradeColor = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 80) return 'text-secondary';
    if (percentage >= 70) return 'text-warning';
    if (percentage >= 60) return 'text-blue-600';
    return 'text-accent';
  };

  const getGradeBackground = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 80) return 'bg-secondary/10 border-secondary/20';
    if (percentage >= 70) return 'bg-warning/10 border-warning/20';
    if (percentage >= 60) return 'bg-blue-50 border-blue-200';
    return 'bg-accent/10 border-accent/20';
  };

  const filteredGrades = grades?.filter(grade => {
    if (selectedSubject === "all") return true;
    return grade.subjectId === selectedSubject;
  }).sort((a, b) => new Date(b.examDate).getTime() - new Date(a.examDate).getTime()) || [];

  // Calculate subject averages
  const subjectAverages = subjects?.map(subject => {
    const subjectGrades = grades?.filter(g => g.subjectId === subject.id) || [];
    if (subjectGrades.length === 0) return { ...subject, average: null };

    const totalWeight = subjectGrades.reduce((sum, g) => sum + parseFloat(g.weight), 0);
    if (totalWeight === 0) return { ...subject, average: null };

    const weightedSum = subjectGrades.reduce((sum, g) => {
      const score = parseFloat(g.score);
      const maxScore = parseFloat(g.maxScore);
      const weight = parseFloat(g.weight);
      const normalizedScore = (score / maxScore) * 10; // Normalize to 0-10
      return sum + (normalizedScore * weight);
    }, 0);

    return {
      ...subject,
      average: Math.round((weightedSum / totalWeight) * 100) / 100,
      gradeCount: subjectGrades.length
    };
  }) || [];

  if (gradesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-lg text-muted-foreground">Carregando notas...</div>
      </div>
    );
  }

  const stats = {
    totalGrades: grades?.length || 0,
    overallAverage: overallAverage?.average || 0,
    subjectsWithGrades: subjectAverages.filter(s => s.average !== null).length,
    excellentGrades: grades?.filter(g => (parseFloat(g.score) / parseFloat(g.maxScore)) >= 0.9).length || 0
  };

  return (
    <div className="flex min-h-screen bg-background" data-testid="notas-container">
      <Sidebar />
      
      <div className="flex-1 ml-64">
        <Header />
        
        <main className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Minhas Notas</h1>
              <p className="text-gray-600 mt-2">Acompanhe seu desempenho acadêmico</p>
            </div>
            <Button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2"
              data-testid="button-add-grade"
            >
              <Plus className="h-4 w-4" />
              Registrar Nota
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total de Notas</p>
                    <p className="text-2xl font-bold">{stats.totalGrades}</p>
                  </div>
                  <Calendar className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Média Geral</p>
                    <p className={`text-2xl font-bold ${getGradeColor(stats.overallAverage, 10)}`}>
                      {stats.overallAverage > 0 ? stats.overallAverage.toFixed(1) : 'N/A'}
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-secondary" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Disciplinas Avaliadas</p>
                    <p className="text-2xl font-bold">{stats.subjectsWithGrades}</p>
                  </div>
                  <Target className="h-8 w-8 text-warning" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Notas Excelentes</p>
                    <p className="text-2xl font-bold text-secondary">{stats.excellentGrades}</p>
                  </div>
                  <Award className="h-8 w-8 text-secondary" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Subject Averages */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Médias por Disciplina
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {subjectAverages.length === 0 ? (
                  <p className="text-center text-gray-500 py-4">
                    Nenhuma disciplina cadastrada
                  </p>
                ) : (
                  subjectAverages.map(subject => (
                    <div key={subject.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: subject.color }}
                          />
                          <span className="text-sm font-medium">{subject.name}</span>
                        </div>
                        <div className="text-right">
                          <span className={`text-sm font-bold ${
                            subject.average ? getGradeColor(subject.average, 10) : 'text-gray-500'
                          }`}>
                            {subject.average?.toFixed(1) || 'N/A'}
                          </span>
                          {'gradeCount' in subject && subject.gradeCount && (
                            <p className="text-xs text-gray-500">
                              {subject.gradeCount} nota{subject.gradeCount !== 1 ? 's' : ''}
                            </p>
                          )}
                        </div>
                      </div>
                      {subject.average && (
                        <Progress value={subject.average * 10} className="h-1" />
                      )}
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Grades List */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Histórico de Avaliações</h2>
                <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filtrar por disciplina" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as Disciplinas</SelectItem>
                    {subjects?.map(subject => (
                      <SelectItem key={subject.id} value={subject.id}>
                        {subject.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                {filteredGrades.length === 0 ? (
                  <Card>
                    <CardContent className="p-12 text-center">
                      <Award className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <h3 className="text-lg font-semibold text-gray-600 mb-2">
                        {selectedSubject === "all" ? "Nenhuma nota registrada" : "Nenhuma nota para esta disciplina"}
                      </h3>
                      <p className="text-gray-500 mb-4">
                        {selectedSubject === "all" 
                          ? "Registre suas primeiras avaliações para começar"
                          : "Selecione outra disciplina ou registre uma nova nota"
                        }
                      </p>
                      <Button onClick={() => setIsModalOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Registrar Primeira Nota
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  filteredGrades.map(grade => {
                    const percentage = (parseFloat(grade.score) / parseFloat(grade.maxScore)) * 100;
                    
                    return (
                      <Card 
                        key={grade.id}
                        className={`border-2 ${getGradeBackground(parseFloat(grade.score), parseFloat(grade.maxScore))}`}
                        data-testid={`grade-card-${grade.id}`}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <div 
                                  className="w-3 h-3 rounded-full"
                                  style={{ backgroundColor: grade.subject.color }}
                                />
                                <h3 className="font-semibold text-gray-900">
                                  {grade.examName}
                                </h3>
                                <Badge variant="outline" className="text-xs">
                                  Peso {parseFloat(grade.weight).toFixed(0)}%
                                </Badge>
                              </div>
                              
                              <div className="flex items-center gap-4 text-sm text-gray-600">
                                <span>{grade.subject.name}</span>
                                <span>•</span>
                                <span>{formatDate(grade.examDate)}</span>
                              </div>
                            </div>
                            
                            <div className="text-right">
                              <div className="flex items-center gap-2 mb-1">
                                <span className={`text-2xl font-bold ${getGradeColor(parseFloat(grade.score), parseFloat(grade.maxScore))}`}>
                                  {parseFloat(grade.score).toFixed(1)}
                                </span>
                                <span className="text-gray-500">
                                  /{parseFloat(grade.maxScore).toFixed(1)}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className={`text-sm font-medium ${getGradeColor(parseFloat(grade.score), parseFloat(grade.maxScore))}`}>
                                  {percentage.toFixed(1)}%
                                </span>
                                {percentage >= 90 && <Award className="h-4 w-4 text-secondary" />}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </main>
      </div>

      <GradeModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
}