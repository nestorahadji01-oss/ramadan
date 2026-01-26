import { NextRequest, NextResponse } from 'next/server';
import { createActivationCode } from '@/lib/supabase';

/**
 * Chariow Webhook Handler
 * 
 * This endpoint receives webhook data from Chariow when a sale is completed.
 * It creates an activation code in Supabase using the customer's phone number.
 * 
 * Expected payload structure from Chariow:
 * {
 *   event: "successful.sale",
 *   sale: { id, amount, status, created_at, completed_at },
 *   product: { id, name, url, price },
 *   customer: { id, name, first_name, last_name, email, phone, country, created_at },
 *   store: { id, name, url, created_at },
 *   note: string
 * }
 */

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

export async function POST(request: NextRequest) {
    try {
        const payload: ChariowWebhookPayload = await request.json();

        // Verify this is a successful sale event
        if (payload.event !== 'successful.sale') {
            return NextResponse.json(
                { success: false, message: 'Event type not handled' },
                { status: 200 }
            );
        }

        // Validate required fields
        if (!payload.customer?.phone) {
            return NextResponse.json(
                { success: false, message: 'Missing customer phone number' },
                { status: 400 }
            );
        }

        if (!payload.sale?.id) {
            return NextResponse.json(
                { success: false, message: 'Missing sale ID' },
                { status: 400 }
            );
        }

        // Create activation code in Supabase
        const result = await createActivationCode({
            phone: payload.customer.phone,
            order_id: payload.sale.id,
            customer_name: payload.customer.name || `${payload.customer.first_name} ${payload.customer.last_name}`,
            customer_email: payload.customer.email,
        });

        if (!result.success) {
            console.error('Failed to create activation code:', result.error);
            return NextResponse.json(
                { success: false, message: result.error },
                { status: 500 }
            );
        }

        console.log(`✅ Activation code created for ${payload.customer.phone} (Order: ${payload.sale.id})`);

        return NextResponse.json({
            success: true,
            message: 'Activation code created successfully',
            data: {
                phone: payload.customer.phone,
                order_id: payload.sale.id,
            },
        });

    } catch (error) {
        console.error('Webhook error:', error);
        return NextResponse.json(
            { success: false, message: 'Internal server error' },
            { status: 500 }
        );
    }
}

// Health check endpoint
export async function GET() {
    return NextResponse.json({
        status: 'ok',
        message: 'Chariow webhook endpoint is active',
        timestamp: new Date().toISOString(),
    });
}
