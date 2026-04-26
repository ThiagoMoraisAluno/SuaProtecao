"use client";

import Link from "next/link";
import {
  ShieldCheck,
  Mail,
  Phone,
  MapPin,
  Clock,
  Instagram,
  Facebook,
  Linkedin,
  MessageCircle,
} from "lucide-react";

const QUICK_LINKS = [
  { label: "Início", href: "#inicio" },
  { label: "Sobre", href: "#sobre" },
  { label: "Serviços", href: "#servicos" },
  { label: "Planos", href: "#planos" },
  { label: "Blog", href: "#" },
  { label: "Contato", href: "#contato" },
];

const SERVICES = [
  "Encanamento",
  "Elétrica",
  "Alvenaria",
  "Chaveiro",
  "Pintura",
  "Carpintaria",
  "Diarista",
];

const SOCIAL = [
  { icon: Instagram, label: "Instagram", href: "#" },
  { icon: Facebook, label: "Facebook", href: "#" },
  { icon: MessageCircle, label: "WhatsApp", href: "#" },
  { icon: Linkedin, label: "LinkedIn", href: "#" },
];

export function Footer() {
  return (
    <footer
      id="contato"
      className="relative overflow-hidden bg-navy-950 text-slate-300"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.7) 1px, transparent 0)",
          backgroundSize: "32px 32px",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 -left-24 h-72 w-72 rounded-full bg-brand-500/15 blur-3xl"
      />

      <div className="relative mx-auto max-w-7xl px-4 pb-10 pt-20 md:px-8">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-4">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 shadow-lg">
                <ShieldCheck className="h-5 w-5 text-white" strokeWidth={2.4} />
              </span>
              <span className="flex flex-col leading-tight">
                <span className="font-display text-base font-bold text-white">
                  Sua Proteção
                </span>
                <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-300">
                  Reparo Certo
                </span>
              </span>
            </Link>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-slate-400">
              Proteção residencial completa em uma única assinatura. Serviços
              domésticos, cobertura financeira e tranquilidade para o seu lar.
            </p>

            <div className="mt-6 flex items-center gap-2">
              {SOCIAL.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-slate-300 transition-colors hover:bg-brand-500 hover:text-white"
                >
                  <social.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2">
            <p className="text-sm font-bold uppercase tracking-[0.14em] text-white">
              Links Rápidos
            </p>
            <ul className="mt-5 space-y-3 text-sm">
              {QUICK_LINKS.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-slate-300 transition-colors hover:text-white"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-3">
            <p className="text-sm font-bold uppercase tracking-[0.14em] text-white">
              Nossos Serviços
            </p>
            <ul className="mt-5 space-y-3 text-sm">
              {SERVICES.map((service) => (
                <li
                  key={service}
                  className="text-slate-300 transition-colors hover:text-white"
                >
                  {service}
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-3">
            <p className="text-sm font-bold uppercase tracking-[0.14em] text-white">
              Contato
            </p>
            <ul className="mt-5 space-y-3.5 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-300" />
                <span>Goianinha, RN — Brasil</span>
              </li>
              <li>
                <a
                  href="tel:+5511999999999"
                  className="flex items-start gap-3 transition-colors hover:text-white"
                >
                  <Phone className="mt-0.5 h-4 w-4 shrink-0 text-brand-300" />
                  <span>(11) 99999-9999</span>
                </a>
              </li>
              <li>
                <a
                  href="mailto:contato@suaprotecao.com.br"
                  className="flex items-start gap-3 break-all transition-colors hover:text-white"
                >
                  <Mail className="mt-0.5 h-4 w-4 shrink-0 text-brand-300" />
                  <span>contato@suaprotecao.com.br</span>
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-brand-300" />
                <span>Seg-Sex: 8h às 18h | Sáb: 8h às 13h</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-start justify-between gap-4 border-t border-white/10 pt-8 sm:flex-row sm:items-center">
          <p className="text-xs text-slate-400">
            © {new Date().getFullYear()} Sua Proteção. Todos os direitos
            reservados.
          </p>
          <div className="flex items-center gap-6 text-xs">
            <a
              href="#"
              className="text-slate-400 transition-colors hover:text-white"
            >
              Termos de Uso
            </a>
            <a
              href="#"
              className="text-slate-400 transition-colors hover:text-white"
            >
              Política de Privacidade
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
