// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

// Fix for Vite environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string || ''

// Check if credentials exist
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase credentials. Please check your .env file.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Type definitions
interface Profile {
  id: string
  name: string | null
  email: string | null
  phone: string | null
  mess_qr: string | null
  profile_pic: string | null
  created_at: string
  updated_at: string
}

interface Settings {
  user_id: string
  notify_listing_sold: boolean
  notify_listing_resumed: boolean
  notify_auction_won: boolean
  notify_auction_lost: boolean
  notify_lost_auction_resumes: boolean
  notify_price_reduced: boolean
  created_at: string
  updated_at: string
}

interface Listing {
  id: string
  seller_id: string
  mess: string
  meal_time: string
  date: string
  is_auction: boolean
  target_price: number
  current_price: number
  price_drop_amount: number
  price_drop_interval: number
  auction_duration: number
  longer_bids: boolean
  status: string
  end_time: string
  drop_count: number
  created_at: string
  updated_at: string
  bids?: Bid[]
  profiles?: Profile
}

interface Bid {
  id: string
  listing_id: string
  bidder_id: string
  amount: number
  created_at: string
}

// API Functions
export const api = {
  // Profile
  async getProfile(userId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    return { data, error }
  },

  async updateProfile(userId: string, updates: Partial<Profile>) {
    const { data, error } = await supabase
      .from('profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select()
      .single()
    return { data, error }
  },

  async uploadProfilePic(userId: string, file: File) {
    const fileExt = file.name.split('.').pop()
    const fileName = `${userId}.${fileExt}`
    const { error } = await supabase.storage
      .from('profile-pics')
      .upload(fileName, file, { upsert: true })
    
    if (error) return { data: null, error }
    
    const { data: urlData } = supabase.storage
      .from('profile-pics')
      .getPublicUrl(fileName)
    
    return { data: urlData.publicUrl, error: null }
  },

  // Settings
  async getSettings(userId: string) {
    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', userId)
      .single()
    return { data, error }
  },

  async updateSettings(userId: string, settings: Partial<Settings>) {
    const { data, error } = await supabase
      .from('user_settings')
      .upsert({ user_id: userId, ...settings, updated_at: new Date().toISOString() })
      .select()
      .single()
    return { data, error }
  },

  // Listings
  async createListing(listingData: Partial<Listing>) {
    const { data, error } = await supabase
      .from('listings')
      .insert([listingData])
      .select()
      .single()
    return { data, error }
  },

  async getListings(filters: { mess?: string; dateFrom?: string; dateTo?: string } = {}) {
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

  async updateListing(listingId: string, updates: Partial<Listing>) {
    const { data, error } = await supabase
      .from('listings')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', listingId)
      .select()
      .single()
    return { data, error }
  },

  async deleteListing(listingId: string) {
    const { data, error } = await supabase
      .from('listings')
      .update({ status: 'unlisted', updated_at: new Date().toISOString() })
      .eq('id', listingId)
      .select()
      .single()
    return { data, error }
  },

  // Bids
  async placeBid(listingId: string, bidderId: string, amount: number) {
    const { data, error } = await supabase
      .from('bids')
      .insert([{ listing_id: listingId, bidder_id: bidderId, amount }])
      .select()
      .single()
    return { data, error }
  },

  async withdrawBids(listingId: string, bidderId: string) {
    const { data, error } = await supabase
      .from('bids')
      .delete()
      .eq('listing_id', listingId)
      .eq('bidder_id', bidderId)
      .select()
    return { data, error }
  },

  // Notifications
  async createNotification(userId: string, title: string, message: string) {
    const { data, error } = await supabase
      .from('notifications')
      .insert([{ user_id: userId, title, message }])
      .select()
      .single()
    return { data, error }
  },

  async getNotifications(userId: string) {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .eq('read', false)
      .order('created_at', { ascending: false })
    return { data, error }
  },

  async markNotificationRead(notificationId: string) {
    const { data, error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId)
      .select()
      .single()
    return { data, error }
  },

  // Payments
  async createPayment(listingId: string, buyerId: string, sellerId: string, amount: number) {
    const { data, error } = await supabase
      .from('payments')
      .insert([{ listing_id: listingId, buyer_id: buyerId, seller_id: sellerId, amount }])
      .select()
      .single()
    return { data, error }
  },

  async updatePayment(paymentId: string, status: string, transactionId: string | null = null) {
    const updates: any = { status, updated_at: new Date().toISOString() }
    if (status === 'completed') {
      updates.completed_at = new Date().toISOString()
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
  subscribeToListings(callback: (payload: any) => void) {
    return supabase
      .channel('listings-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'listings' }, callback)
      .subscribe()
  },

  subscribeToBids(listingId: string, callback: (payload: any) => void) {
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

  subscribeToNotifications(userId: string, callback: (payload: any) => void) {
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
export async function handlePriceDropLogic(listing: Listing) {
  const { data: bids } = await supabase
    .from('bids')
    .select('amount, bidder_id')
    .eq('listing_id', listing.id)
    .order('amount', { ascending: false })
  
  const highestBid = bids?.[0]?.amount || 0
  
  // Non-auction mode with 2-drop rule
  if (!listing.is_auction && highestBid > 0 && highestBid < listing.current_price) {
    if (listing.drop_count < 2) {
      const newPrice = Math.max(highestBid, listing.current_price - listing.price_drop_amount)
      await api.updateListing(listing.id, {
        current_price: newPrice,
        drop_count: listing.drop_count + 1,
        end_time: new Date(Date.now() + listing.price_drop_interval * 60000).toISOString()
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
      const highestBidder = bids?.[0]
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