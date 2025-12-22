import { useState } from 'react';
import { X, AlertTriangle, Upload, Send } from 'lucide-react';

interface ReportModalProps {
  darkMode: boolean;
  reportedUserName: string;
  reportedUserId: string;
  listingId?: string;
  onClose: () => void;
  onSubmit: (reason: string, description: string, evidenceUrls: string[]) => Promise<void>;
}

const REPORT_REASONS = [
  'Scam/Fraud',
  'No Show',
  'False Listing',
  'Harassment',
  'Price Manipulation',
  'Fake Account',
  'Payment Issues',
  'Other'
];

export default function ReportModal({ 
  darkMode, 
  reportedUserName,
  reportedUserId,
  listingId,
  onClose, 
  onSubmit 
}: ReportModalProps) {
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [evidenceUrls, setEvidenceUrls] = useState<string[]>([]);
  const [newUrl, setNewUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!reason) {
      alert('Please select a reason for reporting');
      return;
    }

    if (!description.trim()) {
      alert('Please provide a description');
      return;
    }

    if (description.length < 20) {
      alert('Description must be at least 20 characters');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit(reason, description, evidenceUrls);
      alert('Report submitted successfully. Our team will review it shortly.');
      onClose();
    } catch (error) {
      console.error('Error submitting report:', error);
      alert('Failed to submit report. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const addEvidenceUrl = () => {
    if (newUrl.trim() && evidenceUrls.length < 5) {
      setEvidenceUrls([...evidenceUrls, newUrl.trim()]);
      setNewUrl('');
    }
  };

  const removeEvidenceUrl = (index: number) => {
    setEvidenceUrls(evidenceUrls.filter((_, i) => i !== index));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className={`${darkMode ? 'bg-gray-800 text-white' : 'bg-white'} rounded-lg max-w-2xl w-full my-8 p-6`}>
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Report User</h2>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Help us maintain a safe community
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Reported User Info */}
        <div className={`p-4 rounded-lg mb-6 border-2 ${
          darkMode 
            ? 'bg-red-900/20 border-red-700' 
            : 'bg-red-50 border-red-200'
        }`}>
          <p className="text-sm font-medium mb-1">Reporting:</p>
          <p className="text-lg font-bold">{reportedUserName}</p>
          {listingId && (
            <p className="text-xs text-red-600 dark:text-red-400 mt-1">
              Related to listing ID: {listingId.slice(0, 8)}...
            </p>
          )}
        </div>

        {/* Warning */}
        <div className={`p-4 rounded-lg mb-6 ${
          darkMode ? 'bg-yellow-900/30 border border-yellow-700' : 'bg-yellow-50 border border-yellow-200'
        }`}>
          <p className="text-sm text-yellow-600 dark:text-yellow-400">
            ⚠️ <strong>Important:</strong> False reports may result in action against your account. 
            Please only report genuine violations.
          </p>
        </div>

        {/* Reason Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-3">
            Reason for Report <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            {REPORT_REASONS.map((r) => (
              <button
                key={r}
                onClick={() => setReason(r)}
                className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${
                  reason === r
                    ? 'border-red-500 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                    : darkMode
                    ? 'border-gray-600 hover:border-gray-500'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Description */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">
            Detailed Description <span className="text-red-500">*</span>
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Please provide specific details about the issue. Include dates, amounts, and what happened..."
            rows={5}
            maxLength={1000}
            className={`w-full border ${
              darkMode ? 'bg-gray-700 border-gray-600' : 'border-gray-300'
            } rounded-lg px-4 py-3 resize-none focus:ring-2 focus:ring-red-500 focus:border-transparent`}
          />
          <div className="flex justify-between items-center mt-1">
            <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {description.length}/1000 characters (minimum 20)
            </p>
            {description.length < 20 && description.length > 0 && (
              <p className="text-xs text-red-500">
                {20 - description.length} more characters needed
              </p>
            )}
          </div>
        </div>

        {/* Evidence URLs */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">
            Evidence (Screenshots, Links)
          </label>
          <p className={`text-xs mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Add up to 5 URLs to screenshots or other evidence (e.g., Imgur, Google Drive)
          </p>
          
          <div className="flex gap-2 mb-2">
            <input
              type="url"
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              placeholder="https://example.com/screenshot.png"
              disabled={evidenceUrls.length >= 5}
              className={`flex-1 border ${
                darkMode ? 'bg-gray-700 border-gray-600' : 'border-gray-300'
              } rounded-lg px-4 py-2 disabled:opacity-50`}
            />
            <button
              onClick={addEvidenceUrl}
              disabled={!newUrl.trim() || evidenceUrls.length >= 5}
              className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              Add
            </button>
          </div>

          {evidenceUrls.length > 0 && (
            <div className="space-y-2">
              {evidenceUrls.map((url, index) => (
                <div
                  key={index}
                  className={`flex items-center gap-2 p-2 rounded-lg ${
                    darkMode ? 'bg-gray-700' : 'bg-gray-100'
                  }`}
                >
                  <span className="flex-1 text-sm truncate">{url}</span>
                  <button
                    onClick={() => removeEvidenceUrl(index)}
                    className="text-red-500 hover:text-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Consequences Notice */}
        <div className={`p-4 rounded-lg mb-6 ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
          <p className="text-sm font-semibold mb-2">What happens next?</p>
          <ul className={`text-sm space-y-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            <li>• Your report will be reviewed by our moderation team</li>
            <li>• We may contact you for additional information</li>
            <li>• The reported user may face warnings, suspension, or ban</li>
            <li>• You'll be notified of the outcome via notification</li>
          </ul>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={submitting}
            className={`flex-1 px-4 py-3 rounded-lg font-semibold ${
              darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'
            } disabled:opacity-50`}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting || !reason || description.length < 20}
            className="flex-1 bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white px-4 py-3 rounded-lg font-semibold flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Submitting...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Submit Report
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}