import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useState } from "react";

const registerSchema = z.object({
  name: z.string().min(3, "Nome obrigatório"),
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
  semester: z.number().min(1, "Semestre obrigatório"),
});

type RegisterFormData = z.infer<typeof registerSchema>;

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin?: () => void;
}

export default function RegisterModal({ isOpen, onClose, onLogin }: RegisterModalProps) {
  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      semester: 1,
    },
  });

  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (data: RegisterFormData) => {
    setError(null);
    try {
      await apiRequest("POST", "/api/register", data);
      form.reset();
      onClose();
    } catch (err: any) {
      setError(err.message || "Erro ao cadastrar usuário");
    }
  };

  const handleClose = () => {
    setError(null);
    form.reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md w-full mx-4" data-testid="modal-register">
        <DialogHeader>
          <DialogTitle>Cadastro de Usuário</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="name">Nome Completo</Label>
            <Input id="name" {...form.register("name" )} placeholder="Seu nome" />
            {form.formState.errors.name && (
              <p className="text-sm text-destructive mt-1">{form.formState.errors.name.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" type="email" {...form.register("email")} placeholder="seu@email.com" />
            {form.formState.errors.email && (
              <p className="text-sm text-destructive mt-1">{form.formState.errors.email.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="password">Senha</Label>
            <Input id="password" type="password" {...form.register("password")} placeholder="Senha" />
            {form.formState.errors.password && (
              <p className="text-sm text-destructive mt-1">{form.formState.errors.password.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="semester">Semestre/Ano</Label>
            <Input id="semester" type="number" min="1" max="12" {...form.register("semester", { valueAsNumber: true })} placeholder="Ex: 1" />
            {form.formState.errors.semester && (
              <p className="text-sm text-destructive mt-1">{form.formState.errors.semester.message}</p>
            )}
          </div>
          {error && <p className="text-sm text-destructive mt-2">{error}</p>}
          <div className="flex space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={handleClose} className="flex-1">Cancelar</Button>
            <Button type="submit" className="flex-1">Cadastrar</Button>
          </div>
          <div className="pt-2 text-center">
            <Button type="button" variant="ghost" onClick={onLogin}>Já tem conta? Entrar</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
