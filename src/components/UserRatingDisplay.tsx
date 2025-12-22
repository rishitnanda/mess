import { useState, useEffect } from 'react';
import { Star, TrendingUp, ShoppingBag, Award, X } from 'lucide-react';
import { api } from '../lib/supabase';

interface UserRatingDisplayProps {
  userId: string;
  darkMode: boolean;
  compact?: boolean;
  onClose?: () => void;
}

interface Rating {
  id: string;
  rating: number;
  review: string;
  transaction_type: 'buyer' | 'seller';
  created_at: string;
  profiles: {
    name: string;
    profile_pic: string | null;
  };
}

interface UserStats {
  avg_rating: number;
  total_ratings: number;
  total_sales: number;
  total_purchases: number;
}

export default function UserRatingDisplay({ 
  userId, 
  darkMode, 
  compact = false,
  onClose 
}: UserRatingDisplayProps) {
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'buyer' | 'seller'>('all');

  useEffect(() => {
    loadData();
  }, [userId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [ratingsData, statsData] = await Promise.all([
        api.getUserRatings(userId),
        api.getUserStats(userId)
      ]);

      if (ratingsData.data) setRatings(ratingsData.data);
      if (statsData.data) setStats(statsData.data);
    } catch (error) {
      console.error('Error loading ratings:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredRatings = ratings.filter(r => 
    filter === 'all' ? true : r.transaction_type === filter
  );

  const ratingDistribution = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: ratings.filter(r => r.rating === star).length,
    percentage: ratings.length > 0 
      ? (ratings.filter(r => r.rating === star).length / ratings.length) * 100 
      : 0
  }));

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1">
          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
          <span className="font-semibold">
            {stats?.avg_rating?.toFixed(1) || '0.0'}
          </span>
        </div>
        <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          ({stats?.total_ratings || 0} {stats?.total_ratings === 1 ? 'review' : 'reviews'})
        </span>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className={`${darkMode ? 'bg-gray-800 text-white' : 'bg-white'} rounded-lg max-w-4xl w-full my-8 max-h-[90vh] flex flex-col`}>
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-2xl font-bold">User Ratings & Reviews</h2>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Community feedback and statistics
            </p>
          </div>
          {onClose && (
            <button onClick={onClose} className="hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded-lg">
              <X className="w-6 h-6" />
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-6">
            {/* Overall Rating Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Rating Overview */}
              <div className={`p-6 rounded-lg border-2 ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                <div className="text-center mb-4">
                  <div className="text-5xl font-bold mb-2">
                    {stats?.avg_rating?.toFixed(1) || '0.0'}
                  </div>
                  <div className="flex items-center justify-center gap-1 mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-6 h-6 ${
                          star <= Math.round(stats?.avg_rating || 0)
                            ? 'fill-yellow-400 text-yellow-400'
                            : darkMode
                            ? 'text-gray-600'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Based on {stats?.total_ratings || 0} reviews
                  </p>
                </div>

                {/* Rating Distribution */}
                <div className="space-y-2">
                  {ratingDistribution.map(({ star, count, percentage }) => (
                    <div key={star} className="flex items-center gap-2">
                      <span className="text-sm w-3">{star}</span>
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-yellow-400"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-sm w-8 text-right">{count}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Activity Stats */}
              <div className="space-y-3">
                <div className={`p-4 rounded-lg ${darkMode ? 'bg-blue-900/30' : 'bg-blue-50'}`}>
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-500 rounded-lg">
                      <ShoppingBag className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Total Sales
                      </p>
                      <p className="text-2xl font-bold">{stats?.total_sales || 0}</p>
                    </div>
                  </div>
                </div>

                <div className={`p-4 rounded-lg ${darkMode ? 'bg-green-900/30' : 'bg-green-50'}`}>
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-green-500 rounded-lg">
                      <TrendingUp className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Total Purchases
                      </p>
                      <p className="text-2xl font-bold">{stats?.total_purchases || 0}</p>
                    </div>
                  </div>
                </div>

                <div className={`p-4 rounded-lg ${darkMode ? 'bg-purple-900/30' : 'bg-purple-50'}`}>
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-purple-500 rounded-lg">
                      <Award className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Community Trust
                      </p>
                      <p className="text-2xl font-bold">
                        {stats?.avg_rating ? Math.round(stats.avg_rating * 20) : 0}%
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 mb-6">
              {(['all', 'buyer', 'seller'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${
                    filter === f
                      ? 'bg-blue-500 text-white'
                      : darkMode
                      ? 'bg-gray-700 hover:bg-gray-600'
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  {f === 'all' ? 'All' : f === 'buyer' ? 'As Buyer' : 'As Seller'}
                  {f !== 'all' && ` (${ratings.filter(r => r.transaction_type === f).length})`}
                </button>
              ))}
            </div>

            {/* Reviews List */}
            {filteredRatings.length === 0 ? (
              <div className="text-center py-12">
                <p className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  No reviews yet
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredRatings.map((rating) => (
                  <div
                    key={rating.id}
                    className={`p-4 rounded-lg border-2 ${
                      darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'
                    }`}
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center flex-shrink-0">
                        {rating.profiles.profile_pic ? (
                          <img
                            src={rating.profiles.profile_pic}
                            alt={rating.profiles.name}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <span className="font-semibold">
                            {rating.profiles.name.charAt(0)}
                          </span>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-semibold">{rating.profiles.name}</p>
                          <span className={`text-xs px-2 py-1 rounded ${
                            rating.transaction_type === 'buyer'
                              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                              : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          }`}>
                            {rating.transaction_type === 'buyer' ? 'Buyer' : 'Seller'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 mb-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-4 h-4 ${
                                star <= rating.rating
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : darkMode
                                  ? 'text-gray-600'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        {rating.review && (
                          <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            {rating.review}
                          </p>
                        )}
                        <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'} mt-2`}>
                          {new Date(rating.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}