"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { requestsService } from "@/services/requests.service";
import type { UpdateRequestDto } from "@/services/requests.service";
import { toast } from "sonner";
import type { Request, RequestStatus } from "@/domain/entities";

const SERVICE_STATUSES: RequestStatus[] = ["pending", "in_progress", "completed"];
const COVERAGE_STATUSES: RequestStatus[] = ["analyzing", "approved", "denied"];

export interface UseRequestUpdateReturn {
  selectedRequest: Request | null;
  adminNotes: string;
  setAdminNotes: (v: string) => void;
  newStatus: RequestStatus;
  setNewStatus: (v: RequestStatus) => void;
  approvedAmount: string;
  setApprovedAmount: (v: string) => void;
  openDetail: (req: Request) => void;
  closeDetail: () => void;
  handleUpdate: () => void;
  isPending: boolean;
  getStatuses: (req: Request) => RequestStatus[];
}

export function useRequestUpdate(): UseRequestUpdateReturn {
  const qc = useQueryClient();
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [newStatus, setNewStatus] = useState<RequestStatus>("pending");
  const [approvedAmount, setApprovedAmount] = useState("");

  const mutation = useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateRequestDto }) =>
      requestsService.updateStatus(id, dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["requests"] });
      setSelectedRequest(null);
      toast.success("Chamado atualizado!");
    },
    onError: () => toast.error("Erro ao atualizar chamado."),
  });

  const openDetail = (req: Request) => {
    setSelectedRequest(req);
    setAdminNotes(req.adminNotes ?? "");
    setNewStatus(req.status);
    setApprovedAmount(
      req.type === "coverage" && req.approvedAmount ? String(req.approvedAmount) : ""
    );
  };

  const closeDetail = () => setSelectedRequest(null);

  const handleUpdate = () => {
    if (!selectedRequest) return;
    const dto: UpdateRequestDto = { status: newStatus, adminNotes };
    if (selectedRequest.type === "coverage" && approvedAmount) {
      dto.approvedAmount = Number(approvedAmount);
    }
    mutation.mutate({ id: selectedRequest.id, dto });
  };

  const getStatuses = (req: Request): RequestStatus[] =>
    req.type === "service" ? SERVICE_STATUSES : COVERAGE_STATUSES;

  return {
    selectedRequest,
    adminNotes,
    setAdminNotes,
    newStatus,
    setNewStatus,
    approvedAmount,
    setApprovedAmount,
    openDetail,
    closeDetail,
    handleUpdate,
    isPending: mutation.isPending,
    getStatuses,
  };
}
