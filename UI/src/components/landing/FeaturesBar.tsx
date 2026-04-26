"use client";

import { motion } from "framer-motion";
import { HardHat, Zap, Clock } from "lucide-react";

const FEATURES = [
  { icon: Zap, label: "Atendimento Rápido" },
  { icon: HardHat, label: "Profissionais Confiáveis" },
  { icon: Clock, label: "Suporte 24/7" },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
};

export function FeaturesBar() {
  return (
    <section className="bg-navy-600">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-40px" }}
        className="mx-auto flex max-w-7xl flex-col items-center justify-center gap-6 px-4 py-8 text-white sm:flex-row sm:gap-10 md:gap-16 md:px-8"
      >
        {FEATURES.map((feature) => (
          <motion.div
            key={feature.label}
            variants={itemVariants}
            className="flex items-center gap-3"
          >
            <span className="inline-flex h-11 w-11 flex-none items-center justify-center rounded-xl bg-white/15 backdrop-blur">
              <feature.icon className="h-5 w-5" />
            </span>
            <p className="font-display text-base font-semibold md:text-lg">
              {feature.label}
            </p>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
