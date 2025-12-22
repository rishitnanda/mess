import { useState, useEffect } from 'react';
import { X, Users, AlertTriangle, TrendingUp, DollarSign, Package, Shield, Ban, CheckCircle, Clock, Eye, MessageSquare } from 'lucide-react';
import { api } from '../lib/supabase';

interface AdminPanelProps {
  darkMode: boolean;
  currentUserId: string;
  onClose: () => void;
}

interface Report {
  id: string;
  reason: string;
  description: string;
  status: string;
  created_at: string;
  reporter: {
    name: string;
    email: string;
  };
  reported_user: {
    id: string;
    name: string;
    email: string;
  };
  listing?: {
    mess: string;
    meal_time: string;
  };
}

interface SystemStats {
  totalUsers: number;
  totalListings: number;
  activeListings: number;
  pendingReports: number;
  totalReports: number;
  totalRevenue: number;
}

export default function AdminPanel({ darkMode, currentUserId, onClose }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'reports' | 'users'>('dashboard');
  const [reports, setReports] = useState<Report[]>([]);
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [actionNotes, setActionNotes] = useState('');
  const [processingAction, setProcessingAction] = useState(false);

  useEffect(() => {
    loadData();
    
    // Subscribe to new reports
    const subscription = api.subscribeToReports((payload) => {
      if (payload.eventType === 'INSERT') {
        loadData();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [reportsData, statsData] = await Promise.all([
        api.getReports(),
        api.getSystemStats()
      ]);

      if (reportsData.data) setReports(reportsData.data);
      if (statsData) setStats(statsData);
    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReportAction = async (reportId: string, action: 'resolved' | 'dismissed' | 'reviewing', shouldBan: boolean = false) => {
    if (!actionNotes.trim() && action !== 'reviewing') {
      alert('Please provide notes for this action');
      return;
    }

    setProcessingAction(true);
    try {
      await api.updateReportStatus(reportId, action, currentUserId, actionNotes);

      if (shouldBan && selectedReport) {
        await api.banUser(
          selectedReport.reported_user.id,
          `Banned due to report: ${selectedReport.reason}. ${actionNotes}`,
          currentUserId
        );
      }

      alert(`Report ${action}${shouldBan ? ' and user banned' : ''} successfully`);
      setSelectedReport(null);
      setActionNotes('');
      loadData();
    } catch (error) {
      console.error('Error processing report:', error);
      alert('Failed to process report');
    } finally {
      setProcessingAction(false);
    }
  };

  const StatCard = ({ icon: Icon, label, value, color }: any) => (
    <div className={`p-6 rounded-lg border-2 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-lg ${color === 'blue' ? 'bg-blue-100 dark:bg-blue-900/30' : color === 'red' ? 'bg-red-100 dark:bg-red-900/30' : 'bg-green-100 dark:bg-green-900/30'}`}>
          <Icon className={`w-6 h-6 ${color === 'blue' ? 'text-blue-600 dark:text-blue-400' : color === 'red' ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`} />
        </div>
      </div>
      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>{label}</p>
      <p className="text-3xl font-bold">{value}</p>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className={`${darkMode ? 'bg-gray-900 text-white' : 'bg-white'} rounded-lg max-w-7xl w-full h-[90vh] flex flex-col`}>
        {/* Header */}
        <div className={`flex justify-between items-center p-6 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500 rounded-lg">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Admin Panel</h2>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                System management and moderation
              </p>
            </div>
          </div>
          <button onClick={onClose} className="hover:bg-gray-100 dark:hover:bg-gray-800 p-2 rounded-lg">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className={`flex gap-2 p-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          {[
            { id: 'dashboard', label: 'Dashboard', icon: TrendingUp },
            { id: 'reports', label: 'Reports', icon: AlertTriangle, badge: stats?.pendingReports || 0 },
            { id: 'users', label: 'Users', icon: Users }
          ].map((tab: any) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium ${
                  activeTab === tab.id
                    ? 'bg-purple-500 text-white'
                    : darkMode
                    ? 'bg-gray-800 hover:bg-gray-700'
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                <Icon className="w-5 h-5" />
                {tab.label}
                {tab.badge > 0 && (
                  <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
            </div>
          ) : (
            <>
              {/* Dashboard Tab */}
              {activeTab === 'dashboard' && stats && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <StatCard icon={Users} label="Total Users" value={stats.totalUsers} color="blue" />
                    <StatCard icon={Package} label="Total Listings" value={stats.totalListings} color="green" />
                    <StatCard icon={TrendingUp} label="Active Listings" value={stats.activeListings} color="green" />
                    <StatCard icon={AlertTriangle} label="Pending Reports" value={stats.pendingReports} color="red" />
                    <StatCard icon={AlertTriangle} label="Total Reports" value={stats.totalReports} color="red" />
                    <StatCard icon={DollarSign} label="Total Revenue" value={`₹${stats.totalRevenue}`} color="green" />
                  </div>

                  <div className={`p-6 rounded-lg border-2 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                    <h3 className="font-bold text-lg mb-4">Quick Actions</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <button 
                        onClick={() => setActiveTab('reports')}
                        className="p-4 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium"
                      >
                        Review Reports ({stats.pendingReports})
                      </button>
                      <button 
                        onClick={() => setActiveTab('users')}
                        className="p-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium"
                      >
                        Manage Users
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Reports Tab */}
              {activeTab === 'reports' && (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-lg">Report Queue</h3>
                    <div className="flex gap-2">
                      {['pending', 'reviewing', 'resolved', 'dismissed'].map((status) => (
                        <button
                          key={status}
                          onClick={() => api.getReports(status).then(res => res.data && setReports(res.data))}
                          className={`px-3 py-1 rounded text-sm ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </div>

                  {reports.length === 0 ? (
                    <div className="text-center py-12">
                      <AlertTriangle className={`w-16 h-16 mx-auto mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-300'}`} />
                      <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>No reports found</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {reports.map((report) => (
                        <div
                          key={report.id}
                          className={`p-4 rounded-lg border-2 ${
                            report.status === 'pending'
                              ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                              : darkMode
                              ? 'border-gray-700 bg-gray-800'
                              : 'border-gray-200 bg-white'
                          }`}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className={`px-2 py-1 rounded text-xs font-medium ${
                                  report.status === 'pending' ? 'bg-red-500 text-white' :
                                  report.status === 'reviewing' ? 'bg-yellow-500 text-white' :
                                  report.status === 'resolved' ? 'bg-green-500 text-white' :
                                  'bg-gray-500 text-white'
                                }`}>
                                  {report.status}
                                </span>
                                <span className="font-bold text-red-600 dark:text-red-400">
                                  {report.reason}
                                </span>
                              </div>
                              <p className="text-sm mb-2">{report.description}</p>
                              <div className="flex gap-4 text-xs text-gray-500">
                                <span>Reporter: {report.reporter.name}</span>
                                <span>Reported: {report.reported_user.name}</span>
                                <span>{new Date(report.created_at).toLocaleString()}</span>
                              </div>
                            </div>
                            <button
                              onClick={() => setSelectedReport(report)}
                              className="ml-4 p-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg"
                            >
                              <Eye className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Users Tab */}
              {activeTab === 'users' && (
                <div className="text-center py-12">
                  <Users className={`w-16 h-16 mx-auto mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-300'}`} />
                  <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>User management coming soon</p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Report Detail Modal */}
        {selectedReport && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[60]">
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg max-w-2xl w-full p-6`}>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Report Details</h3>
                <button onClick={() => setSelectedReport(null)}>
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <p className="text-sm font-medium">Reason:</p>
                  <p className="text-red-600 dark:text-red-400 font-bold">{selectedReport.reason}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Description:</p>
                  <p>{selectedReport.description}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium">Reporter:</p>
                    <p>{selectedReport.reporter.name}</p>
                    <p className="text-xs text-gray-500">{selectedReport.reporter.email}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Reported User:</p>
                    <p>{selectedReport.reported_user.name}</p>
                    <p className="text-xs text-gray-500">{selectedReport.reported_user.email}</p>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Admin Notes</label>
                <textarea
                  value={actionNotes}
                  onChange={(e) => setActionNotes(e.target.value)}
                  rows={3}
                  className={`w-full border ${darkMode ? 'bg-gray-700 border-gray-600' : 'border-gray-300'} rounded-lg px-4 py-2`}
                  placeholder="Add notes about your decision..."
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleReportAction(selectedReport.id, 'reviewing', false)}
                  disabled={processingAction}
                  className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white py-2 rounded-lg flex items-center justify-center gap-2"
                >
                  <Clock className="w-4 h-4" />
                  Mark Reviewing
                </button>
                <button
                  onClick={() => handleReportAction(selectedReport.id, 'dismissed', false)}
                  disabled={processingAction}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 rounded-lg flex items-center justify-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Dismiss
                </button>
                <button
                  onClick={() => handleReportAction(selectedReport.id, 'resolved', false)}
                  disabled={processingAction}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  Resolve
                </button>
                <button
                  onClick={() => {
                    if (confirm('Ban this user? This action cannot be undone easily.')) {
                      handleReportAction(selectedReport.id, 'resolved', true);
                    }
                  }}
                  disabled={processingAction}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg flex items-center justify-center gap-2"
                >
                  <Ban className="w-4 h-4" />
                  Ban User
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}