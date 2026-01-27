import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * Check if a device fingerprint is already activated
 * GET /api/check-device?fingerprint=xxx
 */
export async function GET(request: NextRequest) {
    const fingerprint = request.nextUrl.searchParams.get('fingerprint');

    if (!fingerprint) {
        return NextResponse.json({ activated: false, error: 'Fingerprint required' });
    }

    try {
        // Look for an activation with this device fingerprint
        const { data, error } = await supabase
            .from('activation_codes')
            .select('*')
            .eq('device_id', fingerprint)
            .eq('used', true)
            .single();

        if (error || !data) {
            return NextResponse.json({ activated: false });
        }

        // Device is activated!
        return NextResponse.json({
            activated: true,
            phone: data.phone,
            profile: {
                phone: data.phone,
                name: data.customer_name,
                firstName: data.customer_name?.split(' ')[0] || null,
                email: data.customer_email,
            },
        });
    } catch (err) {
        console.error('Check device error:', err);
        return NextResponse.json({ activated: false });
    }
}
