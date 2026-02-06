import { NextRequest, NextResponse } from 'next/server';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Create admin client server-side with service_role key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabaseAdmin: SupabaseClient | null = null;

if (supabaseUrl && supabaseServiceRoleKey) {
    supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    });
}

// Normalize phone number to consistent format
function normalizePhoneNumber(phone: string): string {
    let normalized = phone.replace(/[^\d+]/g, '');
    if (!normalized.startsWith('+')) {
        normalized = '+' + normalized;
    }
    return normalized;
}

/**
 * POST: Activate a code with device binding
 * Uses service_role key to bypass RLS
 */
export async function POST(request: NextRequest) {
    try {
        if (!supabaseAdmin) {
            console.error('Missing SUPABASE_SERVICE_ROLE_KEY');
            return NextResponse.json(
                { success: false, error: 'Configuration serveur manquante' },
                { status: 500 }
            );
        }

        const body = await request.json();
        const { phone, deviceId } = body;

        if (!phone || !deviceId) {
            return NextResponse.json(
                { success: false, error: 'Téléphone et deviceId requis' },
                { status: 400 }
            );
        }

        const normalizedPhone = normalizePhoneNumber(phone);

        // Get the current activation code data
        const { data: currentData, error: fetchError } = await supabaseAdmin
            .from('activation_codes')
            .select('*')
            .eq('phone', normalizedPhone)
            .single();

        if (fetchError || !currentData) {
            console.error('Code not found for:', normalizedPhone, fetchError);
            return NextResponse.json(
                { success: false, error: 'Code d\'activation introuvable pour ce numéro.' },
                { status: 404 }
            );
        }

        // Check if already activated on a different device
        if (currentData.used && currentData.device_id && currentData.device_id !== deviceId) {
            return NextResponse.json(
                { success: false, error: 'Ce numéro est déjà activé sur un autre appareil.' },
                { status: 403 }
            );
        }

        // Build profile response
        const profile = {
            phone: currentData.phone,
            name: currentData.customer_name,
            firstName: currentData.customer_name?.split(' ')[0] || null,
            email: currentData.customer_email,
        };

        // If already activated on same device, just return success
        if (currentData.used && currentData.device_id === deviceId) {
            return NextResponse.json({
                success: true,
                message: 'Déjà activé sur cet appareil',
                data: {
                    phone: normalizedPhone,
                    deviceId,
                    activatedAt: currentData.used_at,
                    profile,
                }
            });
        }

        // Activate the code with service_role (bypasses RLS)
        const { error: updateError } = await supabaseAdmin
            .from('activation_codes')
            .update({
                used: true,
                used_at: new Date().toISOString(),
                device_id: deviceId,
            })
            .eq('phone', normalizedPhone);

        if (updateError) {
            console.error('Activation update error:', updateError);
            return NextResponse.json(
                { success: false, error: 'Erreur lors de l\'activation.' },
                { status: 500 }
            );
        }

        console.log('✅ Activated:', normalizedPhone, 'on device:', deviceId);

        return NextResponse.json({
            success: true,
            message: 'Application activée avec succès!',
            data: {
                phone: normalizedPhone,
                deviceId,
                activatedAt: new Date().toISOString(),
                profile,
            },
        });

    } catch (error) {
        console.error('Activation API error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
        return NextResponse.json(
            { success: false, error: `Erreur serveur: ${errorMessage}` },
            { status: 500 }
        );
    }
}

/**
 * GET: Check activation status for a phone number
 */
export async function GET(request: NextRequest) {
    try {
        if (!supabaseAdmin) {
            return NextResponse.json(
                { valid: false, error: 'Configuration serveur manquante' },
                { status: 500 }
            );
        }

        const searchParams = request.nextUrl.searchParams;
        const phone = searchParams.get('phone');
        const deviceId = searchParams.get('deviceId');

        if (!phone) {
            return NextResponse.json(
                { valid: false, error: 'Numéro de téléphone requis' },
                { status: 400 }
            );
        }

        const normalizedPhone = normalizePhoneNumber(phone);

        const { data, error } = await supabaseAdmin
            .from('activation_codes')
            .select('*')
            .eq('phone', normalizedPhone)
            .single();

        if (error || !data) {
            return NextResponse.json({
                valid: false,
                error: 'Code d\'activation introuvable pour ce numéro.',
            });
        }

        // Check if already used on a different device
        if (data.used && data.device_id && deviceId && data.device_id !== deviceId) {
            return NextResponse.json({
                valid: false,
                error: 'Ce numéro est déjà activé sur un autre appareil.',
            });
        }

        const profile = {
            phone: data.phone,
            name: data.customer_name,
            firstName: data.customer_name?.split(' ')[0] || null,
            email: data.customer_email,
        };

        return NextResponse.json({
            valid: true,
            profile,
        });

    } catch (error) {
        console.error('Verify API error:', error);
        return NextResponse.json(
            { valid: false, error: 'Erreur de vérification.' },
            { status: 500 }
        );
    }
}
