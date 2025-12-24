import { useState, useEffect } from 'react';
import { Clock, Users, IndianRupee, X, Menu, Home as HomeIcon, ListPlus, Settings, User, QrCode, Trash2, Bell, Star, AlertTriangle, Shield, Eye } from 'lucide-react';
import NotificationPanel from '../components/NotificationPanel';
import RatingModal from '../components/RatingModal';
import ReportModal from '../components/ReportModal';
import UserRatingDisplay from '../components/UserRatingDisplay';
import AdminPanel from '../components/AdminPanel';
import { api } from '../lib/supabase';

// Export constants for use in other components
export const MESS_OPTIONS = ['Mess 1 - Veg', 'Mess 1 - Non-Veg', 'Mess 2', 'Mess 3'];
export const MEAL_TIMES = ['Breakfast', 'Lunch', 'Snacks', 'Dinner'];

// Types
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
  priceDropAmount: number;
  priceDropInterval: number;
  auctionDuration: number;
  longerBids: boolean;
  bids: Bid[];
  status: string;
  endTime: number;
  createdAt: number;
  sellerName: string;
  sellerId: string;
  messQR?: string | null;
  upiQR?: string | null;
}

interface Notification {
  id: number;
  title: string;
  message: string;
}

interface HomeProps {
  darkMode: boolean;
  currentUser: { id: string; name: string; email: string; is_admin?: boolean };
  onShowProfile: () => void;
  onShowSettings: () => void;
}

interface RatingTarget {
  userId: string;
  userName: string;
  listingId: string;
  transactionType: 'buyer' | 'seller';
}

interface ReportTarget {
  userId: string;
  userName: string;
  listingId?: string;
}

// Utility Functions
const getTimeRemaining = (endTime: number) => {
  const remaining = endTime - Date.now();
  if (remaining <= 0) return { expired: true, display: 'Expired', seconds: 0 };
  const mins = Math.floor(remaining / 60000);
  const secs = Math.floor((remaining % 60000) / 1000);
  return { expired: false, display: `${mins}:${secs.toString().padStart(2, '0')}`, seconds: Math.floor(remaining/1000) };
};

// Export for use in payment/confirmation components
export const generateUPIQR = (amount: number, seller: string) => {
  const upiId = `${seller}@paytm`;
  const upiString = `upi://pay?pa=${upiId}&pn=${seller}&am=${amount}&cu=INR&tn=Mess Payment`;
  return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiString)}`;
};

// QR Display Modal Component
interface QRDisplayModalProps {
  listing: Listing;
  darkMode: boolean;
  onClose: () => void;
}

const QRDisplayModal: React.FC<QRDisplayModalProps> = ({ listing, darkMode, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className={`${darkMode ? 'bg-gray-800 text-white' : 'bg-white'} rounded-lg max-w-2xl w-full p-6`}>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold">Transaction QR Codes</h2>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {listing.mess} - {listing.mealTime}
            </p>
          </div>
          <button onClick={onClose} className="hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded-lg">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className={`p-4 rounded-lg mb-6 ${darkMode ? 'bg-blue-900/30' : 'bg-blue-50'}`}>
          <p className="text-sm font-semibold mb-2">Transaction Details</p>
          <div className="space-y-1 text-sm">
            <p><strong>Final Price:</strong> ₹{listing.currentPrice}</p>
            <p><strong>Date:</strong> {new Date(listing.date).toLocaleDateString()}</p>
            <p><strong>Status:</strong> <span className="text-green-600 dark:text-green-400">Sold</span></p>
          </div>
        </div>

        {(listing.messQR || listing.upiQR) ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {listing.messQR && (
              <div className="text-center">
                <div className={`p-4 rounded-lg border-2 ${darkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-gray-50'}`}>
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <QrCode className="w-5 h-5 text-blue-500" />
                    <h3 className="font-semibold">Mess QR Code</h3>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                    Buyer: Scan to receive mess
                  </p>
                  <img 
                    src={listing.messQR} 
                    alt="Mess QR Code" 
                    className="w-full max-w-[250px] mx-auto border-4 border-white dark:border-gray-800 rounded-lg shadow-lg"
                  />
                  <a
                    href={listing.messQR}
                    download="mess-qr.png"
                    className="inline-block mt-3 text-sm text-blue-500 hover:text-blue-600"
                  >
                    Download QR
                  </a>
                </div>
              </div>
            )}

            {listing.upiQR && (
              <div className="text-center">
                <div className={`p-4 rounded-lg border-2 ${darkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-gray-50'}`}>
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <IndianRupee className="w-5 h-5 text-green-500" />
                    <h3 className="font-semibold">UPI QR Code</h3>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                    Buyer: Scan to pay ₹{listing.currentPrice}
                  </p>
                  <img 
                    src={listing.upiQR} 
                    alt="UPI QR Code" 
                    className="w-full max-w-[250px] mx-auto border-4 border-white dark:border-gray-800 rounded-lg shadow-lg"
                  />
                  <a
                    href={listing.upiQR}
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
            💡 <strong>Next Steps:</strong>
          </p>
          <ol className="text-xs text-gray-600 dark:text-gray-400 mt-2 space-y-1 ml-4 list-decimal">
            <li>Buyer scans Mess QR to receive mess access</li>
            <li>Buyer scans UPI QR to complete payment</li>
            <li>Transaction is complete!</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

// Notification Component
interface NotificationToastProps {
  notifications: Notification[];
  onDismiss: (id: number) => void;
  darkMode: boolean;
}

const NotificationToast: React.FC<NotificationToastProps> = ({ notifications, onDismiss, darkMode }) => (
  <div className="fixed top-20 right-4 z-50 space-y-2 max-w-sm">
    {notifications.map(n => (
      <div key={n.id} className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-2 rounded-lg shadow-lg p-4 flex gap-3 animate-fadeIn`}>
        <Bell className="w-5 h-5 text-blue-500 flex-shrink-0" />
        <div className="flex-1">
          <p className="font-semibold text-sm">{n.title}</p>
          <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>{n.message}</p>
        </div>
        <button onClick={() => onDismiss(n.id)}><X className="w-4 h-4" /></button>
      </div>
    ))}
  </div>
);

// Listing Card Component
interface ListingCardProps {
  listing: Listing;
  currentUser: { id: string; name: string };
  darkMode: boolean;
  onPlaceBid: (id: number, amount: number) => void;
  onWithdraw: (id: number) => void;
  onUnlist: (id: number) => void;
  onRateUser: (target: RatingTarget) => void;
  onReportUser: (target: ReportTarget) => void;
  onViewRating: (userId: string) => void;
  onViewQRCodes: (listing: Listing) => void;
}

const ListingCard: React.FC<ListingCardProps> = ({ 
  listing, 
  currentUser, 
  darkMode, 
  onPlaceBid, 
  onWithdraw, 
  onUnlist,
  onRateUser,
  onReportUser,
  onViewRating,
  onViewQRCodes
}) => {
  const [timeRemaining, setTimeRemaining] = useState(getTimeRemaining(listing.endTime));
  const [bidAmount, setBidAmount] = useState('');
  const [showInput, setShowInput] = useState(false);
  
  const userBids = listing.bids.filter(b => b.bidder === currentUser.name);
  const isSeller = listing.sellerName === currentUser.name;
  const topBid = listing.bids.length > 0 ? Math.max(...listing.bids.map(b => b.amount)) : 0;
  const isTopBidder = userBids.length > 0 && Math.max(...userBids.map(b => b.amount)) === topBid;

  useEffect(() => {
    const timer = setInterval(() => setTimeRemaining(getTimeRemaining(listing.endTime)), 1000);
    return () => clearInterval(timer);
  }, [listing.endTime]);

  const handleBid = () => {
    const amt = parseFloat(bidAmount);
    if (!amt || amt <= 0) return;
    if (listing.isAuction && amt < listing.currentPrice) {
      alert('Bid must be >= current price in auction mode');
      return;
    }
    onPlaceBid(listing.id, amt);
    setBidAmount('');
    setShowInput(false);
  };

  // Show rating button if transaction is complete and user was involved
  const canRateSeller = listing.status === 'sold' && !isSeller && isTopBidder;
  const canRateBuyer = listing.status === 'sold' && isSeller;

  return (
    <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow-lg p-4 border-2`}>
      <div className="flex justify-between mb-3">
        <div>
          <h3 className={`font-bold text-lg ${darkMode ? 'text-white' : 'text-gray-800'}`}>{listing.mess}</h3>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{listing.mealTime}</p>
          <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>{new Date(listing.date).toLocaleDateString()}</p>
        </div>
        <div className="flex flex-col gap-1 items-end">
          <span className={`text-xs px-2 py-1 rounded ${listing.isAuction ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'}`}>
            {listing.isAuction ? 'Auction' : 'Instant'}
          </span>
          {listing.status === 'sold' && (
            <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-700">
              Sold
            </span>
          )}
        </div>
      </div>

      <div className={`${darkMode ? 'bg-blue-900/30' : 'bg-blue-50'} rounded-lg p-3 mb-3`}>
        <p className={`text-2xl font-bold ${darkMode ? 'text-blue-400' : 'text-blue-600'} flex items-center`}>
          <IndianRupee className="w-5 h-5" />{listing.currentPrice}
        </p>
        {topBid > 0 && <p className="text-sm mt-1">Top Bid: ₹{topBid}</p>}
      </div>

      {/* Seller Rating Display */}
      {!isSeller && (
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
              View Rating
            </button>
          </div>
        </div>
      )}

      <div className="flex gap-2 mb-3">
        <span className={`text-sm ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} px-3 py-1 rounded flex items-center gap-1`}>
          <Clock className="w-4 h-4" />{timeRemaining.display}
        </span>
        <span className={`text-sm ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} px-3 py-1 rounded flex items-center gap-1`}>
          <Users className="w-4 h-4" />{listing.bids.length}
        </span>
      </div>

      {userBids.length > 0 && (
        <div className={`mb-3 p-2 ${darkMode ? 'bg-yellow-900/30' : 'bg-yellow-50'} rounded border text-xs`}>
          <p className="font-medium mb-1">Your bids: {userBids.map(b => `₹${b.amount}`).join(', ')}</p>
          {isTopBidder && <p className="text-green-600 dark:text-green-400 font-semibold">🏆 You're the top bidder!</p>}
          <button onClick={() => onWithdraw(listing.id)} className="text-red-600 underline mt-1">Withdraw all</button>
        </div>
      )}

      {/* Action Buttons */}
      <div className="space-y-2">
        {listing.status === 'active' && !isSeller && (
          !showInput ? (
            <button onClick={() => setShowInput(true)} className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg font-semibold">
              Place Bid
            </button>
          ) : (
            <div className="flex gap-2">
              <input type="number" value={bidAmount} onChange={(e) => setBidAmount(e.target.value)}
                placeholder={listing.isAuction ? `Min: ₹${listing.currentPrice}` : 'Any amount'}
                className={`flex-1 border ${darkMode ? 'bg-gray-700 border-gray-600' : 'border-gray-300'} rounded-lg px-3 py-2`} />
              <button onClick={handleBid} className="bg-blue-500 text-white px-4 py-2 rounded-lg">Bid</button>
              <button onClick={() => setShowInput(false)} className={`${darkMode ? 'bg-gray-700' : 'bg-gray-200'} px-3 py-2 rounded-lg`}>
                <X className="w-5 h-5" />
              </button>
            </div>
          )
        )}

        {isSeller && listing.status === 'active' && (
          <button onClick={() => onUnlist(listing.id)} className="w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg font-semibold flex items-center justify-center gap-2">
            <Trash2 className="w-4 h-4" />Unlist
          </button>
        )}

        {/* Rating Buttons for Completed Transactions */}
        {canRateSeller && (
          <button 
            onClick={() => onRateUser({
              userId: listing.sellerId,
              userName: listing.sellerName,
              listingId: listing.id.toString(),
              transactionType: 'seller'
            })}
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-white py-2 rounded-lg font-semibold flex items-center justify-center gap-2"
          >
            <Star className="w-4 h-4" />
            Rate Seller
          </button>
        )}

        {canRateBuyer && topBid > 0 && (
          <button 
            onClick={() => {
              const topBidder = listing.bids.find(b => b.amount === topBid);
              if (topBidder) {
                onRateUser({
                  userId: 'buyer-id', // You'll need to get actual buyer ID
                  userName: topBidder.bidder,
                  listingId: listing.id.toString(),
                  transactionType: 'buyer'
                });
              }
            }}
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-white py-2 rounded-lg font-semibold flex items-center justify-center gap-2"
          >
            <Star className="w-4 h-4" />
            Rate Buyer
          </button>
        )}

        {/* Report Button (always available for non-sellers) */}
        {!isSeller && (
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
        )}

        {/* View QR Codes Button for Sold Listings */}
        {listing.status === 'sold' && (listing.messQR || listing.upiQR) && (
          <button
            onClick={() => onViewQRCodes(listing)}
            className={`w-full ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} py-2 rounded-lg font-medium flex items-center justify-center gap-2 text-blue-600 dark:text-blue-400`}
          >
            <QrCode className="w-4 h-4" />
            View QR Codes
          </button>
        )}
      </div>
    </div>
  );
};

// Main App Component
export default function Home({ 
  darkMode, 
  currentUser, 
  onShowProfile, 
  onShowSettings 
}: HomeProps) {
  const [listings, setListings] = useState<Listing[]>([]);
  const [showMenu, setShowMenu] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotificationPanel, setShowNotificationPanel] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // New states for ratings and reports
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [ratingTarget, setRatingTarget] = useState<RatingTarget | null>(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportTarget, setReportTarget] = useState<ReportTarget | null>(null);
  const [showUserRating, setShowUserRating] = useState(false);
  const [viewingUserId, setViewingUserId] = useState<string | null>(null);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  
  // QR Modal states
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedQRListing, setSelectedQRListing] = useState<Listing | null>(null);

  // Load unread notification count
  useEffect(() => {
    loadUnreadCount();
    const subscription = api.subscribeToNotifications(currentUser.id, (payload) => {
      if (payload.eventType === 'INSERT') {
        loadUnreadCount();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [currentUser.id]);

  const loadUnreadCount = async () => {
    try {
      const { data } = await api.getNotifications(currentUser.id);
      if (data) {
        setUnreadCount(data.filter(n => !n.read).length);
      }
    } catch (error) {
      console.error('Error loading notification count:', error);
    }
  };

  const addNotif = (title: string, msg: string) => {
    const id = Date.now();
    setNotifications(p => [...p, {id, title, message: msg}]);
    setTimeout(() => setNotifications(p => p.filter(n => n.id !== id)), 5000);
  };

  const placeBid = (id: number, amt: number) => {
    setListings(p => p.map(l => l.id === id ? {
      ...l, 
      bids: [...l.bids, {
        id: Date.now(), 
        amount: amt, 
        bidder: currentUser.name, 
        timestamp: Date.now()
      }]
    } : l));
    addNotif('Bid Placed', `₹${amt} bid placed`);
  };

  const withdrawBid = (id: number) => {
    setListings(p => p.map(l => l.id === id ? {
      ...l, 
      bids: l.bids.filter(b => b.bidder !== currentUser.name)
    } : l));
    addNotif('Withdrawn', 'Bids removed');
  };

  const unlistListing = (id: number) => {
    if (confirm('Unlist this listing?')) {
      setListings(p => p.map(l => l.id === id ? {...l, status: 'unlisted'} : l));
      addNotif('Unlisted', 'Listing removed');
    }
  };

  const handleRateUser = (target: RatingTarget) => {
    setRatingTarget(target);
    setShowRatingModal(true);
  };

  const handleReportUser = (target: ReportTarget) => {
    setReportTarget(target);
    setShowReportModal(true);
  };

  const handleViewRating = (userId: string) => {
    setViewingUserId(userId);
    setShowUserRating(true);
  };

  const handleViewQRCodes = (listing: Listing) => {
    setSelectedQRListing(listing);
    setShowQRModal(true);
  };

  const submitRating = async (rating: number, review: string) => {
    if (!ratingTarget) return;

    try {
      await api.createRating(
        currentUser.id,
        ratingTarget.userId,
        ratingTarget.listingId,
        rating,
        review,
        ratingTarget.transactionType
      );
      addNotif('Rating Submitted', `You rated ${ratingTarget.userName} ${rating} stars`);
    } catch (error) {
      console.error('Error submitting rating:', error);
      throw error;
    }
  };

  const submitReport = async (reason: string, description: string, evidenceUrls: string[]) => {
    if (!reportTarget) return;

    try {
      await api.createReport(
        currentUser.id,
        reportTarget.userId,
        reportTarget.listingId || null,
        reason,
        description,
        evidenceUrls
      );
      addNotif('Report Submitted', 'Our team will review your report');
    } catch (error) {
      console.error('Error submitting report:', error);
      throw error;
    }
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50'}`}>
      <header className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b`}>
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button onClick={() => setShowMenu(true)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-bold">Mess Marketplace</h1>
          </div>
          <div className="flex gap-3">
            {/* Admin Panel Button (only for admins) */}
            {currentUser.is_admin && (
              <button 
                onClick={() => setShowAdminPanel(true)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg relative"
                title="Admin Panel"
              >
                <Shield className="w-6 h-6 text-purple-500" />
              </button>
            )}

            {/* Notification Bell */}
            <button 
              onClick={() => setShowNotificationPanel(true)}
              className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              <Bell className="w-6 h-6" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
            
            <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
              <QrCode className="w-5 h-5" />Get QR
            </button>
          </div>
        </div>
      </header>

      <NotificationToast 
        notifications={notifications} 
        onDismiss={(id) => setNotifications(p => p.filter(n => n.id !== id))} 
        darkMode={darkMode} 
      />

      {/* Modals */}
      {showNotificationPanel && (
        <NotificationPanel
          userId={currentUser.id}
          darkMode={darkMode}
          onClose={() => {
            setShowNotificationPanel(false);
            loadUnreadCount();
          }}
        />
      )}

      {showRatingModal && ratingTarget && (
        <RatingModal
          darkMode={darkMode}
          ratedUserName={ratingTarget.userName}
          transactionType={ratingTarget.transactionType}
          onClose={() => {
            setShowRatingModal(false);
            setRatingTarget(null);
          }}
          onSubmit={submitRating}
        />
      )}

      {showReportModal && reportTarget && (
        <ReportModal
          darkMode={darkMode}
          reportedUserName={reportTarget.userName}
          reportedUserId={reportTarget.userId}
          listingId={reportTarget.listingId}
          onClose={() => {
            setShowReportModal(false);
            setReportTarget(null);
          }}
          onSubmit={submitReport}
        />
      )}

      {showUserRating && viewingUserId && (
        <UserRatingDisplay
          userId={viewingUserId}
          darkMode={darkMode}
          compact={false}
          onClose={() => {
            setShowUserRating(false);
            setViewingUserId(null);
          }}
        />
      )}

      {showAdminPanel && (
        <AdminPanel
          darkMode={darkMode}
          currentUserId={currentUser.id}
          onClose={() => setShowAdminPanel(false)}
        />
      )}

      {showQRModal && selectedQRListing && (
        <QRDisplayModal
          listing={selectedQRListing}
          darkMode={darkMode}
          onClose={() => {
            setShowQRModal(false);
            setSelectedQRListing(null);
          }}
        />
      )}

      <main className="max-w-7xl mx-auto px-4 py-6">
        {listings.filter(l => l.status !== 'unlisted').length === 0 ? (
          <div className="text-center py-12">
            <p className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              No listings available. Check back later!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.filter(l => l.status !== 'unlisted').map(l => (
              <ListingCard 
                key={l.id} 
                listing={l} 
                currentUser={currentUser}
                darkMode={darkMode}
                onPlaceBid={placeBid} 
                onWithdraw={withdrawBid} 
                onUnlist={unlistListing}
                onRateUser={handleRateUser}
                onReportUser={handleReportUser}
                onViewRating={handleViewRating}
                onViewQRCodes={handleViewQRCodes}
              />
            ))}
          </div>
        )}
      </main>

      {showMenu && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowMenu(false)} />
          <div className={`absolute left-0 top-0 h-full w-80 ${darkMode ? 'bg-gray-900' : 'bg-white'} p-6`}>
            <div className="flex justify-between mb-8">
              <h2 className="text-xl font-bold">Menu</h2>
              <button onClick={() => setShowMenu(false)}><X className="w-6 h-6" /></button>
            </div>
            <div className="space-y-2">
              <button 
                onClick={() => setShowMenu(false)} 
                className="w-full flex items-center gap-3 px-4 py-3 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <HomeIcon className="w-5 h-5" />Buy Mess
              </button>
              <button 
                onClick={() => {
                  setShowMenu(false);
                  addNotif('Coming Soon', 'Add listing feature');
                }} 
                className="w-full flex items-center gap-3 px-4 py-3 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <ListPlus className="w-5 h-5" />Add Listing
              </button>
              <button 
                onClick={() => {
                  setShowMenu(false);
                  onShowProfile();
                }} 
                className="w-full flex items-center gap-3 px-4 py-3 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <User className="w-5 h-5" />Profile
              </button>
              <button 
                onClick={() => {
                  setShowMenu(false);
                  onShowSettings();
                }} 
                className="w-full flex items-center gap-3 px-4 py-3 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <Settings className="w-5 h-5" />Settings
              </button>
              {currentUser.is_admin && (
                <button 
                  onClick={() => {
                    setShowMenu(false);
                    setShowAdminPanel(true);
                  }} 
                  className="w-full flex items-center gap-3 px-4 py-3 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-purple-600 dark:text-purple-400 font-semibold"
                >
                  <Shield className="w-5 h-5" />Admin Panel
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}