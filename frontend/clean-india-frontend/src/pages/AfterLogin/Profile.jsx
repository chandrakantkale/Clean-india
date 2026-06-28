import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useState, useEffect } from "react";
import axios from "axios";

export default function Profile() {
  const navigate = useNavigate();
  const { user, logout, setUser } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [workStatus, setWorkStatus] = useState(user?.workStatus || 'not-in-work');
  const [updating, setUpdating] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: user?.name || '',
    city: user?.city || '',
    village: user?.village || '',
    taluka: user?.taluka || ''
  });

  useEffect(() => {
    if (user?.phone) {
      fetchStats();
    }
    if (user?.workStatus) {
      setWorkStatus(user.workStatus);
    }
  }, [user]);

  const fetchStats = async () => {
    try {
      if (user?.role === 'worker') {
        const res = await axios.get(`http://localhost:5000/api/waste/worker-stats/${user.phone}`);
        setStats(res.data.stats);
      } else if (user?.role === 'owner') {
        const res = await axios.get(`http://localhost:5000/api/coupons/owner/${user.phone}`);
        setStats({
          totalCoupons: res.data.coupons.length,
          activeCoupons: res.data.coupons.filter(c => c.isActive).length
        });
      } else {
        const res = await axios.get(`http://localhost:5000/api/waste/history/${user.phone}`);
        const verifiedEntries = res.data.history.filter(item => item.status === 'verified');
        const totalEarning = verifiedEntries.reduce((sum, item) => sum + item.earning, 0);
        const totalWaste = verifiedEntries.reduce((sum, item) => sum + item.weight, 0);
        setStats({ totalEarning, totalWaste, totalSubmissions: res.data.history.length });
      }
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleWorkStatusChange = async (newStatus) => {
    setUpdating(true);
    try {
      await axios.patch('http://localhost:5000/api/auth/work-status', {
        phone: user.phone,
        workStatus: newStatus
      });
      setWorkStatus(newStatus);
      const updatedUser = { ...user, workStatus: newStatus };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    } catch (err) {
      console.error(err);
      alert('Failed to update work status');
    } finally {
      setUpdating(false);
    }
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      await axios.put(`http://localhost:5000/api/auth/profile/${user.phone}`, editFormData);
      const updatedUser = { ...user, ...editFormData };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      alert('Profile updated successfully!');
      setIsEditingProfile(false);
    } catch (err) {
      console.error(err);
      alert('Failed to update profile');
    } finally {
      setUpdating(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'on-work': return 'from-green-500 to-emerald-600';
      case 'leave': return 'from-yellow-500 to-amber-600';
      default: return 'from-gray-500 to-slate-600';
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'on-work': return 'bg-green-500/20 text-green-400 border-green-500/50';
      case 'leave': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'on-work': return 'On Work';
      case 'not-in-work': return 'Not in Work';
      case 'leave': return 'On Leave';
      default: return status;
    }
  };

  return (
    <section className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-block mb-4">
            <div className="w-24 h-24 mx-auto bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center shadow-2xl shadow-orange-500/50 transform hover:scale-110 transition-transform duration-300">
              <span className="text-4xl font-bold text-white">{user?.name?.charAt(0).toUpperCase()}</span>
            </div>
          </div>
          <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 mb-3">
            {user?.name}
          </h1>
          <p className="text-gray-400 text-lg">
            {user?.role === 'worker' ? '🛠️ Worker Profile' : user?.role === 'owner' ? '💼 Business Owner' : '👤 Citizen Profile'}
          </p>
          <button
            onClick={() => setIsEditingProfile(true)}
            className="mt-4 inline-flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg font-semibold transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit Profile
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Personal Information Card */}
          <div className="lg:col-span-1 bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-8 shadow-2xl hover:shadow-orange-500/20 transition-all duration-300 hover:scale-105">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-700/50">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                <span className="text-xl">👤</span>
              </div>
              <h2 className="text-2xl font-bold text-white">Personal Info</h2>
            </div>

            <div className="space-y-5">
              <div className="group">
                <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Full Name</p>
                <p className="text-white text-lg font-semibold group-hover:text-orange-400 transition-colors">{user?.name}</p>
              </div>

              <div className="group">
                <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Phone Number</p>
                <p className="text-white text-lg font-semibold font-mono group-hover:text-orange-400 transition-colors">{user?.phone}</p>
              </div>

              <div className="group">
                <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Role</p>
                <span className="inline-block px-4 py-2 bg-gradient-to-r from-orange-500/20 to-orange-600/20 border border-orange-500/50 rounded-full text-orange-400 text-sm font-bold uppercase tracking-wide">
                  {user?.role}
                </span>
              </div>

              {user?.city && (
                <div className="group">
                  <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Location</p>
                  <p className="text-white text-lg font-semibold group-hover:text-orange-400 transition-colors">
                    {user.city}{user.taluka ? `, ${user.taluka}` : ''}
                  </p>
                </div>
              )}

              {user?.role === 'worker' && (
                <div className="pt-4 border-t border-gray-700/50">
                  <p className="text-gray-500 text-xs uppercase tracking-wider mb-3">Work Status</p>

                  <div className={`flex items-center gap-3 mb-4 p-3 rounded-xl border ${getStatusBadgeColor(workStatus)}`}>
                    <span className={`w-3 h-3 rounded-full bg-gradient-to-r ${getStatusColor(workStatus)} animate-pulse`}></span>
                    <span className="font-bold text-sm uppercase tracking-wide">{getStatusLabel(workStatus)}</span>
                  </div>

                  <div className="space-y-2">
                    <button
                      onClick={() => handleWorkStatusChange('on-work')}
                      disabled={updating || workStatus === 'on-work'}
                      className={`w-full px-4 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${workStatus === 'on-work'
                          ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/50 scale-105'
                          : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50 hover:scale-105'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      ✅ On Work
                    </button>

                    <button
                      onClick={() => handleWorkStatusChange('not-in-work')}
                      disabled={updating || workStatus === 'not-in-work'}
                      className={`w-full px-4 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${workStatus === 'not-in-work'
                          ? 'bg-gradient-to-r from-gray-500 to-slate-600 text-white shadow-lg shadow-gray-500/50 scale-105'
                          : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50 hover:scale-105'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      ⏸️ Not in Work
                    </button>

                    <button
                      onClick={() => handleWorkStatusChange('leave')}
                      disabled={updating || workStatus === 'leave'}
                      className={`w-full px-4 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${workStatus === 'leave'
                          ? 'bg-gradient-to-r from-yellow-500 to-amber-600 text-white shadow-lg shadow-yellow-500/50 scale-105'
                          : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50 hover:scale-105'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      🏖️ On Leave
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Statistics Card */}
          <div className="lg:col-span-2 bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-8 shadow-2xl hover:shadow-orange-500/20 transition-all duration-300">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-700/50">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                <span className="text-xl">📊</span>
              </div>
              <h2 className="text-2xl font-bold text-white">
                {user?.role === 'worker' ? 'Work Statistics' : user?.role === 'owner' ? 'Business Statistics' : 'My Statistics'}
              </h2>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="relative">
                  <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-orange-500"></div>
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <div className="w-8 h-8 bg-orange-500 rounded-full animate-pulse"></div>
                  </div>
                </div>
                <p className="text-gray-400 mt-4">Loading statistics...</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {user?.role === 'worker' ? (
                  <>
                    <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/30 rounded-2xl p-6 hover:scale-105 transition-transform duration-300">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-blue-400 text-sm font-semibold uppercase tracking-wide">Total Verifications</p>
                        <span className="text-2xl">✓</span>
                      </div>
                      <p className="text-white text-4xl font-extrabold">{stats?.totalVerifications || 0}</p>
                    </div>

                    <div className="bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-500/30 rounded-2xl p-6 hover:scale-105 transition-transform duration-300">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-green-400 text-sm font-semibold uppercase tracking-wide">Waste Processed</p>
                        <span className="text-2xl">♻️</span>
                      </div>
                      <p className="text-white text-4xl font-extrabold">{stats?.totalWasteProcessed || 0} <span className="text-xl text-gray-400">kg</span></p>
                    </div>

                    <div className="bg-gradient-to-br from-orange-500/10 to-orange-600/10 border border-orange-500/30 rounded-2xl p-6 hover:scale-105 transition-transform duration-300 md:col-span-2">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-orange-400 text-sm font-semibold uppercase tracking-wide">Work Score</p>
                        <span className="text-2xl">🏆</span>
                      </div>
                      <p className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600 text-5xl font-extrabold">
                        {Math.floor((stats?.totalWasteProcessed || 0) / 10)}
                      </p>
                    </div>
                  </>
                ) : user?.role === 'owner' ? (
                  <>
                    <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border border-purple-500/30 rounded-2xl p-6 hover:scale-105 transition-transform duration-300">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-purple-400 text-sm font-semibold uppercase tracking-wide">Total Coupons</p>
                        <span className="text-2xl">🎟️</span>
                      </div>
                      <p className="text-white text-4xl font-extrabold">{stats?.totalCoupons || 0}</p>
                    </div>

                    <div className="bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-500/30 rounded-2xl p-6 hover:scale-105 transition-transform duration-300">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-green-400 text-sm font-semibold uppercase tracking-wide">Active Coupons</p>
                        <span className="text-2xl">✨</span>
                      </div>
                      <p className="text-green-400 text-4xl font-extrabold">{stats?.activeCoupons || 0}</p>
                    </div>

                    <div className="bg-gradient-to-br from-orange-500/10 to-orange-600/10 border border-orange-500/30 rounded-2xl p-6 hover:scale-105 transition-transform duration-300 md:col-span-2">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-orange-400 text-sm font-semibold uppercase tracking-wide">Business Type</p>
                        <span className="text-2xl">💼</span>
                      </div>
                      <p className="text-orange-400 text-2xl font-bold">Local Business Partner</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-500/30 rounded-2xl p-6 hover:scale-105 transition-transform duration-300">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-green-400 text-sm font-semibold uppercase tracking-wide">Wallet Balance</p>
                        <span className="text-2xl">💰</span>
                      </div>
                      <p className="text-green-400 text-4xl font-extrabold">₹{user?.walletBalance || 0}</p>
                    </div>

                    <div className="bg-linear-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/30 rounded-2xl p-6 hover:scale-105 transition-transform duration-300">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-blue-400 text-sm font-semibold uppercase tracking-wide">Total Earnings</p>
                        <span className="text-2xl">💵</span>
                      </div>
                      <p className="text-white text-4xl font-extrabold">₹{stats?.totalEarning || 0}</p>
                    </div>

                    <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border border-purple-500/30 rounded-2xl p-6 hover:scale-105 transition-transform duration-300">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-purple-400 text-sm font-semibold uppercase tracking-wide">Waste Submitted</p>
                        <span className="text-2xl">♻️</span>
                      </div>
                      <p className="text-white text-4xl font-extrabold">{stats?.totalWaste || 0} <span className="text-xl text-gray-400">kg</span></p>
                    </div>

                    <div className="bg-gradient-to-br from-orange-500/10 to-orange-600/10 border border-orange-500/30 rounded-2xl p-6 hover:scale-105 transition-transform duration-300">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-orange-400 text-sm font-semibold uppercase tracking-wide">CI Points</p>
                        <span className="text-2xl">⭐</span>
                      </div>
                      <p className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600 text-4xl font-extrabold">
                        {user?.rewards || 0}
                      </p>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Logout Button */}
        <div className="text-center">
          <button
            onClick={handleLogout}
            className="group relative px-12 py-4 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-2xl font-bold text-lg transition-all duration-300 shadow-2xl shadow-red-500/50 hover:shadow-red-600/70 hover:scale-110 transform">
            <span className="flex items-center gap-3">
              <span>🚪</span>
              <span>Logout</span>
            </span>
          </button>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditingProfile && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-gray-900/95 to-gray-950/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-8 shadow-2xl max-w-md w-full">
            <div className="flex justify-between items-center mb-6 border-b border-gray-700/50 pb-4">
              <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">
                Edit Profile
              </h3>
              <button
                onClick={() => setIsEditingProfile(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-gray-300 block mb-2">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={editFormData.name}
                  onChange={handleEditChange}
                  className="w-full bg-gray-950/80 border border-gray-700 px-4 py-2 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-300 block mb-2">City</label>
                <input
                  type="text"
                  name="city"
                  value={editFormData.city}
                  onChange={handleEditChange}
                  className="w-full bg-gray-950/80 border border-gray-700 px-4 py-2 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-300 block mb-2">Village</label>
                <input
                  type="text"
                  name="village"
                  value={editFormData.village}
                  onChange={handleEditChange}
                  className="w-full bg-gray-950/80 border border-gray-700 px-4 py-2 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-300 block mb-2">Taluka</label>
                <input
                  type="text"
                  name="taluka"
                  value={editFormData.taluka}
                  onChange={handleEditChange}
                  className="w-full bg-gray-950/80 border border-gray-700 px-4 py-2 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={updating}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-2 rounded-lg transition-all disabled:opacity-50"
                >
                  {updating ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditingProfile(false)}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 rounded-lg transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
