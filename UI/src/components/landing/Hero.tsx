"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, Check, Star, Award, ShieldCheck } from "lucide-react";

const ADVANTAGES = [
  "Disponível 24/7",
  "Profissionais Certificados",
  "Preços Transparentes",
  "Atendimento Personalizado",
];

export function Hero() {
  return (
    <section
      id="inicio"
      className="relative overflow-hidden bg-navy-950 text-white pt-28 pb-0 md:pt-36"
    >
      {/* Dot grid */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.18]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)",
          backgroundSize: "32px 32px",
        }}
      />

      {/* Ambient orbs */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-32 top-1/3 h-96 w-96 rounded-full bg-navy-600/30 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-32 -top-20 h-[28rem] w-[28rem] rounded-full bg-brand-500/20 blur-3xl"
      />

      <div className="relative mx-auto max-w-7xl px-4 md:px-8">
        <div className="grid items-end gap-12 lg:grid-cols-2">

          {/* ── Left: text content ── */}
          <div className="flex flex-col gap-6 pb-16 md:pb-24">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="inline-flex w-max items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.18em] text-brand-300 backdrop-blur"
            >
              <ShieldCheck className="h-4 w-4" />
              Proteção Residencial Inteligente
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, ease: "easeOut", delay: 0.15 }}
              className="font-display text-4xl font-bold leading-[1.05] tracking-tight md:text-6xl"
            >
              Sua casa{" "}
              <span className="italic text-brand-400">protegida.</span>
              <br />
              Seu reparo resolvido.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, ease: "easeOut", delay: 0.3 }}
              className="max-w-xl text-base leading-relaxed text-white/75 md:text-lg"
            >
              Uma assinatura mensal que cuida do seu imóvel com serviços
              domésticos e cobertura financeira para imprevistos.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, ease: "easeOut", delay: 0.45 }}
              className="flex flex-col gap-3 sm:flex-row"
            >
              <Link
                href="/login"
                className="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-xl bg-navy-600 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-navy-600/40 transition-all duration-300 hover:bg-navy-700 hover:scale-[1.03] hover:shadow-xl hover:shadow-navy-700/50 active:scale-[0.98]"
              >
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 -translate-x-full skew-x-12 bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-500 ease-out group-hover:translate-x-full"
                />
                <span className="relative">Escolher meu plano</span>
                <ArrowUpRight className="relative h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="#como-funciona"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/5 px-7 py-3.5 text-sm font-semibold text-white backdrop-blur transition-all duration-300 hover:border-white/40 hover:bg-white/10"
              >
                Ver como funciona
              </Link>
            </motion.div>

            <motion.ul
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: "easeOut", delay: 0.6 }}
              className="mt-2 grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-4 sm:gap-x-2"
            >
              {ADVANTAGES.map((label) => (
                <li key={label} className="flex items-start gap-2 text-sm text-white/85">
                  <span className="mt-0.5 inline-flex h-5 w-5 flex-none items-center justify-center rounded-full bg-brand-500/20 text-brand-300">
                    <Check className="h-3.5 w-3.5" strokeWidth={3} />
                  </span>
                  <span>{label}</span>
                </li>
              ))}
            </motion.ul>
          </div>

          {/* ── Right: professional image (no card, no hexagon) ── */}
          <motion.div
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
            className="relative mx-auto flex w-full max-w-[500px] justify-center lg:ml-auto"
          >
            {/* Large diffuse glow behind the figure */}
            <div
              aria-hidden
              className="absolute left-1/2 top-[10%] h-[75%] w-[75%] -translate-x-1/2 rounded-full bg-blue-600/35 blur-[90px]"
            />
            {/* Tighter inner glow for depth */}
            <div
              aria-hidden
              className="absolute left-1/2 top-[22%] h-[50%] w-[50%] -translate-x-1/2 rounded-full bg-brand-500/30 blur-[55px]"
            />
            {/* Ground shadow ellipse */}
            <div
              aria-hidden
              className="absolute bottom-0 left-1/2 h-10 w-[55%] -translate-x-1/2 rounded-full bg-blue-500/30 blur-2xl"
            />

            {/* Professional image — fills to section bottom edge */}
            <div className="relative h-[420px] w-full md:h-[520px] lg:h-[580px]">
              <Image
                src="/images/landing/team15.png"
                alt="Profissional Sua Proteção pronto para atender"
                fill
                priority
                sizes="(max-width: 1024px) 80vw, 500px"
                className="object-contain object-bottom"
              />
            </div>

            {/* Badge: years of experience — lateral esquerda, fora do rosto */}
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, ease: "easeOut", delay: 0.9 }}
              className="absolute bottom-32 right-0 z-10 flex items-center gap-3 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 shadow-2xl shadow-navy-950/50 backdrop-blur-md md:bottom-40"
            >
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-brand-500 text-white">
                <Award className="h-5 w-5" />
              </span>
              <div>
                <p className="text-lg font-bold leading-none">7+</p>
                <p className="text-[11px] uppercase tracking-wider text-white/70">
                  Anos de experiência
                </p>
              </div>
            </motion.div>

            {/* Badge: rating — borda direita do container */}
            <motion.div
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, ease: "easeOut", delay: 1.05 }}
              className="absolute right-0 bottom-10 flex items-center gap-3 rounded-2xl border border-white/10 bg-white px-4 py-3 text-navy-950 shadow-2xl shadow-navy-950/50"
            >
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-amber-100 text-amber-500">
                <Star className="h-5 w-5 fill-current" />
              </span>
              <div>
                <p className="text-lg font-bold leading-none">4.9/5.0</p>
                <p className="text-[11px] uppercase tracking-wider text-slate-500">
                  Avaliação
                </p>
              </div>
            </motion.div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
