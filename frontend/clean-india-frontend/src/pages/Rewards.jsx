import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import RedemptionHistoryModal from "../components/RedemptionHistoryModal";
import axios from "axios";

export default function Rewards() {
  const { user, setUser } = useAuth();
  const { showToast } = useToast();
  const [wallet, setWallet] = useState(0);
  const [coupons, setCoupons] = useState([]);
  const [purchasedCouponIds, setPurchasedCouponIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  useEffect(() => {
    if (user?.phone) {
      fetchWalletData();
      fetchActiveCoupons();
      fetchPurchasedCoupons();
    }
  }, [user]);

  const fetchWalletData = async () => {
    try {
      // Fetch actual wallet balance from citizen profile
      const res = await axios.get(`http://localhost:5000/api/auth/profile/${user.phone}`);
      setWallet(res.data.user.walletBalance || 0);
      setLoading(false);
    } catch (err) {
      console.error(err);
      showToast("Failed to fetch wallet data", "error");
      setLoading(false);
    }
  };

  const fetchActiveCoupons = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/coupons/active');
      setCoupons(res.data.coupons);
    } catch (err) {
      console.error(err);
      showToast("Failed to fetch coupons", "error");
    }
  };

  const fetchPurchasedCoupons = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/coupons/purchased/${user.phone}`);
      setPurchasedCouponIds(res.data.couponIds);
    } catch (err) {
      console.error(err);
    }
  };

  function redeem(item, value, category) {
    if (wallet < value) {
      showToast("Insufficient balance!", "error");
      return;
    }

    recordCashRedemption(item, value, category);
  }

  const recordCashRedemption = async (item, amount, category) => {
    try {
      await axios.post("http://localhost:5000/api/coupons/redeem-cash", {
        citizenPhone: user.phone,
        amount,
        item
      });

      // Refresh wallet data from backend
      await fetchWalletData();
      showToast(`Successfully redeemed ${item} for ₹${amount}!`, "success");
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Failed to record redemption";
      showToast(errorMsg, "error");
      console.error(err);
    }
  };

  const handlePurchaseCoupon = async (coupon) => {
    if (wallet < coupon.price) {
      showToast("Insufficient wallet balance!", "error");
      return;
    }

    try {
      await axios.post("http://localhost:5000/api/coupons/purchase", {
        citizenPhone: user.phone,
        couponId: coupon._id
      });
      
      // Refresh wallet data from backend
      await fetchWalletData();
      
      setPurchasedCouponIds([...purchasedCouponIds, coupon._id]);
      showToast("Coupon unlocked successfully!", "success");
      
      // Refresh purchased coupons
      fetchPurchasedCoupons();
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Failed to purchase coupon";
      showToast(errorMsg, "error");
    }
  };

  return (
    <>
      <RedemptionHistoryModal 
        isOpen={showHistoryModal} 
        onClose={() => setShowHistoryModal(false)}
        userPhone={user?.phone}
      />

      <div className="fixed top-8 right-8 z-40">
        <button
          onClick={() => setShowHistoryModal(true)}
          className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white p-4 rounded-full shadow-lg hover:shadow-purple-500/50 hover:scale-110 transition-all group"
          title="View Redemption History"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span className="absolute top-full right-0 mt-2 px-3 py-1 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">History</span>
        </button>
      </div>

      <main className="min-h-screen bg-gradient-to-bl from-black via-gray-900 to-black backdrop-blur-3xl rounded-3xl text-gray-200 px-6 py-12">
      <div className="max-w-7xl mx-auto space-y-10">

        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white">
            Redeem Dashboard
          </h1>
          <p className="text-gray-400 mt-1">
            Redeem your rewards and track your redemption history
          </p>
        </div>

        {/* Wallet */}
        <div className="bg-gradient-to-br from-gray-950/80 to-gray-900/60 backdrop-blur-2xl border border-gray-700/50 rounded-2xl p-8 shadow-2xl">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-400 text-sm mb-2">Wallet Balance</p>
              <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600">
                ₹{wallet}
              </h2>
            </div>
            <div className="bg-orange-500/10 p-4 rounded-xl border border-orange-500/30">
              <svg className="w-10 h-10 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
          <p className="text-gray-500 text-xs mt-4">CLEAN-INDIA Wallet</p>
        </div>

        {/* Cash Redeem */}
        <div className="bg-gradient-to-br from-gray-900/40 to-gray-950/60 border border-gray-700/50 rounded-2xl p-8 shadow-xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-orange-500/20 p-3 rounded-lg">
              <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white">Redeem Cash</h3>
              <p className="text-gray-400 text-sm">Transfer to your bank or UPI</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => redeem("UPI Transfer", 100, "Cash Redeem")}
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-4 rounded-xl transition-all shadow-lg hover:shadow-orange-500/50 hover:scale-105"
            >
              Redeem ₹100
            </button>
            <button
              onClick={() => redeem("UPI Transfer", 200, "Cash Redeem")}
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-4 rounded-xl transition-all shadow-lg hover:shadow-orange-500/50 hover:scale-105"
            >
              Redeem ₹200
            </button>
          </div>
        </div>

        {/* Available Coupons from Owners */}
        <div className="bg-gradient-to-br from-gray-900/40 to-gray-950/60 border border-gray-700/50 rounded-2xl p-8 shadow-xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-orange-500/20 p-3 rounded-lg">
              <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
              </svg>
            </div>
            <div>
              <h3 className="text-2xl font-semibold text-white">Available Discount Coupons</h3>
              <p className="text-gray-400 text-sm">Use these coupon codes from local businesses</p>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
            </div>
          ) : coupons.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {coupons.map((coupon, index) => {
                const isPurchased = purchasedCouponIds.includes(coupon._id);
                return (
                  <div key={index} className="bg-gradient-to-br from-gray-950/80 to-gray-900/60 border border-gray-700 rounded-xl p-5 hover:border-orange-500/50 transition-all hover:scale-105 shadow-lg">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="text-white font-bold text-lg">{coupon.title}</h4>
                        <p className="text-gray-500 text-xs mt-1">by {coupon.ownerName}</p>
                      </div>
                      <span className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-3 py-1.5 rounded-full text-sm font-bold shadow-lg">
                        {coupon.discount}% OFF
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm mb-4 line-clamp-2">{coupon.description}</p>
                    
                    {isPurchased ? (
                      <div className="bg-gray-900/80 border-2 border-dashed border-orange-500/40 rounded-lg px-4 py-3 mb-3">
                        <p className="text-xs text-gray-500 mb-1">Coupon Code</p>
                        <p className="text-orange-400 font-mono font-bold text-xl tracking-wider">{coupon.couponCode}</p>
                      </div>
                    ) : (
                      <div className="bg-gray-900/80 border-2 border-gray-700 rounded-lg px-4 py-3 mb-3 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gray-900/90 backdrop-blur-sm flex items-center justify-center">
                          <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                        </div>
                        <p className="text-xs text-gray-500 mb-1">Coupon Code</p>
                        <p className="text-gray-600 font-mono font-bold text-xl tracking-wider blur-sm">••••••••</p>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between text-xs mb-3">
                      <span className="text-gray-500">Valid until: {new Date(coupon.validUntil).toLocaleDateString()}</span>
                      <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded-full font-semibold">Active</span>
                    </div>
                    
                    {!isPurchased && (
                      <button
                        onClick={() => handlePurchaseCoupon(coupon)}
                        className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-3 rounded-lg transition-all shadow-lg hover:shadow-orange-500/50"
                      >
                        Unlock for ₹{coupon.price}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <p className="text-gray-500">No active coupons available at the moment</p>
            </div>
          )}
        </div>

      </div>
    </main>
    </>
  );
}
