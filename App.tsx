import { useState } from 'react'
import { LoginForm } from './components/LoginForm'
import Home from './src/pages/Home'
import ProfileComponent from './src/components/ProfileComponent'
import SettingsComponent from './src/components/SettingsComponent'
import { Moon, Sun } from 'lucide-react'

import AdminPanel from './src/components/AdminPanel';
import RatingModal from './src/components/RatingModal';
import ReportModal from './src/components/ReportModal';
import UserRatingDisplay from './src/components/UserRatingDisplay';

// Add state
const [showAdminPanel, setShowAdminPanel] = useState(false);
const [showRatingModal, setShowRatingModal] = useState(false);
const [showReportModal, setShowReportModal] = useState(false);

// Define User interface
interface User {
  id: string
  name: string
  email: string
}

// Define proper types for update callbacks
interface ProfileUpdateData {
  name?: string;
  email?: string;
  phone?: string;
  mess_qr?: string;
  profile_pic?: string | null;
}

interface SettingsUpdateData {
  notify_listing_sold?: boolean;
  notify_listing_resumed?: boolean;
  notify_auction_won?: boolean;
  notify_auction_lost?: boolean;
  notify_lost_auction_resumes?: boolean;
  notify_price_reduced?: boolean;
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [darkMode, setDarkMode] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [showSettings, setShowSettings] = useState(false)

  // Not authenticated - show login
  if (!isAuthenticated) {
    return (
      <div className={darkMode ? 'dark' : ''}>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
          {/* Dark mode toggle in login screen */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="fixed top-4 right-4 p-2 rounded-lg bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-all"
          >
            {darkMode ? (
              <Sun className="w-5 h-5 text-yellow-500" />
            ) : (
              <Moon className="w-5 h-5 text-gray-700" />
            )}
          </button>
          
          <LoginForm 
            darkMode={darkMode}
            onLogin={(user) => {
              setIsAuthenticated(true)
              setCurrentUser(user)
            }}
          />
        </div>
      </div>
    )
  }

  // Authenticated but no user data - safety check
  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  // Authenticated with user - currentUser is guaranteed non-null here
  return (
    <div className={darkMode ? 'dark' : ''}>
      {/* Dark mode toggle button */}
      <button
        onClick={() => setDarkMode(!darkMode)}
        className="fixed top-4 right-20 z-50 p-2 rounded-lg bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-all"
      >
        {darkMode ? (
          <Sun className="w-5 h-5 text-yellow-500" />
        ) : (
          <Moon className="w-5 h-5 text-gray-700" />
        )}
      </button>

      <Home 
        darkMode={darkMode}
        currentUser={currentUser}
        onShowProfile={() => setShowProfile(true)}
        onShowSettings={() => setShowSettings(true)}
      />
      
      {showProfile && (
        <ProfileComponent
          userId={currentUser.id}
          darkMode={darkMode}
          onClose={() => setShowProfile(false)}
          onUpdate={(updatedData: ProfileUpdateData) => {
            // Update user data if needed
            if (updatedData) {
              setCurrentUser({
                ...currentUser,
                name: updatedData.name || currentUser.name,
                email: updatedData.email || currentUser.email
              })
            }
          }}
        />
      )}
      
      {showSettings && (
        <SettingsComponent
          userId={currentUser.id}
          darkMode={darkMode}
          onClose={() => setShowSettings(false)}
          onUpdate={(updatedSettings: SettingsUpdateData) => {
            console.log('Settings updated:', updatedSettings)
          }}
        />
      )}
    </div>
  )
}

// Add admin button (only for admins)
{currentUser.is_admin && (
  <button onClick={() => setShowAdminPanel(true)}>
    Admin Panel
  </button>
)}

// Add modals
{showAdminPanel && (
  <AdminPanel
    darkMode={darkMode}
    currentUserId={currentUser.id}
    onClose={() => setShowAdminPanel(false)}
  />
)}