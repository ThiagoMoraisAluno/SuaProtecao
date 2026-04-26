"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Calendar, Clock } from "lucide-react";

type Article = {
  image: string;
  category: string;
  categoryColor: string;
  title: string;
  date: string;
  readTime: string;
};

const ARTICLES: Article[] = [
  {
    image: "/images/landing/img41.jpg",
    category: "Manutenção",
    categoryColor: "bg-navy-600",
    title: "5 Sinais que sua Casa Precisa de um Encanador Urgente",
    date: "15 Abr 2026",
    readTime: "5 min de leitura",
  },
  {
    image: "/images/landing/img42.jpg",
    category: "Segurança",
    categoryColor: "bg-brand-500",
    title: "Como Preparar sua Casa para a Temporada de Chuvas",
    date: "10 Abr 2026",
    readTime: "4 min de leitura",
  },
  {
    image: "/images/landing/img43.jpg",
    category: "Economia",
    categoryColor: "bg-emerald-500",
    title: "Por que Assinar é Mais Barato que Chamar Avulso",
    date: "05 Abr 2026",
    readTime: "6 min de leitura",
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

export function Blog() {
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
            Últimas notícias
          </span>
          <h2 className="font-display text-3xl font-bold tracking-tight text-slate-900 md:text-5xl">
            Dicas Para{" "}
            <span className="italic text-navy-700">Proteger Melhor</span> Seu
            Lar
          </h2>
          <p className="mt-4 text-base text-slate-600 md:text-lg">
            Conteúdos práticos para você manter sua casa segura, organizada e
            sem imprevistos.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="mt-14 grid gap-7 md:grid-cols-3"
        >
          {ARTICLES.map((article) => (
            <motion.article
              key={article.title}
              variants={itemVariants}
              className="group flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-[0_4px_22px_-12px_rgba(15,20,96,0.1)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_18px_40px_-20px_rgba(15,20,96,0.25)]"
            >
              <Link href="#" className="relative block aspect-[4/3] overflow-hidden">
                <Image
                  src={article.image}
                  alt={article.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
                <span
                  className={`absolute left-4 top-4 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-white ${article.categoryColor}`}
                >
                  {article.category}
                </span>
              </Link>

              <div className="flex flex-1 flex-col gap-4 p-6">
                <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    {article.date}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" />
                    {article.readTime}
                  </span>
                </div>

                <Link href="#" className="block">
                  <h3 className="font-display text-lg font-bold leading-snug text-slate-900 transition-colors duration-300 group-hover:text-navy-700">
                    {article.title}
                  </h3>
                </Link>

                <Link
                  href="#"
                  className="mt-auto inline-flex w-max items-center gap-1.5 text-sm font-semibold text-navy-700 transition-all duration-300 hover:gap-2.5"
                >
                  Ler mais
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
