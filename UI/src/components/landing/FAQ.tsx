"use client";

import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, MessageCircle } from "lucide-react";

type FaqItem = {
  question: string;
  answer: string;
};

const FAQS: FaqItem[] = [
  {
    question: "O que está incluído no meu plano?",
    answer:
      "Seu plano inclui serviços domésticos mensais (encanador, eletricista, pintor, diarista, entre outros) e cobertura financeira para sinistros como roubo, enchente, dano estrutural e incêndio, conforme o limite contratado.",
  },
  {
    question: "Como solicito um serviço?",
    answer:
      "Pelo nosso aplicativo ou site, você abre um chamado descrevendo o problema, anexa fotos se quiser e escolhe o melhor horário. Em poucos minutos um profissional verificado é direcionado.",
  },
  {
    question: "Em quanto tempo o prestador chega?",
    answer:
      "Atendimentos de rotina são agendados em até 24h. Para emergências dos planos Intermediário e Premium, garantimos atendimento em até 4 horas.",
  },
  {
    question: "Como funciona a cobertura financeira?",
    answer:
      "Em caso de sinistro coberto, você abre o registro pelo app, nossa equipe analisa e libera a indenização dentro do limite do plano em até 10 dias úteis após a documentação completa.",
  },
  {
    question: "Posso mudar de plano depois?",
    answer:
      "Sim. A qualquer momento você pode fazer upgrade ou downgrade pelo painel. A nova mensalidade entra em vigor no próximo ciclo de cobrança.",
  },
  {
    question: "Como faço para cancelar?",
    answer:
      "Não temos fidelidade. O cancelamento pode ser feito pelo app ou via suporte e tem efeito a partir do próximo ciclo. Sem multa, sem burocracia.",
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="bg-slate-50 py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="flex flex-col gap-5 lg:sticky lg:top-32 lg:self-start"
          >
            <span className="inline-flex w-max items-center gap-2 rounded-full border border-navy-100 bg-white px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-navy-700">
              Perguntas frequentes
            </span>
            <h2 className="font-display text-3xl font-bold tracking-tight text-slate-900 md:text-5xl">
              Tem Dúvidas?{" "}
              <span className="italic text-navy-700">Nós Respondemos.</span>
            </h2>
            <p className="text-base leading-relaxed text-slate-600 md:text-lg">
              Não encontrou sua resposta? Fale conosco pelo WhatsApp em até 1
              hora útil.
            </p>
            <Link
              href="#contato"
              className="group relative inline-flex w-max items-center gap-2 overflow-hidden rounded-xl bg-navy-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-navy-600/30 transition-all duration-300 hover:bg-navy-700 hover:shadow-xl hover:scale-[1.03]"
            >
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 -translate-x-full skew-x-12 bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-500 ease-out group-hover:translate-x-full"
              />
              <MessageCircle className="relative h-4 w-4" />
              <span className="relative">Falar no WhatsApp</span>
            </Link>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.08 } },
            }}
            className="flex flex-col gap-3"
          >
            {FAQS.map((item, index) => {
              const isOpen = openIndex === index;
              return (
                <motion.div
                  key={item.question}
                  variants={{
                    hidden: { opacity: 0, x: 40 },
                    visible: {
                      opacity: 1,
                      x: 0,
                      transition: { duration: 0.5, ease: "easeOut" as const },
                    },
                  }}
                  className={`relative overflow-hidden rounded-2xl border bg-white transition-all duration-300 ${
                    isOpen
                      ? "border-navy-200 bg-navy-50/50 shadow-lg shadow-navy-900/5"
                      : "border-slate-200 hover:border-navy-200"
                  }`}
                >
                  <span
                    aria-hidden
                    className={`absolute inset-y-0 left-0 w-1 bg-navy-600 transition-transform duration-300 ${
                      isOpen ? "scale-y-100" : "scale-y-0"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setOpenIndex(isOpen ? null : index)}
                    aria-expanded={isOpen}
                    className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                  >
                    <span className="font-display text-base font-bold text-slate-900 md:text-lg">
                      {item.question}
                    </span>
                    <span
                      className={`inline-flex h-8 w-8 flex-none items-center justify-center rounded-full transition-all duration-300 ${
                        isOpen
                          ? "rotate-180 bg-navy-600 text-white"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      <ChevronDown className="h-4 w-4" />
                    </span>
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.35, ease: "easeOut" }}
                      >
                        <p className="px-6 pb-6 text-sm leading-relaxed text-slate-600">
                          {item.answer}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
