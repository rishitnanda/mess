import { useState } from 'react'
import { LoginForm } from './components/LoginForm'
import Home from './pages/Home'
import ProfileComponent from './components/ProfileComponent'
import SettingsComponent from './components/SettingsComponent'

// Define User interface
interface User {
  id: string
  name: string
  email: string
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

  // Authenticated but no user data - safety check
  if (!currentUser) {
    return <div>Loading...</div>
  }

  // Authenticated with user - currentUser is guaranteed non-null here
  return (
    <div className={darkMode ? 'dark' : ''}>
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