-- Migration: Create marketplace tables
-- Run this SQL in Supabase SQL Editor or via API

-- 1. Create marketplace_listings table
CREATE TABLE IF NOT EXISTS marketplace_listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL,
    seller_id UUID NOT NULL,
    price NUMERIC(10,2) NOT NULL,
    original_price NUMERIC(10,2) NOT NULL,
    commission_rate NUMERIC(5,2) DEFAULT 7.5,
    status VARCHAR(20) DEFAULT 'available' CHECK (status IN ('available', 'sold', 'cancelled', 'expired')),
    buyer_id UUID,
    stripe_payment_intent_id VARCHAR(255),
    payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded', 'failed')),
    title VARCHAR(255),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days')
);

-- 2. Create marketplace_commissions table
CREATE TABLE IF NOT EXISTS marketplace_commissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID NOT NULL,
    seller_id UUID NOT NULL,
    buyer_id UUID,
    sale_price NUMERIC(10,2) NOT NULL,
    commission_amount NUMERIC(10,2) NOT NULL,
    seller_amount NUMERIC(10,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'cancelled')),
    payout_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Add columns to bookings table if they don't exist
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS is_resellable BOOLEAN DEFAULT FALSE;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS resold_from UUID REFERENCES bookings(id);

-- 4. Create indexes
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_seller ON marketplace_listings(seller_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_status ON marketplace_listings(status);
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_booking ON marketplace_listings(booking_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_expires ON marketplace_listings(expires_at);
CREATE INDEX IF NOT EXISTS idx_marketplace_commissions_seller ON marketplace_commissions(seller_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_commissions_listing ON marketplace_commissions(listing_id);
