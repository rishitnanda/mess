import React, { useState, useEffect } from 'react';
import { Clock, Users, IndianRupee, X, Menu, Home, ListPlus, Settings, User, Moon, Sun, QrCode, Info, Trash2, Bell, Upload, AlertCircle, CheckCircle, CreditCard } from 'lucide-react';

const MESS_OPTIONS = ['Mess 1 - Veg', 'Mess 1 - Non-Veg', 'Mess 2', 'Mess 3'];
const MEAL_TIMES = ['Breakfast', 'Lunch', 'Snacks', 'Dinner'];

// Utility Functions
const getTimeRemaining = (endTime) => {
  const remaining = endTime - Date.now();
  if (remaining <= 0) return { expired: true, display: 'Expired', seconds: 0 };
  const mins = Math.floor(remaining / 60000);
  const secs = Math.floor((remaining % 60000) / 1000);
  return { expired: false, display: `${mins}:${secs.toString().padStart(2, '0')}`, seconds: Math.floor(remaining/1000) };
};

const generateUPIQR = (amount, seller) => {
  const upiId = `${seller}@paytm`;
  const upiString = `upi://pay?pa=${upiId}&pn=${seller}&am=${amount}&cu=INR&tn=Mess Payment`;
  return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiString)}`;
};

// Notification Component
const NotificationToast = ({ notifications, onDismiss, darkMode }) => (
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
const ListingCard = ({ listing, currentUser, darkMode, onPlaceBid, onWithdraw, onUnlist }) => {
  const [timeRemaining, setTimeRemaining] = useState(getTimeRemaining(listing.endTime));
  const [bidAmount, setBidAmount] = useState('');
  const [showInput, setShowInput] = useState(false);
  
  const userBids = listing.bids.filter(b => b.bidder === currentUser);
  const isSeller = listing.sellerName === currentUser;
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

// Confirmation Flow
const ConfirmationFlow = ({ wonAuctions, activeAuctions, onConfirm, onClose, darkMode }) => {
  const [step, setStep] = useState(1);
  const [selected, setSelected] = useState(wonAuctions.map(a => a.id));
  const [continueActive, setContinueActive] = useState([]);
  const [timeLeft, setTimeLeft] = useState(180);

  useEffect(() => {
    const t = setInterval(() => setTimeLeft(p => p <= 1 ? (onClose(), 0) : p - 1), 1000);
    return () => clearInterval(t);
  }, [onClose]);

  const toggle = (id) => setSelected(p => p.includes(id) ? p.filter(i => i !== id) : [...p, id]);

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6`}>
        <div className="flex justify-between mb-4">
          <h2 className="text-2xl font-bold">
            {step === 1 ? 'Select Auctions' : step === 2 ? 'Your Active Bids' : 'Final Confirmation'}
          </h2>
          <div className="flex items-center gap-4">
            <span className={`font-semibold ${timeLeft < 60 ? 'text-red-600' : ''}`}>
              {Math.floor(timeLeft/60)}:{(timeLeft%60).toString().padStart(2,'0')}
            </span>
            <button onClick={onClose}><X className="w-6 h-6" /></button>
          </div>
        </div>

        {step === 1 && (
          <>
            <p className="text-sm text-gray-600 mb-4">Select which auctions to purchase (3 min timer)</p>
            <div className="space-y-2 mb-4">
              {wonAuctions.map(a => (
                <div key={a.id} onClick={() => toggle(a.id)}
                  className={`p-4 border-2 rounded-lg cursor-pointer ${selected.includes(a.id) ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}>
                  <div className="flex justify-between">
                    <div>
                      <p className="font-semibold">{a.mess} - {a.mealTime}</p>
                      <p className="text-sm">{new Date(a.date).toLocaleDateString()}</p>
                    </div>
                    <p className="font-bold text-lg text-blue-600">₹{a.winningBid}</p>
                  </div>
                  {selected.includes(a.id) && <div className="mt-2 flex items-center gap-2 text-green-600"><CheckCircle className="w-4 h-4" />Selected</div>}
                </div>
              ))}
            </div>
            <button onClick={() => selected.length ? (activeAuctions.length ? setStep(2) : setStep(3)) : alert('Select at least one')}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg font-semibold">
              Continue ({selected.length})
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="font-semibold mb-2">You have {activeAuctions.length} ongoing auctions</p>
              <p className="text-sm">Select which to continue. Others will be cancelled.</p>
            </div>
            <div className="space-y-2 mb-4">
              {activeAuctions.map(a => (
                <div key={a.id} onClick={() => setContinueActive(p => p.includes(a.id) ? p.filter(i => i !== a.id) : [...p, a.id])}
                  className={`p-4 border-2 rounded-lg cursor-pointer ${continueActive.includes(a.id) ? 'border-green-500 bg-green-50' : 'border-gray-300'}`}>
                  <p className="font-semibold">{a.mess} - {a.mealTime}</p>
                  <p className="text-sm">Your bid: ₹{a.yourBid}</p>
                </div>
              ))}
            </div>
            <button onClick={() => setStep(3)} className="w-full bg-blue-500 text-white py-3 rounded-lg font-semibold">Continue</button>
          </>
        )}

        {step === 3 && (
          <>
            <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-lg">
              <p className="font-bold text-red-800 text-lg flex items-center gap-2 mb-2">
                <AlertCircle className="w-6 h-6" />Are you sure?
              </p>
              <p className="text-sm text-red-700">This cannot be undone</p>
            </div>
            <div className="mb-6">
              <h3 className="font-semibold mb-2">Purchasing ({selected.length}):</h3>
              {wonAuctions.filter(a => selected.includes(a.id)).map(a => (
                <div key={a.id} className="text-sm p-2 bg-gray-100 rounded mb-1">{a.mess} - ₹{a.winningBid}</div>
              ))}
              <p className="font-bold mt-2">Total: ₹{wonAuctions.filter(a => selected.includes(a.id)).reduce((s,a) => s+a.winningBid, 0)}</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => onConfirm(selected, continueActive)} className="flex-1 bg-green-500 text-white py-3 rounded-lg font-semibold">
                Confirm Purchase
              </button>
              <button onClick={() => setStep(1)} className="px-6 bg-gray-200 py-3 rounded-lg font-semibold">Back</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// Payment Flow
const PaymentFlow = ({ auctions, onComplete, onTimeout, darkMode }) => {
  const [timeLeft, setTimeLeft] = useState(240);
  const [paid, setPaid] = useState([]);

  useEffect(() => {
    const t = setInterval(() => setTimeLeft(p => p <= 1 ? (onTimeout(), 0) : p - 1), 1000);
    return () => clearInterval(t);
  }, [onTimeout]);

  const markPaid = (id) => {
    setPaid(p => [...p, id]);
    if (paid.length + 1 === auctions.length) setTimeout(onComplete, 1000);
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg max-w-3xl w-full max-h-[85vh] overflow-y-auto p-6`}>
        <div className="flex justify-between mb-6">
          <h2 className="text-2xl font-bold">Complete Payment</h2>
          <span className={`text-lg font-bold ${timeLeft < 60 ? 'text-red-600' : ''}`}>
            {Math.floor(timeLeft/60)}:{(timeLeft%60).toString().padStart(2,'0')}
          </span>
        </div>
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
          <p className="text-sm text-blue-800">4 minutes to complete all payments</p>
        </div>
        <div className="space-y-6">
          {auctions.map(a => {
            const isPaid = paid.includes(a.id);
            return (
              <div key={a.id} className={`p-4 border-2 rounded-lg ${isPaid ? 'border-green-500 bg-green-50' : 'border-gray-300'}`}>
                <div className="flex justify-between mb-3">
                  <div>
                    <p className="font-bold text-lg">{a.mess} - {a.mealTime}</p>
                    <p className="text-sm text-gray-600">Seller: {a.seller}</p>
                  </div>
                  <p className="font-bold text-2xl text-blue-600">₹{a.amount}</p>
                </div>
                {!isPaid ? (
                  <div className="flex items-center gap-4">
                    <div className="bg-white p-2 rounded border">
                      <img src={generateUPIQR(a.amount, a.seller)} alt="QR" className="w-40 h-40" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm mb-3">Scan with any UPI app</p>
                      <button onClick={() => markPaid(a.id)} className="w-full bg-green-500 text-white py-2 rounded-lg font-semibold">
                        Mark as Paid
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2 text-green-600 py-4">
                    <CheckCircle className="w-6 h-6" /><span className="font-semibold">Payment Completed</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <div className="mt-6 p-4 bg-gray-100 rounded">
          <p className="text-sm">Paid: {paid.length} / {auctions.length}</p>
        </div>
      </div>
    </div>
  );
};

// Main App
export default function MessAuctionSystem() {
  const [listings, setListings] = useState([]);
  const [darkMode, setDarkMode] = useState(false);
  const [currentUser] = useState('User123');
  const [showMenu, setShowMenu] = useState(false);
  const [currentPage, setCurrentPage] = useState('home');
  const [notifications, setNotifications] = useState([]);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [pendingAuctions, setPendingAuctions] = useState([]);
  const [paymentAuctions, setPaymentAuctions] = useState([]);
  const [userProfile, setUserProfile] = useState({
    name: 'User123', email: 'user@example.com', phone: '1234567890', messQR: 'SAMPLE_QR', profilePic: null
  });
  const [settings, setSettings] = useState({
    notifyListingSold: true, notifyListingResumed: true, notifyAuctionWon: true,
    notifyAuctionLost: false, notifyLostAuctionResumes: true, notifyPriceReduced: true
  });

  const addNotif = (title, msg) => {
    const id = Date.now();
    setNotifications(p => [...p, {id, title, message: msg}]);
    setTimeout(() => setNotifications(p => p.filter(n => n.id !== id)), 5000);
  };

  const createListing = (form) => {
    setListings([{
      id: Date.now(), ...form,
      targetPrice: parseFloat(form.targetPrice), currentPrice: parseFloat(form.targetPrice),
      priceDropAmount: form.priceDropAmount ? parseFloat(form.priceDropAmount) : 0,
      priceDropInterval: parseFloat(form.priceDropInterval), auctionDuration: parseFloat(form.auctionDuration),
      bids: [], status: 'active',
      endTime: Date.now() + ((form.isAuction ? form.auctionDuration : form.priceDropInterval) * 60000),
      createdAt: Date.now()
    }, ...listings]);
    addNotif('Listing Created', `${form.mess} is now live`);
  };

  const placeBid = (id, amt) => {
    setListings(p => p.map(l => l.id === id ? {...l, bids: [...l.bids, {id: Date.now(), amount: amt, bidder: currentUser, timestamp: Date.now()}]} : l));
    addNotif('Bid Placed', `₹${amt} bid placed`);
  };

  const withdrawBid = (id) => {
    setListings(p => p.map(l => l.id === id ? {...l, bids: l.bids.filter(b => b.bidder !== currentUser)} : l));
    addNotif('Withdrawn', 'Bids removed');
  };

  const unlistListing = (id) => {
    if (confirm('Unlist?')) {
      setListings(p => p.map(l => l.id === id ? {...l, status: 'unlisted'} : l));
      addNotif('Unlisted', 'Listing removed');
    }
  };

  const handleConfirmComplete = (sel, cont) => {
    setShowConfirmation(false);
    const selected = pendingAuctions.filter(a => sel.includes(a.id));
    setPaymentAuctions(selected.map(a => ({id: a.id, mess: a.mess, mealTime: a.mealTime, amount: a.winningBid, seller: a.sellerName})));
    setShowPayment(true);
    setPendingAuctions([]);
  };

  const handlePaymentComplete = () => {
    setShowPayment(false);
    addNotif('Purchase Complete', 'Mess QR available');
    setPaymentAuctions([]);
  };

  const handlePaymentTimeout = () => {
    setShowPayment(false);
    addNotif('Timeout', 'Auctions resumed');
    setPaymentAuctions([]);
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
            <button onClick={() => setDarkMode(!darkMode)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
              <QrCode className="w-5 h-5" />Get QR
            </button>
          </div>
        </div>
      </header>

      <NotificationToast notifications={notifications} onDismiss={(id) => setNotifications(p => p.filter(n => n.id !== id))} darkMode={darkMode} />

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.filter(l => l.status !== 'unlisted').map(l => (
            <ListingCard key={l.id} listing={l} currentUser={currentUser} darkMode={darkMode}
              onPlaceBid={placeBid} onWithdraw={withdrawBid} onUnlist={unlistListing} />
          ))}
        </div>
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
              <button onClick={() => {setCurrentPage('home'); setShowMenu(false);}} className="w-full flex items-center gap-3 px-4 py-3 rounded hover:bg-gray-100 dark:hover:bg-gray-800">
                <Home className="w-5 h-5" />Buy Mess
              </button>
              <button onClick={() => {setCurrentPage('add'); setShowMenu(false);}} className="w-full flex items-center gap-3 px-4 py-3 rounded hover:bg-gray-100 dark:hover:bg-gray-800">
                <ListPlus className="w-5 h-5" />Add Listing
              </button>
              <button onClick={() => {setCurrentPage('profile'); setShowMenu(false);}} className="w-full flex items-center gap-3 px-4 py-3 rounded hover:bg-gray-100 dark:hover:bg-gray-800">
                <User className="w-5 h-5" />Profile
              </button>
              <button onClick={() => {setCurrentPage('settings'); setShowMenu(false);}} className="w-full flex items-center gap-3 px-4 py-3 rounded hover:bg-gray-100 dark:hover:bg-gray-800">
                <Settings className="w-5 h-5" />Settings
              </button>
              <button onClick={() => {setCurrentPage('payment'); setShowMenu(false);}} className="w-full flex items-center gap-3 px-4 py-3 rounded hover:bg-gray-100 dark:hover:bg-gray-800">
                <CreditCard className="w-5 h-5" />Payments
              </button>
            </div>
          </div>
        </div>
      )}

      {showConfirmation && (
        <ConfirmationFlow wonAuctions={pendingAuctions}
          activeAuctions={listings.filter(l => l.bids.some(b => b.bidder === currentUser) && l.status === 'active').map(l => ({
            id: l.id, mess: l.mess, mealTime: l.mealTime, yourBid: Math.max(...l.bids.filter(b => b.bidder === currentUser).map(b => b.amount))
          }))}
          onConfirm={handleConfirmComplete} onClose={() => setShowConfirmation(false)} darkMode={darkMode} />
      )}

      {showPayment && (
        <PaymentFlow auctions={paymentAuctions} onComplete={handlePaymentComplete} onTimeout={handlePaymentTimeout} darkMode={darkMode} />
      )}
    </div>
  );
}