"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  Users,
  Star,
  Wrench,
  Award,
} from "lucide-react";
import { CountUp } from "./motion";

const STATS = [
  {
    value: 3000,
    suffix: "+",
    label: "Famílias Atendidas",
    icon: Users,
    decimals: 0,
  },
  {
    value: 4.9,
    suffix: "/5.0",
    label: "Avaliação Média",
    icon: Star,
    decimals: 1,
  },
  {
    value: 150,
    suffix: "+",
    label: "Prestadores Parceiros",
    icon: Wrench,
    decimals: 0,
  },
  {
    value: 7,
    suffix: "+",
    label: "Anos de Experiência",
    icon: Award,
    decimals: 0,
  },
];

export function About() {
  return (
    <section id="sobre" className="bg-slate-50 py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="grid items-center gap-14 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative"
          >
            <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] shadow-2xl shadow-navy-900/15">
              <Image
                src="/images/landing/img32.jpg"
                alt="Encanador profissional trabalhando"
                fill
                sizes="(max-width: 1024px) 90vw, 520px"
                className="object-cover"
              />
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.7, ease: "easeOut", delay: 0.4 }}
              className="absolute -right-4 bottom-12 hidden w-52 overflow-hidden rounded-2xl border-4 border-white shadow-2xl shadow-navy-900/20 sm:block md:-right-8 lg:right-0"
            >
              <div className="aspect-square relative">
                <Image
                  src="/images/landing/img35.jpg"
                  alt="Técnico em banheiro"
                  fill
                  sizes="220px"
                  className="object-cover"
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.7, ease: "easeOut", delay: 0.6 }}
              className="absolute -left-4 top-10 flex items-center gap-3 rounded-2xl bg-navy-700 px-4 py-3 text-white shadow-xl shadow-navy-700/40 md:-left-8"
            >
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-white/15">
                <Users className="h-5 w-5" />
              </span>
              <div>
                <p className="text-lg font-bold leading-none">3.000+</p>
                <p className="text-[11px] uppercase tracking-wider text-white/70">
                  Famílias Protegidas
                </p>
              </div>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex flex-col gap-6"
          >
            <span className="inline-flex w-max items-center gap-2 rounded-full border border-navy-100 bg-navy-50 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-navy-700">
              Sobre nós
            </span>
            <h2 className="font-display text-3xl font-bold tracking-tight text-slate-900 md:text-5xl">
              Proteção Residencial{" "}
              <span className="italic text-navy-700">Completa</span> Para Sua
              Família
            </h2>
            <p className="text-base leading-relaxed text-slate-600 md:text-lg">
              Reunimos os melhores profissionais e a tecnologia mais moderna
              para oferecer serviços domésticos ágeis e cobertura financeira
              real. Tudo em uma assinatura simples e sem burocracia.
            </p>

            <div className="grid grid-cols-2 gap-4 border-y border-slate-200 py-6 md:grid-cols-4">
              {STATS.map((stat) => (
                <div key={stat.label} className="flex flex-col gap-1">
                  <stat.icon className="h-5 w-5 text-navy-600" />
                  <p className="font-display text-2xl font-bold text-slate-900 md:text-3xl">
                    <CountUp
                      end={stat.value}
                      decimals={stat.decimals}
                      suffix={stat.suffix}
                    />
                  </p>
                  <p className="text-xs font-medium text-slate-500">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>

            <Link
              href="#planos"
              className="group relative inline-flex w-max items-center gap-2 overflow-hidden rounded-xl bg-navy-600 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-navy-600/30 transition-all duration-300 hover:bg-navy-700 hover:shadow-xl hover:shadow-navy-700/40 hover:scale-[1.03] active:scale-[0.98]"
            >
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 -translate-x-full skew-x-12 bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-500 ease-out group-hover:translate-x-full"
              />
              <span className="relative">Conhecer os planos</span>
              <ArrowUpRight className="relative h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
