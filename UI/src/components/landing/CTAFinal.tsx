"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, MessageCircle } from "lucide-react";
import MarqueeBanner from "./MarqueeBanner";

const VP = { x: 1080, y: 300 };
const W = 1440;
const H = 600;

// Perspective rays from vanishing point to left edge
const RAYS = Array.from({ length: 15 }, (_, i) => {
  const y = i * (H / 14);
  const isAccent = i === 0 || i === 7 || i === 14;
  const distFromCenter = Math.abs(y - VP.y) / VP.y;
  return { y2: y, isAccent, opacity: isAccent ? 0.35 : 0.055 + distFromCenter * 0.055 };
});

// Cross-section depth markers (vertical lines, height compressed toward VP)
const CROSS_LINES = [80, 190, 295, 395, 490, 580, 670, 760, 870, 980].map((x, i) => {
  const fraction = Math.max(0, (VP.x - x) / VP.x);
  const halfH = (H / 2) * fraction;
  return {
    x,
    y1: VP.y - halfH,
    y2: VP.y + halfH,
    opacity: 0.035 + fraction * 0.075,
    isAccent: i === 1 || i === 4 || i === 7,
  };
});

const PARTICLES = [
  { cx: 95,  cy: 72,  r: 1.8, delay: 0,   dur: 4.2 },
  { cx: 230, cy: 195, r: 1.2, delay: 1.1, dur: 5.1 },
  { cx: 415, cy: 108, r: 2.2, delay: 2.3, dur: 3.8 },
  { cx: 165, cy: 425, r: 1.5, delay: 0.7, dur: 6.0 },
  { cx: 325, cy: 492, r: 1.0, delay: 1.9, dur: 4.5 },
  { cx: 535, cy: 278, r: 1.8, delay: 3.1, dur: 5.3 },
  { cx: 70,  cy: 528, r: 1.2, delay: 2.6, dur: 4.0 },
  { cx: 685, cy: 368, r: 1.5, delay: 0.4, dur: 3.6 },
  { cx: 380, cy: 52,  r: 1.0, delay: 1.7, dur: 5.8 },
  { cx: 752, cy: 178, r: 2.0, delay: 0.2, dur: 4.4 },
  { cx: 188, cy: 312, r: 1.5, delay: 2.0, dur: 3.2 },
  { cx: 478, cy: 518, r: 1.0, delay: 1.3, dur: 5.6 },
  { cx: 622, cy: 92,  r: 1.8, delay: 3.5, dur: 4.1 },
  { cx: 845, cy: 442, r: 1.2, delay: 0.9, dur: 5.0 },
  { cx: 562, cy: 162, r: 1.0, delay: 2.8, dur: 3.5 },
  { cx: 288, cy: 342, r: 2.0, delay: 0.5, dur: 4.8 },
  { cx: 145, cy: 138, r: 1.3, delay: 3.8, dur: 5.5 },
  { cx: 730, cy: 490, r: 1.6, delay: 1.5, dur: 4.0 },
];

export function CTAFinal() {
  return (
    <section
      className="relative overflow-hidden pb-20 text-white"
      style={{
        background:
          "linear-gradient(145deg, #000b28 0%, #001440 35%, #001f6b 62%, #0038a8 85%, #004fcc 100%)",
      }}
    >
      {/* ── Perspective 3D Grid SVG ── */}
      <svg
        aria-hidden
        className="pointer-events-none absolute inset-0 h-full w-full"
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="xMidYMid slice"
        style={{ zIndex: 1 }}
      >
        <defs>
          {/* Glow filters */}
          <filter id="ctaGlow" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="2.8" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="ctaGlowStrong" x="-120%" y="-120%" width="340%" height="340%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="ctaParticle" x="-400%" y="-400%" width="900%" height="900%">
            <feGaussianBlur stdDeviation="2.2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Radial light bloom from vanishing point */}
          <radialGradient
            id="ctaVpBloom"
            gradientUnits="userSpaceOnUse"
            cx="1080"
            cy="300"
            r="700"
          >
            <stop offset="0%"   stopColor="#0055ff" stopOpacity="0.45" />
            <stop offset="35%"  stopColor="#001e80" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#000510" stopOpacity="0" />
          </radialGradient>

          {/* Cyan edge glow on left */}
          <radialGradient id="ctaLeftGlow" gradientUnits="userSpaceOnUse" cx="0" cy="300" r="400">
            <stop offset="0%"   stopColor="#00d4ff" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#00d4ff" stopOpacity="0" />
          </radialGradient>

          {/* Particle animation keyframes */}
          <style>{`
            @keyframes cta-float {
              0%,100% { opacity: 0.10; transform: translateY(0px)   scale(1);   }
              50%      { opacity: 0.80; transform: translateY(-13px) scale(1.4); }
            }
          `}</style>
        </defs>

        {/* VP radial bloom */}
        <rect width={W} height={H} fill="url(#ctaVpBloom)" />
        <rect width={W} height={H} fill="url(#ctaLeftGlow)" />

        {/* ── Perspective rays: VP → left edge ── */}
        {RAYS.map((ray, i) => (
          <line
            key={`ray-${i}`}
            x1={VP.x} y1={VP.y}
            x2={0}    y2={ray.y2}
            stroke={ray.isAccent ? "#00d4ff" : "#2255cc"}
            strokeWidth={ray.isAccent ? 1.7 : 0.65}
            strokeOpacity={ray.opacity}
            filter={ray.isAccent ? "url(#ctaGlowStrong)" : undefined}
          />
        ))}

        {/* ── Cross-section depth markers ── */}
        {CROSS_LINES.map((cl, i) => (
          <line
            key={`cl-${i}`}
            x1={cl.x} y1={cl.y1}
            x2={cl.x} y2={cl.y2}
            stroke={cl.isAccent ? "#00d4ff" : "#2a5acc"}
            strokeWidth={cl.isAccent ? 1.1 : 0.45}
            strokeOpacity={cl.opacity}
            filter={cl.isAccent ? "url(#ctaGlow)" : undefined}
          />
        ))}

        {/* ── Primary hero cyan accent rays ── */}
        <line
          x1={VP.x} y1={VP.y} x2={0} y2={0}
          stroke="#00d4ff" strokeWidth="2.2" strokeOpacity="0.45"
          filter="url(#ctaGlowStrong)"
        />
        <line
          x1={VP.x} y1={VP.y} x2={0} y2={H}
          stroke="#00d4ff" strokeWidth="2.2" strokeOpacity="0.45"
          filter="url(#ctaGlowStrong)"
        />
        <line
          x1={VP.x} y1={VP.y} x2={0} y2={VP.y}
          stroke="#55aaff" strokeWidth="3" strokeOpacity="0.22"
          filter="url(#ctaGlowStrong)"
        />

        {/* ── Subtle horizontal scan lines (tech feel) ── */}
        {[105, 195, 282, 370, 458, 545].map((y, i) => (
          <line
            key={`scan-${i}`}
            x1={0} y1={y} x2={W * 0.58} y2={y}
            stroke="#1a44aa" strokeWidth="0.45" strokeOpacity={0.10}
          />
        ))}

        {/* ── Floating particles ── */}
        {PARTICLES.map((p, i) => (
          <circle
            key={`p-${i}`}
            cx={p.cx} cy={p.cy} r={p.r}
            fill="#00d4ff"
            filter="url(#ctaParticle)"
            style={{ animation: `cta-float ${p.dur}s ease-in-out ${p.delay}s infinite` }}
          />
        ))}
      </svg>

      {/* Left vignette → text readability */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 z-[2] w-3/4"
        style={{
          background:
            "linear-gradient(to right, rgba(0,5,22,0.55) 0%, rgba(0,8,30,0.25) 45%, transparent 100%)",
        }}
      />

      {/* ── Content ── */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 md:px-8">
        <div className="grid items-center gap-10 py-16 md:py-20 lg:grid-cols-2 lg:gap-16">
          {/* Left: text */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex flex-col gap-6"
          >
            <span className="inline-flex w-max items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-brand-300 backdrop-blur">
              Comece agora
            </span>
            <h2 className="font-display text-3xl font-bold tracking-tight md:text-5xl">
              Pronto Para{" "}
              <span className="italic text-brand-400">Proteger Seu Lar?</span>
            </h2>
            <p className="max-w-xl text-base leading-relaxed text-white/75 md:text-lg">
              Assine agora e tenha serviços domésticos e cobertura financeira em
              uma mensalidade simples e sem burocracia.
            </p>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/login"
                className="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-xl bg-white px-7 py-3.5 text-sm font-semibold text-navy-700 shadow-lg shadow-navy-900/30 transition-all duration-300 hover:scale-[1.03] hover:bg-brand-50 hover:shadow-xl active:scale-[0.98]"
              >
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 -translate-x-full skew-x-12 bg-gradient-to-r from-transparent via-navy-200/60 to-transparent transition-transform duration-500 ease-out group-hover:translate-x-full"
                />
                <span className="relative">Escolher meu plano</span>
                <ArrowUpRight className="relative h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="#"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/30 bg-transparent px-7 py-3.5 text-sm font-semibold text-white transition-all duration-300 hover:border-white/60 hover:bg-white/10"
              >
                <MessageCircle className="h-4 w-4" />
                Falar no WhatsApp
              </Link>
            </div>
          </motion.div>

          {/* Right: image */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.9, ease: "easeOut" }}
            className="relative mx-auto w-full max-w-[460px]"
          >
            <div
              aria-hidden
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[85%] w-[85%]"
              style={{
                clipPath:
                  "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
                background:
                  "linear-gradient(135deg, #0055ff 0%, #1a3aff 40%, #0033cc 100%)",
                filter: "blur(0px)",
                boxShadow: "0 0 60px 20px rgba(0,100,255,0.35), 0 0 120px 40px rgba(0,60,200,0.18)",
              }}
            />
            <div className="relative aspect-[3/4]">
              <Image
                src="/images/landing/img111.png"
                alt="Profissional pronto para atender"
                fill
                sizes="(max-width: 1024px) 80vw, 460px"
                className="object-contain object-bottom"
              />
            </div>
          </motion.div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 z-20">
        <MarqueeBanner />
      </div>
    </section>
  );
}
