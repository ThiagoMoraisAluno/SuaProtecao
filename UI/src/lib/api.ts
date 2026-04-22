/**
 * Sua Proteção | Reparo Certo — Supabase API Layer
 * All data operations go through this module.
 */
import { supabase } from "@/lib/supabase";
import type {
  Client, ClientAsset, Supervisor, Plan, Request,
  ServiceRequest, CoverageRequest, ClientStatus, RequestStatus,
} from "@/types";

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function mapClientRow(row: any, assets: ClientAsset[] = []): Client {
  return {
    id: row.id,
    name: row.profile?.username || row.id,
    email: row.profile?.email || "",
    role: "client",
    cpf: row.cpf,
    phone: row.phone,
    planId: row.plan_id,
    supervisorId: row.supervisor_id,
    status: row.status,
    assets,
    totalAssetsValue: Number(row.total_assets_value) || 0,
    servicesUsedThisMonth: row.services_used_this_month || 0,
    joinedAt: row.joined_at,
    lastPaymentAt: row.last_payment_at,
    createdAt: row.created_at,
    address: {
      street: row.address_street || "",
      number: row.address_number || "",
      complement: row.address_complement || "",
      neighborhood: row.address_neighborhood || "",
      city: row.address_city || "",
      state: row.address_state || "",
      zipCode: row.address_zip_code || "",
    },
  };
}

function mapSupervisorRow(row: any): Supervisor {
  return {
    id: row.id,
    name: row.profile?.username || row.id,
    email: row.profile?.email || "",
    role: "supervisor",
    phone: row.profile?.phone || "",
    commission: Number(row.commission) || 10,
    totalClients: 0,
    activeClients: 0,
    createdAt: row.created_at,
  };
}

function mapRequestRow(row: any): Request {
  if (row.type === "service") {
    return {
      id: row.id,
      clientId: row.client_id,
      clientName: row.client_name,
      type: "service",
      serviceType: row.service_type,
      description: row.description,
      desiredDate: row.desired_date,
      status: row.status,
      adminNotes: row.admin_notes,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    } as ServiceRequest;
  }
  return {
    id: row.id,
    clientId: row.client_id,
    clientName: row.client_name,
    type: "coverage",
    coverageType: row.coverage_type,
    description: row.description,
    estimatedLoss: Number(row.estimated_loss) || 0,
    approvedAmount: row.approved_amount ? Number(row.approved_amount) : undefined,
    evidenceUrls: row.evidence_urls || [],
    status: row.status,
    adminNotes: row.admin_notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  } as CoverageRequest;
}

function mapPlanRow(row: any): Plan {
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    price: Number(row.price),
    servicesPerMonth: row.services_per_month,
    coverageLimit: Number(row.coverage_limit),
    features: Array.isArray(row.features) ? row.features : JSON.parse(row.features || "[]"),
    color: row.color,
    popular: row.popular,
  };
}

// ─── PLANS ────────────────────────────────────────────────────────────────────

export async function fetchPlans(): Promise<Plan[]> {
  const { data, error } = await supabase.from("plans").select("*").order("price");
  if (error) throw error;
  return (data || []).map(mapPlanRow);
}

export async function updatePlan(plan: Plan): Promise<void> {
  const { error } = await supabase.from("plans").update({
    name: plan.name,
    price: plan.price,
    services_per_month: plan.servicesPerMonth,
    coverage_limit: plan.coverageLimit,
    features: plan.features,
    updated_at: new Date().toISOString(),
  }).eq("id", plan.id);
  if (error) throw error;
}

// ─── SUPERVISORS ──────────────────────────────────────────────────────────────

export async function fetchSupervisors(): Promise<Supervisor[]> {
  const { data, error } = await supabase
    .from("supervisors")
    .select("*, profile:user_profiles(username, email)")
    .order("created_at");
  if (error) throw error;
  return (data || []).map(mapSupervisorRow);
}

export async function fetchSupervisorById(id: string): Promise<Supervisor | null> {
  const { data, error } = await supabase
    .from("supervisors")
    .select("*, profile:user_profiles(username, email)")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data ? mapSupervisorRow(data) : null;
}

export async function createSupervisor(params: {
  name: string;
  email: string;
  phone: string;
  commission: number;
  password: string;
}): Promise<void> {
  // 1. Create auth user via admin (edge function) — for now use sign up and then assign role
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email: params.email,
    password: params.password,
    options: {
      data: { full_name: params.name, username: params.name },
      emailRedirectTo: undefined,
    },
  });
  if (signUpError) throw signUpError;
  if (!signUpData.user) throw new Error("Falha ao criar usuário.");

  const userId = signUpData.user.id;

  // 2. Insert into supervisors table
  const { error: supError } = await supabase.from("supervisors").insert({
    id: userId,
    commission: params.commission,
  });
  if (supError) throw supError;

  // 3. Assign role
  const { error: roleError } = await supabase.from("user_roles").insert({
    id: userId,
    role: "supervisor",
  });
  if (roleError) throw roleError;

  // 4. Update user_profiles username
  const { error: profileError } = await supabase.from("user_profiles").update({
    username: params.name,
  }).eq("id", userId);
  if (profileError) throw profileError;
}

// ─── CLIENTS ──────────────────────────────────────────────────────────────────

export async function fetchClients(): Promise<Client[]> {
  const { data, error } = await supabase
    .from("clients")
    .select("*, profile:user_profiles(username, email)")
    .order("created_at", { ascending: false });
  if (error) throw error;

  if (!data || data.length === 0) return [];

  const clientIds = data.map((c: any) => c.id);
  const { data: assets } = await supabase
    .from("client_assets")
    .select("*")
    .in("client_id", clientIds);

  return data.map((row: any) => {
    const clientAssets = (assets || [])
      .filter((a: any) => a.client_id === row.id)
      .map((a: any) => ({ name: a.name, estimatedValue: Number(a.estimated_value) }));
    return mapClientRow(row, clientAssets);
  });
}

export async function fetchClientById(id: string): Promise<Client | null> {
  const { data, error } = await supabase
    .from("clients")
    .select("*, profile:user_profiles(username, email)")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;

  const { data: assets } = await supabase
    .from("client_assets")
    .select("*")
    .eq("client_id", id);

  const clientAssets = (assets || []).map((a: any) => ({
    name: a.name,
    estimatedValue: Number(a.estimated_value),
  }));

  return mapClientRow(data, clientAssets);
}

export async function fetchClientsBySupervisor(supervisorId: string): Promise<Client[]> {
  const { data, error } = await supabase
    .from("clients")
    .select("*, profile:user_profiles(username, email)")
    .eq("supervisor_id", supervisorId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  if (!data || data.length === 0) return [];

  const clientIds = data.map((c: any) => c.id);
  const { data: assets } = await supabase
    .from("client_assets")
    .select("*")
    .in("client_id", clientIds);

  return data.map((row: any) => {
    const clientAssets = (assets || [])
      .filter((a: any) => a.client_id === row.id)
      .map((a: any) => ({ name: a.name, estimatedValue: Number(a.estimated_value) }));
    return mapClientRow(row, clientAssets);
  });
}

export async function createClient(params: {
  name: string;
  email: string;
  phone: string;
  cpf: string;
  password: string;
  planId: string;
  supervisorId: string;
  address: Client["address"];
  assets: ClientAsset[];
  totalAssetsValue: number;
}): Promise<void> {
  // 1. Sign up auth user
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email: params.email,
    password: params.password,
    options: {
      data: { full_name: params.name, username: params.name },
      emailRedirectTo: undefined,
    },
  });
  if (signUpError) throw signUpError;
  if (!signUpData.user) throw new Error("Falha ao criar usuário.");

  const userId = signUpData.user.id;

  // 2. Insert into clients table
  const { error: clientError } = await supabase.from("clients").insert({
    id: userId,
    cpf: params.cpf,
    phone: params.phone,
    plan_id: params.planId,
    supervisor_id: params.supervisorId,
    status: "active",
    total_assets_value: params.totalAssetsValue,
    address_street: params.address.street,
    address_number: params.address.number,
    address_complement: params.address.complement,
    address_neighborhood: params.address.neighborhood,
    address_city: params.address.city,
    address_state: params.address.state,
    address_zip_code: params.address.zipCode,
  });
  if (clientError) throw clientError;

  // 3. Insert assets
  if (params.assets.length > 0) {
    const { error: assetsError } = await supabase.from("client_assets").insert(
      params.assets.map((a) => ({
        client_id: userId,
        name: a.name,
        estimated_value: a.estimatedValue,
      }))
    );
    if (assetsError) throw assetsError;
  }

  // 4. Assign role
  const { error: roleError } = await supabase.from("user_roles").insert({
    id: userId,
    role: "client",
  });
  if (roleError) throw roleError;

  // 5. Update user_profiles
  const { error: profileError } = await supabase.from("user_profiles").update({
    username: params.name,
  }).eq("id", userId);
  if (profileError) throw profileError;
}

export async function updateClientStatus(clientId: string, status: ClientStatus): Promise<void> {
  const { error } = await supabase.from("clients").update({
    status,
    updated_at: new Date().toISOString(),
  }).eq("id", clientId);
  if (error) throw error;
}

export async function incrementClientServices(clientId: string): Promise<void> {
  const { data, error } = await supabase
    .from("clients")
    .select("services_used_this_month")
    .eq("id", clientId)
    .single();
  if (error) throw error;

  await supabase.from("clients").update({
    services_used_this_month: (data.services_used_this_month || 0) + 1,
    updated_at: new Date().toISOString(),
  }).eq("id", clientId);
}

// ─── REQUESTS ─────────────────────────────────────────────────────────────────

export async function fetchRequests(): Promise<Request[]> {
  const { data, error } = await supabase
    .from("requests")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data || []).map(mapRequestRow);
}

export async function fetchRequestsByClient(clientId: string): Promise<Request[]> {
  const { data, error } = await supabase
    .from("requests")
    .select("*")
    .eq("client_id", clientId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data || []).map(mapRequestRow);
}

export async function createRequest(req: Omit<ServiceRequest, "id" | "createdAt" | "updatedAt"> | Omit<CoverageRequest, "id" | "createdAt" | "updatedAt">): Promise<void> {
  const payload: any = {
    client_id: req.clientId,
    client_name: req.clientName,
    type: req.type,
    description: req.description,
    status: req.status,
  };

  if (req.type === "service") {
    const s = req as Omit<ServiceRequest, "id" | "createdAt" | "updatedAt">;
    payload.service_type = s.serviceType;
    payload.desired_date = s.desiredDate;
  } else {
    const c = req as Omit<CoverageRequest, "id" | "createdAt" | "updatedAt">;
    payload.coverage_type = c.coverageType;
    payload.estimated_loss = c.estimatedLoss;
    payload.evidence_urls = c.evidenceUrls;
  }

  const { error } = await supabase.from("requests").insert(payload);
  if (error) throw error;
}

export async function updateRequest(requestId: string, updates: {
  status?: RequestStatus;
  adminNotes?: string;
  approvedAmount?: number;
}): Promise<void> {
  const payload: any = { updated_at: new Date().toISOString() };
  if (updates.status !== undefined) payload.status = updates.status;
  if (updates.adminNotes !== undefined) payload.admin_notes = updates.adminNotes;
  if (updates.approvedAmount !== undefined) payload.approved_amount = updates.approvedAmount;

  const { error } = await supabase.from("requests").update(payload).eq("id", requestId);
  if (error) throw error;
}
