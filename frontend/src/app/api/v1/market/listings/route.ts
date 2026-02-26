import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
    try {
        const { data: listings, error } = await supabaseAdmin
            .from('market_listings')
            .select('*')
            .eq('status', 'OPEN');

        if (error) throw error;

        return NextResponse.json({
            status: 'success',
            message: 'Listings berhasil diambil',
            data: listings || []
        }, { status: 200 });

    } catch (error: any) {
        console.error('Listings error:', error);
        return NextResponse.json(
            { status: 'error', message: 'Failed to fetch market listings' },
            { status: 500 }
        );
    }
}
