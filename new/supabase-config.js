// supabase/config.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database Schema Setup (SQL)
// Run these in Supabase SQL Editor:

/*
-- Users table (extends Supabase auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  name TEXT,
  email TEXT,
  phone TEXT,
  mess_qr TEXT,
  profile_pic TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Settings table
CREATE TABLE public.user_settings (
  user_id UUID REFERENCES auth.users PRIMARY KEY,
  notify_listing_sold BOOLEAN DEFAULT true,
  notify_listing_resumed BOOLEAN DEFAULT true,
  notify_auction_won BOOLEAN DEFAULT true,
  notify_auction_lost BOOLEAN DEFAULT false,
  notify_lost_auction_resumes BOOLEAN DEFAULT true,
  notify_price_reduced BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Listings table
CREATE TABLE public.listings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seller_id UUID REFERENCES auth.users NOT NULL,
  mess TEXT NOT NULL,
  meal_time TEXT NOT NULL,
  date DATE NOT NULL,
  is_auction BOOLEAN DEFAULT false,
  target_price DECIMAL(10,2) NOT NULL,
  current_price DECIMAL(10,2) NOT NULL,
  price_drop_amount DECIMAL(10,2) DEFAULT 0,
  price_drop_interval INTEGER DEFAULT 5,
  auction_duration INTEGER DEFAULT 3,
  longer_bids BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'active',
  end_time TIMESTAMP NOT NULL,
  drop_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Bids table
CREATE TABLE public.bids (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id UUID REFERENCES public.listings NOT NULL,
  bidder_id UUID REFERENCES auth.users NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Notifications table
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Payments table
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id UUID REFERENCES public.listings NOT NULL,
  buyer_id UUID REFERENCES auth.users NOT NULL,
  seller_id UUID REFERENCES auth.users NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pending',
  upi_transaction_id TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_listings_seller ON public.listings(seller_id);
CREATE INDEX idx_listings_status ON public.listings(status);
CREATE INDEX idx_listings_end_time ON public.listings(end_time);
CREATE INDEX idx_bids_listing ON public.bids(listing_id);
CREATE INDEX idx_bids_bidder ON public.bids(bidder_id);
CREATE INDEX idx_notifications_user ON public.notifications(user_id);

-- Row Level Security (RLS) Policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Settings policies
CREATE POLICY "Users can view own settings" ON public.user_settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own settings" ON public.user_settings FOR UPDATE USING (auth.uid() = user_id);

-- Listings policies
CREATE POLICY "Anyone can view active listings" ON public.listings FOR SELECT USING (status = 'active');
CREATE POLICY "Users can create listings" ON public.listings FOR INSERT WITH CHECK (auth.uid() = seller_id);
CREATE POLICY "Users can update own listings" ON public.listings FOR UPDATE USING (auth.uid() = seller_id);

-- Bids policies
CREATE POLICY "Users can view bids on listings" ON public.bids FOR SELECT USING (true);
CREATE POLICY "Users can create bids" ON public.bids FOR INSERT WITH CHECK (auth.uid() = bidder_id);
CREATE POLICY "Users can delete own bids" ON public.bids FOR DELETE USING (auth.uid() = bidder_id);

-- Notifications policies
CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);

-- Payments policies
CREATE POLICY "Users can view own payments" ON public.payments FOR SELECT USING (auth.uid() = buyer_id OR auth.uid() = seller_id);
CREATE POLICY "Users can create payments" ON public.payments FOR INSERT WITH CHECK (auth.uid() = buyer_id);
*/

// API Functions
export const api = {
  // Profile
  async getProfile(userId) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    return { data, error }
  },

  async updateProfile(userId, updates) {
    const { data, error } = await supabase
      .from('profiles')
      .update({ ...updates, updated_at: new Date() })
      .eq('id', userId)
      .select()
      .single()
    return { data, error }
  },

  async uploadProfilePic(userId, file) {
    const fileExt = file.name.split('.').pop()
    const fileName = `${userId}.${fileExt}`
    const { data, error } = await supabase.storage
      .from('profile-pics')
      .upload(fileName, file, { upsert: true })
    
    if (error) return { data: null, error }
    
    const { data: { publicUrl } } = supabase.storage
      .from('profile-pics')
      .getPublicUrl(fileName)
    
    return { data: publicUrl, error: null }
  },

  // Settings
  async getSettings(userId) {
    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', userId)
      .single()
    return { data, error }
  },

  async updateSettings(userId, settings) {
    const { data, error } = await supabase
      .from('user_settings')
      .upsert({ user_id: userId, ...settings, updated_at: new Date() })
      .select()
      .single()
    return { data, error }
  },

  // Listings
  async createListing(listingData) {
    const { data, error } = await supabase
      .from('listings')
      .insert([listingData])
      .select()
      .single()
    return { data, error }
  },

  async getListings(filters = {}) {
    let query = supabase
      .from('listings')
      .select('*, bids(*), profiles!seller_id(*)')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
    
    if (filters.mess) query = query.eq('mess', filters.mess)
    if (filters.dateFrom) query = query.gte('date', filters.dateFrom)
    if (filters.dateTo) query = query.lte('date', filters.dateTo)
    
    const { data, error } = await query
    return { data, error }
  },

  async updateListing(listingId, updates) {
    const { data, error } = await supabase
      .from('listings')
      .update({ ...updates, updated_at: new Date() })
      .eq('id', listingId)
      .select()
      .single()
    return { data, error }
  },

  async deleteListing(listingId) {
    const { data, error } = await supabase
      .from('listings')
      .update({ status: 'unlisted', updated_at: new Date() })
      .eq('id', listingId)
      .select()
      .single()
    return { data, error }
  },

  // Bids
  async placeBid(listingId, bidderId, amount) {
    const { data, error } = await supabase
      .from('bids')
      .insert([{ listing_id: listingId, bidder_id: bidderId, amount }])
      .select()
      .single()
    return { data, error }
  },

  async withdrawBids(listingId, bidderId) {
    const { data, error } = await supabase
      .from('bids')
      .delete()
      .eq('listing_id', listingId)
      .eq('bidder_id', bidderId)
      .select()
    return { data, error }
  },

  // Notifications
  async createNotification(userId, title, message) {
    const { data, error } = await supabase
      .from('notifications')
      .insert([{ user_id: userId, title, message }])
      .select()
      .single()
    return { data, error }
  },

  async getNotifications(userId) {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .eq('read', false)
      .order('created_at', { ascending: false })
    return { data, error }
  },

  async markNotificationRead(notificationId) {
    const { data, error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId)
      .select()
      .single()
    return { data, error }
  },

  // Payments
  async createPayment(listingId, buyerId, sellerId, amount) {
    const { data, error } = await supabase
      .from('payments')
      .insert([{ listing_id: listingId, buyer_id: buyerId, seller_id: sellerId, amount }])
      .select()
      .single()
    return { data, error }
  },

  async updatePayment(paymentId, status, transactionId = null) {
    const updates = { status, updated_at: new Date() }
    if (status === 'completed') {
      updates.completed_at = new Date()
      if (transactionId) updates.upi_transaction_id = transactionId
    }
    
    const { data, error } = await supabase
      .from('payments')
      .update(updates)
      .eq('id', paymentId)
      .select()
      .single()
    return { data, error }
  },

  // Real-time subscriptions
  subscribeToListings(callback) {
    return supabase
      .channel('listings-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'listings' }, callback)
      .subscribe()
  },

  subscribeToBids(listingId, callback) {
    return supabase
      .channel(`bids-${listingId}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'bids',
        filter: `listing_id=eq.${listingId}`
      }, callback)
      .subscribe()
  },

  subscribeToNotifications(userId, callback) {
    return supabase
      .channel(`notifications-${userId}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'notifications',
        filter: `user_id=eq.${userId}`
      }, callback)
      .subscribe()
  }
}

// Helper function for auction logic with 2-drop rule
export async function handlePriceDropLogic(listing) {
  const bids = await supabase
    .from('bids')
    .select('amount')
    .eq('listing_id', listing.id)
    .order('amount', { ascending: false })
  
  const highestBid = bids.data?.[0]?.amount || 0
  
  // Non-auction mode with 2-drop rule
  if (!listing.is_auction && highestBid > 0 && highestBid < listing.current_price) {
    if (listing.drop_count < 2) {
      const newPrice = Math.max(highestBid, listing.current_price - listing.price_drop_amount)
      await api.updateListing(listing.id, {
        current_price: newPrice,
        drop_count: listing.drop_count + 1,
        end_time: new Date(Date.now() + listing.price_drop_interval * 60000)
      })
      
      // Notify seller
      await api.createNotification(
        listing.seller_id,
        'Price Reduced',
        `${listing.mess} price dropped to ₹${newPrice}`
      )
    } else {
      // After 2 drops, sell to highest bidder
      await api.updateListing(listing.id, { status: 'sold' })
      const highestBidder = bids.data?.[0]
      if (highestBidder) {
        await api.createNotification(
          highestBidder.bidder_id,
          'Auction Won!',
          `You won ${listing.mess} for ₹${highestBid}`
        )
      }
    }
  }
}