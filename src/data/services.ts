import { Service } from "@/types"

export const mockServices: Service[] = [
  {
    id: "svc_001",
    name: "Consultas",
    icon: "Stethoscope",
    count: 15,
    description: "médicos disponíveis",
    href: "/doctors",
  },
  {
    id: "svc_002",
    name: "Exames",
    icon: "TestTube",
    count: 7,
    description: "resultados disponíveis",
    href: "/exams",
  },
  {
    id: "svc_003",
    name: "Receitas",
    icon: "Pill",
    count: 5,
    description: "prescrições ativas",
    href: "/prescriptions",
  },
  {
    id: "svc_004",
    name: "Carteirinha",
    icon: "CreditCard",
    count: 1,
    description: "carteirinha digital",
    href: "/card",
  },
]
