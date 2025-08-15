import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertGradeSchema, type InsertGrade } from "@shared/schema";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

interface GradeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const gradeFormSchema = insertGradeSchema.extend({
  examDate: z.string(),
  score: z.string(),
  maxScore: z.string(),
  weight: z.string(),
});

type GradeFormData = z.infer<typeof gradeFormSchema>;

export default function GradeModal({ isOpen, onClose }: GradeModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: subjects } = useQuery({
    queryKey: ['/api/subjects'],
  });

  const form = useForm<GradeFormData>({
    resolver: zodResolver(gradeFormSchema),
    defaultValues: {
      subjectId: "",
      examName: "",
      score: "",
      maxScore: "10.00",
      weight: "1.00",
      examDate: "",
    },
  });

  const createGradeMutation = useMutation({
    mutationFn: async (data: InsertGrade) => {
      await apiRequest("POST", "/api/grades", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/grades'] });
      queryClient.invalidateQueries({ queryKey: ['/api/grades/recent'] });
      queryClient.invalidateQueries({ queryKey: ['/api/grades/average/overall'] });
      queryClient.invalidateQueries({ queryKey: ['/api/subjects/stats'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
      toast({
        title: "Sucesso",
        description: "Nota registrada com sucesso!",
      });
      form.reset();
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao registrar nota",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: GradeFormData) => {
    const formattedData: InsertGrade = {
      ...data,
      score: data.score,
      maxScore: data.maxScore,
      weight: data.weight,
      examDate: new Date(data.examDate),
    };
    
    createGradeMutation.mutate(formattedData);
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md w-full mx-4" data-testid="modal-grade">
        <DialogHeader>
          <DialogTitle>Registrar Nova Nota</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="examName">Nome da Avaliação</Label>
            <Input
              id="examName"
              placeholder="Ex: Prova P1, Trabalho, Quiz"
              {...form.register("examName")}
              data-testid="input-grade-exam-name"
            />
            {form.formState.errors.examName && (
              <p className="text-sm text-destructive mt-1">
                {form.formState.errors.examName.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="subjectId">Disciplina</Label>
            <Select onValueChange={(value) => form.setValue("subjectId", value)} data-testid="select-grade-subject">
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="score">Nota Obtida</Label>
              <Input
                id="score"
                type="number"
                step="0.1"
                min="0"
                placeholder="Ex: 8.5"
                {...form.register("score")}
                data-testid="input-grade-score"
              />
              {form.formState.errors.score && (
                <p className="text-sm text-destructive mt-1">
                  {form.formState.errors.score.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="maxScore">Nota Máxima</Label>
              <Input
                id="maxScore"
                type="number"
                step="0.1"
                min="0"
                placeholder="10.0"
                {...form.register("maxScore")}
                data-testid="input-grade-max-score"
              />
              {form.formState.errors.maxScore && (
                <p className="text-sm text-destructive mt-1">
                  {form.formState.errors.maxScore.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="weight">Peso (%)</Label>
            <Input
              id="weight"
              type="number"
              step="0.1"
              min="0"
              max="100"
              placeholder="Ex: 40"
              {...form.register("weight")}
              data-testid="input-grade-weight"
            />
            <p className="text-xs text-gray-500 mt-1">
              Peso da avaliação para cálculo da média (em %)
            </p>
            {form.formState.errors.weight && (
              <p className="text-sm text-destructive mt-1">
                {form.formState.errors.weight.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="examDate">Data da Avaliação</Label>
            <Input
              id="examDate"
              type="date"
              {...form.register("examDate")}
              data-testid="input-grade-exam-date"
            />
            {form.formState.errors.examDate && (
              <p className="text-sm text-destructive mt-1">
                {form.formState.errors.examDate.message}
              </p>
            )}
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
              disabled={createGradeMutation.isPending}
              className="flex-1"
              data-testid="button-save-grade"
            >
              {createGradeMutation.isPending ? "Salvando..." : "Salvar Nota"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
