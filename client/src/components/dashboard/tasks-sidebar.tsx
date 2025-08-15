import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Clock, Play, AlertTriangle } from "lucide-react";
import type { TaskWithSubject } from "@shared/schema";
import { formatRelativeDate } from "@/lib/date-utils";

interface TasksSidebarProps {
  tasks: TaskWithSubject[];
  onAddTask: () => void;
}

export default function TasksSidebar({ tasks, onAddTask }: TasksSidebarProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Pendente':
        return Clock;
      case 'Em Andamento':
        return Play;
      default:
        return AlertTriangle;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pendente':
        return 'bg-warning/10 text-warning';
      case 'Em Andamento':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-accent/10 text-accent';
    }
  };

  const getDueDateColor = (dueDate: Date | null) => {
    if (!dueDate) return 'text-gray-500';
    
    const now = new Date();
    const due = new Date(dueDate);
    
    if (due < now) return 'text-accent'; // Overdue
    if (due.getTime() - now.getTime() < 24 * 60 * 60 * 1000) return 'text-warning'; // Due today/tomorrow
    return 'text-gray-500';
  };

  return (
    <Card className="bg-white shadow-sm border border-gray-100">
      <CardHeader className="border-b border-gray-200">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-800">
            Tarefas Urgentes
          </CardTitle>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={onAddTask}
            className="text-primary hover:text-primary/80"
            data-testid="button-add-task"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        {tasks.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 text-sm">Nenhuma tarefa urgente</p>
          </div>
        ) : (
          <>
            {tasks.slice(0, 5).map((task) => {
              const StatusIcon = getStatusIcon(task.status);
              
              return (
                <div 
                  key={task.id} 
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                  data-testid={`task-${task.title.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-800">
                        {task.title}
                      </h4>
                      {task.subject && (
                        <p className="text-xs text-gray-600 mt-1">
                          {task.subject.name}
                        </p>
                      )}
                      <div className="flex items-center mt-2">
                        <Badge className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                          <StatusIcon className="mr-1 h-3 w-3" />
                          {task.status}
                        </Badge>
                      </div>
                    </div>
                    <div className={`text-xs font-medium ${getDueDateColor(task.dueDate)}`}>
                      {task.dueDate ? formatRelativeDate(task.dueDate) : 'Sem prazo'}
                    </div>
                  </div>
                </div>
              );
            })}

            <Button 
              variant="ghost" 
              className="w-full text-center text-primary hover:text-primary/80 text-sm font-medium py-2"
              data-testid="button-view-all-tasks"
            >
              Ver todas as tarefas
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
