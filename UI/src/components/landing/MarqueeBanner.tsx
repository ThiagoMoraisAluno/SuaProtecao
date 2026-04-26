"use client";

const ITEMS = [
  "Reparos Rápidos",
  "Profissionais Confiáveis",
  "Atendimento 24/7",
  "Cobertura Garantida",
  "Preço Transparente",
  "Sem Burocracia",
];

export default function MarqueeBanner() {
  const allItems = [...ITEMS, ...ITEMS];
  return (
    <div
      className="w-full overflow-hidden bg-[#1d36f5] py-4"
      style={{
        maskImage:
          "linear-gradient(to right, transparent 0%, black 5%, black 95%, transparent 100%)",
        WebkitMaskImage:
          "linear-gradient(to right, transparent 0%, black 5%, black 95%, transparent 100%)",
      }}
    >
      <div
        className="flex w-max"
        style={{ animation: "marquee-scroll 30s linear infinite" }}
      >
        {allItems.map((item, i) => (
          <div key={i} className="flex items-center gap-4 px-4">
            <span className="whitespace-nowrap text-base font-medium text-white">
              {item}
            </span>
            <span className="text-lg text-white/60">✦</span>
          </div>
        ))}
      </div>
    </div>
  );
}
