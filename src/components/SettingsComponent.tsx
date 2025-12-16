import React, { useState, useEffect } from 'react';
import { X, Bell, BellOff, Save, Check } from 'lucide-react';
import { api } from '../lib/supabase';

interface SettingsComponentProps {
  userId: string;
  onClose: () => void;
  darkMode: boolean;
  onUpdate?: (data: any) => void;
}

export default function SettingsComponent({ userId, onClose, darkMode, onUpdate }: SettingsComponentProps) {
  const [settings, setSettings] = useState({
    notify_listing_sold: true,
    notify_listing_resumed: true,
    notify_auction_won: true,
    notify_auction_lost: false,
    notify_lost_auction_resumes: true,
    notify_price_reduced: true
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadSettings();
  }, [userId]);

  const loadSettings = async () => {
    setLoading(true);
    const { data, error } = await api.getSettings(userId);
    if (data) {
      setSettings({
        notify_listing_sold: data.notify_listing_sold,
        notify_listing_resumed: data.notify_listing_resumed,
        notify_auction_won: data.notify_auction_won,
        notify_auction_lost: data.notify_auction_lost,
        notify_lost_auction_resumes: data.notify_lost_auction_resumes,
        notify_price_reduced: data.notify_price_reduced
      });
    }
    setLoading(false);
  };

  const toggleSetting = (key) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    
    try {
      const { data, error } = await api.updateSettings(userId, settings);
      
      if (error) throw error;
      
      setSaved(true);
      if (onUpdate) onUpdate(data);
      
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Error updating settings:', error);
      alert('Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const settingsConfig = [
    {
      key: 'notify_listing_sold',
      title: 'Listing Sold',
      description: 'Get notified when your listing is successfully sold',
      icon: '💰'
    },
    {
      key: 'notify_listing_resumed',
      title: 'Listing Resumed',
      description: 'Get notified when your listing is resumed after being paused',
      icon: '▶️'
    },
    {
      key: 'notify_auction_won',
      title: 'Auction Won',
      description: 'Get notified when you win an auction',
      icon: '🏆'
    },
    {
      key: 'notify_auction_lost',
      title: 'Auction Lost',
      description: 'Get notified when you lose an auction',
      icon: '😔'
    },
    {
      key: 'notify_lost_auction_resumes',
      title: 'Lost Auction Resumes',
      description: 'Get notified when an auction you lost becomes available again',
      icon: '🔄'
    },
    {
      key: 'notify_price_reduced',
      title: 'Price Reduced',
      description: 'Get notified when listing price drops due to no bids',
      icon: '📉'
    }
  ];

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
          <div>
            <h2 className="text-2xl font-bold">Settings</h2>
            <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Manage your notification preferences
            </p>
          </div>
          <button onClick={onClose} className="hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded-lg">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Saved Indicator */}
        {saved && (
          <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center gap-2 text-green-700 dark:text-green-400">
            <Check className="w-5 h-5" />
            <span className="text-sm font-medium">Settings saved successfully!</span>
          </div>
        )}

        {/* Notifications Section */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Bell className="w-5 h-5 text-blue-500" />
            <h3 className="text-lg font-semibold">Notifications</h3>
          </div>
          
          <div className="space-y-3">
            {settingsConfig.map((config) => (
              <div
                key={config.key}
                className={`p-4 rounded-lg border-2 transition-all ${
                  settings[config.key]
                    ? darkMode
                      ? 'border-blue-600 bg-blue-900/20'
                      : 'border-blue-200 bg-blue-50'
                    : darkMode
                    ? 'border-gray-600 bg-gray-700/50'
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xl">{config.icon}</span>
                      <h4 className="font-semibold">{config.title}</h4>
                    </div>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {config.description}
                    </p>
                  </div>
                  
                  <button
                    onClick={() => toggleSetting(config.key)}
                    className={`relative ml-4 w-14 h-7 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                      settings[config.key]
                        ? 'bg-blue-500'
                        : darkMode
                        ? 'bg-gray-600'
                        : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform duration-200 ${
                        settings[config.key] ? 'translate-x-7' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className={`mb-6 p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
          <h4 className="font-semibold mb-3 text-sm">Quick Actions</h4>
          <div className="flex gap-2">
            <button
              onClick={() => {
                const newSettings = { ...settings };
                Object.keys(newSettings).forEach(key => newSettings[key] = true);
                setSettings(newSettings);
                setSaved(false);
              }}
              className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                darkMode
                  ? 'bg-gray-600 hover:bg-gray-500 text-white'
                  : 'bg-white hover:bg-gray-200 text-gray-700'
              }`}
            >
              Enable All
            </button>
            <button
              onClick={() => {
                const newSettings = { ...settings };
                Object.keys(newSettings).forEach(key => newSettings[key] = false);
                setSettings(newSettings);
                setSaved(false);
              }}
              className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                darkMode
                  ? 'bg-gray-600 hover:bg-gray-500 text-white'
                  : 'bg-white hover:bg-gray-200 text-gray-700'
              }`}
            >
              Disable All
            </button>
          </div>
        </div>

        {/* Summary */}
        <div className={`mb-6 p-4 rounded-lg border ${
          darkMode ? 'bg-gray-700/50 border-gray-600' : 'bg-blue-50 border-blue-200'
        }`}>
          <div className="flex items-center gap-2 mb-2">
            <Bell className="w-4 h-4 text-blue-500" />
            <span className="text-sm font-semibold">Notification Summary</span>
          </div>
          <p className="text-sm">
            {Object.values(settings).filter(Boolean).length} of {Object.keys(settings).length} notifications enabled
          </p>
        </div>

        {/* Save Button */}
        <div className="flex gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleSave}
            disabled={saving || saved}
            className={`flex-1 ${
              saved
                ? 'bg-green-500 hover:bg-green-600'
                : 'bg-blue-500 hover:bg-blue-600'
            } disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2`}
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Saving...
              </>
            ) : saved ? (
              <>
                <Check className="w-5 h-5" />
                Saved!
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Save Settings
              </>
            )}
          </button>
          <button
            onClick={onClose}
            className={`px-6 ${
              darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'
            } py-3 rounded-lg font-semibold transition-colors`}
          >
            Close
          </button>
        </div>

        {/* Additional Info */}
        <div className={`mt-6 p-4 rounded-lg ${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            💡 <strong>Tip:</strong> You'll receive notifications in real-time when enabled. 
            Make sure to allow notifications in your browser settings for the best experience.
          </p>
        </div>
      </div>
    </div>
  );
}