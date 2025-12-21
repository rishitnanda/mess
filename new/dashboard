import { useState } from 'react';
import { TrendingUp, TrendingDown, DollarSign, ShoppingBag, Award, Clock, Users, Package } from 'lucide-react';

interface DashboardProps {
  darkMode: boolean;
  userId: string;
  listings: any[];
}

interface StatCard {
  title: string;
  value: string | number;
  change: string;
  trend: 'up' | 'down' | 'neutral';
  icon: any;
  color: string;
}

export default function Dashboard({ darkMode, userId, listings }: DashboardProps) {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'all'>('week');

  // Calculate stats
  const userListings = listings.filter(l => l.sellerName === userId);
  const userBids = listings.filter(l => l.bids?.some((b: any) => b.bidder === userId));
  const soldListings = userListings.filter(l => l.status === 'sold');
  const activeListings = userListings.filter(l => l.status === 'active');
  
  const totalEarnings = soldListings.reduce((sum, l) => sum + l.currentPrice, 0);
  const totalSpent = userBids
    .filter(l => l.status === 'sold' && l.bids.find((b: any) => b.bidder === userId)?.amount === l.currentPrice)
    .reduce((sum, l) => sum + l.currentPrice, 0);
  
  const avgListingPrice = userListings.length > 0 
    ? (userListings.reduce((sum, l) => sum + l.currentPrice, 0) / userListings.length).toFixed(0)
    : 0;

  const stats: StatCard[] = [
    {
      title: 'Total Earnings',
      value: `₹${totalEarnings}`,
      change: '+12%',
      trend: 'up',
      icon: DollarSign,
      color: 'green'
    },
    {
      title: 'Active Listings',
      value: activeListings.length,
      change: `${userListings.length} total`,
      trend: 'neutral',
      icon: Package,
      color: 'blue'
    },
    {
      title: 'Items Sold',
      value: soldListings.length,
      change: '+3 this week',
      trend: 'up',
      icon: ShoppingBag,
      color: 'purple'
    },
    {
      title: 'Avg. Price',
      value: `₹${avgListingPrice}`,
      change: '-5%',
      trend: 'down',
      icon: TrendingUp,
      color: 'orange'
    }
  ];

  const recentActivity = [
    ...userListings.slice(0, 3).map(l => ({
      type: 'listing',
      title: `${l.mess} - ${l.mealTime}`,
      description: `Listed for ₹${l.currentPrice}`,
      time: new Date(l.createdAt).toLocaleString(),
      icon: Package
    })),
    ...userBids.slice(0, 2).map(l => ({
      type: 'bid',
      title: `${l.mess} - ${l.mealTime}`,
      description: `Bid ₹${l.bids.find((b: any) => b.bidder === userId)?.amount}`,
      time: new Date(l.bids.find((b: any) => b.bidder === userId)?.timestamp || 0).toLocaleString(),
      icon: Award
    }))
  ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Dashboard</h2>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Welcome back! Here's your activity overview
          </p>
        </div>
        <div className="flex gap-2">
          {(['week', 'month', 'all'] as const).map(range => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                timeRange === range
                  ? 'bg-blue-500 text-white'
                  : darkMode
                  ? 'bg-gray-700 hover:bg-gray-600'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              {range === 'week' ? 'Week' : range === 'month' ? 'Month' : 'All Time'}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div
              key={idx}
              className={`p-6 rounded-lg border-2 ${
                darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-lg ${
                  stat.color === 'green' ? 'bg-green-100 dark:bg-green-900/30' :
                  stat.color === 'blue' ? 'bg-blue-100 dark:bg-blue-900/30' :
                  stat.color === 'purple' ? 'bg-purple-100 dark:bg-purple-900/30' :
                  'bg-orange-100 dark:bg-orange-900/30'
                }`}>
                  <Icon className={`w-6 h-6 ${
                    stat.color === 'green' ? 'text-green-600 dark:text-green-400' :
                    stat.color === 'blue' ? 'text-blue-600 dark:text-blue-400' :
                    stat.color === 'purple' ? 'text-purple-600 dark:text-purple-400' :
                    'text-orange-600 dark:text-orange-400'
                  }`} />
                </div>
                {stat.trend !== 'neutral' && (
                  <span className={`text-xs font-medium flex items-center gap-1 ${
                    stat.trend === 'up' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                  }`}>
                    {stat.trend === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {stat.change}
                  </span>
                )}
              </div>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>{stat.title}</p>
              <p className="text-2xl font-bold">{stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Stats */}
        <div className={`p-6 rounded-lg border-2 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <h3 className="font-bold mb-4">Quick Stats</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm">Win Rate</span>
              <span className="font-semibold">
                {userBids.length > 0 ? ((soldListings.length / userBids.length) * 100).toFixed(0) : 0}%
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full"
                style={{ width: `${userBids.length > 0 ? (soldListings.length / userBids.length) * 100 : 0}%` }}
              />
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm">Total Spent</span>
              <span className="font-semibold">₹{totalSpent}</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-purple-500 h-2 rounded-full"
                style={{ width: `${totalSpent > 0 ? Math.min((totalSpent / 1000) * 100, 100) : 0}%` }}
              />
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm">Active Bids</span>
              <span className="font-semibold">{userBids.filter(l => l.status === 'active').length}</span>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className={`p-6 rounded-lg border-2 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <h3 className="font-bold mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {recentActivity.length > 0 ? recentActivity.map((activity, idx) => {
              const Icon = activity.icon;
              return (
                <div key={idx} className="flex gap-3">
                  <div className={`p-2 rounded-lg h-fit ${
                    darkMode ? 'bg-gray-700' : 'bg-gray-100'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{activity.title}</p>
                    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {activity.description}
                    </p>
                    <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'} mt-1`}>
                      {activity.time}
                    </p>
                  </div>
                </div>
              );
            }) : (
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} text-center py-4`}>
                No recent activity
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Popular Times */}
      <div className={`p-6 rounded-lg border-2 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <h3 className="font-bold mb-4">Popular Meal Times</h3>
        <div className="grid grid-cols-4 gap-4">
          {['Breakfast', 'Lunch', 'Snacks', 'Dinner'].map(meal => {
            const count = listings.filter(l => l.mealTime === meal).length;
            return (
              <div key={meal} className={`p-4 rounded-lg text-center ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <Clock className="w-6 h-6 mx-auto mb-2" />
                <p className="font-semibold">{meal}</p>
                <p className="text-2xl font-bold mt-1">{count}</p>
                <p className="text-xs text-gray-500">listings</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}