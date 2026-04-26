"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ShieldCheck, Menu, X, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "#inicio", label: "Início" },
  { href: "#sobre", label: "Sobre" },
  { href: "#servicos", label: "Serviços" },
  { href: "#planos", label: "Planos" },
  { href: "#faq", label: "FAQ" },
  { href: "#contato", label: "Contato" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 bg-white transition-all duration-300",
        scrolled
          ? "shadow-[0_8px_30px_-12px_rgba(15,20,96,0.18)] border-b border-slate-100"
          : "shadow-[0_2px_12px_-6px_rgba(15,20,96,0.08)] border-b border-transparent"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex h-[72px] items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2.5 group"
            aria-label="Sua Proteção - página inicial"
          >
            <span className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-navy-700 to-brand-500 text-white shadow-lg shadow-navy-700/20 transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-105">
              <ShieldCheck className="h-5 w-5" strokeWidth={2.4} />
            </span>
            <span className="flex flex-col leading-tight">
              <span className="font-display text-[15px] font-bold tracking-tight text-slate-900">
                Sua Proteção
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-navy-700">
                Reparo Certo
              </span>
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="relative text-sm font-medium text-slate-700 hover:text-navy-700 transition-colors group py-1"
              >
                {link.label}
                <span
                  aria-hidden
                  className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 h-[2px] w-0 rounded-full bg-navy-600 group-hover:w-full transition-all duration-300 ease-out"
                />
              </a>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <Link href="/login">
              <button className="relative overflow-hidden text-blue-600 border border-blue-200 hover:border-blue-400 hover:bg-blue-50 text-sm font-medium px-5 py-2 rounded-lg transition-all duration-300 group">
                <span className="relative z-10">Entrar</span>
                <span
                  aria-hidden
                  className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-blue-100/50 to-transparent skew-x-12"
                />
              </button>
            </Link>

            <Link href="/login">
              <button className="relative overflow-hidden inline-flex items-center gap-1.5 rounded-lg bg-navy-600 hover:bg-navy-700 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-navy-600/30 hover:shadow-xl hover:shadow-navy-700/40 hover:scale-[1.03] transition-all duration-300 ease-out active:scale-[0.98] group">
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 -translate-x-full skew-x-12 bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-500 ease-out group-hover:translate-x-full"
                />
                <span className="relative">Assinar agora</span>
              </button>
            </Link>
          </div>

          <button
            type="button"
            aria-label={open ? "Fechar menu" : "Abrir menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="lg:hidden inline-flex h-10 w-10 items-center justify-center rounded-xl text-slate-700 hover:bg-slate-100 transition-colors"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        <div
          className={cn(
            "lg:hidden grid overflow-hidden transition-[grid-template-rows] duration-300",
            open ? "grid-rows-[1fr] pb-4" : "grid-rows-[0fr]"
          )}
        >
          <div className="min-h-0 overflow-hidden">
            <div className="flex flex-col gap-1 rounded-2xl border border-slate-100 bg-white p-2 shadow-xl">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="group flex items-center justify-between rounded-xl px-3 py-3 text-sm font-medium text-slate-700 hover:text-navy-700 hover:bg-brand-50 hover:translate-x-1 transition-all duration-200 ease-out"
                >
                  <span>{link.label}</span>
                  <ChevronRight
                    aria-hidden
                    className="h-4 w-4 text-navy-600 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 ease-out"
                  />
                </a>
              ))}
              <div className="mt-1 flex flex-col gap-2 border-t border-slate-100 pt-2">
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="rounded-xl border border-blue-200 bg-white px-3 py-3 text-center text-sm font-semibold text-blue-600 hover:border-blue-400 hover:bg-blue-50 transition-colors"
                >
                  Entrar
                </Link>
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="rounded-xl bg-navy-600 px-3 py-3 text-center text-sm font-semibold text-white shadow-lg shadow-navy-600/30 transition-colors hover:bg-navy-700"
                >
                  Assinar agora
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
