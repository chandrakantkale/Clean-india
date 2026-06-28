import { useState, useEffect } from "react";
import axios from "axios";

export default function RedemptionHistoryModal({ isOpen, onClose, userPhone }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all'); // all, cash, coupon

  useEffect(() => {
    if (isOpen && userPhone) {
      fetchRedemptionHistory();
    }
  }, [isOpen, userPhone]);

  const fetchRedemptionHistory = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:5000/api/coupons/history/${userPhone}`);
      setHistory(res.data.history);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredHistory = () => {
    if (filter === 'all') return history;
    return history.filter(item => item.type === filter);
  };

  const filteredHistory = getFilteredHistory();
  const totalRedeemed = filteredHistory.reduce((sum, item) => sum + item.amount, 0);

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[9998]" onClick={onClose} />
      <div className="fixed inset-0 flex items-center justify-center z-[9999] p-4">
        <div className="bg-gradient-to-br from-gray-900/95 to-gray-950/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        
        {/* Header - Fixed */}
        <div className="bg-gradient-to-r from-gray-900 to-gray-950 border-b border-gray-700/50 p-6 flex items-center justify-between flex-shrink-0">
          <div>
            <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600">
              Redemption History
            </h2>
            <p className="text-gray-400 text-sm mt-1">Track all your redemptions</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-800/50 rounded-lg"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-900/20 border border-blue-700/30 rounded-lg p-4 text-center">
              <p className="text-gray-400 text-sm mb-1">Total Redemptions</p>
              <p className="text-2xl font-bold text-blue-400">{filteredHistory.length}</p>
            </div>
            <div className="bg-orange-900/20 border border-orange-700/30 rounded-lg p-4 text-center">
              <p className="text-gray-400 text-sm mb-1">Total Amount</p>
              <p className="text-2xl font-bold text-orange-400">₹{totalRedeemed}</p>
            </div>
            <div className="bg-purple-900/20 border border-purple-700/30 rounded-lg p-4 text-center">
              <p className="text-gray-400 text-sm mb-1">Average</p>
              <p className="text-2xl font-bold text-purple-400">
                ₹{filteredHistory.length > 0 ? Math.round(totalRedeemed / filteredHistory.length) : 0}
              </p>
            </div>
          </div>

          {/* Filter Buttons */}
          <div className="flex gap-3 mb-6">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                filter === 'all'
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('cash')}
              className={`px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 ${
                filter === 'cash'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50'
              }`}
            >
              <span>💰</span> Cash
            </button>
            <button
              onClick={() => setFilter('coupon')}
              className={`px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 ${
                filter === 'coupon'
                  ? 'bg-purple-500 text-white'
                  : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50'
              }`}
            >
              <span>🎟️</span> Coupon
            </button>
          </div>

          {/* History List */}
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
            </div>
          ) : filteredHistory.length > 0 ? (
            <div className="space-y-3">
              {filteredHistory.map((item, index) => (
                <div
                  key={index}
                  className="bg-gray-900/40 border border-gray-700/30 rounded-lg p-4 hover:border-orange-500/50 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">
                          {item.type === 'cash' ? '💰' : '🎟️'}
                        </span>
                        <div>
                          <h4 className="text-white font-semibold">{item.item}</h4>
                          <p className="text-gray-400 text-xs">
                            {new Date(item.createdAt).toLocaleDateString('en-IN', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                      {item.couponCode && (
                        <div className="mt-2 bg-gray-950/50 border border-gray-700/50 rounded px-3 py-1 inline-block">
                          <p className="text-gray-400 text-xs">Code:</p>
                          <p className="text-orange-400 font-mono font-bold text-sm">{item.couponCode}</p>
                        </div>
                      )}
                    </div>
                    <div className="text-right ml-4">
                      <p className="text-2xl font-bold text-orange-400">₹{item.amount}</p>
                      <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full mt-2 ${
                        item.status === 'completed'
                          ? 'bg-green-500/20 text-green-400'
                          : item.status === 'pending'
                          ? 'bg-yellow-500/20 text-yellow-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {item.status === 'completed' ? '✓' : item.status === 'pending' ? '⏳' : '✗'}
                        {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-gray-400 font-medium">No redemptions found</p>
              <p className="text-gray-500 text-sm mt-1">
                {filter === 'all' 
                  ? 'Start redeeming coupons or cash to see history'
                  : `No ${filter} redemptions yet`}
              </p>
            </div>
          )}
        </div>

        {/* Footer - Fixed */}
        <div className="bg-gradient-to-r from-gray-900 to-gray-950 border-t border-gray-700/50 p-4 flex items-center justify-between flex-shrink-0">
          <button
            onClick={fetchRedemptionHistory}
            className="text-orange-400 hover:text-orange-300 text-sm font-semibold flex items-center gap-2 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
          <button
            onClick={onClose}
            className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-2 px-6 rounded-lg transition-all"
          >
            Close
          </button>
        </div>
        </div>
      </div>
    </>
  );
}
