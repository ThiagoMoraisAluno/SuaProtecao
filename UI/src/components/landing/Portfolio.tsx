"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Search } from "lucide-react";

type Category = "Todos" | "Elétrica" | "Hidráulica" | "Alvenaria" | "Acabamento";

type Project = {
  image: string;
  title: string;
  category: Exclude<Category, "Todos">;
};

const PROJECTS: Project[] = [
  {
    image: "/images/landing/img8.jpg",
    title: "Reforma de Cozinha Completa",
    category: "Acabamento",
  },
  {
    image: "/images/landing/img10.jpg",
    title: "Instalação Elétrica Residencial",
    category: "Elétrica",
  },
  {
    image: "/images/landing/img11.jpg",
    title: "Modernização de Cozinha",
    category: "Acabamento",
  },
  {
    image: "/images/landing/img16.jpg",
    title: "Reforma de Ambiente Escuro",
    category: "Acabamento",
  },
  {
    image: "/images/landing/img41.jpg",
    title: "Reparo Estrutural de Alvenaria",
    category: "Alvenaria",
  },
  {
    image: "/images/landing/img32.jpg",
    title: "Instalação Hidráulica Completa",
    category: "Hidráulica",
  },
];

const CATEGORIES: Category[] = [
  "Todos",
  "Elétrica",
  "Hidráulica",
  "Alvenaria",
  "Acabamento",
];

export function Portfolio() {
  const [active, setActive] = useState<Category>("Todos");

  const filtered = useMemo(
    () =>
      active === "Todos"
        ? PROJECTS
        : PROJECTS.filter((project) => project.category === active),
    [active],
  );

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
            Nossos projetos
          </span>
          <h2 className="font-display text-3xl font-bold tracking-tight text-slate-900 md:text-5xl">
            Projetos <span className="italic text-navy-700">Concluídos</span>{" "}
            Pelos Nossos Profissionais
          </h2>
          <p className="mt-4 text-base text-slate-600 md:text-lg">
            Resultados reais entregues por profissionais verificados em todo o
            Brasil.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.2 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-2"
        >
          {CATEGORIES.map((cat) => {
            const isActive = active === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setActive(cat)}
                className={`rounded-full border px-5 py-2 text-sm font-semibold transition-all duration-300 ${
                  isActive
                    ? "border-navy-600 bg-navy-600 text-white shadow-lg shadow-navy-600/25"
                    : "border-slate-200 bg-white text-slate-700 hover:border-navy-300 hover:text-navy-700"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </motion.div>

        <motion.div
          layout
          className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          <AnimatePresence mode="popLayout">
            {filtered.map((project) => (
              <motion.article
                key={project.title}
                layout
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.92 }}
                transition={{ duration: 0.45, ease: "easeOut" }}
                className="group relative aspect-[4/5] overflow-hidden rounded-2xl bg-slate-100 shadow-[0_8px_24px_-12px_rgba(15,20,96,0.18)]"
              >
                <Image
                  src={project.image}
                  alt={project.title}
                  fill
                  sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 30vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                />
                <div
                  aria-hidden
                  className="absolute inset-0 bg-navy-950/0 transition-colors duration-500 group-hover:bg-navy-950/55"
                />
                <Link
                  href="#"
                  aria-label={`Ver detalhes de ${project.title}`}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <span className="flex h-14 w-14 scale-50 items-center justify-center rounded-full bg-white text-navy-700 opacity-0 shadow-xl transition-all duration-500 ease-out group-hover:scale-100 group-hover:opacity-100">
                    <Search className="h-5 w-5" />
                  </span>
                </Link>
                <div className="absolute inset-x-5 bottom-5 z-10 translate-y-2 opacity-0 transition-all duration-500 ease-out group-hover:translate-y-0 group-hover:opacity-100">
                  <span className="inline-flex rounded-full bg-brand-500 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-white">
                    {project.category}
                  </span>
                  <h3 className="mt-2 font-display text-lg font-bold leading-tight text-white">
                    {project.title}
                  </h3>
                </div>
              </motion.article>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}
