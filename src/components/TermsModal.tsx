import { X, FileText } from 'lucide-react';

interface TermsModalProps {
  darkMode: boolean;
  onClose: () => void;
}

export default function TermsModal({ darkMode, onClose }: TermsModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className={`${darkMode ? 'bg-gray-800 text-white' : 'bg-white'} rounded-lg max-w-3xl w-full my-8 p-6`}>
        {/* Header */}
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Terms and Conditions</h2>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Last updated: {new Date().toLocaleDateString()}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded-lg"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content - Currently Empty */}
        <div className="max-h-[60vh] overflow-y-auto space-y-6">
          <div className={`p-6 rounded-lg border-2 ${
            darkMode 
              ? 'bg-yellow-900/20 border-yellow-700' 
              : 'bg-yellow-50 border-yellow-200'
          }`}>
            <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
              ⚠️ Terms and Conditions content will be added here.
            </p>
            <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-2">
              This section is currently under development. Please check back later for detailed terms and conditions.
            </p>
          </div>

          {/* Placeholder sections */}
          <div>
            <h3 className="text-lg font-bold mb-3">1. Introduction</h3>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              [Content to be added]
            </p>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-3">2. User Responsibilities</h3>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              [Content to be added]
            </p>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-3">3. Marketplace Rules</h3>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              [Content to be added]
            </p>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-3">4. Payment and Transactions</h3>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              [Content to be added]
            </p>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-3">5. Privacy Policy</h3>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              [Content to be added]
            </p>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-3">6. Dispute Resolution</h3>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              [Content to be added]
            </p>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-3">7. Limitation of Liability</h3>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              [Content to be added]
            </p>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-3">8. Changes to Terms</h3>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              [Content to be added]
            </p>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-3">9. Contact Information</h3>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              [Content to be added]
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}