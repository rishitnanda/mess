import { useState } from 'react';
import { LoginForm } from './components/LoginForm';
import { Moon, Sun } from 'lucide-react';

export default function App() {
  const [darkMode, setDarkMode] = useState(false);

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-[#1E1F24]' : 'bg-[#F3F4F6]'} flex items-center justify-center p-6 transition-colors duration-300 relative`}>
      {/* Dark Mode Toggle */}
      <button
        type="button"
        onClick={() => setDarkMode(!darkMode)}
        className={`absolute top-6 right-6 p-3 rounded-lg ${
          darkMode 
            ? 'bg-gray-700 text-yellow-400 hover:bg-gray-600' 
            : 'bg-white text-gray-600 hover:bg-gray-100'
        } transition-all duration-200 shadow-md`}
      >
        {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
      </button>
      
      <LoginForm darkMode={darkMode} />
    </div>
  );
}