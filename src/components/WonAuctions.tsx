import { useState, useEffect } from 'react';
import { Trophy, Calendar, IndianRupee, QrCode, Package, Star, AlertTriangle, Eye } from 'lucide-react';

interface Bid {
  id: number;
  amount: number;
  bidder: string;
  timestamp: number;
}

interface Listing {
  id: number;
  mess: string;
  mealTime: string;
  date: string;
  isAuction: boolean;
  targetPrice: number;
  currentPrice: number;
  bids: Bid[];
  status: string;
  createdAt: number;
  sellerName: string;
  sellerId: string;
  messQR?: string | null;
  upiQR?: string | null;
}

interface WonAuctionsProps {
  darkMode: boolean;
  currentUser: { id: string; name: string; email: string };
  listings: Listing[];
  onRateUser: (target: { userId: string; userName: string; listingId: string; transactionType: 'buyer' | 'seller' }) => void;
  onReportUser: (target: { userId: string; userName: string; listingId?: string }) => void;
  onViewRating: (userId: string) => void;
}

export default function WonAuctions({ 
  darkMode, 
  currentUser, 
  listings,
  onRateUser,
  onReportUser,
  onViewRating
}: WonAuctionsProps) {
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('all');
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);

  // Get listings where user won (highest bid and status is sold)
  const wonListings = listings.filter(listing => {
    if (listing.status !== 'sold') return false;
    
    const userBids = listing.bids.filter(b => b.bidder === currentUser.name);
    if (userBids.length === 0) return false;
    
    const topBid = Math.max(...listing.bids.map(b => b.amount));
    const userTopBid = Math.max(...userBids.map(b => b.amount));
    
    return userTopBid === topBid;
  });

  // Filter by date
  const filteredListings = wonListings.filter(listing => {
    const listingDate = new Date(listing.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (filter === 'upcoming') {
      return listingDate >= today;
    } else if (filter === 'past') {
      return listingDate < today;
    }
    return true;
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const totalSpent = wonListings.reduce((sum, l) => sum + l.currentPrice, 0);
  const avgPrice = wonListings.length > 0 ? (totalSpent / wonListings.length).toFixed(0) : 0;

  return (
    <div className="space-y-6">
      {/* Header & Stats */}
      <div>
        <h2 className="text-2xl font-bold mb-2">Won Auctions</h2>
        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Listings you've successfully won
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={`p-6 rounded-lg border-2 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
              <Trophy className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Wins</p>
              <p className="text-2xl font-bold">{wonListings.length}</p>
            </div>
          </div>
        </div>

        <div className={`p-6 rounded-lg border-2 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <IndianRupee className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Spent</p>
              <p className="text-2xl font-bold">₹{totalSpent}</p>
            </div>
          </div>
        </div>

        <div className={`p-6 rounded-lg border-2 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <Package className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Avg. Price</p>
              <p className="text-2xl font-bold">₹{avgPrice}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {(['all', 'upcoming', 'past'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              filter === f
                ? 'bg-blue-500 text-white'
                : darkMode
                ? 'bg-gray-700 hover:bg-gray-600'
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            {f === 'all' ? 'All' : f === 'upcoming' ? 'Upcoming' : 'Past'}
            {f !== 'all' && ` (${wonListings.filter(l => {
              const date = new Date(l.date);
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              return f === 'upcoming' ? date >= today : date < today;
            }).length})`}
          </button>
        ))}
      </div>

      {/* Listings Grid */}
      {filteredListings.length === 0 ? (
        <div className="text-center py-12">
          <Trophy className={`w-16 h-16 mx-auto mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-300'}`} />
          <p className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {filter === 'all' 
              ? "You haven't won any auctions yet"
              : filter === 'upcoming'
              ? 'No upcoming meals'
              : 'No past meals'}
          </p>
          <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-500'} mt-2`}>
            Keep bidding to win more deals!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredListings.map(listing => {
            const userBids = listing.bids.filter(b => b.bidder === currentUser.name);
            const winningBid = Math.max(...userBids.map(b => b.amount));
            const isUpcoming = new Date(listing.date) >= new Date();

            return (
              <div 
                key={listing.id}
                className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow-lg p-4 border-2`}
              >
                {/* Header */}
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className={`font-bold text-lg ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                      {listing.mess}
                    </h3>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {listing.mealTime}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                        {new Date(listing.date).toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 items-end">
                    <span className="text-xs px-2 py-1 rounded bg-yellow-100 text-yellow-700 flex items-center gap-1">
                      <Trophy className="w-3 h-3" />
                      Won
                    </span>
                    {isUpcoming ? (
                      <span className="text-xs px-2 py-1 rounded bg-green-100 text-green-700">
                        Upcoming
                      </span>
                    ) : (
                      <span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                        Past
                      </span>
                    )}
                  </div>
                </div>

                {/* Price */}
                <div className={`${darkMode ? 'bg-blue-900/30' : 'bg-blue-50'} rounded-lg p-3 mb-3`}>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Winning Bid</p>
                  <p className={`text-2xl font-bold ${darkMode ? 'text-blue-400' : 'text-blue-600'} flex items-center`}>
                    <IndianRupee className="w-5 h-5" />
                    {winningBid}
                  </p>
                </div>

                {/* Seller Info */}
                <div className="mb-3 pb-3 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm">
                      <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Seller:</span>
                      <span className="font-semibold">{listing.sellerName}</span>
                    </div>
                    <button
                      onClick={() => onViewRating(listing.sellerId)}
                      className="flex items-center gap-1 text-blue-500 hover:text-blue-600 text-xs"
                    >
                      <Eye className="w-3 h-3" />
                      Rating
                    </button>
                  </div>
                </div>

                {/* QR Codes Status */}
                {(listing.messQR || listing.upiQR) && (
                  <div className={`mb-3 p-2 rounded-lg text-xs ${
                    darkMode ? 'bg-green-900/30' : 'bg-green-50'
                  }`}>
                    <div className="flex items-center gap-2">
                      <QrCode className="w-4 h-4 text-green-600 dark:text-green-400" />
                      <span className="text-green-700 dark:text-green-300 font-medium">
                        QR Codes Available
                      </span>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="space-y-2">
                  {/* View QR Codes */}
                  {(listing.messQR || listing.upiQR) && (
                    <button
                      onClick={() => setSelectedListing(listing)}
                      className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg font-semibold flex items-center justify-center gap-2"
                    >
                      <QrCode className="w-4 h-4" />
                      View QR Codes
                    </button>
                  )}

                  {/* Rate Seller */}
                  <button
                    onClick={() => onRateUser({
                      userId: listing.sellerId,
                      userName: listing.sellerName,
                      listingId: listing.id.toString(),
                      transactionType: 'seller'
                    })}
                    className={`w-full ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} py-2 rounded-lg font-medium flex items-center justify-center gap-2`}
                  >
                    <Star className="w-4 h-4" />
                    Rate Seller
                  </button>

                  {/* Report */}
                  <button
                    onClick={() => onReportUser({
                      userId: listing.sellerId,
                      userName: listing.sellerName,
                      listingId: listing.id.toString()
                    })}
                    className={`w-full ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} py-2 rounded-lg font-medium flex items-center justify-center gap-2 text-red-600 dark:text-red-400`}
                  >
                    <AlertTriangle className="w-4 h-4" />
                    Report Issue
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* QR Code Modal */}
      {selectedListing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className={`${darkMode ? 'bg-gray-800 text-white' : 'bg-white'} rounded-lg max-w-2xl w-full p-6`}>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold">Transaction QR Codes</h2>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {selectedListing.mess} - {selectedListing.mealTime}
                </p>
              </div>
              <button 
                onClick={() => setSelectedListing(null)}
                className="hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className={`p-4 rounded-lg mb-6 ${darkMode ? 'bg-blue-900/30' : 'bg-blue-50'}`}>
              <p className="text-sm font-semibold mb-2">Transaction Details</p>
              <div className="space-y-1 text-sm">
                <p><strong>Final Price:</strong> ₹{selectedListing.currentPrice}</p>
                <p><strong>Date:</strong> {new Date(selectedListing.date).toLocaleDateString()}</p>
                <p><strong>Seller:</strong> {selectedListing.sellerName}</p>
              </div>
            </div>

            {(selectedListing.messQR || selectedListing.upiQR) ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {selectedListing.messQR && (
                  <div className="text-center">
                    <div className={`p-4 rounded-lg border-2 ${darkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-gray-50'}`}>
                      <div className="flex items-center justify-center gap-2 mb-3">
                        <QrCode className="w-5 h-5 text-blue-500" />
                        <h3 className="font-semibold">Mess QR Code</h3>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                        Scan to receive mess access
                      </p>
                      <img 
                        src={selectedListing.messQR} 
                        alt="Mess QR Code" 
                        className="w-full max-w-[250px] mx-auto border-4 border-white dark:border-gray-800 rounded-lg shadow-lg"
                      />
                      <a
                        href={selectedListing.messQR}
                        download="mess-qr.png"
                        className="inline-block mt-3 text-sm text-blue-500 hover:text-blue-600"
                      >
                        Download QR
                      </a>
                    </div>
                  </div>
                )}

                {selectedListing.upiQR && (
                  <div className="text-center">
                    <div className={`p-4 rounded-lg border-2 ${darkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-gray-50'}`}>
                      <div className="flex items-center justify-center gap-2 mb-3">
                        <IndianRupee className="w-5 h-5 text-green-500" />
                        <h3 className="font-semibold">UPI QR Code</h3>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                        Scan to pay ₹{selectedListing.currentPrice}
                      </p>
                      <img 
                        src={selectedListing.upiQR} 
                        alt="UPI QR Code" 
                        className="w-full max-w-[250px] mx-auto border-4 border-white dark:border-gray-800 rounded-lg shadow-lg"
                      />
                      <a
                        href={selectedListing.upiQR}
                        download="upi-qr.png"
                        className="inline-block mt-3 text-sm text-blue-500 hover:text-blue-600"
                      >
                        Download QR
                      </a>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <QrCode className={`w-16 h-16 mx-auto mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-300'}`} />
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  No QR codes available for this listing
                </p>
              </div>
            )}

            <div className={`mt-6 p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                💡 <strong>Steps:</strong>
              </p>
              <ol className="text-xs text-gray-600 dark:text-gray-400 mt-2 space-y-1 ml-4 list-decimal">
                <li>Scan Mess QR to receive mess access</li>
                <li>Scan UPI QR to complete payment</li>
                <li>Contact seller if issues arise</li>
              </ol>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}