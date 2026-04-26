"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { requestsService } from "@/services/requests.service";
import type { Request, RequestStatus } from "@/domain/entities";

export type TypeFilter = "all" | "service" | "coverage";
export type StatusFilter = RequestStatus | "all";

export interface UseRequestsFilterReturn {
  requests: Request[];
  filtered: Request[];
  isLoading: boolean;
  search: string;
  setSearch: (v: string) => void;
  typeFilter: TypeFilter;
  setTypeFilter: (v: TypeFilter) => void;
  statusFilter: StatusFilter;
  setStatusFilter: (v: StatusFilter) => void;
}

export function useRequestsFilter(): UseRequestsFilterReturn {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ["requests"],
    queryFn: () => requestsService.findAll(),
  });

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return requests.filter((r) => {
      const matchSearch =
        !q ||
        r.clientName.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q);
      const matchType = typeFilter === "all" || r.type === typeFilter;
      const matchStatus = statusFilter === "all" || r.status === statusFilter;
      return matchSearch && matchType && matchStatus;
    });
  }, [requests, search, typeFilter, statusFilter]);

  return {
    requests,
    filtered,
    isLoading,
    search,
    setSearch,
    typeFilter,
    setTypeFilter,
    statusFilter,
    setStatusFilter,
  };
}
