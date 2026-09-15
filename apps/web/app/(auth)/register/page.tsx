"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, User, ArrowRight, Github, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useAuthStore } from "../../../store/useAuthStore";

export default function RegisterPage() {
  const { t } = useTranslation("common");
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { setUser } = useAuthStore();

  const registerSchema = z.object({
    fullName: z.string().min(1, { message: t("auth.errors.required") }),
    username: z.string()
      .min(3, { message: t("auth.errors.username_too_short") })
      .regex(/^[a-zA-Z0-9_]+$/, { message: t("auth.errors.username_invalid") }),
    email: z.string().email({ message: t("auth.errors.invalid_email") }),
    password: z.string().min(8, { message: t("auth.errors.password_too_short") }),
    confirmPassword: z.string()
  }).refine((data) => data.password === data.confirmPassword, {
    message: t("auth.errors.passwords_dont_match"),
    path: ["confirmPassword"],
  });

  type RegisterFormValues = z.infer<typeof registerSchema>;

  const { register, handleSubmit, setError, formState: { errors } } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setIsSubmitting(true);
    try {
      const res = await fetch("http://localhost:8008/api/v1/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          fullName: data.fullName
        }),
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Registration failed");
      }
      
      const responseData = await res.json();

      if (responseData.user) {
        setUser(responseData.user);
      }

      router.push("/dashboard");
      toast.success(t("auth.register.success"));
    } catch (error: any) {
      console.error(error);
      const msg = error.message;
      if (Array.isArray(msg)) {
        toast.error(t(msg[0]) || t("auth.errors.unknown"));
      } else {
        toast.error(t(msg) || t("auth.errors.unknown"));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-2 text-center lg:text-left">
        <h1 className="text-3xl font-bold tracking-tight">{t("auth.register.title")}</h1>
        <p className="text-muted-foreground text-sm">
          {t("auth.register.subtitle")}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium leading-none">{t("auth.register.full_name")}</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
              {...register("fullName")}
              type="text" 
              className={`flex h-10 w-full rounded-md border bg-background px-10 py-2 text-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${errors.fullName ? 'border-destructive focus-visible:ring-destructive' : 'border-input focus-visible:ring-ring'}`}
              placeholder={t("auth.register.full_name_placeholder")}
            />
          </div>
          {errors.fullName && <p className="text-[10px] font-medium text-destructive">{errors.fullName.message}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium leading-none">{t("auth.register.username")}</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
              {...register("username")}
              type="text" 
              className={`flex h-10 w-full rounded-md border bg-background px-10 py-2 text-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${errors.username ? 'border-destructive focus-visible:ring-destructive' : 'border-input focus-visible:ring-ring'}`}
              placeholder={t("auth.register.username_placeholder")}
            />
          </div>
          {errors.username && <p className="text-[10px] font-medium text-destructive">{errors.username.message}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium leading-none">{t("auth.login.email")}</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
              {...register("email")}
              type="email" 
              className={`flex h-10 w-full rounded-md border bg-background px-10 py-2 text-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${errors.email ? 'border-destructive focus-visible:ring-destructive' : 'border-input focus-visible:ring-ring'}`}
              placeholder={t("auth.login.email_placeholder")}
            />
          </div>
          {errors.email && <p className="text-[10px] font-medium text-destructive">{errors.email.message}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium leading-none">{t("auth.login.password")}</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
              {...register("password")}
              type="password" 
              className={`flex h-10 w-full rounded-md border bg-background px-10 py-2 text-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${errors.password ? 'border-destructive focus-visible:ring-destructive' : 'border-input focus-visible:ring-ring'}`}
              placeholder={t("auth.login.password_placeholder")}
            />
          </div>
          {errors.password && <p className="text-[10px] font-medium text-destructive">{errors.password.message}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium leading-none">{t("auth.register.confirm_password")}</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
              {...register("confirmPassword")}
              type="password" 
              className={`flex h-10 w-full rounded-md border bg-background px-10 py-2 text-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${errors.confirmPassword ? 'border-destructive focus-visible:ring-destructive' : 'border-input focus-visible:ring-ring'}`}
              placeholder={t("auth.login.password_placeholder")}
            />
          </div>
          {errors.confirmPassword && <p className="text-[10px] font-medium text-destructive">{errors.confirmPassword.message}</p>}
        </div>

        <button 
          disabled={isSubmitting}
          type="submit" 
          className="w-full inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 mt-2 group"
        >
          {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : (
            <>
              {t("auth.register.submit")}
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            {t("auth.login.or_continue_with")}
          </span>
        </div>
      </div>

      <button className="w-full inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2">
        <Github className="mr-2 w-4 h-4" />
        GitHub
      </button>

      <p className="text-center text-sm text-muted-foreground">
        {t("auth.register.have_account")}{" "}
        <Link href="/login" className="font-semibold text-primary hover:underline underline-offset-4">
          {t("auth.register.login_link")}
        </Link>
      </p>

      <p className="px-8 text-center text-xs text-muted-foreground">
        {t("auth.register.terms_prefix")}
        <Link href="/terms" className="underline underline-offset-4 hover:text-primary">
          {t("auth.register.terms")}
        </Link>
        {t("auth.register.and")}
        <Link href="/privacy" className="underline underline-offset-4 hover:text-primary">
          {t("auth.register.privacy")}
        </Link>
        {t("auth.register.terms_suffix")}
      </p>
    </div>
  );
}
