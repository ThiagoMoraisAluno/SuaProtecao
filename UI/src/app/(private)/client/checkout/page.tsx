"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Check,
  Copy,
  CreditCard,
  FileText,
  Loader2,
  QrCode,
} from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { plansService } from "@/services/plans.service";
import { clientsService } from "@/services/clients.service";
import { paymentsService } from "@/services/payments.service";
import { formatCurrency } from "@/lib/utils";
import { PageSkeleton } from "@/components/ui/PageSkeleton";
import { toast } from "sonner";
import axios from "axios";
import type { Payment, PaymentMethod, Plan } from "@/types";

const POLL_INTERVAL_MS = 10_000;

function CheckoutInner() {
  const router = useRouter();
  const params = useSearchParams();
  const { user } = useAuth();
  const planIdParam = params.get("planId");

  const [method, setMethod] = useState<PaymentMethod>("pix");
  const [generated, setGenerated] = useState<Payment | null>(null);

  const { data: client, isLoading: loadingClient } = useQuery({
    queryKey: ["client-me", user?.id],
    queryFn: () => clientsService.findOne(user!.id),
    enabled: !!user?.id,
  });

  const { data: plans = [], isLoading: loadingPlans } = useQuery({
    queryKey: ["plans"],
    queryFn: () => plansService.findAll(),
  });

  const targetPlan: Plan | undefined =
    plans.find((p) => p.id === planIdParam) ??
    plans.find((p) => p.id === client?.planId);

  const isAnnual = targetPlan?.billingCycle === "annual";
  const annualDiscount = targetPlan?.annualDiscount ?? 0;
  const grossAnnual = targetPlan ? targetPlan.price * 12 : 0;
  const finalAmount = targetPlan
    ? isAnnual
      ? Number((grossAnnual * (1 - annualDiscount / 100)).toFixed(2))
      : targetPlan.price
    : 0;
  const annualSavings = isAnnual ? grossAnnual - finalAmount : 0;

  const allowedMethods: PaymentMethod[] = isAnnual
    ? ["pix", "boleto", "credit_card"]
    : ["pix", "boleto"];

  const createMutation = useMutation({
    mutationFn: () =>
      paymentsService.create({ method, planId: targetPlan?.id }),
    onSuccess: (payment) => {
      setGenerated(payment);
      toast.success("Cobrança gerada!");
    },
    onError: (err: unknown) => {
      toast.error(
        axios.isAxiosError<{ message: string }>(err)
          ? (err.response?.data?.message ?? "Erro ao gerar cobrança.")
          : "Erro ao gerar cobrança.",
      );
    },
  });

  // Polling do status enquanto pendente
  const { data: polled } = useQuery({
    queryKey: ["payment", generated?.id],
    queryFn: () => paymentsService.findOne(generated!.id),
    enabled:
      !!generated &&
      generated.status !== "confirmed" &&
      generated.status !== "cancelled",
    refetchInterval: POLL_INTERVAL_MS,
    refetchIntervalInBackground: false,
  });

  const current: Payment | null = polled ?? generated;

  if (loadingClient || loadingPlans) return <PageSkeleton />;

  if (!targetPlan) {
    return (
      <div className="max-w-lg mx-auto py-12 text-center">
        <p className="text-slate-500">Plano não encontrado.</p>
        <Link href="/client/dashboard" className="btn-primary mt-4 inline-flex">
          <ArrowLeft size={16} /> Voltar
        </Link>
      </div>
    );
  }

  if (current?.status === "confirmed") {
    return (
      <div className="max-w-lg mx-auto py-12 text-center animate-fade-in">
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Check className="w-10 h-10 text-emerald-600" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 font-display mb-3">
          Pagamento confirmado!
        </h2>
        <p className="text-slate-500 mb-8">
          Seu plano <strong>{targetPlan.name}</strong> está ativo.
        </p>
        <Link href="/client/dashboard" className="btn-primary">
          Ir para o painel
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
          aria-label="Voltar"
        >
          <ArrowLeft size={20} className="text-slate-600" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-slate-900 font-display">
            Pagamento
          </h1>
          <p className="text-slate-500 text-sm">
            Confirme o plano e escolha como pagar
          </p>
        </div>
      </div>

      {/* Resumo do plano */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-xs text-slate-400 uppercase font-semibold mb-1">
              Plano selecionado
            </p>
            <h2 className="text-lg font-bold text-slate-900 font-display">
              {targetPlan.name}
            </h2>
          </div>
          {isAnnual && (
            <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold px-2.5 py-1 rounded-full">
              Anual · -{annualDiscount}%
            </span>
          )}
        </div>

        <ul className="space-y-1.5 text-sm text-slate-600 mb-5">
          {targetPlan.features.slice(0, 4).map((f, i) => (
            <li key={i} className="flex items-start gap-2">
              <Check className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
              {f}
            </li>
          ))}
        </ul>

        <div className="border-t border-slate-100 pt-4">
          {isAnnual ? (
            <>
              <p className="text-sm text-slate-400 line-through">
                {formatCurrency(grossAnnual)} no total
              </p>
              <p className="text-3xl font-bold text-slate-900 font-display">
                {formatCurrency(finalAmount)}
                <span className="text-sm text-slate-500 font-normal">
                  {" "}
                  /ano
                </span>
              </p>
              <p className="text-xs text-emerald-700 font-medium mt-1">
                Você economiza {formatCurrency(annualSavings)} por ano
              </p>
            </>
          ) : (
            <p className="text-3xl font-bold text-slate-900 font-display">
              {formatCurrency(finalAmount)}
              <span className="text-sm text-slate-500 font-normal"> /mês</span>
            </p>
          )}
        </div>
      </div>

      {!current && (
        <>
          {/* Seleção do método */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 space-y-3">
            <p className="text-sm font-semibold text-slate-900">
              Como você quer pagar?
            </p>

            {allowedMethods.map((m) => {
              const meta = METHOD_META[m];
              const Icon = meta.icon;
              const disabled = m === "credit_card" && !isAnnual;
              const selected = method === m;
              return (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMethod(m)}
                  disabled={disabled}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${
                    selected
                      ? "border-brand-500 bg-brand-50"
                      : "border-slate-200 hover:border-slate-300"
                  } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <Icon
                    className={`w-6 h-6 ${selected ? "text-brand-600" : "text-slate-500"}`}
                  />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-900">
                      {meta.label}
                    </p>
                    <p className="text-xs text-slate-500">
                      {m === "credit_card" && isAnnual
                        ? "12x sem juros"
                        : meta.subtitle}
                    </p>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      selected
                        ? "border-brand-500 bg-brand-500"
                        : "border-slate-300"
                    }`}
                  >
                    {selected && (
                      <div className="w-2 h-2 bg-white rounded-full" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          <button
            onClick={() => createMutation.mutate()}
            disabled={createMutation.isPending}
            className="btn-primary w-full justify-center py-3.5"
          >
            {createMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : null}
            Gerar cobrança ({formatCurrency(finalAmount)})
          </button>
        </>
      )}

      {current && <PaymentDetails payment={current} />}
    </div>
  );
}

const METHOD_META: Record<
  PaymentMethod,
  { label: string; subtitle: string; icon: typeof QrCode }
> = {
  pix: {
    label: "PIX",
    subtitle: "Aprovação instantânea",
    icon: QrCode,
  },
  boleto: {
    label: "Boleto",
    subtitle: "Compensa em até 3 dias úteis",
    icon: FileText,
  },
  credit_card: {
    label: "Cartão de crédito",
    subtitle: "Disponível em planos anuais",
    icon: CreditCard,
  },
};

function copyToClipboard(value: string, label: string) {
  void navigator.clipboard.writeText(value);
  toast.success(`${label} copiado!`);
}

function PaymentDetails({ payment }: { payment: Payment }) {
  if (payment.method === "pix") {
    return (
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 space-y-4 animate-fade-in">
        <div className="text-center">
          <p className="text-sm font-semibold text-slate-900 mb-1">
            Escaneie o QR Code com seu banco
          </p>
          <p className="text-xs text-slate-500">
            Estamos verificando o pagamento a cada 10 segundos
          </p>
        </div>

        {payment.pixQrCode && (
          <div className="flex justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`data:image/png;base64,${payment.pixQrCode}`}
              alt="QR Code PIX"
              className="w-56 h-56 border border-slate-200 rounded-xl"
            />
          </div>
        )}

        {payment.pixCode && (
          <div>
            <label className="form-label">Copia e cola</label>
            <div className="flex gap-2">
              <input
                readOnly
                value={payment.pixCode}
                className="form-input font-mono text-xs"
              />
              <button
                onClick={() => copyToClipboard(payment.pixCode!, "Código PIX")}
                className="btn-secondary"
                aria-label="Copiar código PIX"
              >
                <Copy size={16} />
              </button>
            </div>
          </div>
        )}

        <div className="flex items-center justify-center gap-2 text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-xl p-3">
          <Loader2 className="w-4 h-4 animate-spin" />
          Aguardando pagamento…
        </div>
      </div>
    );
  }

  if (payment.method === "boleto") {
    return (
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 space-y-4 animate-fade-in">
        <p className="text-sm font-semibold text-slate-900">
          Boleto gerado com sucesso
        </p>

        {payment.boletoUrl && (
          <a
            href={payment.boletoUrl}
            target="_blank"
            rel="noreferrer"
            className="btn-primary w-full justify-center"
          >
            <FileText size={16} /> Abrir boleto (PDF)
          </a>
        )}

        {payment.boletoBarCode && (
          <div>
            <label className="form-label">Linha digitável</label>
            <div className="flex gap-2">
              <input
                readOnly
                value={payment.boletoBarCode}
                className="form-input font-mono text-xs"
              />
              <button
                onClick={() =>
                  copyToClipboard(payment.boletoBarCode!, "Linha digitável")
                }
                className="btn-secondary"
                aria-label="Copiar linha digitável"
              >
                <Copy size={16} />
              </button>
            </div>
          </div>
        )}

        <div className="flex items-center justify-center gap-2 text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-xl p-3">
          <Loader2 className="w-4 h-4 animate-spin" />
          Aguardando compensação (até 3 dias úteis)
        </div>
      </div>
    );
  }

  // credit_card
  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 space-y-4 animate-fade-in">
      <p className="text-sm font-semibold text-slate-900">
        Finalize o pagamento no Asaas
      </p>
      <p className="text-sm text-slate-500">
        Você será redirecionado para a página segura do gateway para inserir os
        dados do seu cartão (12x sem juros).
      </p>
      {payment.invoiceUrl && (
        <a
          href={payment.invoiceUrl}
          target="_blank"
          rel="noreferrer"
          className="btn-primary w-full justify-center"
        >
          <CreditCard size={16} /> Pagar com cartão
        </a>
      )}
      <div className="flex items-center justify-center gap-2 text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-xl p-3">
        <Loader2 className="w-4 h-4 animate-spin" />
        Aguardando confirmação…
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <CheckoutInner />
    </Suspense>
  );
}
