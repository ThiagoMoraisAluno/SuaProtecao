"use client";

import { useState } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  type GeoFeature,
} from "react-simple-maps";
import { motion } from "framer-motion";
import { CountUp } from "./motion";

// Official Brazil states GeoJSON (IBGE-based, maintained dataset)
const GEO_URL =
  "https://raw.githubusercontent.com/giuliano-macedo/geodata-br-states/main/geojson/br_states.geojson";

type Capital = {
  name: string;
  coordinates: [number, number];
  delay: number;
};

const CAPITALS: Capital[] = [
  { name: "São Paulo",      coordinates: [-46.633, -23.55],  delay: 0   },
  { name: "Rio de Janeiro", coordinates: [-43.172, -22.906], delay: 0.3 },
  { name: "Brasília",       coordinates: [-47.929, -15.78],  delay: 0.6 },
  { name: "Salvador",       coordinates: [-38.501, -12.97],  delay: 0.9 },
  { name: "Fortaleza",      coordinates: [-38.543, -3.717],  delay: 1.2 },
  { name: "Manaus",         coordinates: [-60.025, -3.119],  delay: 1.5 },
  { name: "Curitiba",       coordinates: [-49.265, -25.428], delay: 1.8 },
  { name: "Porto Alegre",   coordinates: [-51.23,  -30.034], delay: 2.1 },
  { name: "Recife",         coordinates: [-34.881, -8.054],  delay: 2.4 },
  { name: "Belém",          coordinates: [-48.504, -1.455],  delay: 2.7 },
];

const STATS = [
  { value: 3000, suffix: "+", label: "Famílias Protegidas"  },
  { value: 10,   suffix: "+", label: "Estados Atendidos"    },
  { value: 150,  suffix: "+", label: "Prestadores Parceiros"},
];

const GEO_STYLE = {
  default: {
    fill: "#1a3a7a",
    stroke: "#3b82f6",
    strokeWidth: 0.5,
    outline: "none",
  },
  hover: {
    fill: "#2a559a",
    stroke: "#60a5fa",
    strokeWidth: 0.8,
    outline: "none",
    cursor: "pointer",
  },
  pressed: {
    fill: "#1e4080",
    outline: "none",
  },
} as const;

export function Coverage() {
  const [hoveredState, setHoveredState] = useState<string | null>(null);

  return (
    <section className="relative overflow-hidden bg-navy-950 py-20 text-white md:py-28">
      {/* Dot grid */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)",
          backgroundSize: "32px 32px",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-32 top-1/4 h-96 w-96 rounded-full bg-brand-500/10 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-navy-600/30 blur-3xl"
      />

      <div className="relative mx-auto max-w-7xl px-4 md:px-8">

        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mx-auto flex max-w-3xl flex-col items-center text-center"
        >
          <span className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-brand-300 backdrop-blur">
            Onde estamos
          </span>
          <h2 className="font-display text-3xl font-bold tracking-tight md:text-5xl">
            Atendendo Famílias{" "}
            <span className="italic text-brand-400">em Todo o Brasil</span>
          </h2>
          <p className="mt-4 text-base text-white/70 md:text-lg">
            Presente nas principais capitais e expandindo para novas cidades a
            cada mês.
          </p>
        </motion.div>

        {/* ── Map ── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.93 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.9, ease: "easeOut" }}
          className="relative mx-auto mt-10 max-w-2xl"
        >
          {/* Glow behind map */}
          <div
            aria-hidden
            className="absolute left-1/2 top-1/2 h-[75%] w-[65%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-600/15 blur-[80px]"
          />

          {/* Hovered state badge */}
          <div
            aria-live="polite"
            className={`absolute left-1/2 top-3 z-10 -translate-x-1/2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold text-white backdrop-blur-md transition-opacity duration-200 ${
              hoveredState
                ? "opacity-100"
                : "pointer-events-none opacity-0"
            }`}
          >
            {hoveredState ?? ""}
          </div>

          <ComposableMap
            projection="geoMercator"
            projectionConfig={{ scale: 780, center: [-54, -15] }}
            width={600}
            height={540}
            className="h-auto w-full drop-shadow-[0_0_48px_rgba(59,130,246,0.18)]"
          >
            <Geographies geography={GEO_URL}>
              {({ geographies }) =>
                geographies.map((geo: GeoFeature) => {
                  const props = geo.properties as Record<string, string>;
                  const name =
                    props.name || props.NM_ESTADO || props.NOME_UF || "";
                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      onMouseEnter={() => setHoveredState(name)}
                      onMouseLeave={() => setHoveredState(null)}
                      style={GEO_STYLE}
                    />
                  );
                })
              }
            </Geographies>

            {CAPITALS.map((capital) => (
              <Marker key={capital.name} coordinates={capital.coordinates}>
                {/* Expanding ping ring (SMIL animation) */}
                <circle r={4} fill="#0ea5e9" fillOpacity={0.45}>
                  <animate
                    attributeName="r"
                    from="4"
                    to="18"
                    dur="2.4s"
                    repeatCount="indefinite"
                    begin={`${capital.delay}s`}
                  />
                  <animate
                    attributeName="fill-opacity"
                    from="0.45"
                    to="0"
                    dur="2.4s"
                    repeatCount="indefinite"
                    begin={`${capital.delay}s`}
                  />
                </circle>
                {/* Glow halo */}
                <circle r={5} fill="#0ea5e9" fillOpacity={0.18} />
                {/* Core white dot */}
                <circle r={3} fill="#ffffff" />
                {/* Inner cyan dot */}
                <circle r={2} fill="#38bdf8" />
              </Marker>
            ))}
          </ComposableMap>
        </motion.div>

        {/* ── Stats ── */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.18 } },
          }}
          className="mx-auto mt-14 grid max-w-3xl gap-6 sm:grid-cols-3"
        >
          {STATS.map((stat) => (
            <motion.div
              key={stat.label}
              variants={{
                hidden: { opacity: 0, y: 30 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: { duration: 0.6, ease: "easeOut" as const },
                },
              }}
              className="flex flex-col items-center text-center"
            >
              <p className="font-display text-4xl font-bold md:text-5xl">
                <CountUp end={stat.value} suffix={stat.suffix} />
              </p>
              <p className="mt-1 text-sm font-medium text-white/70">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </motion.div>

      </div>
    </section>
  );
}
