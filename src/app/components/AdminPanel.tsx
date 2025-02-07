'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { FiUsers, FiActivity, FiShield, FiAlertTriangle } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';

interface User {
  id: string;
  email: string;
  created_at: string;
  is_banned: boolean;
  ban_reason?: string;
  last_active?: string;
  strikes?: number;
}

interface AdminLog {
  id: string;
  admin_id: string;
  action: string;
  target_user_id: string;
  details: string;
  created_at: string;
}

export default function AdminPanel() {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'banned' | 'active'>('all');
  const [adminLogs, setAdminLogs] = useState<AdminLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [isServiceBusy, setIsServiceBusy] = useState(false);
  const auth = useAuth();

  useEffect(() => {
    checkAdminAccess();
    fetchUsers();
    fetchAdminLogs();
  }, []);

  const checkAdminAccess = async () => {
    if (!auth?.user?.id) return;

    const { data: adminData } = await supabase
      .from('admins')
      .select('*')
      .eq('user_id', auth.user.id)
      .single();

    if (!adminData) {
      // Redirect non-admin users
      window.location.href = '/';
    }
  };

  const fetchUsers = async () => {
    const { data } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) {
      setUsers(data);
    }
    setLoading(false);
  };

  const fetchAdminLogs = async () => {
    const { data } = await supabase
      .from('admin_logs')
      .select(`
        *,
        admins (
          email
        )
      `)
      .order('created_at', { ascending: false });

    if (data) {
      setAdminLogs(data);
    }
  };

  const banUser = async (userId: string, reason: string) => {
    try {
      await supabase
        .from('users')
        .update({ 
          is_banned: true,
          ban_reason: reason
        })
        .eq('id', userId);

      // Log the action
      await supabase
        .from('admin_logs')
        .insert({
          admin_id: auth?.user?.id,
          action: 'ban_user',
          target_user_id: userId,
          details: `Banned user for reason: ${reason}`
        });

      fetchUsers();
      fetchAdminLogs();
    } catch (error) {
      console.error('Error banning user:', error);
    }
  };

  const unbanUser = async (userId: string) => {
    try {
      await supabase
        .from('users')
        .update({ 
          is_banned: false,
          ban_reason: null
        })
        .eq('id', userId);

      // Log the action
      await supabase
        .from('admin_logs')
        .insert({
          admin_id: auth?.user?.id,
          action: 'unban_user',
          target_user_id: userId,
          details: 'Unbanned user'
        });

      fetchUsers();
      fetchAdminLogs();
    } catch (error) {
      console.error('Error unbanning user:', error);
    }
  };

  const addStrike = async (userId: string, reason: string) => {
    try {
      const { data: userData } = await supabase
        .from('users')
        .select('strikes')
        .eq('id', userId)
        .single();

      const currentStrikes = userData?.strikes || 0;

      await supabase
        .from('users')
        .update({ 
          strikes: currentStrikes + 1
        })
        .eq('id', userId);

      // Log the action
      await supabase
        .from('admin_logs')
        .insert({
          admin_id: auth?.user?.id,
          action: 'add_strike',
          target_user_id: userId,
          details: `Added strike for reason: ${reason}. New total: ${currentStrikes + 1}`
        });

      fetchUsers();
      fetchAdminLogs();
    } catch (error) {
      console.error('Error adding strike:', error);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = 
      filter === 'all' ? true :
      filter === 'banned' ? user.is_banned :
      filter === 'active' ? !user.is_banned : true;
    return matchesSearch && matchesFilter;
  });

  const checkServiceStatus = async () => {
    try {
      const response = await fetch('/api/status');
      const data = await response.json();
      return data.status === 'operational';
    } catch (error) {
      console.error('Error checking service status:', error);
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      // Check service status before proceeding
      const isServiceAvailable = await checkServiceStatus();
      
      if (!isServiceAvailable) {
        setIsServiceBusy(true);
        toast.error('Service is busy at the moment, please try again later', {
          duration: 4000,
          position: 'top-center',
          style: {
            background: '#F87171',
            color: 'white',
            borderRadius: '10px',
          },
        });
        return;
      }

      // Rest of your existing handleSubmit code...
      
    } catch (error) {
      console.error('Error:', error);
      toast.error('Service is unavailable, please try again later', {
        duration: 4000,
        position: 'top-center',
        style: {
          background: '#F87171',
          color: 'white',
          borderRadius: '10px',
        },
      });
    } finally {
      setIsLoading(false);
      setIsServiceBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Admin Panel</h1>
          <div className="flex items-center gap-4">
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-4 py-2 bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as 'all' | 'banned' | 'active')}
              className="px-4 py-2 bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Users</option>
              <option value="banned">Banned Users</option>
              <option value="active">Active Users</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Users List */}
          <div className="lg:col-span-2 bg-gray-800 rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4">Users</h2>
            <div className="space-y-4">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                filteredUsers.map(user => (
                  <motion.div
                    key={user.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-lg ${
                      user.is_banned ? 'bg-red-900/20' : 'bg-gray-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">{user.email}</h3>
                        <p className="text-sm text-gray-400">
                          Joined: {new Date(user.created_at).toLocaleDateString()}
                        </p>
                        {user.strikes > 0 && (
                          <div className="mt-1 flex items-center gap-1 text-yellow-400">
                            <FiAlertTriangle className="w-4 h-4" />
                            <span className="text-sm">{user.strikes} strikes</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedUser(user)}
                          className="px-3 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                        >
                          Manage
                        </button>
                        {user.is_banned ? (
                          <button
                            onClick={() => unbanUser(user.id)}
                            className="px-3 py-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                          >
                            Unban
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              const reason = prompt('Enter ban reason:');
                              if (reason) banUser(user.id, reason);
                            }}
                            className="px-3 py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                          >
                            Ban
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>

          {/* Admin Logs */}
          <div className="bg-gray-800 rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
            <div className="space-y-4">
              {adminLogs.map(log => (
                <div key={log.id} className="p-4 bg-gray-700 rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-full bg-blue-500/20">
                      {log.action === 'ban_user' && <FiShield className="w-4 h-4" />}
                      {log.action === 'unban_user' && <FiShield className="w-4 h-4" />}
                      {log.action === 'add_strike' && <FiAlertTriangle className="w-4 h-4" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{log.details}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(log.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* User Management Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4">Manage User</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-400">Email</label>
                <p className="font-medium">{selectedUser.email}</p>
              </div>
              <div>
                <label className="text-sm text-gray-400">Status</label>
                <p className={`font-medium ${selectedUser.is_banned ? 'text-red-400' : 'text-green-400'}`}>
                  {selectedUser.is_banned ? 'Banned' : 'Active'}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-400">Strikes</label>
                <p className="font-medium">{selectedUser.strikes || 0}</p>
              </div>
              
              <div className="border-t border-gray-700 pt-4">
                <button
                  onClick={() => {
                    const reason = prompt('Enter strike reason:');
                    if (reason) addStrike(selectedUser.id, reason);
                  }}
                  className="w-full px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors mb-2"
                >
                  Add Strike
                </button>
                {selectedUser.is_banned ? (
                  <button
                    onClick={() => unbanUser(selectedUser.id)}
                    className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                  >
                    Unban User
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      const reason = prompt('Enter ban reason:');
                      if (reason) banUser(selectedUser.id, reason);
                    }}
                    className="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                  >
                    Ban User
                  </button>
                )}
              </div>
            </div>
            <button
              onClick={() => setSelectedUser(null)}
              className="mt-4 w-full px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Add service busy notification */}
      {isServiceBusy && (
        <div className="fixed top-4 right-4 bg-red-500/90 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in">
          <div className="flex items-center gap-3">
            <svg 
              className="w-6 h-6" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
              />
            </svg>
            <span>Service is busy at the moment, please try again later</span>
          </div>
        </div>
      )}
    </div>
  );
} 