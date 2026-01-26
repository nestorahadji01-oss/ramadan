import { NextRequest, NextResponse } from 'next/server';
import { verifyActivationCode, activateCode, type UserProfile } from '@/lib/supabase';

/**
 * Activation API Endpoint
 * 
 * POST: Verify and activate using phone number + device_id
 * GET: Check activation status
 */

export async function POST(request: NextRequest) {
    try {
        const { phone, deviceId } = await request.json();

        if (!phone) {
            return NextResponse.json(
                { success: false, error: 'Numéro de téléphone requis' },
                { status: 400 }
            );
        }

        if (!deviceId) {
            return NextResponse.json(
                { success: false, error: 'Device ID requis' },
                { status: 400 }
            );
        }

        // Verify the phone number has a valid code
        const verification = await verifyActivationCode(phone, deviceId);

        if (!verification.valid) {
            return NextResponse.json(
                { success: false, error: verification.error },
                { status: 400 }
            );
        }

        // Activate the code with device binding
        const activation = await activateCode(phone, deviceId);

        if (!activation.success) {
            return NextResponse.json(
                { success: false, error: activation.error },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Application activée avec succès!',
            data: {
                phone,
                deviceId,
                activatedAt: new Date().toISOString(),
                profile: activation.profile,
            },
        });

    } catch (error) {
        console.error('Activation error:', error);
        return NextResponse.json(
            { success: false, error: 'Erreur serveur. Veuillez réessayer.' },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const phone = searchParams.get('phone');
    const deviceId = searchParams.get('deviceId');

    if (!phone) {
        return NextResponse.json(
            { success: false, error: 'Numéro de téléphone requis' },
            { status: 400 }
        );
    }

    const verification = await verifyActivationCode(phone, deviceId || undefined);

    return NextResponse.json({
        valid: verification.valid,
        error: verification.error,
        profile: verification.profile,
    });
}
