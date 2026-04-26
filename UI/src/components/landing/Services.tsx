"use client";

import Image from "next/image";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

type Service = {
  number: string;
  title: string;
  description: string;
  image: string;
};

const SERVICES: Service[] = [
  {
    number: "01",
    title: "Encanamento e Hidráulica",
    description: "Vazamentos, entupimentos, instalações e reparos em redes hidráulicas.",
    image: "/images/landing/img32.jpg",
  },
  {
    number: "02",
    title: "Instalações Elétricas",
    description: "Tomadas, disjuntores, fiação e instalação de luminárias com segurança.",
    image: "/images/landing/img10.jpg",
  },
  {
    number: "03",
    title: "Alvenaria e Reformas",
    description: "Pequenas reformas, reparos estruturais e adequações no seu imóvel.",
    image: "/images/landing/img41.jpg",
  },
  {
    number: "04",
    title: "Chaveiro e Segurança",
    description: "Troca de fechaduras, cópias de chaves e instalação de travas extras.",
    image: "/images/landing/img43.jpg",
  },
  {
    number: "05",
    title: "Pintura Residencial",
    description: "Retoques e pintura completa com acabamento profissional.",
    image: "/images/landing/img8.jpg",
  },
  {
    number: "06",
    title: "Carpintaria",
    description: "Móveis sob medida, reparos em madeira e instalação de portas.",
    image: "/images/landing/img11.jpg",
  },
  {
    number: "07",
    title: "Limpeza Doméstica",
    description: "Diaristas verificadas para limpeza pesada ou rotineira.",
    image: "/images/landing/img19.jpg",
  },
];

export function Services() {
  const [active, setActive] = useState(0);
  const current = SERVICES[active];

  return (
    <section id="servicos" className="bg-white py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mx-auto flex max-w-2xl flex-col items-center text-center"
        >
          <span className="mb-3 inline-flex items-center gap-2 rounded-full border border-navy-100 bg-navy-50 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-navy-700">
            Nossos serviços
          </span>
          <h2 className="font-display text-3xl font-bold tracking-tight text-slate-900 md:text-5xl">
            Serviços <span className="italic text-navy-700">Confiáveis</span>{" "}
            Para o Seu Lar
          </h2>
          <p className="mt-4 text-base text-slate-600 md:text-lg">
            Profissionais especializados, prontos para resolver qualquer
            problema da sua casa.
          </p>
        </motion.div>

        <div className="mt-16 grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <motion.ul
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.08 } },
            }}
            className="divide-y divide-slate-200"
          >
            {SERVICES.map((service, index) => {
              const isActive = active === index;
              return (
                <motion.li
                  key={service.number}
                  variants={{
                    hidden: { opacity: 0, x: -40 },
                    visible: {
                      opacity: 1,
                      x: 0,
                      transition: { duration: 0.5, ease: "easeOut" as const },
                    },
                  }}
                  onMouseEnter={() => setActive(index)}
                  onFocus={() => setActive(index)}
                >
                  <button
                    type="button"
                    onClick={() => setActive(index)}
                    className={`group relative flex w-full items-center gap-6 py-6 text-left transition-colors duration-300 ${
                      isActive ? "text-navy-700" : "text-slate-900"
                    }`}
                  >
                    <span
                      className={`font-display text-2xl font-bold tabular-nums transition-colors duration-300 md:text-3xl ${
                        isActive ? "text-navy-600" : "text-slate-300"
                      }`}
                    >
                      {service.number}
                    </span>
                    <div className="flex-1">
                      <h3
                        className={`font-display text-lg font-bold leading-tight transition-colors duration-300 md:text-2xl ${
                          isActive ? "text-navy-700" : "text-slate-900"
                        }`}
                      >
                        {service.title}
                      </h3>
                      <p className="mt-1 text-sm leading-relaxed text-slate-600">
                        {service.description}
                      </p>
                    </div>
                    <span
                      className={`flex h-10 w-10 flex-none items-center justify-center rounded-full border transition-all duration-300 ${
                        isActive
                          ? "border-navy-600 bg-navy-600 text-white"
                          : "border-slate-200 text-slate-400 group-hover:border-navy-300 group-hover:text-navy-600"
                      }`}
                    >
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  </button>
                </motion.li>
              );
            })}
          </motion.ul>

          <div className="relative aspect-[4/5] overflow-hidden rounded-[2.5rem] bg-slate-100 shadow-2xl shadow-navy-900/10 lg:sticky lg:top-32">
            <AnimatePresence mode="wait">
              <motion.div
                key={current.image}
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="absolute inset-0"
              >
                <Image
                  src={current.image}
                  alt={current.title}
                  fill
                  sizes="(max-width: 1024px) 90vw, 600px"
                  className="object-cover"
                />
                <div
                  aria-hidden
                  className="absolute inset-0 bg-gradient-to-t from-navy-950/50 via-transparent to-transparent"
                />
                <div className="absolute inset-x-6 bottom-6 text-white">
                  <span className="font-display text-3xl font-bold">
                    {current.number}
                  </span>
                  <h3 className="mt-1 font-display text-xl font-bold leading-tight md:text-2xl">
                    {current.title}
                  </h3>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
