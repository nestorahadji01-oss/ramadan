// Supabase Edge Function for Chariow Webhook
// This function receives payment notifications from Chariow and creates activation codes

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// CORS headers for preflight requests
const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Chariow payload interfaces
interface ChariowCustomer {
    id: string;
    name: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    country: string;
    created_at: string;
}

interface ChariowSale {
    id: string;
    amount: number;
    status: string;
    created_at: string;
    completed_at: string;
}

interface ChariowProduct {
    id: string;
    name: string;
    url: string;
    price: number;
}

interface ChariowWebhookPayload {
    event: string;
    sale: ChariowSale;
    product: ChariowProduct;
    customer: ChariowCustomer;
    store: {
        id: string;
        name: string;
        url: string;
        created_at: string;
    };
    note?: string;
}

// Normalize phone number to consistent format
function normalizePhoneNumber(phone: string): string {
    // Remove all non-digit characters except +
    let normalized = phone.replace(/[^\d+]/g, "");

    // Ensure it starts with a +
    if (!normalized.startsWith("+")) {
        normalized = "+" + normalized;
    }

    return normalized;
}

serve(async (req) => {
    // Handle CORS preflight requests
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        // Only accept POST requests
        if (req.method !== "POST") {
            return new Response(
                JSON.stringify({ success: false, message: "Method not allowed" }),
                { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        // Parse the webhook payload
        const payload: ChariowWebhookPayload = await req.json();

        console.log("📨 Received Chariow webhook:", payload.event);

        // Verify this is a successful sale event
        if (payload.event !== "successful.sale") {
            console.log("⏭️ Ignoring event type:", payload.event);
            return new Response(
                JSON.stringify({ success: true, message: "Event type not handled" }),
                { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        // Validate required fields
        if (!payload.customer?.phone) {
            console.error("❌ Missing customer phone number");
            return new Response(
                JSON.stringify({ success: false, message: "Missing customer phone number" }),
                { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        if (!payload.sale?.id) {
            console.error("❌ Missing sale ID");
            return new Response(
                JSON.stringify({ success: false, message: "Missing sale ID" }),
                { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        // Create Supabase client with service role key (server-side only)
        const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
        const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        // Normalize phone number
        const normalizedPhone = normalizePhoneNumber(payload.customer.phone);

        // Check if activation code already exists for this phone
        const { data: existing } = await supabase
            .from("activation_codes")
            .select("id")
            .eq("phone", normalizedPhone)
            .single();

        if (existing) {
            console.log("ℹ️ Activation code already exists for:", normalizedPhone);
            return new Response(
                JSON.stringify({
                    success: true,
                    message: "Activation code already exists",
                    data: { phone: normalizedPhone }
                }),
                { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        // Create new activation code
        const customerName = payload.customer.name ||
            `${payload.customer.first_name || ""} ${payload.customer.last_name || ""}`.trim() ||
            "Client";

        const { error } = await supabase
            .from("activation_codes")
            .insert({
                phone: normalizedPhone,
                order_id: payload.sale.id,
                customer_name: customerName,
                customer_email: payload.customer.email || null,
                device_id: null,
                used: false,
            });

        if (error) {
            console.error("❌ Database error:", error);
            return new Response(
                JSON.stringify({ success: false, message: error.message }),
                { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        console.log(`✅ Activation code created for ${normalizedPhone} (Order: ${payload.sale.id})`);

        return new Response(
            JSON.stringify({
                success: true,
                message: "Activation code created successfully",
                data: {
                    phone: normalizedPhone,
                    order_id: payload.sale.id,
                    customer_name: customerName,
                },
            }),
            { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );

    } catch (error) {
        console.error("❌ Webhook error:", error);
        return new Response(
            JSON.stringify({ success: false, message: "Internal server error" }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
});
