import { useState } from 'react'
import { LoginForm } from './components/LoginForm'
import Home from './pages/Home'
import ProfileComponent from './components/ProfileComponent'
import SettingsComponent from './components/SettingsComponent'

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)
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
        </>
      )}
    </div>
  )
}