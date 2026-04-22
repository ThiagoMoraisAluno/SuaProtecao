import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const body = await req.json();
    const { action, email, password, name, role, commission, supervisorId, planId, cpf, phone, address, assets, totalAssetsValue } = body;

    if (action === "create_user") {
      // Create auth user
      const { data: userData, error: userError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        user_metadata: { full_name: name, username: name },
        email_confirm: true,
      });

      if (userError) throw userError;
      const userId = userData.user.id;

      // Assign role
      await supabaseAdmin.from("user_roles").insert({ id: userId, role });

      // Create role-specific record
      if (role === "supervisor") {
        await supabaseAdmin.from("supervisors").insert({ id: userId, commission: commission || 10 });
      } else if (role === "client") {
        await supabaseAdmin.from("clients").insert({
          id: userId,
          cpf,
          phone,
          plan_id: planId,
          supervisor_id: supervisorId,
          status: "active",
          total_assets_value: totalAssetsValue || 0,
          address_street: address?.street,
          address_number: address?.number,
          address_complement: address?.complement,
          address_neighborhood: address?.neighborhood,
          address_city: address?.city,
          address_state: address?.state,
          address_zip_code: address?.zipCode,
        });

        if (assets && assets.length > 0) {
          await supabaseAdmin.from("client_assets").insert(
            assets.map((a: any) => ({
              client_id: userId,
              name: a.name,
              estimated_value: a.estimatedValue,
            }))
          );
        }
      } else if (role === "admin") {
        // nothing extra needed
      }

      // Update profile username
      await supabaseAdmin.from("user_profiles").update({ username: name }).eq("id", userId);

      return new Response(
        JSON.stringify({ success: true, userId }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "seed_admin") {
      // Create admin user
      const { data: userData, error: userError } = await supabaseAdmin.auth.admin.createUser({
        email: "admin@demo.com",
        password: "123456",
        user_metadata: { full_name: "Admin Master", username: "admin" },
        email_confirm: true,
      });

      if (userError && !userError.message.includes("already registered")) throw userError;

      const userId = userData?.user?.id;
      if (userId) {
        await supabaseAdmin.from("user_roles").insert({ id: userId, role: "admin" }).onConflict("id").ignoreDuplicates();
        await supabaseAdmin.from("user_profiles").update({ username: "admin" }).eq("id", userId);
      }

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    throw new Error("Unknown action");
  } catch (error: any) {
    console.error("admin-actions error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
