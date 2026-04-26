"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Quote,
  Star,
} from "lucide-react";

type Testimonial = {
  avatar: string;
  name: string;
  city: string;
  plan: string;
  text: string;
};

const TESTIMONIALS: Testimonial[] = [
  {
    avatar: "/images/landing/testi1.jpg",
    name: "Camila Rosa",
    city: "Belo Horizonte, MG",
    plan: "Plano Básico",
    text: "Tive um vazamento na pia num domingo à noite. Em menos de 2 horas o encanador estava na minha porta e resolveu tudo. Mudou minha relação com imprevistos domésticos.",
  },
  {
    avatar: "/images/landing/testi2.jpg",
    name: "Rafael Monteiro",
    city: "Porto Alegre, RS",
    plan: "Plano Intermediário",
    text: "A enchente causou R$32.000 em danos. A cobertura aprovou o ressarcimento em 8 dias. Sem a Sua Proteção, eu teria entrado em dívida.",
  },
  {
    avatar: "/images/landing/testi3.jpg",
    name: "Juliana Tavares",
    city: "São Paulo, SP",
    plan: "Plano Premium",
    text: "Uso pelo menos um serviço por mês — pintura, elétrica, diarista. O preço fixo me dá uma paz absurda. Recomendo para qualquer família.",
  },
];

const AUTOPLAY_MS = 5000;

export function Testimonials() {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);

  const goNext = useCallback(() => {
    setDirection(1);
    setIndex((prev) => (prev + 1) % TESTIMONIALS.length);
  }, []);

  const goPrev = useCallback(() => {
    setDirection(-1);
    setIndex((prev) => (prev - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);
  }, []);

  useEffect(() => {
    const id = window.setInterval(goNext, AUTOPLAY_MS);
    return () => window.clearInterval(id);
  }, [goNext]);

  const current = TESTIMONIALS[index];

  return (
    <section className="bg-white py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="grid items-center gap-14 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative"
          >
            <div className="relative aspect-[4/5] overflow-hidden rounded-[2.5rem] bg-navy-950 shadow-2xl shadow-navy-900/30">
              <Image
                src="/images/landing/img47.png"
                alt="Profissional Sua Proteção"
                fill
                sizes="(max-width: 1024px) 90vw, 540px"
                className="object-cover object-top"
              />
              <div
                aria-hidden
                className="absolute inset-0 bg-gradient-to-tr from-navy-950/40 via-transparent to-transparent"
              />
            </div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.7, ease: "easeOut", delay: 0.4 }}
              className="absolute -bottom-6 right-4 flex items-center gap-3 rounded-2xl bg-white px-5 py-3 shadow-2xl shadow-navy-900/20 md:right-6"
            >
              <p className="font-display text-3xl font-bold text-navy-700">
                4.9
              </p>
              <div className="flex flex-col gap-1">
                <div className="flex">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <Star
                      key={i}
                      className="h-3.5 w-3.5 fill-amber-400 text-amber-400"
                    />
                  ))}
                </div>
                <p className="text-[10px] uppercase tracking-wider text-slate-500">
                  Avaliação Geral
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
              Depoimentos
            </span>
            <h2 className="font-display text-3xl font-bold tracking-tight text-slate-900 md:text-5xl">
              Confiança que vem dos{" "}
              <span className="italic text-navy-700">nossos clientes.</span>
            </h2>

            <div className="relative mt-4 min-h-[280px] overflow-hidden">
              <AnimatePresence mode="wait" custom={direction}>
                <motion.blockquote
                  key={current.name}
                  custom={direction}
                  initial={{ opacity: 0, x: direction * 60 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: direction * -60 }}
                  transition={{ duration: 0.55, ease: "easeOut" }}
                  className="relative rounded-3xl border border-slate-100 bg-white p-7 shadow-[0_8px_32px_-16px_rgba(15,20,96,0.18)]"
                >
                  <Quote className="absolute -top-4 left-6 h-10 w-10 fill-navy-600 text-navy-600" />
                  <div className="mb-3 flex">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <Star
                        key={i}
                        className="h-4 w-4 fill-amber-400 text-amber-400"
                      />
                    ))}
                  </div>
                  <p className="text-base leading-relaxed text-slate-700">
                    “{current.text}”
                  </p>
                  <div className="mt-6 flex items-center gap-4 border-t border-slate-100 pt-5">
                    <div className="relative h-12 w-12 overflow-hidden rounded-full">
                      <Image
                        src={current.avatar}
                        alt={current.name}
                        fill
                        sizes="48px"
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">
                        {current.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {current.city} · {current.plan}
                      </p>
                    </div>
                  </div>
                </motion.blockquote>
              </AnimatePresence>
            </div>

            <div className="flex items-center gap-4">
              <button
                type="button"
                aria-label="Depoimento anterior"
                onClick={goPrev}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition-all duration-300 hover:border-navy-300 hover:bg-navy-50 hover:text-navy-700"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                aria-label="Próximo depoimento"
                onClick={goNext}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-navy-600 text-white shadow-lg shadow-navy-600/30 transition-all duration-300 hover:bg-navy-700 hover:scale-105"
              >
                <ArrowRight className="h-4 w-4" />
              </button>
              <div className="ml-2 flex gap-2">
                {TESTIMONIALS.map((_, i) => (
                  <span
                    key={i}
                    aria-hidden
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      i === index ? "w-8 bg-navy-600" : "w-2 bg-slate-300"
                    }`}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
