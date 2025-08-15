import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { SubjectWithStats, GradeWithSubject } from "@shared/schema";
import { formatDate } from "@/lib/date-utils";

interface ProgressSectionProps {
  subjects: SubjectWithStats[];
  recentGrades: GradeWithSubject[];
  overallAverage: number;
  onAddGrade: () => void;
}

export default function ProgressSection({ 
  subjects, 
  recentGrades, 
  overallAverage, 
  onAddGrade 
}: ProgressSectionProps) {
  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-primary';
    if (progress >= 60) return 'bg-secondary';
    return 'bg-warning';
  };

  const getGradeColor = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 80) return 'text-secondary';
    if (percentage >= 60) return 'text-warning';
    return 'text-accent';
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Subject Progress */}
      <Card className="bg-white shadow-sm border border-gray-100">
        <CardHeader className="border-b border-gray-200">
          <CardTitle className="text-lg font-semibold text-gray-800">
            Progresso por Disciplina
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {subjects.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 text-sm">Nenhuma disciplina cadastrada</p>
            </div>
          ) : (
            subjects.map(subject => {
              const progressPercentage = subject.totalTasks > 0 
                ? Math.round((subject.completedTasks / subject.totalTasks) * 100) 
                : 0;
              
              return (
                <div key={subject.id} className="space-y-2" data-testid={`subject-progress-${subject.name.toLowerCase()}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">
                      {subject.name}
                    </span>
                    <span className="text-sm text-gray-600">
                      {progressPercentage}%
                    </span>
                  </div>
                  <Progress value={progressPercentage} className="w-full h-2" />
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>
                      {subject.completedTasks} de {subject.totalTasks} tarefas
                    </span>
                    <span>
                      Média: {subject.averageGrade?.toFixed(1) || 'N/A'}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      {/* Grades Overview */}
      <Card className="bg-white shadow-sm border border-gray-100">
        <CardHeader className="border-b border-gray-200">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-gray-800">
              Notas Recentes
            </CardTitle>
            <Button 
              variant="ghost"
              onClick={onAddGrade}
              className="text-primary hover:text-primary/80 text-sm font-medium"
              data-testid="button-add-grade"
            >
              + Adicionar Nota
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          {recentGrades.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 text-sm">Nenhuma nota registrada</p>
            </div>
          ) : (
            <>
              {recentGrades.map(grade => (
                <div 
                  key={grade.id}
                  className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0"
                  data-testid={`grade-${grade.examName.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-gray-800">
                      {grade.examName}
                    </h4>
                    <p className="text-xs text-gray-600 mt-1">
                      {grade.subject.name} • {formatDate(grade.examDate)}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className={`text-lg font-bold ${getGradeColor(parseFloat(grade.score), parseFloat(grade.maxScore))}`}>
                      {parseFloat(grade.score).toFixed(1)}
                    </div>
                    <div className="text-xs text-gray-500">
                      Peso: {parseFloat(grade.weight).toFixed(0)}%
                    </div>
                  </div>
                </div>
              ))}

              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">
                    Média Geral do Semestre
                  </span>
                  <span className="text-xl font-bold text-secondary" data-testid="text-overall-average">
                    {overallAverage.toFixed(1)}
                  </span>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
