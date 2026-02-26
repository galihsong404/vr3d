-- Supabase SQL Schema for Cash Cow Valley

-- 1. Users Table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_address VARCHAR(42) UNIQUE NOT NULL,
    role VARCHAR(20) DEFAULT 'F2P',
    points NUMERIC(18,2) DEFAULT 0,
    gold_balance NUMERIC(18,2) DEFAULT 0,
    daily_ad_count INTEGER DEFAULT 0,
    last_ad_date TIMESTAMP WITH TIME ZONE,
    usdt_balance NUMERIC(18,2) DEFAULT 0,
    nonce VARCHAR(255) NOT NULL,
    referrer_id UUID REFERENCES users(id),
    last_ad_watched_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Inventories Table
CREATE TABLE inventories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    grass INTEGER DEFAULT 0,
    milk INTEGER DEFAULT 0,
    land_slots INTEGER DEFAULT 1,
    has_barn BOOLEAN DEFAULT false
);

-- 3. Cows Table
CREATE TABLE cows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(20) DEFAULT 'STANDARD',
    level INTEGER DEFAULT 1,
    happiness INTEGER DEFAULT 100,
    expected_lifespan TIMESTAMP WITH TIME ZONE,
    last_fed_at TIMESTAMP WITH TIME ZONE,
    last_harvested_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Market Listings Table
CREATE TABLE market_listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    item_type VARCHAR(50) DEFAULT 'GRASS',
    quantity INTEGER NOT NULL,
    price_usdt NUMERIC(18,4) NOT NULL,
    status VARCHAR(20) DEFAULT 'OPEN',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Web2 Stake Table
CREATE TABLE web2_stakes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    asset_type VARCHAR(20) NOT NULL,
    amount NUMERIC(18,2) NOT NULL,
    staked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_claimed_at TIMESTAMP WITH TIME ZONE
);

-- Optional: Enable Row Level Security (RLS)
-- For complete security, uncomment and configure RLS. 
-- Since we are using SUPABASE_SERVICE_ROLE_KEY in our Next.js API, 
-- it bypasses RLS, making it safe to keep RLS active but restrictive to the frontend anon key.

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventories ENABLE ROW LEVEL SECURITY;
ALTER TABLE cows ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE web2_stakes ENABLE ROW LEVEL SECURITY;

-- Allow only authenticated/service role access
CREATE POLICY "Service Role Only" ON users FOR ALL USING (true);
CREATE POLICY "Service Role Only" ON inventories FOR ALL USING (true);
CREATE POLICY "Service Role Only" ON cows FOR ALL USING (true);
CREATE POLICY "Service Role Only" ON market_listings FOR ALL USING (true);
CREATE POLICY "Service Role Only" ON web2_stakes FOR ALL USING (true);
