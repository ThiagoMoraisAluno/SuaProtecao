"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Check, Sparkles, ArrowUpRight } from "lucide-react";

type Plan = {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  cta: string;
  highlighted?: boolean;
};

const PLANS: Plan[] = [
  {
    name: "Básico",
    price: "R$ 49,99",
    period: "/mês",
    description: "Para quem precisa do essencial em manutenção e cobertura.",
    features: [
      "1 serviço por mês",
      "Cobertura até R$20.000",
      "Suporte por app",
      "Profissionais verificados",
      "Sem fidelidade",
    ],
    cta: "Assinar plano Básico",
  },
  {
    name: "Intermediário",
    price: "R$ 99,90",
    period: "/mês",
    description: "O plano mais escolhido pelas famílias brasileiras.",
    features: [
      "2 serviços por mês",
      "Cobertura até R$40.000",
      "Suporte prioritário",
      "Relatório mensal",
      "Atendimento em até 4h",
      "Sem fidelidade",
    ],
    cta: "Assinar agora",
    highlighted: true,
  },
  {
    name: "Premium",
    price: "R$ 169,90",
    period: "/mês",
    description: "Para uma proteção completa com atendimento prioritário.",
    features: [
      "Serviços ilimitados",
      "Cobertura até R$80.000",
      "Suporte VIP 24/7",
      "Relatório + consultoria",
      "Atendimento emergencial",
      "Gestor dedicado",
    ],
    cta: "Assinar plano Premium",
  },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.18 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: "easeOut" as const },
  },
};

export function Pricing() {
  return (
    <section id="planos" className="bg-slate-50 py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mx-auto flex max-w-2xl flex-col items-center text-center"
        >
          <span className="mb-3 inline-flex items-center gap-2 rounded-full border border-navy-100 bg-white px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-navy-700">
            Planos & assinaturas
          </span>
          <h2 className="font-display text-3xl font-bold tracking-tight text-slate-900 md:text-5xl">
            Opções <span className="italic text-navy-700">Transparentes</span>{" "}
            Para Cada Família
          </h2>
          <p className="mt-4 text-base text-slate-600 md:text-lg">
            Escolha o plano certo. Sem letras miúdas, sem fidelidade.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="mt-14 grid gap-6 lg:grid-cols-3 lg:items-stretch"
        >
          {PLANS.map((plan) => {
            const isHighlighted = plan.highlighted;
            return (
              <motion.article
                key={plan.name}
                variants={itemVariants}
                className={`relative flex flex-col rounded-3xl p-8 transition-transform duration-500 ${
                  isHighlighted
                    ? "bg-navy-950 text-white shadow-2xl shadow-navy-950/40 lg:-mt-6 lg:scale-[1.04]"
                    : "border border-slate-200 bg-white text-slate-900 shadow-[0_4px_22px_-12px_rgba(15,20,96,0.12)]"
                }`}
              >
                {isHighlighted && (
                  <span className="absolute -top-3 left-1/2 inline-flex -translate-x-1/2 items-center gap-1 rounded-full bg-brand-500 px-4 py-1 text-[11px] font-bold uppercase tracking-wider text-white shadow-lg shadow-brand-500/40">
                    <Sparkles className="h-3.5 w-3.5" />
                    Mais Popular
                  </span>
                )}

                <h3
                  className={`font-display text-2xl font-bold ${
                    isHighlighted ? "text-white" : "text-slate-900"
                  }`}
                >
                  {plan.name}
                </h3>
                <p
                  className={`mt-2 text-sm leading-relaxed ${
                    isHighlighted ? "text-white/70" : "text-slate-500"
                  }`}
                >
                  {plan.description}
                </p>

                <div className="mt-6 flex items-baseline gap-1.5">
                  <span
                    className={`font-display text-4xl font-bold tracking-tight md:text-5xl ${
                      isHighlighted ? "text-white" : "text-slate-900"
                    }`}
                  >
                    {plan.price}
                  </span>
                  <span
                    className={`text-sm font-medium ${
                      isHighlighted ? "text-white/60" : "text-slate-500"
                    }`}
                  >
                    {plan.period}
                  </span>
                </div>

                <ul
                  className={`mt-8 flex flex-col gap-3 border-y py-6 ${
                    isHighlighted ? "border-white/10" : "border-slate-100"
                  }`}
                >
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className={`flex items-start gap-3 text-sm ${
                        isHighlighted ? "text-white/85" : "text-slate-700"
                      }`}
                    >
                      <span
                        className={`mt-0.5 inline-flex h-5 w-5 flex-none items-center justify-center rounded-full ${
                          isHighlighted
                            ? "bg-brand-500/20 text-brand-300"
                            : "bg-navy-50 text-navy-700"
                        }`}
                      >
                        <Check className="h-3.5 w-3.5" strokeWidth={3} />
                      </span>
                      {feature}
                    </li>
                  ))}
                </ul>

                <Link
                  href="/login"
                  className={`group relative mt-8 inline-flex items-center justify-center gap-2 overflow-hidden rounded-xl px-6 py-3.5 text-sm font-semibold transition-all duration-300 ${
                    isHighlighted
                      ? "bg-brand-500 text-white shadow-lg shadow-brand-500/40 hover:bg-brand-400 hover:shadow-xl hover:scale-[1.03]"
                      : "bg-navy-600 text-white shadow-lg shadow-navy-600/30 hover:bg-navy-700 hover:shadow-xl hover:scale-[1.03]"
                  }`}
                >
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-0 -translate-x-full skew-x-12 bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-500 ease-out group-hover:translate-x-full"
                  />
                  <span className="relative">{plan.cta}</span>
                  <ArrowUpRight className="relative h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </Link>
              </motion.article>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
