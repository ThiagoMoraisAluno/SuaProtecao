"use client";

import { motion } from "framer-motion";
import { ClipboardList, Smartphone, CheckCircle2 } from "lucide-react";
import { CountUp } from "./motion";

const STEPS = [
  {
    number: "01",
    title: "Escolha seu Plano",
    description:
      "Selecione o plano ideal para o seu imóvel e faça sua assinatura em minutos pelo app ou site.",
    icon: ClipboardList,
  },
  {
    number: "02",
    title: "Solicite pelo App",
    description:
      "Abra um chamado de serviço ou registre um sinistro diretamente pelo aplicativo com foto e descrição.",
    icon: Smartphone,
  },
  {
    number: "03",
    title: "Problema Resolvido",
    description:
      "Nossa equipe cuida de tudo. Você acompanha em tempo real e avalia o atendimento ao final.",
    icon: CheckCircle2,
  },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.4 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: "easeOut" as const },
  },
};

export function HowItWorks() {
  return (
    <section
      id="como-funciona"
      className="relative bg-slate-50 py-20 md:py-28"
    >
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="grid items-end gap-8 lg:grid-cols-2 lg:gap-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="flex flex-col gap-4"
          >
            <span className="inline-flex w-max items-center gap-2 rounded-full border border-navy-100 bg-white px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-navy-700">
              Como funciona
            </span>
            <h2 className="font-display text-3xl font-bold tracking-tight text-slate-900 md:text-5xl">
              Apenas <span className="italic text-navy-700">3 Passos</span>{" "}
              <br className="hidden md:block" />
              Para Resolver Seu Problema
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="rounded-3xl border border-slate-200 bg-white p-7 shadow-[0_8px_24px_-12px_rgba(15,20,96,0.1)] lg:justify-self-end"
          >
            <div className="flex items-baseline gap-1">
              <p className="font-display text-5xl font-bold text-navy-700 md:text-6xl">
                <CountUp end={95} />
              </p>
              <p className="font-display text-3xl font-bold text-brand-500 md:text-4xl">
                %
              </p>
            </div>
            <p className="mt-2 text-sm font-medium text-slate-600">
              de satisfação dos clientes
            </p>
          </motion.div>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="relative mt-16 grid gap-8 md:grid-cols-3 md:gap-6"
        >
          <div
            aria-hidden
            className="absolute inset-x-0 top-9 hidden h-px bg-gradient-to-r from-transparent via-navy-200 to-transparent md:block"
          />

          {STEPS.map((step) => (
            <motion.div
              key={step.number}
              variants={itemVariants}
              className="relative flex flex-col items-start gap-4 rounded-2xl bg-white p-6 shadow-[0_4px_18px_-10px_rgba(15,20,96,0.12)] md:bg-transparent md:p-0 md:shadow-none"
            >
              <div className="flex items-center gap-4">
                <span className="flex h-[72px] w-[72px] items-center justify-center rounded-2xl bg-navy-600 font-display text-2xl font-bold text-white shadow-lg shadow-navy-600/30">
                  {step.number}
                </span>
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                  <step.icon className="h-6 w-6" />
                </span>
              </div>
              <h3 className="font-display text-xl font-bold text-slate-900 md:text-2xl">
                {step.title}
              </h3>
              <p className="text-sm leading-relaxed text-slate-600">
                {step.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
