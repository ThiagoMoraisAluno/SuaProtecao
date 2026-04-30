"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Check, Sparkles, ArrowUpRight, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { plansService } from "@/services/plans.service";
import { formatCurrency } from "@/lib/utils";
import type { Plan } from "@/types";

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

interface DisplayPlan {
  plan: Plan;
  isHighlighted: boolean;
  isAnnual: boolean;
  monthlyEquivalent: number;
  finalAnnual: number;
  grossAnnual: number;
  savings: number;
}

function buildDisplayPlan(plan: Plan): DisplayPlan {
  const isAnnual = plan.billingCycle === "annual";
  const annualDiscount = plan.annualDiscount ?? 0;
  const grossAnnual = plan.price * 12;
  const finalAnnual = isAnnual
    ? Number((grossAnnual * (1 - annualDiscount / 100)).toFixed(2))
    : grossAnnual;
  const monthlyEquivalent = isAnnual ? finalAnnual / 12 : plan.price;
  return {
    plan,
    isHighlighted: !!plan.popular,
    isAnnual,
    monthlyEquivalent,
    finalAnnual,
    grossAnnual,
    savings: isAnnual ? grossAnnual - finalAnnual : 0,
  };
}

export function Pricing() {
  const { data: plans = [], isLoading } = useQuery({
    queryKey: ["public-plans"],
    queryFn: () => plansService.findAll(),
  });

  const display = plans.map(buildDisplayPlan);

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

        {isLoading ? (
          <div className="mt-14 flex justify-center">
            <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="mt-14 grid gap-6 lg:grid-cols-3 lg:items-stretch"
          >
            {display.map((d) => {
              const { plan, isHighlighted, isAnnual } = d;
              return (
                <motion.article
                  key={plan.id}
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

                  {isAnnual && (
                    <span
                      className={`absolute -top-3 right-6 inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider shadow-lg ${
                        isHighlighted
                          ? "bg-emerald-400 text-emerald-950 shadow-emerald-400/40"
                          : "bg-emerald-500 text-white shadow-emerald-500/40"
                      }`}
                    >
                      Anual · -{(plan.annualDiscount ?? 0).toFixed(0)}%
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
                    {plan.servicesPerMonth === -1
                      ? "Serviços ilimitados, cobertura completa."
                      : `${plan.servicesPerMonth} serviço${plan.servicesPerMonth === 1 ? "" : "s"} por mês com cobertura inclusa.`}
                  </p>

                  {isAnnual ? (
                    <div className="mt-6">
                      <p
                        className={`text-sm line-through ${
                          isHighlighted ? "text-white/40" : "text-slate-400"
                        }`}
                      >
                        {formatCurrency(d.grossAnnual)} no total
                      </p>
                      <div className="flex items-baseline gap-1.5">
                        <span
                          className={`font-display text-4xl font-bold tracking-tight md:text-5xl ${
                            isHighlighted ? "text-white" : "text-slate-900"
                          }`}
                        >
                          {formatCurrency(d.monthlyEquivalent)}
                        </span>
                        <span
                          className={`text-sm font-medium ${
                            isHighlighted ? "text-white/60" : "text-slate-500"
                          }`}
                        >
                          /mês
                        </span>
                      </div>
                      <p
                        className={`mt-1 text-xs font-medium ${
                          isHighlighted ? "text-emerald-300" : "text-emerald-700"
                        }`}
                      >
                        Cobrado anualmente — economize{" "}
                        {formatCurrency(d.savings)}/ano
                      </p>
                    </div>
                  ) : (
                    <div className="mt-6 flex items-baseline gap-1.5">
                      <span
                        className={`font-display text-4xl font-bold tracking-tight md:text-5xl ${
                          isHighlighted ? "text-white" : "text-slate-900"
                        }`}
                      >
                        {formatCurrency(plan.price)}
                      </span>
                      <span
                        className={`text-sm font-medium ${
                          isHighlighted ? "text-white/60" : "text-slate-500"
                        }`}
                      >
                        /mês
                      </span>
                    </div>
                  )}

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
                    <span className="relative">Assinar plano {plan.name}</span>
                    <ArrowUpRight className="relative h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </Link>
                </motion.article>
              );
            })}
          </motion.div>
        )}
      </div>
    </section>
  );
}
