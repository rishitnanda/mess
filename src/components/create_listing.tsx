import { useState, useEffect } from 'react';
import { X, Calendar, Clock, IndianRupee, TrendingDown, Timer, Info, QrCode, Upload } from 'lucide-react';
import { api } from '../lib/supabase';

const MESS_OPTIONS = ['Mess 1 - Veg', 'Mess 1 - Non-Veg', 'Mess 2', 'Mess 3'];
const MEAL_TIMES = ['Breakfast', 'Lunch', 'Snacks', 'Dinner'];

interface CreateListingProps {
  onClose: () => void;
  onSubmit: (listing: any) => void;
  darkMode: boolean;
  userMessQR?: string;
  userId: string;
}

export default function CreateListing({ onClose, onSubmit, darkMode, userMessQR, userId }: CreateListingProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    mess: '',
    mealTime: '',
    date: '',
    isAuction: false,
    targetPrice: '',
    priceDropAmount: '',
    priceDropInterval: '30',
    auctionDuration: '60',
    longerBids: false
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // QR Code states
  const [defaultMessQR, setDefaultMessQR] = useState<string | null>(null);
  const [defaultUpiQR, setDefaultUpiQR] = useState<string | null>(null);
  const [useDefaultMessQR, setUseDefaultMessQR] = useState(false);
  const [useDefaultUpiQR, setUseDefaultUpiQR] = useState(false);
  const [customMessQR, setCustomMessQR] = useState<string | null>(null);
  const [customUpiQR, setCustomUpiQR] = useState<string | null>(null);
  const [messQRFile, setMessQRFile] = useState<File | null>(null);
  const [upiQRFile, setUpiQRFile] = useState<File | null>(null);

  useEffect(() => {
    loadDefaultQRs();
  }, [userId]);

  const loadDefaultQRs = async () => {
    try {
      const { data } = await api.getProfile(userId);
      if (data) {
        setDefaultMessQR(data.default_mess_qr);
        setDefaultUpiQR(data.default_upi_qr);
        // Auto-select defaults if available
        if (data.default_mess_qr) setUseDefaultMessQR(true);
        if (data.default_upi_qr) setUseDefaultUpiQR(true);
      }
    } catch (error) {
      console.error('Error loading default QRs:', error);
    }
  };

  const handleQRUpload = (type: 'mess' | 'upi', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === 'mess') {
          setCustomMessQR(reader.result as string);
          setMessQRFile(file);
        } else {
          setCustomUpiQR(reader.result as string);
          setUpiQRFile(file);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.mess) newErrors.mess = 'Select a mess';
    if (!formData.mealTime) newErrors.mealTime = 'Select meal time';
    if (!formData.date) newErrors.date = 'Select date';
    
    const selectedDate = new Date(formData.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
      newErrors.date = 'Cannot select past date';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {};
    const target = parseFloat(formData.targetPrice);
    
    if (!formData.targetPrice || target <= 0) {
      newErrors.targetPrice = 'Enter valid price';
    }
    
    if (!formData.isAuction) {
      const drop = parseFloat(formData.priceDropAmount);
      if (!formData.priceDropAmount || drop <= 0) {
        newErrors.priceDropAmount = 'Enter valid drop amount';
      }
      if (drop >= target) {
        newErrors.priceDropAmount = 'Drop must be less than target price';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) setStep(2);
    else if (step === 2 && validateStep2()) setStep(3);
    else if (step === 3) handleSubmit();
  };

  const handleSubmit = async () => {
    if (!userMessQR) {
      alert('Please add your Mess QR code in Profile before creating listings');
      return;
    }

    try {
      let messQRUrl = null;
      let upiQRUrl = null;

      // Upload custom QR codes if provided
      if (!useDefaultMessQR && messQRFile) {
        const { data, error } = await api.uploadQRCode(userId, messQRFile, 'mess');
        if (error) throw error;
        messQRUrl = data;
      } else if (useDefaultMessQR) {
        messQRUrl = defaultMessQR;
      }

      if (!useDefaultUpiQR && upiQRFile) {
        const { data, error } = await api.uploadQRCode(userId, upiQRFile, 'upi');
        if (error) throw error;
        upiQRUrl = data;
      } else if (useDefaultUpiQR) {
        upiQRUrl = defaultUpiQR;
      }

      const listing = {
        ...formData,
        targetPrice: parseFloat(formData.targetPrice),
        currentPrice: parseFloat(formData.targetPrice),
        priceDropAmount: formData.isAuction ? 0 : parseFloat(formData.priceDropAmount),
        priceDropInterval: parseInt(formData.priceDropInterval),
        auctionDuration: parseInt(formData.isAuction ? formData.auctionDuration : formData.priceDropInterval),
        endTime: Date.now() + (parseInt(formData.isAuction ? formData.auctionDuration : formData.priceDropInterval) * 60000),
        status: 'active',
        bids: [],
        dropCount: 0,
        messQR: messQRUrl,
        upiQR: upiQRUrl
      };
      
      onSubmit(listing);
      onClose();
    } catch (error) {
      console.error('Error creating listing:', error);
      alert('Failed to create listing. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className={`${darkMode ? 'bg-gray-800 text-white' : 'bg-white'} rounded-lg max-w-2xl w-full my-8 p-6`}>
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold">Create Listing</h2>
            <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Step {step} of 3
            </p>
          </div>
          <button onClick={onClose} className="hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded-lg">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-500 transition-all duration-300"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>
        </div>

        {/* Warning if no QR */}
        {!userMessQR && (
          <div className={`mb-6 p-4 rounded-lg border-2 ${
            darkMode 
              ? 'bg-red-900/20 border-red-700 text-red-200' 
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            <p className="text-sm font-semibold mb-1">⚠️ Mess QR Required</p>
            <p className="text-xs">Add your Mess QR code in Profile before creating listings</p>
          </div>
        )}

        {/* Step 1: Basic Details */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Mess</label>
              <select
                value={formData.mess}
                onChange={(e) => setFormData({ ...formData, mess: e.target.value })}
                className={`w-full border ${darkMode ? 'bg-gray-700 border-gray-600' : 'border-gray-300'} rounded-lg px-4 py-3`}
              >
                <option value="">Select Mess</option>
                {MESS_OPTIONS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
              {errors.mess && <p className="text-red-500 text-xs mt-1">{errors.mess}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Meal Time</label>
              <div className="grid grid-cols-2 gap-2">
                {MEAL_TIMES.map(meal => (
                  <button
                    key={meal}
                    type="button"
                    onClick={() => setFormData({ ...formData, mealTime: meal })}
                    className={`py-3 rounded-lg border-2 font-medium transition-all ${
                      formData.mealTime === meal
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                        : darkMode
                        ? 'border-gray-600 hover:border-gray-500'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    {meal}
                  </button>
                ))}
              </div>
              {errors.mealTime && <p className="text-red-500 text-xs mt-1">{errors.mealTime}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Date
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                min={new Date().toISOString().split('T')[0]}
                className={`w-full border ${darkMode ? 'bg-gray-700 border-gray-600' : 'border-gray-300'} rounded-lg px-4 py-3`}
              />
              {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date}</p>}
            </div>
          </div>
        )}

        {/* Step 2: Pricing */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                <IndianRupee className="w-4 h-4" />
                Target Price
              </label>
              <input
                type="number"
                value={formData.targetPrice}
                onChange={(e) => setFormData({ ...formData, targetPrice: e.target.value })}
                placeholder="100"
                className={`w-full border ${darkMode ? 'bg-gray-700 border-gray-600' : 'border-gray-300'} rounded-lg px-4 py-3`}
              />
              {errors.targetPrice && <p className="text-red-500 text-xs mt-1">{errors.targetPrice}</p>}
            </div>

            <div className={`p-4 rounded-lg border-2 ${darkMode ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isAuction}
                  onChange={(e) => setFormData({ ...formData, isAuction: e.target.checked })}
                  className="w-5 h-5"
                />
                <div>
                  <p className="font-medium">Auction Mode</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Price stays fixed, highest bid wins
                  </p>
                </div>
              </label>
            </div>

            {!formData.isAuction && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                    <TrendingDown className="w-4 h-4" />
                    Price Drop Amount
                  </label>
                  <input
                    type="number"
                    value={formData.priceDropAmount}
                    onChange={(e) => setFormData({ ...formData, priceDropAmount: e.target.value })}
                    placeholder="10"
                    className={`w-full border ${darkMode ? 'bg-gray-700 border-gray-600' : 'border-gray-300'} rounded-lg px-4 py-3`}
                  />
                  {errors.priceDropAmount && <p className="text-red-500 text-xs mt-1">{errors.priceDropAmount}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                    <Timer className="w-4 h-4" />
                    Drop Interval (minutes)
                  </label>
                  <input
                    type="number"
                    value={formData.priceDropInterval}
                    onChange={(e) => setFormData({ ...formData, priceDropInterval: e.target.value })}
                    className={`w-full border ${darkMode ? 'bg-gray-700 border-gray-600' : 'border-gray-300'} rounded-lg px-4 py-3`}
                  />
                </div>

                <div className={`p-3 rounded-lg ${darkMode ? 'bg-blue-900/30' : 'bg-blue-50'} flex gap-2`}>
                  <Info className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-blue-600 dark:text-blue-400">
                    After 2 price drops, the item will be sold to the highest bidder
                  </p>
                </div>
              </>
            )}

            {formData.isAuction && (
              <div>
                <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Auction Duration (minutes)
                </label>
                <input
                  type="number"
                  value={formData.auctionDuration}
                  onChange={(e) => setFormData({ ...formData, auctionDuration: e.target.value })}
                  className={`w-full border ${darkMode ? 'bg-gray-700 border-gray-600' : 'border-gray-300'} rounded-lg px-4 py-3`}
                />
              </div>
            )}
          </div>
        )}

        {/* Step 3: QR Codes */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-700 rounded-lg p-4 mb-4">
              <p className="text-xs text-yellow-800 dark:text-yellow-200 font-medium mb-2">⚠️ Important: Verify QR codes!</p>
              <p className="text-xs text-yellow-700 dark:text-yellow-300">• <strong>Mess QR</strong> = For buyer to receive mess</p>
              <p className="text-xs text-yellow-700 dark:text-yellow-300">• <strong>UPI QR</strong> = For you to receive payment</p>
              <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1 font-medium">Double-check before uploading!</p>
            </div>

            {/* Mess QR */}
            <div>
              <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                <QrCode className="w-4 h-4" />
                Mess QR Code
                <span className="text-xs text-gray-500">(Buyer receives mess)</span>
              </label>
              
              {defaultMessQR && (
                <label className="flex items-center gap-2 mb-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                  <input
                    type="checkbox"
                    checked={useDefaultMessQR}
                    onChange={(e) => {
                      setUseDefaultMessQR(e.target.checked);
                      if (e.target.checked) {
                        setCustomMessQR(null);
                        setMessQRFile(null);
                      }
                    }}
                    className="rounded"
                  />
                  <span className="text-sm">Use default from profile</span>
                </label>
              )}

              {useDefaultMessQR && defaultMessQR ? (
                <img src={defaultMessQR} alt="Default Mess QR" className="w-32 h-32 object-cover rounded border" />
              ) : (
                <>
                  {customMessQR ? (
                    <div className="flex items-center gap-3">
                      <img src={customMessQR} alt="Mess QR" className="w-32 h-32 object-cover rounded border" />
                      <button
                        onClick={() => {
                          setCustomMessQR(null);
                          setMessQRFile(null);
                        }}
                        className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                      <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                      <label className="cursor-pointer">
                        <span className="text-sm text-blue-500 hover:text-blue-600">Upload Mess QR Code</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleQRUpload('mess', e)}
                          className="hidden"
                        />
                      </label>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* UPI QR */}
            <div>
              <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                <QrCode className="w-4 h-4" />
                UPI QR Code
                <span className="text-xs text-gray-500">(You receive payment)</span>
              </label>
              
              {defaultUpiQR && (
                <label className="flex items-center gap-2 mb-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                  <input
                    type="checkbox"
                    checked={useDefaultUpiQR}
                    onChange={(e) => {
                      setUseDefaultUpiQR(e.target.checked);
                      if (e.target.checked) {
                        setCustomUpiQR(null);
                        setUpiQRFile(null);
                      }
                    }}
                    className="rounded"
                  />
                  <span className="text-sm">Use default from profile</span>
                </label>
              )}

              {useDefaultUpiQR && defaultUpiQR ? (
                <img src={defaultUpiQR} alt="Default UPI QR" className="w-32 h-32 object-cover rounded border" />
              ) : (
                <>
                  {customUpiQR ? (
                    <div className="flex items-center gap-3">
                      <img src={customUpiQR} alt="UPI QR" className="w-32 h-32 object-cover rounded border" />
                      <button
                        onClick={() => {
                          setCustomUpiQR(null);
                          setUpiQRFile(null);
                        }}
                        className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                      <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                      <label className="cursor-pointer">
                        <span className="text-sm text-blue-500 hover:text-blue-600">Upload UPI QR Code</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleQRUpload('upi', e)}
                          className="hidden"
                        />
                      </label>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className={`p-3 rounded-lg ${darkMode ? 'bg-blue-900/30' : 'bg-blue-50'} flex gap-2`}>
              <Info className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-blue-600 dark:text-blue-400">
                QR codes are optional but recommended for smooth transactions
              </p>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          {step > 1 && (
            <button
              onClick={() => setStep(step - 1)}
              className={`px-6 ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} py-3 rounded-lg font-semibold`}
            >
              Back
            </button>
          )}
          <button
            onClick={handleNext}
            disabled={!userMessQR}
            className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-3 rounded-lg font-semibold"
          >
            {step === 3 ? 'Create Listing' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
}