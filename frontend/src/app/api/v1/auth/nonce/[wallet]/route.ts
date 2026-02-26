import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';

export async function GET(
    request: Request,
    { params }: { params: { wallet: string } }
) {
    try {
        const walletAddress = params.wallet.toLowerCase().trim();

        if (!walletAddress) {
            return NextResponse.json({ error: 'Wallet address is required' }, { status: 400 });
        }

        // Check if user exists
        const { data: user, error: userError } = await supabaseAdmin
            .from('users')
            .select('id, wallet_address')
            .eq('wallet_address', walletAddress)
            .single();

        let exists = true;

        if (userError && userError.code === 'PGRST116') {
            // User not found (PostgREST code for zero rows)
            exists = false;
        } else if (userError) {
            throw userError;
        }

        // Generate a new nonce
        const newNonce = uuidv4();

        if (exists && user) {
            // Update the existing user's nonce
            const { error: updateError } = await supabaseAdmin
                .from('users')
                .update({ nonce: newNonce })
                .eq('wallet_address', walletAddress);

            if (updateError) throw updateError;
        } else {
            // For new users, we just return a nonce. We don't save it to the DB yet
            // until they actually sign and login (to prevent filling the DB with ghost wallets).
            // But if we want to follow the Go backend logic closely, we might want to temporarily store it.
            // In a truly stateless JWT setup, the nonce would be stored in a short-lived cache (Redis) or a temp table.
            // For simplicity and matching the Go behavior (which said: "stored temporarily" but actually returned it without saving),
            // we will just return the generated nonce.
        }

        return NextResponse.json({
            nonce: newNonce,
            exists: exists,
        }, { status: 200 });

    } catch (error: any) {
        console.error('Error generating nonce:', error);
        return NextResponse.json({ error: 'Failed to generate nonce' }, { status: 500 });
    }
}
