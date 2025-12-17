import React, { useState, useEffect } from 'react';
import { X, Upload, User, Mail, Phone, QrCode, Camera } from 'lucide-react';
import { api } from '../lib/supabase';

// FIXED: Proper type definitions
interface ProfileData {
  id?: string;
  name?: string;
  email?: string;
  phone?: string;
  mess_qr?: string;
  profile_pic?: string | null;
  created_at?: string;
  updated_at?: string;
}

interface ProfileComponentProps {
  userId: string;
  onClose: () => void;
  darkMode: boolean;
  onUpdate?: (data: ProfileData) => void;
}

interface ProfileState {
  name: string;
  email: string;
  phone: string;
  messQR: string;
  profilePic: string | null;
}

export default function ProfileComponent({ 
  userId, 
  onClose, 
  darkMode, 
  onUpdate 
}: ProfileComponentProps) {
  const [profile, setProfile] = useState<ProfileState>({
    name: '',
    email: '',
    phone: '',
    messQR: '',
    profilePic: null
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [hasActiveItems, setHasActiveItems] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    loadProfile();
    checkActiveItems();
  }, [userId]);

  const loadProfile = async () => {
    setLoading(true);
    const { data, error } = await api.getProfile(userId);
    if (data) {
      setProfile({
        name: data.name || '',
        email: data.email || '',
        phone: data.phone || '',
        messQR: data.mess_qr || '',
        profilePic: data.profile_pic || null
      });
      setImagePreview(data.profile_pic || null);
    }
    if (error) {
      console.error('Error loading profile:', error);
    }
    setLoading(false);
  };

  const checkActiveItems = async () => {
    try {
      // Check if user has active listings or bids
      const { data: listings } = await api.getListings();
      const userListings = listings?.filter(l => l.seller_id === userId && l.status === 'active') || [];
      
      const { data: allListings } = await api.getListings();
      const userBids = allListings?.filter(l => 
        Array.isArray(l.bids) && l.bids.some(b => b.bidder_id === userId)
      ) || [];
      
      setHasActiveItems(userListings.length > 0 || userBids.length > 0);
    } catch (error) {
      console.error('Error checking active items:', error);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    
    try {
      let profilePicUrl = profile.profilePic;
      
      // Upload profile picture if changed
      if (imageFile) {
        const { data: uploadData, error: uploadError } = await api.uploadProfilePic(userId, imageFile);
        if (uploadError) throw uploadError;
        profilePicUrl = uploadData;
      }
      
      // Update profile
      const { data, error } = await api.updateProfile(userId, {
        name: profile.name,
        email: profile.email,
        phone: profile.phone,
        mess_qr: profile.messQR,
        profile_pic: profilePicUrl || undefined
      });
      
      if (error) throw error;
      
      setProfile(prev => ({ ...prev, profilePic: profilePicUrl }));
      setEditMode(false);
      setImageFile(null);
      
      if (onUpdate && data) onUpdate(data);
      
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <div className={`${darkMode ? 'bg-gray-800 text-white' : 'bg-white'} rounded-lg p-8`}>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className={`${darkMode ? 'bg-gray-800 text-white' : 'bg-white'} rounded-lg max-w-2xl w-full my-8 p-6`}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">My Profile</h2>
          <button onClick={onClose} className="hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded-lg">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Profile Picture Section */}
        <div className="flex flex-col items-center mb-6">
          <div className="relative">
            <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
              {imagePreview ? (
                <img src={imagePreview} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User className="w-16 h-16 text-gray-400" />
              )}
            </div>
            
            {editMode && (
              <label className="absolute bottom-0 right-0 bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full cursor-pointer shadow-lg">
                <Camera className="w-5 h-5" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            )}
          </div>
          
          {!editMode && (
            <label className="mt-4 text-sm text-blue-500 hover:text-blue-600 cursor-pointer flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Change Photo
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  setEditMode(true);
                  handleImageChange(e);
                }}
                className="hidden"
              />
            </label>
          )}
        </div>

        {/* Warning for active items */}
        {hasActiveItems && !editMode && (
          <div className={`mb-6 p-4 rounded-lg border-2 ${
            darkMode 
              ? 'bg-yellow-900/20 border-yellow-700 text-yellow-200' 
              : 'bg-yellow-50 border-yellow-200 text-yellow-800'
          }`}>
            <p className="text-sm font-semibold mb-1">⚠️ Cannot Edit Profile</p>
            <p className="text-xs">
              You have active listings or pending bids. Complete or cancel them before editing your profile information.
            </p>
          </div>
        )}

        {/* Profile Form */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 flex items-center gap-2">
              <User className="w-4 h-4" />
              Full Name
            </label>
            <input
              type="text"
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              disabled={!editMode || hasActiveItems}
              placeholder="Enter your full name"
              className={`w-full border ${
                darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
              } rounded-lg px-4 py-3 disabled:opacity-50 disabled:cursor-not-allowed focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Email Address
            </label>
            <input
              type="email"
              value={profile.email}
              onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              disabled={!editMode || hasActiveItems}
              placeholder="your.email@example.com"
              className={`w-full border ${
                darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
              } rounded-lg px-4 py-3 disabled:opacity-50 disabled:cursor-not-allowed focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 flex items-center gap-2">
              <Phone className="w-4 h-4" />
              Phone Number
            </label>
            <input
              type="tel"
              value={profile.phone}
              onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              disabled={!editMode || hasActiveItems}
              placeholder="+91 XXXXX XXXXX"
              className={`w-full border ${
                darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
              } rounded-lg px-4 py-3 disabled:opacity-50 disabled:cursor-not-allowed focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 flex items-center gap-2">
              <QrCode className="w-4 h-4" />
              Mess QR Code (Auth Code)
            </label>
            <input
              type="text"
              value={profile.messQR}
              onChange={(e) => setProfile({ ...profile, messQR: e.target.value })}
              disabled={!editMode}
              placeholder="Enter your mess authentication code"
              className={`w-full border ${
                darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
              } rounded-lg px-4 py-3 disabled:opacity-50 disabled:cursor-not-allowed focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            />
            <p className={`mt-2 text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              ℹ️ Required to create listings. You can update this anytime.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          {!editMode ? (
            <button
              onClick={() => setEditMode(true)}
              disabled={hasActiveItems}
              className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-3 rounded-lg font-semibold transition-colors"
            >
              Edit Profile
            </button>
          ) : (
            <>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </button>
              <button
                onClick={() => {
                  setEditMode(false);
                  setImageFile(null);
                  setImagePreview(profile.profilePic);
                  loadProfile();
                }}
                disabled={saving}
                className={`px-6 ${
                  darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'
                } py-3 rounded-lg font-semibold transition-colors`}
              >
                Cancel
              </button>
            </>
          )}
        </div>

        {/* Profile Stats */}
        <div className={`mt-6 pt-6 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <h3 className="text-sm font-semibold mb-3">Account Information</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className={darkMode ? 'text-gray-400' : 'text-gray-500'}>Member Since</p>
              <p className="font-medium">{new Date().toLocaleDateString()}</p>
            </div>
            <div>
              <p className={darkMode ? 'text-gray-400' : 'text-gray-500'}>Account Status</p>
              <p className="font-medium text-green-600">
                {profile.messQR ? '✓ Verified' : '⚠ Incomplete'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}