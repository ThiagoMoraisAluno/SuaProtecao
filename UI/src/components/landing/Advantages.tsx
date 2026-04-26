"use client";

import Image from "next/image";
import { motion } from "framer-motion";

const ADVANTAGES = [
  {
    icon: "/images/landing/icon-1.png",
    title: "Disponível 24/7",
    description: "Solicite um serviço a qualquer hora do dia ou da noite.",
  },
  {
    icon: "/images/landing/hard-hat.png",
    title: "Profissionais Verificados",
    description:
      "Todos os prestadores passam por verificação e avaliação contínua.",
  },
  {
    icon: "/images/landing/icon-2.png",
    title: "Preço Fixo Mensal",
    description: "Uma mensalidade simples. Sem surpresas na conta.",
  },
  {
    icon: "/images/landing/home-renovation.png",
    title: "Atendimento Personalizado",
    description: "Cada chamado tratado com atenção e cuidado especial.",
  },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.18 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" as const },
  },
};

export function Advantages() {
  return (
    <section className="bg-white py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mx-auto flex max-w-2xl flex-col items-center text-center"
        >
          <span className="mb-3 inline-flex items-center gap-2 rounded-full border border-navy-100 bg-navy-50 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-navy-700">
            Nossos diferenciais
          </span>
          <h2 className="font-display text-3xl font-bold tracking-tight text-slate-900 md:text-5xl">
            Nossas <span className="italic text-navy-700">Principais</span>{" "}
            Vantagens
          </h2>
          <p className="mt-4 text-base text-slate-600 md:text-lg">
            Tudo o que você precisa para proteger seu lar com tranquilidade,
            agilidade e transparência.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
        >
          {ADVANTAGES.map((adv) => (
            <motion.article
              key={adv.title}
              variants={itemVariants}
              className="group relative flex flex-col gap-4 overflow-hidden rounded-2xl border border-slate-100 bg-white p-7 shadow-[0_2px_12px_-6px_rgba(15,20,96,0.05)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_-20px_rgba(15,20,96,0.25)]"
            >
              <span
                aria-hidden
                className="absolute inset-x-7 bottom-0 h-0.5 origin-center scale-x-0 rounded-full bg-navy-600 transition-transform duration-500 ease-out group-hover:scale-x-100"
              />
              <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-navy-50 transition-colors duration-300 group-hover:bg-navy-600">
                <Image
                  src={adv.icon}
                  alt=""
                  width={32}
                  height={32}
                  className="h-8 w-8 object-contain transition-all duration-300 group-hover:brightness-0 group-hover:invert"
                />
              </span>
              <h3 className="font-display text-xl font-bold text-slate-900">
                {adv.title}
              </h3>
              <p className="text-sm leading-relaxed text-slate-600">
                {adv.description}
              </p>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
