import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarPlus, CheckSquare, GraduationCap, BookOpen } from "lucide-react";

interface QuickActionsProps {
  onActionClick: (action: 'class' | 'task' | 'grade' | 'subject') => void;
}

export default function QuickActions({ onActionClick }: QuickActionsProps) {
  const actions = [
    {
      id: 'class',
      title: 'Adicionar Aula',
      icon: CalendarPlus,
      color: 'primary',
      testId: 'button-add-class'
    },
    {
      id: 'task',
      title: 'Nova Tarefa',
      icon: CheckSquare,
      color: 'secondary',
      testId: 'button-add-task-quick'
    },
    {
      id: 'grade',
      title: 'Registrar Nota',
      icon: GraduationCap,
      color: 'warning',
      testId: 'button-add-grade-quick'
    },
    {
      id: 'subject',
      title: 'Nova Disciplina',
      icon: BookOpen,
      color: 'accent',
      testId: 'button-add-subject'
    },
  ] as const;

  const getColorClasses = (color: string) => {
    const colorMap = {
      primary: 'border-primary bg-primary/10 hover:border-primary hover:bg-primary/5 text-primary',
      secondary: 'border-secondary bg-secondary/10 hover:border-secondary hover:bg-secondary/5 text-secondary',
      warning: 'border-warning bg-warning/10 hover:border-warning hover:bg-warning/5 text-warning',
      accent: 'border-accent bg-accent/10 hover:border-accent hover:bg-accent/5 text-accent',
    };
    return colorMap[color as keyof typeof colorMap] || colorMap.primary;
  };

  return (
    <Card className="bg-white shadow-sm border border-gray-100">
      <CardHeader className="border-b border-gray-200">
        <CardTitle className="text-lg font-semibold text-gray-800">
          Ações Rápidas
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {actions.map(action => {
            const Icon = action.icon;
            
            return (
              <Button
                key={action.id}
                variant="outline"
                onClick={() => onActionClick(action.id)}
                className={`flex flex-col items-center p-6 h-auto border-2 transition-all ${getColorClasses(action.color)}`}
                data-testid={action.testId}
              >
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-3 ${getColorClasses(action.color).includes('primary') ? 'bg-primary/10' : 
                  getColorClasses(action.color).includes('secondary') ? 'bg-secondary/10' :
                  getColorClasses(action.color).includes('warning') ? 'bg-warning/10' : 'bg-accent/10'}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <span className="text-sm font-medium text-gray-700">
                  {action.title}
                </span>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
