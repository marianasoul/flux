import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertSubjectSchema, type InsertSubject } from "@shared/schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface SubjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const subjectColors = [
  "#2563EB", // Blue
  "#059669", // Green
  "#DC2626", // Red
  "#F59E0B", // Amber
  "#7C3AED", // Purple
  "#DB2777", // Pink
  "#0891B2", // Cyan
  "#65A30D", // Lime
];

export default function SubjectModal({ isOpen, onClose }: SubjectModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<InsertSubject>({
    resolver: zodResolver(insertSubjectSchema),
    defaultValues: {
      name: "",
      code: "",
      color: "#2563EB",
      semester: 6,
    },
  });

  const createSubjectMutation = useMutation({
    mutationFn: async (data: InsertSubject) => {
      await apiRequest("POST", "/api/subjects", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/subjects'] });
      queryClient.invalidateQueries({ queryKey: ['/api/subjects/stats'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
      toast({
        title: "Sucesso",
        description: "Disciplina criada com sucesso!",
      });
      form.reset();
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao criar disciplina",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertSubject) => {
    createSubjectMutation.mutate(data);
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md w-full mx-4" data-testid="modal-subject">
        <DialogHeader>
          <DialogTitle>Adicionar Nova Disciplina</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="name">Nome da Disciplina</Label>
            <Input
              id="name"
              placeholder="Ex: Anatomia, Fisiologia"
              {...form.register("name")}
              data-testid="input-subject-name"
            />
            {form.formState.errors.name && (
              <p className="text-sm text-destructive mt-1">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="code">Código da Disciplina (Opcional)</Label>
            <Input
              id="code"
              placeholder="Ex: ANA001, FIS001"
              {...form.register("code")}
              data-testid="input-subject-code"
            />
          </div>

          <div>
            <Label htmlFor="semester">Semestre</Label>
            <Input
              id="semester"
              type="number"
              min="1"
              max="12"
              {...form.register("semester", { valueAsNumber: true })}
              data-testid="input-subject-semester"
            />
            {form.formState.errors.semester && (
              <p className="text-sm text-destructive mt-1">
                {form.formState.errors.semester.message}
              </p>
            )}
          </div>

          <div>
            <Label>Cor da Disciplina</Label>
            <div className="grid grid-cols-4 gap-2 mt-2">
              {subjectColors.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => form.setValue("color", color)}
                  className={`w-10 h-10 rounded-lg border-2 ${
                    form.watch("color") === color ? "border-gray-800" : "border-gray-300"
                  }`}
                  style={{ backgroundColor: color }}
                  data-testid={`color-${color}`}
                />
              ))}
            </div>
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
              disabled={createSubjectMutation.isPending}
              className="flex-1"
              data-testid="button-save-subject"
            >
              {createSubjectMutation.isPending ? "Salvando..." : "Salvar Disciplina"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
