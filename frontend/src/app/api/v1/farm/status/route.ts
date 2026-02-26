import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: Request) {
    try {
        // Authenticate the request
        const { auth, error: authError } = await requireAuth(request);
        if (authError) return authError;
        if (!auth) throw new Error('Auth context missing');

        // Fetch User Stats
        const { data: user, error: userError } = await supabaseAdmin
            .from('users')
            .select('points, usdt_balance, gold_balance')
            .eq('id', auth.userId)
            .single();

        if (userError) throw userError;

        // Fetch Inventory
        const { data: inventory, error: invError } = await supabaseAdmin
            .from('inventories')
            .select('grass, milk, land_slots, has_barn')
            .eq('user_id', auth.userId)
            .single();

        if (invError) throw invError;

        // Fetch Cows count
        const { count: cowCount, error: cowError } = await supabaseAdmin
            .from('cows')
            .select('*', { count: 'exact', head: true })
            .eq('owner_id', auth.userId);

        if (cowError) throw cowError;

        return NextResponse.json({
            status: 'success',
            data: {
                inventory: {
                    ...inventory,
                    cows_owned: cowCount || 0,
                },
                stats: {
                    experience_points: user.points || 0,
                    level: 1, // Calculate based on points later
                    usdt_balance: user.usdt_balance || 0,
                    gold_balance: user.gold_balance || 0,
                }
            }
        }, { status: 200 });

    } catch (error: any) {
        console.error('Farm status error:', error);
        return NextResponse.json(
            { status: 'error', message: 'Failed to fetch farm status' },
            { status: 500 }
        );
    }
}
