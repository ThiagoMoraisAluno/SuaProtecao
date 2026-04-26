import { Skeleton } from "@/components/ui/skeleton";

interface PageSkeletonProps {
  /** Número de cards de métrica na primeira linha */
  cards?: number;
  /** Número de blocos de conteúdo abaixo dos cards */
  blocks?: number;
}

export function PageSkeleton({ cards = 4, blocks = 2 }: PageSkeletonProps) {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Título da página */}
      <div className="space-y-2">
        <Skeleton className="h-7 w-52" />
        <Skeleton className="h-4 w-36" />
      </div>

      {/* Cards de métricas */}
      <div className={`grid gap-4 grid-cols-2 lg:grid-cols-${cards}`}>
        {Array.from({ length: cards }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>

      {/* Blocos de conteúdo */}
      {Array.from({ length: blocks }).map((_, i) => (
        <Skeleton key={i} className="h-56 rounded-xl" />
      ))}
    </div>
  );
}
