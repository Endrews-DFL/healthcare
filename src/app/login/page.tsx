"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { ArrowRight, Eye, EyeOff, HeartPulse, Loader2, ShieldCheck, Stethoscope } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { isSupabaseConfigured } from "@/lib/supabase/config"
import { createSupabaseBrowserClient } from "@/lib/supabase/client"

export default function LoginPage() {
  const router = useRouter()
  const [isRegistering, setIsRegistering] = React.useState(false)
  const [fullName, setFullName] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [showPassword, setShowPassword] = React.useState(false)
  const [busy, setBusy] = React.useState(false)
  const [message, setMessage] = React.useState("")
  const configured = isSupabaseConfigured()

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setMessage("")
    if (!configured) {
      setMessage("Configure NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY para ativar a autenticação.")
      return
    }

    setBusy(true)
    try {
      const supabase = createSupabaseBrowserClient()
      const result = isRegistering
        ? await supabase.auth.signUp({
            email,
            password,
            options: { data: { full_name: fullName }, emailRedirectTo: `${window.location.origin}/auth/callback` },
          })
        : await supabase.auth.signInWithPassword({ email, password })

      if (result.error) throw result.error
      if (isRegistering && !result.data.session) {
        setMessage("Conta criada. Verifique seu e-mail para confirmar o endereço antes de entrar.")
        return
      }
      const nextPath = new URLSearchParams(window.location.search).get("next")
      router.replace(nextPath || "/dashboard")
      router.refresh()
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Não foi possível autenticar.")
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#f3f6fb] p-4 sm:p-8">
      <div className="mx-auto grid min-h-[calc(100vh-2rem)] w-full max-w-6xl overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white shadow-xl shadow-slate-900/5 sm:min-h-[calc(100vh-4rem)] lg:grid-cols-[1.05fr_.95fr]">
        <section className="relative hidden overflow-hidden bg-gradient-to-br from-[#123b66] via-[#155f91] to-[#168b9b] p-12 text-white lg:flex lg:flex-col lg:justify-between">
          <div className="absolute -right-24 -top-20 h-80 w-80 rounded-full border border-white/10" />
          <div className="absolute -bottom-36 -left-20 h-96 w-96 rounded-full border border-white/10" />
          <div className="relative flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/20"><HeartPulse className="h-6 w-6" /></span>
            <span className="text-lg font-bold tracking-tight">HealthCare</span>
          </div>
          <div className="relative max-w-md">
            <span className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-cyan-50 ring-1 ring-white/15"><ShieldCheck className="h-4 w-4" /> Cuidado em cada etapa</span>
            <h1 className="text-4xl font-semibold leading-tight tracking-tight">Sua saúde merece atenção simples e próxima.</h1>
            <p className="mt-4 text-base leading-7 text-blue-100">Encontre especialistas, organize consultas e acompanhe seu cuidado em um só lugar.</p>
          </div>
          <div className="relative flex items-center gap-3 rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15"><Stethoscope className="h-5 w-5" /></span>
            <div><p className="text-sm font-semibold">Atendimento no seu ritmo</p><p className="mt-0.5 text-xs text-blue-100">Online ou presencial, você escolhe.</p></div>
          </div>
        </section>

        <section className="flex items-center justify-center px-5 py-10 sm:px-10 lg:px-14">
          <div className="w-full max-w-md">
            <div className="mb-9 lg:hidden">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-white shadow-lg shadow-blue-600/20"><HeartPulse className="h-6 w-6" /></span>
            </div>
            <div className="mb-8">
              <p className="text-sm font-semibold text-primary">Portal do paciente</p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">{isRegistering ? "Crie sua conta" : "Bem-vindo de volta"}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">{isRegistering ? "Preencha seus dados para começar a cuidar da sua saúde." : "Entre para acessar consultas, médicos e seus dados de saúde."}</p>
            </div>

            <form className="space-y-5" onSubmit={submit}>
              {isRegistering && <label className="block space-y-2 text-sm font-medium text-slate-700">Nome completo<Input autoComplete="name" required value={fullName} onChange={(event) => setFullName(event.target.value)} className="h-12 rounded-xl border-slate-200 bg-slate-50/70 px-4 focus-visible:bg-white" /></label>}
              <label className="block space-y-2 text-sm font-medium text-slate-700">E-mail<Input type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="voce@exemplo.com" className="h-12 rounded-xl border-slate-200 bg-slate-50/70 px-4 focus-visible:bg-white" /></label>
              <label className="block space-y-2 text-sm font-medium text-slate-700">Senha
                <span className="relative block">
                  <Input type={showPassword ? "text" : "password"} autoComplete={isRegistering ? "new-password" : "current-password"} minLength={8} required value={password} onChange={(event) => setPassword(event.target.value)} className="h-12 rounded-xl border-slate-200 bg-slate-50/70 px-4 pr-12 focus-visible:bg-white" />
                  <button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute inset-y-0 right-0 flex w-12 items-center justify-center rounded-r-xl text-slate-400 transition hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}>{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
                </span>
                {isRegistering && <span className="block text-xs font-normal text-slate-500">Use pelo menos 8 caracteres.</span>}
              </label>

              {message && <p role="status" className="rounded-xl border border-blue-100 bg-blue-50 p-3 text-sm leading-5 text-blue-800">{message}</p>}
              <Button type="submit" disabled={busy} className="h-12 w-full rounded-xl text-sm font-semibold shadow-md shadow-blue-600/15">
                {busy ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Aguarde...</> : <>{isRegistering ? "Criar conta" : "Entrar na minha conta"}<ArrowRight className="ml-2 h-4 w-4" /></>}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-600">{isRegistering ? "Já tem uma conta?" : "Ainda não tem uma conta?"}{" "}<button type="button" className="font-semibold text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" onClick={() => { setIsRegistering((value) => !value); setMessage("") }}>{isRegistering ? "Entrar" : "Cadastre-se"}</button></p>
            {!configured && <p className="mt-6 rounded-xl bg-amber-50 px-3 py-2.5 text-center text-xs leading-5 text-amber-800">Modo de demonstração. Configure o Supabase para ativar o acesso.</p>}
          </div>
        </section>
      </div>
    </main>
  )
}
