import { NextRequest, NextResponse } from 'next/server';
import { createActivationCode } from '@/lib/supabase';

/**
 * Admin endpoint to manually add activation codes
 * 
 * This is useful for:
 * - Testing the activation flow
 * - Adding codes manually for customers
 * - Bypassing Chariow webhook during development
 * 
 * POST /api/admin/add-code
 * Body: { phone: string, order_id?: string, customer_name?: string }
 */

export async function POST(request: NextRequest) {
    try {
        // In production, you would add authentication here
        // For now, we'll use a simple secret key
        const adminKey = request.headers.get('x-admin-key');
        const expectedKey = process.env.ADMIN_SECRET_KEY || 'ramadan-admin-2024';

        if (adminKey !== expectedKey) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { phone, order_id, customer_name, customer_email } = body;

        if (!phone) {
            return NextResponse.json(
                { success: false, error: 'Phone number is required' },
                { status: 400 }
            );
        }

        const result = await createActivationCode({
            phone,
            order_id: order_id || `MANUAL-${Date.now()}`,
            customer_name: customer_name || 'Manual Entry',
            customer_email: customer_email || undefined,
        });

        if (!result.success) {
            return NextResponse.json(
                { success: false, error: result.error },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message: `Activation code created for ${phone}`,
            data: { phone },
        });

    } catch (error) {
        console.error('Add code error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function GET() {
    return NextResponse.json({
        message: 'Use POST to add an activation code',
        example: {
            phone: '+221771234567',
            order_id: 'optional',
            customer_name: 'optional',
        },
        headers: {
            'x-admin-key': 'your-admin-key',
        },
    });
}
