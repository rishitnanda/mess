import { useState } from 'react';
import { X, Star, Send } from 'lucide-react';

interface RatingModalProps {
  darkMode: boolean;
  ratedUserName: string;
  transactionType: 'buyer' | 'seller';
  onClose: () => void;
  onSubmit: (rating: number, review: string) => Promise<void>;
}

export default function RatingModal({ 
  darkMode, 
  ratedUserName, 
  transactionType,
  onClose, 
  onSubmit 
}: RatingModalProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [review, setReview] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      alert('Please select a rating');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit(rating, review);
      onClose();
    } catch (error) {
      console.error('Error submitting rating:', error);
      alert('Failed to submit rating. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const ratingLabels = ['Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className={`${darkMode ? 'bg-gray-800 text-white' : 'bg-white'} rounded-lg max-w-md w-full p-6`}>
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold">Rate Transaction</h2>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              How was your experience as a {transactionType}?
            </p>
          </div>
          <button 
            onClick={onClose}
            className="hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Info */}
        <div className={`p-4 rounded-lg mb-6 ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
          <p className="text-sm font-medium mb-1">
            {transactionType === 'buyer' ? 'Rating seller:' : 'Rating buyer:'}
          </p>
          <p className="text-lg font-bold">{ratedUserName}</p>
        </div>

        {/* Star Rating */}
        <div className="mb-6">
          <p className="text-sm font-medium mb-3">Your Rating</p>
          <div className="flex items-center gap-2 mb-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="transition-transform hover:scale-110"
              >
                <Star
                  className={`w-10 h-10 ${
                    star <= (hoverRating || rating)
                      ? 'fill-yellow-400 text-yellow-400'
                      : darkMode
                      ? 'text-gray-600'
                      : 'text-gray-300'
                  }`}
                />
              </button>
            ))}
          </div>
          {(rating > 0 || hoverRating > 0) && (
            <p className="text-sm font-semibold text-yellow-500">
              {ratingLabels[(hoverRating || rating) - 1]}
            </p>
          )}
        </div>

        {/* Review Text */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">
            Review (Optional)
          </label>
          <textarea
            value={review}
            onChange={(e) => setReview(e.target.value)}
            placeholder="Share your experience..."
            rows={4}
            maxLength={500}
            className={`w-full border ${
              darkMode ? 'bg-gray-700 border-gray-600' : 'border-gray-300'
            } rounded-lg px-4 py-3 resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
          />
          <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            {review.length}/500 characters
          </p>
        </div>

        {/* Quick Review Tags */}
        <div className="mb-6">
          <p className="text-sm font-medium mb-2">Quick Tags</p>
          <div className="flex flex-wrap gap-2">
            {[
              'Reliable',
              'Good Communication',
              'On Time',
              'Fair Price',
              'Smooth Transaction',
              'Would Recommend'
            ].map((tag) => (
              <button
                key={tag}
                onClick={() => setReview((prev) => 
                  prev ? `${prev}, ${tag}` : tag
                )}
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  darkMode
                    ? 'bg-gray-700 hover:bg-gray-600'
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Info Box */}
        <div className={`p-3 rounded-lg mb-6 ${
          darkMode ? 'bg-blue-900/30 border border-blue-700' : 'bg-blue-50 border border-blue-200'
        }`}>
          <p className="text-xs text-blue-600 dark:text-blue-400">
            💡 Your rating helps build trust in the community. Be honest and constructive.
          </p>
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
            disabled={submitting || rating === 0}
            className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-4 py-3 rounded-lg font-semibold flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Submitting...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Submit Rating
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}