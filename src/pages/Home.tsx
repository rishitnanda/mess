import { useState } from 'react';
import { Clock, Users, IndianRupee, X, Menu, Home as HomeIcon, ListPlus, Settings, User, QrCode, Trash2, Bell } from 'lucide-react';

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
}

interface Notification {
  id: number;
  title: string;
  message: string;
}

interface HomeProps {
  darkMode: boolean;
  currentUser: { id: string; name: string; email: string };
  onShowProfile: () => void;
  onShowSettings: () => void;
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
  currentUserName: string;
  darkMode: boolean;
  onPlaceBid: (id: number, amount: number) => void;
  onWithdraw: (id: number) => void;
  onUnlist: (id: number) => void;
}

const ListingCard: React.FC<ListingCardProps> = ({ listing, currentUserName, darkMode, onPlaceBid, onWithdraw, onUnlist }) => {
  const [timeRemaining, setTimeRemaining] = useState(getTimeRemaining(listing.endTime));
  const [bidAmount, setBidAmount] = useState('');
  const [showInput, setShowInput] = useState(false);
  
  const userBids = listing.bids.filter(b => b.bidder === currentUserName);
  const isSeller = listing.sellerName === currentUserName;
  const topBid = listing.bids.length > 0 ? Math.max(...listing.bids.map(b => b.amount)) : 0;

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

  return (
    <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow-lg p-4 border-2`}>
      <div className="flex justify-between mb-3">
        <div>
          <h3 className={`font-bold text-lg ${darkMode ? 'text-white' : 'text-gray-800'}`}>{listing.mess}</h3>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{listing.mealTime}</p>
          <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>{new Date(listing.date).toLocaleDateString()}</p>
        </div>
        <span className={`text-xs px-2 py-1 rounded h-fit ${listing.isAuction ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'}`}>
          {listing.isAuction ? 'Auction' : 'Instant'}
        </span>
      </div>

      <div className={`${darkMode ? 'bg-blue-900/30' : 'bg-blue-50'} rounded-lg p-3 mb-3`}>
        <p className={`text-2xl font-bold ${darkMode ? 'text-blue-400' : 'text-blue-600'} flex items-center`}>
          <IndianRupee className="w-5 h-5" />{listing.currentPrice}
        </p>
        {topBid > 0 && <p className="text-sm mt-1">Top Bid: ₹{topBid}</p>}
      </div>

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
          <button onClick={() => onWithdraw(listing.id)} className="text-red-600 underline">Withdraw all</button>
        </div>
      )}

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

      <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} mt-3`}>Seller: {listing.sellerName}</p>
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
  // FIXED: Removed duplicate darkMode and currentUser states
  const [listings, setListings] = useState<Listing[]>([]);
  const [showMenu, setShowMenu] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

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
                currentUserName={currentUser.name} 
                darkMode={darkMode}
                onPlaceBid={placeBid} 
                onWithdraw={withdrawBid} 
                onUnlist={unlistListing} 
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
            </div>
          </div>
        </div>
      )}
    </div>
  );
}