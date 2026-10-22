"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import {
  User as UserIcon,
  ShieldCheck,
  Mail,
  Phone,
  Calendar,
  CreditCard,
  Building2,
  Shield,
  FileText,
  ShieldAlert,
  Smartphone,
  ChevronRight,
  LogOut,
  KeyRound,
  Bell,
  Check,
  Lock,
  ExternalLink,
  Info,
  type LucideIcon,
} from "lucide-react"

import { AppShell } from "@/components/layout/app-shell"
import { PageHeader } from "@/components/shared/page-header"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { mockUser as initialUser } from "@/data/user"
import { formatDate } from "@/lib/utils"
import { isSupabaseConfigured } from "@/lib/supabase/config"
import { createSupabaseBrowserClient } from "@/lib/supabase/client"

interface SettingsItemProps {
  icon: LucideIcon
  iconBgColor?: string
  iconColor?: string
  label: string
  sublabel?: string
  href?: string
  action?: () => void
  trailing?: React.ReactNode
}

/**
 * Reusable SettingsItem component rendering as a link, button, or static row.
 */
function SettingsItem({
  icon: Icon,
  iconBgColor = "bg-blue-50",
  iconColor = "text-primary",
  label,
  sublabel,
  href,
  action,
  trailing,
}: SettingsItemProps) {
  const content = (
    <div className="flex items-center justify-between p-4 group-hover:bg-slate-50/70 transition-colors w-full">
      <div className="flex items-center gap-3.5">
        <div
          className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 ${iconBgColor} ${iconColor}`}
        >
          <Icon className="h-4.5 w-4.5" />
        </div>
        <div className="text-left">
          <p className="text-sm font-medium text-slate-800">{label}</p>
          {sublabel && <p className="text-xs text-slate-400 mt-0.5">{sublabel}</p>}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {trailing ? (
          trailing
        ) : (
          <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-slate-600 group-hover:translate-x-0.5 transition-all" />
        )}
      </div>
    </div>
  )

  if (href) {
    return (
      <Link href={href} className="group block focus:outline-none focus:bg-slate-50">
        {content}
      </Link>
    )
  }

  if (action) {
    return (
      <button
        type="button"
        onClick={action}
        className="group block w-full text-left focus:outline-none focus:bg-slate-50"
      >
        {content}
      </button>
    )
  }

  return <div className="group block">{content}</div>
}

/**
 * Enhanced Profile Page with user credentials, settings groups,
 * interactive dialogs, and account controls.
 */
export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = React.useState(initialUser)
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true)

  // Dialog states
  const [editProfileOpen, setEditProfileOpen] = React.useState(false)
  const [changePasswordOpen, setChangePasswordOpen] = React.useState(false)
  const [coverageOpen, setCoverageOpen] = React.useState(false)
  const [networkOpen, setNetworkOpen] = React.useState(false)
  const [termsOpen, setTermsOpen] = React.useState(false)
  const [privacyOpen, setPrivacyOpen] = React.useState(false)
  const [logoutOpen, setLogoutOpen] = React.useState(false)

  // Form states for profile editing
  const [editName, setEditName] = React.useState(user.fullName)
  const [editPhone, setEditPhone] = React.useState(user.phone)
  const [editEmail, setEditEmail] = React.useState(user.email)
  const [saveSuccess, setSaveSuccess] = React.useState(false)
  const [profileError, setProfileError] = React.useState("")
  const [logoutBusy, setLogoutBusy] = React.useState(false)
  const [logoutError, setLogoutError] = React.useState("")

  React.useEffect(() => {
    if (!isSupabaseConfigured()) return
    fetch("/api/profile", { cache: "no-store" })
      .then(async (response) => {
        const result = await response.json()
        if (!response.ok) throw new Error(result.error || "Não foi possível carregar o perfil.")
        setUser((current) => ({ ...current, id: result.id, fullName: result.fullName, email: result.email, phone: result.phone, cpf: "", dateOfBirth: "", planName: "", planNumber: "", planValidUntil: "" }))
        setEditName(result.fullName)
        setEditPhone(result.phone)
        setEditEmail(result.email)
      })
      .catch((error: unknown) => setProfileError(error instanceof Error ? error.message : "Erro ao carregar perfil."))
  }, [])

  const handleLogout = async () => {
    if (!isSupabaseConfigured()) {
      setLogoutOpen(false)
      return
    }
    setLogoutBusy(true)
    setLogoutError("")
    const { error } = await createSupabaseBrowserClient().auth.signOut()
    if (error) {
      setLogoutError(error.message)
      setLogoutBusy(false)
      return
    }
    router.replace("/login")
    router.refresh()
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setProfileError("")
    if (isSupabaseConfigured()) {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName: editName, phone: editPhone }),
      })
      const result = await response.json()
      if (!response.ok) {
        setProfileError(result.error || "Não foi possível salvar o perfil.")
        return
      }
      setUser((prev) => ({ ...prev, fullName: result.fullName, phone: result.phone, email: result.email }))
    } else {
    setUser((prev) => ({
      ...prev,
      fullName: editName,
      phone: editPhone,
      email: editEmail,
    }))
    }
    setSaveSuccess(true)
    setTimeout(() => {
      setSaveSuccess(false)
      setEditProfileOpen(false)
    }, 900)
  }

  return (
    <AppShell>
      <div className="space-y-6 max-w-2xl mx-auto">
        <PageHeader
          title="Meu Perfil"
          description="Gerencie seus dados pessoais, configurações da conta e benefícios do plano."
        />

        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <Card className="border-slate-200/80 shadow-xs p-6 bg-white">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
              <Avatar className="h-20 w-20 ring-4 ring-blue-50 shadow-sm shrink-0">
                <AvatarImage src={user.avatarUrl} alt={user.fullName} />
                <AvatarFallback className="text-xl font-bold bg-primary text-white">
                  {user.fullName.slice(0, 2)}
                </AvatarFallback>
              </Avatar>

              <div className="space-y-1.5 text-center sm:text-left flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">{user.fullName}</h2>
                    {!isSupabaseConfigured() && <p className="text-xs text-slate-400 mt-0.5">CPF: {user.cpf}</p>}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditProfileOpen(true)}
                    className="h-8 text-xs rounded-lg self-center sm:self-auto border-slate-200"
                  >
                    Editar Perfil
                  </Button>
                </div>

                {!isSupabaseConfigured() && <div className="pt-2 flex items-center justify-center sm:justify-start gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full w-fit">
                  <ShieldCheck className="h-4 w-4" />
                  <span>{user.planName} • Plano Ativo</span>
                </div>}
              </div>
            </div>

            {/* User Meta Information Grid */}
            <div className="mt-6 pt-6 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-sm">
              <div className="flex items-center gap-3 text-slate-600 bg-slate-50/60 p-2.5 rounded-xl border border-slate-100">
                <Mail className="h-4 w-4 text-slate-400 shrink-0" />
                <span className="truncate">{user.email}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-600 bg-slate-50/60 p-2.5 rounded-xl border border-slate-100">
                <Phone className="h-4 w-4 text-slate-400 shrink-0" />
                <span>{user.phone}</span>
              </div>
              {!isSupabaseConfigured() && <div className="flex items-center gap-3 text-slate-600 bg-slate-50/60 p-2.5 rounded-xl border border-slate-100">
                <Calendar className="h-4 w-4 text-slate-400 shrink-0" />
                <span>Nascimento: {formatDate(user.dateOfBirth)}</span>
              </div>}
              {!isSupabaseConfigured() && <div className="flex items-center gap-3 text-slate-600 bg-slate-50/60 p-2.5 rounded-xl border border-slate-100">
                <UserIcon className="h-4 w-4 text-slate-400 shrink-0" />
                <span className="truncate">Nº Cartão: {user.planNumber}</span>
              </div>}
            </div>
          </Card>
        </motion.div>

        {/* Settings Sections */}
        <div className="space-y-6">
          {/* SECTION: CONTA */}
          <div>
            <h3 className="text-xs uppercase font-semibold text-slate-400 tracking-wider mb-2.5 px-1">
              Conta
            </h3>
            <Card className="border-slate-200/80 shadow-xs divide-y divide-slate-100 overflow-hidden bg-white">
              <SettingsItem
                icon={UserIcon}
                iconBgColor="bg-blue-50"
                iconColor="text-blue-600"
                label="Editar Perfil"
                sublabel="Nome, telefone e dados de contato"
                action={() => setEditProfileOpen(true)}
              />
              <SettingsItem
                icon={KeyRound}
                iconBgColor="bg-indigo-50"
                iconColor="text-indigo-600"
                label="Alterar Senha"
                sublabel="Segurança e credenciais de acesso"
                action={() => setChangePasswordOpen(true)}
              />
              <SettingsItem
                icon={Bell}
                iconBgColor="bg-amber-50"
                iconColor="text-amber-600"
                label="Notificações"
                sublabel="Alertas no aplicativo e avisos por e-mail"
                trailing={
                  <Switch
                    checked={notificationsEnabled}
                    onCheckedChange={setNotificationsEnabled}
                    aria-label="Ativar ou desativar notificações"
                  />
                }
              />
            </Card>
          </div>

          {/* SECTION: PLANO DE SAÚDE */}
          {!isSupabaseConfigured() && <div>
            <h3 className="text-xs uppercase font-semibold text-slate-400 tracking-wider mb-2.5 px-1">
              Plano de Saúde
            </h3>
            <Card className="border-slate-200/80 shadow-xs divide-y divide-slate-100 overflow-hidden bg-white">
              <SettingsItem
                icon={CreditCard}
                iconBgColor="bg-emerald-50"
                iconColor="text-emerald-600"
                label="Carteirinha Digital"
                sublabel="Visualizar cartão virtual e QR Code"
                href="/card"
              />
              <SettingsItem
                icon={Building2}
                iconBgColor="bg-teal-50"
                iconColor="text-teal-600"
                label="Rede Credenciada"
                sublabel="Hospitais, clínicas e laboratórios parceiros"
                action={() => setNetworkOpen(true)}
              />
              <SettingsItem
                icon={Shield}
                iconBgColor="bg-sky-50"
                iconColor="text-sky-600"
                label="Cobertura do Plano"
                sublabel="Procedimentos, carências e limites inclusos"
                action={() => setCoverageOpen(true)}
              />
            </Card>
          </div>}

          {/* SECTION: SOBRE */}
          <div>
            <h3 className="text-xs uppercase font-semibold text-slate-400 tracking-wider mb-2.5 px-1">
              Sobre
            </h3>
            <Card className="border-slate-200/80 shadow-xs divide-y divide-slate-100 overflow-hidden bg-white">
              <SettingsItem
                icon={FileText}
                iconBgColor="bg-slate-100"
                iconColor="text-slate-600"
                label="Termos de Uso"
                sublabel="Condições gerais de utilização do portal"
                action={() => setTermsOpen(true)}
              />
              <SettingsItem
                icon={ShieldAlert}
                iconBgColor="bg-slate-100"
                iconColor="text-slate-600"
                label="Política de Privacidade"
                sublabel="Proteção de dados e conformidade LGPD"
                action={() => setPrivacyOpen(true)}
              />
              <SettingsItem
                icon={Smartphone}
                iconBgColor="bg-slate-100"
                iconColor="text-slate-600"
                label="Sobre o App"
                sublabel="HealthCare Portal do Paciente"
                trailing={
                  <Badge variant="outline" className="text-xs font-semibold bg-slate-50 text-slate-600 border-slate-200">
                    v1.2.0
                  </Badge>
                }
              />
            </Card>
          </div>

          {/* Logout Button */}
          <div className="pt-2">
            <Button
              variant="outline"
              onClick={() => setLogoutOpen(true)}
              className="w-full h-12 text-rose-600 border-rose-200 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-300 font-semibold gap-2 rounded-xl transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Sair da Conta
            </Button>
          </div>
        </div>

        {/* DIALOG: EDITAR PERFIL */}
        <Dialog open={editProfileOpen} onOpenChange={setEditProfileOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Editar Perfil</DialogTitle>
              <DialogDescription>
                Atualize seus dados de contato cadastrais.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSaveProfile} className="space-y-4 py-2">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Nome Completo</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">E-mail</label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  disabled={isSupabaseConfigured()}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  required
                />
                {isSupabaseConfigured() && <p className="text-[11px] text-slate-500">E-mail usado para entrar; esta tela não altera credenciais.</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Telefone</label>
                <input
                  type="text"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  required
                />
              </div>

              {profileError && <p role="alert" className="rounded-lg bg-rose-50 p-2.5 text-xs text-rose-700">{profileError}</p>}
              {saveSuccess && (
                <div className="flex items-center gap-2 text-xs font-medium text-emerald-600 bg-emerald-50 p-2.5 rounded-lg border border-emerald-200">
                  <Check className="h-4 w-4" />
                  Dados atualizados com sucesso!
                </div>
              )}

              <DialogFooter className="pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditProfileOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" className="bg-primary text-white">
                  Salvar Alterações
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* DIALOG: ALTERAR SENHA */}
        <Dialog open={changePasswordOpen} onOpenChange={setChangePasswordOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Alterar Senha</DialogTitle>
              <DialogDescription>
                Por segurança, informe sua senha atual antes de cadastrar a nova senha.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3.5 py-2">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Senha Atual</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Nova Senha</label>
                <input
                  type="password"
                  placeholder="Mínimo 8 caracteres"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Confirmar Nova Senha</label>
                <input
                  type="password"
                  placeholder="Repita a nova senha"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setChangePasswordOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                onClick={() => {
                  setChangePasswordOpen(false)
                }}
                className="bg-primary text-white"
              >
                Atualizar Senha
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* DIALOG: COBERTURA DO PLANO */}
        <Dialog open={coverageOpen} onOpenChange={setCoverageOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Cobertura do Plano {user.planName}</DialogTitle>
              <DialogDescription>
                Seu plano conta com cobertura ambulatorial e hospitalar com obstetrícia.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-2 text-xs text-slate-600">
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 flex items-start gap-2.5">
                <ShieldCheck className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-emerald-900">Plano Ativo e Regular</p>
                  <p className="text-emerald-700 mt-0.5">Vigência garantida até {formatDate(user.planValidUntil)} sem carências pendentes.</p>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="font-medium text-slate-800">Consultas Médicas (Eletivas)</span>
                  <span className="text-emerald-600 font-semibold">100% Coberto</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="font-medium text-slate-800">Pronto Atendimento & Emergência 24h</span>
                  <span className="text-emerald-600 font-semibold">100% Coberto</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="font-medium text-slate-800">Exames Laboratoriais e Imagem</span>
                  <span className="text-emerald-600 font-semibold">100% Coberto</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="font-medium text-slate-800">Internação em Apartamento Individual</span>
                  <span className="text-emerald-600 font-semibold">100% Coberto</span>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button onClick={() => setCoverageOpen(false)} className="w-full sm:w-auto">
                Entendido
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* DIALOG: REDE CREDENCIADA */}
        <Dialog open={networkOpen} onOpenChange={setNetworkOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Rede Credenciada</DialogTitle>
              <DialogDescription>
                Acesso a mais de 1.400 profissionais e hospitais de excelência credenciados.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-2 text-xs">
              <p className="text-slate-600">
                Você pode agendar consultas diretamente pelo portal com nossos médicos credenciados ou buscar unidades físicas próximas a você.
              </p>
              <div className="p-3 bg-blue-50 rounded-xl border border-blue-100 text-blue-800 flex items-center justify-between">
                <span>Deseja buscar médicos disponíveis agora?</span>
                <Link href="/doctors" onClick={() => setNetworkOpen(false)}>
                  <Button size="sm" className="h-7 text-xs bg-primary text-white">
                    Ver Médicos
                  </Button>
                </Link>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setNetworkOpen(false)}>
                Fechar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* DIALOG: TERMOS DE USO */}
        <Dialog open={termsOpen} onOpenChange={setTermsOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Termos de Uso</DialogTitle>
              <DialogDescription>
                {isSupabaseConfigured() ? "Portal conectado ao projeto Supabase configurado; médicos e dados do plano são demonstrativos." : "Protótipo demonstrativo com dados fictícios."}
              </DialogDescription>
            </DialogHeader>
            <div className="text-xs text-slate-600 space-y-2 max-h-60 overflow-y-auto pr-1">
              <p>
                Esta interface serve apenas para demonstração. Consultas, exames, receitas e informações de plano exibidos são fictícios e não representam serviços ou registros reais.
              </p>
              <p>
                {isSupabaseConfigured()
                  ? "Autenticação, agendamentos e nome/telefone do perfil são gravados no projeto Supabase configurado. Nenhum e-mail é enviado por estas ações."
                  : "Ações como agendar, alterar dados e sair da conta não são enviadas a um serviço externo neste protótipo."}
              </p>
            </div>
            <DialogFooter>
              <Button onClick={() => setTermsOpen(false)}>Fechar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* DIALOG: PRIVACIDADE */}
        <Dialog open={privacyOpen} onOpenChange={setPrivacyOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Política de Privacidade</DialogTitle>
              <DialogDescription>
                {isSupabaseConfigured() ? "Dados da conta são enviados ao projeto Supabase configurado." : "Os dados desta demonstração são fictícios e locais à interface."}
              </DialogDescription>
            </DialogHeader>
            <div className="text-xs text-slate-600 space-y-2 max-h-60 overflow-y-auto pr-1">
              <p>
                {isSupabaseConfigured()
                  ? "E-mail de acesso, nome e telefone são armazenados na instância Supabase configurada. Não use dados reais de saúde neste protótipo."
                  : "Este protótipo não coleta nem transmite informações pessoais ou de saúde. Não insira dados reais."}
              </p>
              <p>
                {isSupabaseConfigured()
                  ? "Consultas e notificações da conta também ficam nessa instância; revise e configure as políticas do seu projeto antes de uso real."
                  : "Os controles de privacidade apresentados são apenas visuais e não configuram uma conta ou serviço ativo."}
              </p>
            </div>
            <DialogFooter>
              <Button onClick={() => setPrivacyOpen(false)}>Entendido</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* DIALOG: CONFIRMAR LOGOUT */}
        <Dialog open={logoutOpen} onOpenChange={setLogoutOpen}>
          <DialogContent className="sm:max-w-sm">
            <DialogHeader>
              <DialogTitle>{isSupabaseConfigured() ? "Sair da conta" : "Sessão demonstrativa"}</DialogTitle>
              <DialogDescription>
                {isSupabaseConfigured()
                  ? "Deseja encerrar sua sessão? Você precisará entrar novamente para acessar o portal."
                  : "Este protótipo não possui autenticação nem uma sessão real para encerrar."}
              </DialogDescription>
            </DialogHeader>
            {logoutError && <p role="alert" className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{logoutError}</p>}
            <DialogFooter className="pt-2">
              <Button
                variant="outline"
                onClick={() => {
                  setLogoutOpen(false)
                }}
              >
                Cancelar
              </Button>
              <Button variant="destructive" disabled={logoutBusy} onClick={handleLogout}>
                {logoutBusy ? "Saindo…" : isSupabaseConfigured() ? "Sair" : "Entendi"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppShell>
  )
}
