import { useState } from 'react'
import { LoginForm } from './components/LoginForm'
import Home from './pages/Home'
import ProfileComponent from './components/ProfileComponent'
import SettingsComponent from './components/SettingsComponent'

// FIX 1: Define User interface
interface User {
  id: string
  name: string
  email: string
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  
  // FIX 2: Properly type currentUser as User | null
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  
  const [darkMode, setDarkMode] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [showSettings, setShowSettings] = useState(false)

  return (
    <div className={darkMode ? 'dark' : ''}>
      {!isAuthenticated ? (
        <LoginForm 
          darkMode={darkMode}
          onLogin={(user) => {
            setIsAuthenticated(true)
            setCurrentUser(user)
          }}
        />
      ) : (
        <>
          <Home 
            darkMode={darkMode}
            currentUser={currentUser}
            onShowProfile={() => setShowProfile(true)}
            onShowSettings={() => setShowSettings(true)}
          />
          
          {/* FIX 3: Add null check before accessing currentUser.id */}
          {showProfile && currentUser && (
            <ProfileComponent
              userId={currentUser.id}
              darkMode={darkMode}
              onClose={() => setShowProfile(false)}
            />
          )}
          
          {/* FIX 4: Add null check here too */}
          {showSettings && currentUser && (
            <SettingsComponent
              userId={currentUser.id}
              darkMode={darkMode}
              onClose={() => setShowSettings(false)}
            />
          )}
        </>
      )}
    </div>
  )
}

// ===== ALTERNATIVE FIX (Non-null assertion) =====
// If you're 100% sure currentUser exists when isAuthenticated is true:

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [darkMode, setDarkMode] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [showSettings, setShowSettings] = useState(false)

  return (
    <div className={darkMode ? 'dark' : ''}>
      {!isAuthenticated ? (
        <LoginForm 
          darkMode={darkMode}
          onLogin={(user) => {
            setIsAuthenticated(true)
            setCurrentUser(user)
          }}
        />
      ) : (
        <>
          <Home 
            darkMode={darkMode}
            currentUser={currentUser}
            onShowProfile={() => setShowProfile(true)}
            onShowSettings={() => setShowSettings(true)}
          />
          
          {/* Using non-null assertion (!) - use with caution */}
          {showProfile && (
            <ProfileComponent
              userId={currentUser!.id}
              darkMode={darkMode}
              onClose={() => setShowProfile(false)}
            />
          )}
          
          {showSettings && (
            <SettingsComponent
              userId={currentUser!.id}
              darkMode={darkMode}
              onClose={() => setShowSettings(false)}
            />
          )}
        </>
      )}
    </div>
  )
}

// ===== BEST PRACTICE FIX (Early return) =====
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
        <LoginForm 
          darkMode={darkMode}
          onLogin={(user) => {
            setIsAuthenticated(true)
            setCurrentUser(user)
          }}
        />
      </div>
    )
  }

  // Authenticated but no user data - shouldn't happen, but safe guard
  if (!currentUser) {
    return <div>Loading...</div>
  }

  // Authenticated with user - now currentUser is guaranteed non-null
  return (
    <div className={darkMode ? 'dark' : ''}>
      <Home 
        darkMode={darkMode}
        currentUser={currentUser}
        onShowProfile={() => setShowProfile(true)}
        onShowSettings={() => setShowSettings(true)}
      />
      
      {/* Now TypeScript knows currentUser is not null */}
      {showProfile && (
        <ProfileComponent
          userId={currentUser.id}
          darkMode={darkMode}
          onClose={() => setShowProfile(false)}
        />
      )}
      
      {showSettings && (
        <SettingsComponent
          userId={currentUser.id}
          darkMode={darkMode}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  )
}