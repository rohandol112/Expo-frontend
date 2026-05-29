import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Globe, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { loginSchema, type LoginFormValues } from "@/validations/loginSchema";
import { authService } from "@/services/auth.service";
import { hasPersistedAuthSession, useAuthStore } from "@/store/useAuthStore";
import { ROUTES } from "@/constants/routes.constants";
import { handleError } from "@/lib/errorHandler";

export const Route = createFileRoute("/login")({
  beforeLoad: () => {
    if (typeof window === "undefined") return;

    if (useAuthStore.getState().isAuthenticated || hasPersistedAuthSession()) {
      throw redirect({ to: ROUTES.DASHBOARD });
    }
  },
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [showPw, setShowPw] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "admin@news.com", password: "admin123" },
  });

  const onSubmit = async (values: LoginFormValues) => {
    try {
      const { user, token } = await authService.login(values);
      setAuth(user, token);
      toast.success("Welcome back!");
      navigate({ to: ROUTES.DASHBOARD });
    } catch (e) {
      handleError(e, "Login failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl border p-8">
        <div className="flex flex-col items-center mb-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary mb-3">
            <Globe className="h-6 w-6 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-semibold">News Admin</h1>
          <p className="text-sm text-muted-foreground mt-1">Sign in to your dashboard</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <div className="relative mt-1.5">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input id="email" type="email" placeholder="admin@news.com" className="pl-9" {...register("email")} />
            </div>
            {errors.email && <p className="text-xs text-destructive mt-1">{errors.email.message}</p>}
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <div className="relative mt-1.5">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type={showPw ? "text" : "password"}
                placeholder="••••••••"
                className="pl-9 pr-9"
                {...register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              >
                {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && <p className="text-xs text-destructive mt-1">{errors.password.message}</p>}
          </div>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Signing in..." : "Sign In"}
          </Button>
        </form>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Demo credentials: admin@news.com / admin123
        </p>
      </div>
    </div>
  );
}
