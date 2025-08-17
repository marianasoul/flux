import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertTaskSchema, type InsertTask } from "@shared/schema";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task?: TaskFormData & { id?: string } | null;
}

const taskFormSchema = insertTaskSchema.extend({
  dueDate: z.string().optional(),
});

type TaskFormData = z.infer<typeof taskFormSchema>;

export default function TaskModal({ isOpen, onClose }: TaskModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: subjects } = useQuery({
    queryKey: ['/api/subjects'],
  });

  const form = useForm<TaskFormData>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: "",
      description: "",
      status: "Pendente",
      dueDate: "",
      subjectId: "",
    },
    values: {
      title: (typeof task?.title === 'string' ? task.title : ""),
      description: task?.description || "",
      status: task?.status || "Pendente",
      dueDate: task?.dueDate ? (typeof task.dueDate === 'string' ? task.dueDate : (task.dueDate instanceof Date ? task.dueDate.toISOString().slice(0,10) : "")) : "",
      subjectId: task?.subjectId || "",
    }
  });

  const createTaskMutation = useMutation({
    mutationFn: async (data: InsertTask) => {
      await apiRequest("POST", "/api/tasks", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      queryClient.invalidateQueries({ queryKey: ['/api/tasks/urgent'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
      toast({
        title: "Sucesso",
        description: "Tarefa criada com sucesso!",
      });
      form.reset();
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao criar tarefa",
        variant: "destructive",
      });
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: async (data: TaskFormData & { id: string }) => {
      await apiRequest("PUT", `/api/tasks/${data.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      queryClient.invalidateQueries({ queryKey: ['/api/tasks/urgent'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
      toast({
        title: "Sucesso",
        description: "Tarefa atualizada com sucesso!",
      });
      form.reset();
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao atualizar tarefa",
        variant: "destructive",
      });
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/tasks/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      queryClient.invalidateQueries({ queryKey: ['/api/tasks/urgent'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
      toast({
        title: "Sucesso",
        description: "Tarefa removida!",
      });
      form.reset();
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao remover tarefa",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: TaskFormData) => {
    const formattedData: InsertTask = {
      ...data,
      subjectId: data.subjectId || null,
      classId: null,
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
    };
    if (task?.id) {
      updateTaskMutation.mutate({ ...formattedData, id: task.id });
    } else {
      createTaskMutation.mutate(formattedData);
    }
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  const handleDelete = () => {
    if (task?.id) {
      deleteTaskMutation.mutate(task.id);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md w-full mx-4" data-testid="modal-task">
        <DialogHeader>
          <DialogTitle>{task?.id ? "Editar Tarefa" : "Adicionar Nova Tarefa"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="title">Título da Tarefa</Label>
            <Input
              id="title"
              placeholder="Ex: Revisar Sistema Nervoso"
              {...form.register("title")}
              data-testid="input-task-title"
            />
            {form.formState.errors.title && (
              <p className="text-sm text-destructive mt-1">
                {form.formState.errors.title.message}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="description">Descrição (Opcional)</Label>
            <Textarea
              id="description"
              placeholder="Detalhes da tarefa..."
              {...form.register("description")}
              data-testid="input-task-description"
            />
          </div>
          <div>
            <Label htmlFor="subjectId">Disciplina</Label>
            <Select value={form.watch("subjectId")} onValueChange={(value) => form.setValue("subjectId", value)} data-testid="select-task-subject">
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma disciplina" />
              </SelectTrigger>
              <SelectContent>
                {subjects?.map((subject) => (
                  <SelectItem key={subject.id} value={subject.id}>
                    {subject.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="dueDate">Prazo</Label>
            <Input
              id="dueDate"
              type="date"
              {...form.register("dueDate")}
              data-testid="input-task-due-date"
            />
          </div>
          <div>
            <Label htmlFor="status">Status</Label>
            <Select 
              value={form.watch("status")}
              onValueChange={(value) => form.setValue("status", value as "Pendente" | "Em Andamento" | "Concluído")}
              data-testid="select-task-status"
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Pendente">Pendente</SelectItem>
                <SelectItem value="Em Andamento">Em Andamento</SelectItem>
                <SelectItem value="Concluído">Concluído</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex space-x-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose}
              className="flex-1"
              data-testid="button-cancel"
            >
              Cancelar
            </Button>
            <Button 
              type="submit"
              disabled={createTaskMutation.isPending || updateTaskMutation.isPending}
              className="flex-1"
              data-testid="button-save-task"
            >
              {task?.id
                ? (updateTaskMutation.isPending ? "Salvando..." : "Salvar Alterações")
                : (createTaskMutation.isPending ? "Salvando..." : "Salvar Tarefa")}
            </Button>
            {task?.id && (
              <Button 
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={deleteTaskMutation.isPending}
                className="flex-1"
                data-testid="button-delete-task"
              >
                {deleteTaskMutation.isPending ? "Removendo..." : "Remover"}
              </Button>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
