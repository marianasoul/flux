import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, CheckSquare, Clock, Play, AlertTriangle, Calendar } from "lucide-react";
import type { TaskWithSubject } from "@shared/schema";
import TaskModal from "@/components/modals/task-modal";
import { formatRelativeDate } from "@/lib/date-utils";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Tarefas() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: tasks, isLoading } = useQuery<TaskWithSubject[]>({
    queryKey: ['/api/tasks'],
  });

  const updateTaskMutation = useMutation({
    mutationFn: async ({ taskId, status }: { taskId: string; status: string }) => {
      await apiRequest("PUT", `/api/tasks/${taskId}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      queryClient.invalidateQueries({ queryKey: ['/api/tasks/urgent'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
      queryClient.invalidateQueries({ queryKey: ['/api/subjects/stats'] });
      toast({
        title: "Sucesso",
        description: "Status da tarefa atualizado!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao atualizar tarefa",
        variant: "destructive",
      });
    },
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Pendente':
        return Clock;
      case 'Em Andamento':
        return Play;
      case 'Concluído':
        return CheckSquare;
      default:
        return AlertTriangle;
    }
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

  const getDueDateColor = (dueDate: Date | null) => {
    if (!dueDate) return 'text-gray-500';
    
    const now = new Date();
    const due = new Date(dueDate);
    
    if (due < now) return 'text-accent'; // Overdue
    if (due.getTime() - now.getTime() < 24 * 60 * 60 * 1000) return 'text-warning'; // Due today/tomorrow
    return 'text-gray-500';
  };

  const getPriorityLevel = (dueDate: Date | null, status: string) => {
    if (status === 'Concluído') return 0;
    if (!dueDate) return 1;
    
    const now = new Date();
    const due = new Date(dueDate);
    const hoursUntilDue = (due.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    if (hoursUntilDue < 0) return 4; // Overdue
    if (hoursUntilDue < 24) return 3; // Due today
    if (hoursUntilDue < 72) return 2; // Due soon
    return 1; // Normal
  };

  const filteredTasks = tasks?.filter(task => {
    if (statusFilter === "all") return true;
    return task.status === statusFilter;
  }).sort((a, b) => {
    const priorityA = getPriorityLevel(a.dueDate, a.status);
    const priorityB = getPriorityLevel(b.dueDate, b.status);
    
    if (priorityA !== priorityB) return priorityB - priorityA;
    
    if (a.dueDate && b.dueDate) {
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    }
    
    return a.createdAt && b.createdAt ? 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime() : 0;
  }) || [];

  const handleStatusChange = (taskId: string, newStatus: string) => {
    updateTaskMutation.mutate({ taskId, status: newStatus });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-lg text-muted-foreground">Carregando tarefas...</div>
      </div>
    );
  }

  const taskStats = {
    total: tasks?.length || 0,
    pendente: tasks?.filter(t => t.status === 'Pendente').length || 0,
    emAndamento: tasks?.filter(t => t.status === 'Em Andamento').length || 0,
    concluido: tasks?.filter(t => t.status === 'Concluído').length || 0,
  };

  return (
    <div className="flex min-h-screen bg-background" data-testid="tarefas-container">
      <Sidebar />
      
      <div className="flex-1 ml-64">
        <Header />
        
        <main className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Gerenciador de Tarefas</h1>
              <p className="text-gray-600 mt-2">Organize e acompanhe suas atividades acadêmicas</p>
            </div>
            <Button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2"
              data-testid="button-add-task"
            >
              <Plus className="h-4 w-4" />
              Nova Tarefa
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total</p>
                    <p className="text-2xl font-bold">{taskStats.total}</p>
                  </div>
                  <CheckSquare className="h-8 w-8 text-gray-400" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Pendentes</p>
                    <p className="text-2xl font-bold text-warning">{taskStats.pendente}</p>
                  </div>
                  <Clock className="h-8 w-8 text-warning" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Em Andamento</p>
                    <p className="text-2xl font-bold text-blue-600">{taskStats.emAndamento}</p>
                  </div>
                  <Play className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Concluídas</p>
                    <p className="text-2xl font-bold text-secondary">{taskStats.concluido}</p>
                  </div>
                  <CheckSquare className="h-8 w-8 text-secondary" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filter */}
          <div className="mb-6">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Tarefas</SelectItem>
                <SelectItem value="Pendente">Pendentes</SelectItem>
                <SelectItem value="Em Andamento">Em Andamento</SelectItem>
                <SelectItem value="Concluído">Concluídas</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tasks List */}
          <div className="space-y-4">
            {filteredTasks.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <CheckSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">
                    {statusFilter === "all" ? "Nenhuma tarefa encontrada" : `Nenhuma tarefa ${statusFilter.toLowerCase()}`}
                  </h3>
                  <p className="text-gray-500 mb-4">
                    {statusFilter === "all" ? "Crie sua primeira tarefa para começar" : "Altere o filtro para ver outras tarefas"}
                  </p>
                  {statusFilter === "all" && (
                    <Button onClick={() => setIsModalOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Criar Primeira Tarefa
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              filteredTasks.map(task => {
                const StatusIcon = getStatusIcon(task.status);
                const priorityLevel = getPriorityLevel(task.dueDate, task.status);
                
                return (
                  <Card 
                    key={task.id} 
                    className={`hover:shadow-md transition-shadow ${
                      priorityLevel === 4 ? 'border-l-4 border-l-accent' :
                      priorityLevel === 3 ? 'border-l-4 border-l-warning' : ''
                    }`}
                    data-testid={`task-card-${task.id}`}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-lg ${getStatusColor(task.status).split(' ')[0]}/10`}>
                              <StatusIcon className="h-4 w-4" />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-900 mb-1">
                                {task.title}
                              </h3>
                              {task.description && (
                                <p className="text-gray-600 text-sm mb-3">
                                  {task.description}
                                </p>
                              )}
                              
                              <div className="flex items-center gap-4 text-sm">
                                {task.subject && (
                                  <div className="flex items-center gap-1">
                                    <div 
                                      className="w-3 h-3 rounded-full"
                                      style={{ backgroundColor: task.subject.color }}
                                    />
                                    <span className="text-gray-600">
                                      {task.subject.name}
                                    </span>
                                  </div>
                                )}
                                
                                {task.dueDate && (
                                  <div className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    <span className={`font-medium ${getDueDateColor(task.dueDate)}`}>
                                      {formatRelativeDate(task.dueDate)}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <Badge className={`${getStatusColor(task.status)}`}>
                            {task.status}
                          </Badge>
                          
                          <Select 
                            value={task.status} 
                            onValueChange={(value) => handleStatusChange(task.id, value)}
                            disabled={updateTaskMutation.isPending}
                          >
                            <SelectTrigger className="w-36">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Pendente">Pendente</SelectItem>
                              <SelectItem value="Em Andamento">Em Andamento</SelectItem>
                              <SelectItem value="Concluído">Concluído</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </main>
      </div>

      <TaskModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
}