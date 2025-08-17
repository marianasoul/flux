import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useState } from "react";


const loginSchema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "Senha obrigatória"),
});

type LoginFormData = z.infer<typeof loginSchema>;

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegister?: () => void;
}

export default function LoginModal({ isOpen, onClose, onRegister }: LoginModalProps) {
  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (data: LoginFormData) => {
    setError(null);
    try {
      const res = await apiRequest("POST", "/api/login", data);
      const result = await res.json();
      localStorage.setItem("user", JSON.stringify(result.user));
      form.reset();
      onClose();
    } catch (err: any) {
      setError(err.message || "Erro ao fazer login");
    }
  };

  const handleClose = () => {
    setError(null);
    form.reset();
    onClose();
  };

  return (
    <Dialog open={isOpen}>
      <DialogContent className="max-w-md w-full mx-4" data-testid="modal-login">
        <DialogHeader>
          <DialogTitle>Login</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
          {error && <p className="text-sm text-destructive mt-2">{error}</p>}
          <div className="flex space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={handleClose} className="flex-1">Cancelar</Button>
            <Button type="submit" className="flex-1">Entrar</Button>
          </div>
          <div className="pt-2 text-center">
            <Button type="button" variant="ghost" onClick={onRegister}>Cadastrar</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
