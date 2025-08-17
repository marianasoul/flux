import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertClassSchema, type InsertClass } from "@shared/schema";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface ClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  classItem?: InsertClass & { id?: string } | null;
}

const daysOfWeek = [
  "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"
];

const classTypes = [
  "Aula Expositiva", "Laboratório", "SBE", "TBL"
];

export default function ClassModal({ isOpen, onClose }: ClassModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: subjects } = useQuery({
    queryKey: ['/api/subjects'],
  });

  const form = useForm<InsertClass>({
    resolver: zodResolver(insertClassSchema),
    defaultValues: {
      subjectId: "",
      dayOfWeek: "Segunda",
      startTime: "",
      endTime: "",
      type: "Aula Expositiva",
      location: "",
    },
    values: {
      subjectId: classItem?.subjectId || "",
      dayOfWeek: classItem?.dayOfWeek || "Segunda",
      startTime: classItem?.startTime || "",
      endTime: classItem?.endTime || "",
      type: classItem?.type || "Aula Expositiva",
      location: classItem?.location || "",
    }
  });

  const createClassMutation = useMutation({
    mutationFn: async (data: InsertClass) => {
      await apiRequest("POST", "/api/classes", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/classes'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
      toast({
        title: "Sucesso",
        description: "Aula adicionada com sucesso!",
      });
      form.reset();
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao adicionar aula",
        variant: "destructive",
      });
    },
  });

  const updateClassMutation = useMutation({
    mutationFn: async (data: InsertClass & { id: string }) => {
      await apiRequest("PUT", `/api/classes/${data.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/classes'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
      toast({
        title: "Sucesso",
        description: "Aula atualizada com sucesso!",
      });
      form.reset();
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao atualizar aula",
        variant: "destructive",
      });
    },
  });

  const deleteClassMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/classes/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/classes'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
      toast({
        title: "Sucesso",
        description: "Aula removida!",
      });
      form.reset();
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao remover aula",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertClass) => {
    if (classItem?.id) {
      updateClassMutation.mutate({ ...data, id: classItem.id });
    } else {
      createClassMutation.mutate(data);
    }
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  const handleDelete = () => {
    if (classItem?.id) {
      deleteClassMutation.mutate(classItem.id);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md w-full mx-4" data-testid="modal-class">
        <DialogHeader>
          <DialogTitle>{classItem?.id ? "Editar Aula" : "Adicionar Nova Aula"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="subjectId">Disciplina</Label>
            <Select value={form.watch("subjectId")} onValueChange={(value) => form.setValue("subjectId", value)} data-testid="select-class-subject">
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
            {form.formState.errors.subjectId && (
              <p className="text-sm text-destructive mt-1">
                {form.formState.errors.subjectId.message}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="dayOfWeek">Dia da Semana</Label>
            <Select 
              value={form.watch("dayOfWeek")}
              onValueChange={(value) => form.setValue("dayOfWeek", value as any)}
              data-testid="select-class-day"
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {daysOfWeek.map((day) => (
                  <SelectItem key={day} value={day}>
                    {day}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startTime">Horário de Início</Label>
              <Input
                id="startTime"
                type="time"
                {...form.register("startTime")}
                data-testid="input-class-start-time"
              />
              {form.formState.errors.startTime && (
                <p className="text-sm text-destructive mt-1">
                  {form.formState.errors.startTime.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="endTime">Horário de Término</Label>
              <Input
                id="endTime"
                type="time"
                {...form.register("endTime")}
                data-testid="input-class-end-time"
              />
              {form.formState.errors.endTime && (
                <p className="text-sm text-destructive mt-1">
                  {form.formState.errors.endTime.message}
                </p>
              )}
            </div>
          </div>
          <div>
            <Label htmlFor="type">Tipo de Atividade</Label>
            <Select 
              value={form.watch("type")}
              onValueChange={(value) => form.setValue("type", value as any)}
              data-testid="select-class-type"
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {classTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="location">Local (Opcional)</Label>
            <Input
              id="location"
              placeholder="Ex: Sala 101, Lab 2, Auditório"
              {...form.register("location")}
              data-testid="input-class-location"
            />
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
              disabled={createClassMutation.isPending || updateClassMutation.isPending}
              className="flex-1"
              data-testid="button-save-class"
            >
              {classItem?.id
                ? (updateClassMutation.isPending ? "Salvando..." : "Salvar Alterações")
                : (createClassMutation.isPending ? "Salvando..." : "Salvar Aula")}
            </Button>
            {classItem?.id && (
              <Button 
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={deleteClassMutation.isPending}
                className="flex-1"
                data-testid="button-delete-class"
              >
                {deleteClassMutation.isPending ? "Removendo..." : "Remover"}
              </Button>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
