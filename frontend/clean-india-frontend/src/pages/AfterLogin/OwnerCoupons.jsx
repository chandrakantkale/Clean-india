import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import axios from "axios";

export default function OwnerCoupons() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [coupons, setCoupons] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    discount: "",
    description: "",
    validUntil: "",
    couponCode: "",
    price: ""
  });

  useEffect(() => {
    if (user?.phone) {
      fetchCoupons();
    }
  }, [user]);

  const fetchCoupons = async () => {
    if (!user?.phone) return;
    try {
      const res = await axios.get(`http://localhost:5000/api/coupons/owner/${user.phone}`);
      setCoupons(res.data.coupons);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:5000/api/coupons/create", {
        ownerPhone: user.phone,
        ownerName: user.name,
        ...formData
      });
      showToast("Coupon created successfully!", "success");
      setFormData({ title: "", discount: "", description: "", validUntil: "", couponCode: "", price: "" });
      setShowForm(false);
      fetchCoupons();
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Failed to create coupon";
      showToast(errorMsg, "error");
      console.error(err);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleDelete = async (couponId) => {
    if (!window.confirm("Are you sure you want to delete this coupon?")) return;
    
    try {
      await axios.delete(`http://localhost:5000/api/coupons/delete/${couponId}`);
      showToast("Coupon deleted successfully!", "success");
      fetchCoupons();
    } catch (err) {
      showToast("Failed to delete coupon", "error");
      console.error(err);
    }
  };

  return (
    <section className="bg-gradient-to-br from-gray-900/30 via-gray-950/40 to-gray-900/30 backdrop-blur-md mt-6 mb-6 rounded-3xl py-12 shadow-black shadow-2xl border border-gray-600">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600 mb-3">
            Coupon Management
          </h1>
          <p className="text-gray-400 text-lg">Create and manage discount coupons for citizens</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-gradient-to-br from-orange-900/40 to-orange-950/60 backdrop-blur-3xl border border-orange-700/50 rounded-2xl p-6 text-center">
            <div className="flex items-center justify-center mb-3">
              <svg className="w-8 h-8 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-gray-300 mb-2">Total Coupons</h3>
            <p className="text-3xl font-bold text-orange-400">{coupons.length}</p>
          </div>

          <div className="bg-gradient-to-br from-orange-900/40 to-orange-950/60 backdrop-blur-3xl border border-orange-700/50 rounded-2xl p-6 text-center">
            <div className="flex items-center justify-center mb-3">
              <svg className="w-8 h-8 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-gray-300 mb-2">Active</h3>
            <p className="text-3xl font-bold text-orange-400">{coupons.filter(c => c.isActive).length}</p>
          </div>

          <div className="bg-gradient-to-br from-orange-900/40 to-orange-950/60 backdrop-blur-3xl border border-orange-700/50 rounded-2xl p-6 text-center">
            <div className="flex items-center justify-center mb-3">
              <svg className="w-8 h-8 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-gray-300 mb-2">Expired</h3>
            <p className="text-3xl font-bold text-orange-400">{coupons.filter(c => !c.isActive).length}</p>
          </div>
        </div>

        {/* Create Button */}
        <div className="mb-12">
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-lg hover:shadow-orange-500/50 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create New Coupon
          </button>
        </div>

        {/* Create Coupon Form */}
        {showForm && (
          <div className="bg-gradient-to-br from-gray-900/60 to-gray-950/80 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-8 shadow-2xl mb-12">
            <div className="flex justify-between items-center mb-6 border-b border-gray-700/50 pb-4">
              <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600">
                Create New Coupon
              </h2>
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-semibold text-gray-300 block mb-2">Coupon Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g., Food Discount"
                  className="w-full bg-gray-950/80 border border-gray-700 px-4 py-3 rounded-xl text-white placeholder-gray-500 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 focus:outline-none transition-all"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-300 block mb-2">Discount (%)</label>
                <input
                  type="number"
                  name="discount"
                  value={formData.discount}
                  onChange={handleChange}
                  placeholder="e.g., 20"
                  className="w-full bg-gray-950/80 border border-gray-700 px-4 py-3 rounded-xl text-white placeholder-gray-500 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 focus:outline-none transition-all"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-300 block mb-2">Coupon Code</label>
                <input
                  type="text"
                  name="couponCode"
                  value={formData.couponCode}
                  onChange={handleChange}
                  placeholder="e.g., SAVE20"
                  className="w-full bg-gray-950/80 border border-gray-700 px-4 py-3 rounded-xl text-white placeholder-gray-500 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 focus:outline-none transition-all uppercase"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-300 block mb-2">Price (₹)</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="e.g., 50"
                  className="w-full bg-gray-950/80 border border-gray-700 px-4 py-3 rounded-xl text-white placeholder-gray-500 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 focus:outline-none transition-all"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-300 block mb-2">Valid Until</label>
                <input
                  type="date"
                  name="validUntil"
                  value={formData.validUntil}
                  onChange={handleChange}
                  className="w-full bg-gray-950/80 border border-gray-700 px-4 py-3 rounded-xl text-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 focus:outline-none transition-all"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-300 block mb-2">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Coupon details..."
                  rows="1"
                  className="w-full bg-gray-950/80 border border-gray-700 px-4 py-3 rounded-xl text-white placeholder-gray-500 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 focus:outline-none transition-all"
                  required
                />
              </div>

              <button
                type="submit"
                className="md:col-span-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg hover:shadow-orange-500/50"
              >
                Create Coupon
              </button>
            </form>
          </div>
        )}

        {/* Coupons Grid */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-8">Your Coupons</h2>
          {coupons.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {coupons.map((coupon, index) => (
                <div
                  key={index}
                  className={`bg-gradient-to-br backdrop-blur-xl border rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all ${
                    coupon.isActive
                      ? 'from-orange-900/40 to-orange-900/40 border-orange-700/50'
                      : 'from-gray-800/40 to-gray-900/40 border-gray-700/50'
                  }`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-white mb-1">{coupon.title}</h3>
                      <p className="text-gray-400 text-sm">{coupon.description}</p>
                    </div>
                    <button
                      onClick={() => handleDelete(coupon._id)}
                      className="bg-red-500/20 hover:bg-red-500/30 text-red-400 p-2 rounded-lg transition-all ml-2"
                      title="Delete coupon"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>

                  <div className="bg-gray-950/50 border border-gray-700/50 rounded-xl p-4 mb-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-gray-400 text-sm">Code:</span>
                      <span className="text-orange-400 font-mono font-bold text-lg">{coupon.couponCode}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-sm">Discount:</span>
                      <span className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-1 rounded-full text-sm font-bold">
                        {coupon.discount}% OFF
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-gray-950/50 border border-gray-700/50 rounded-lg p-3 text-center">
                      <p className="text-gray-400 text-xs mb-1">Price</p>
                      <p className="text-orange-400 font-bold text-lg">₹{coupon.price}</p>
                    </div>
                    <div className="bg-gray-950/50 border border-gray-700/50 rounded-lg p-3 text-center">
                      <p className="text-gray-400 text-xs mb-1">Valid Until</p>
                      <p className="text-orange-400 font-bold text-sm">{new Date(coupon.validUntil).toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-700/50">
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                      coupon.isActive
                        ? 'bg-orange-500/20 text-orange-400'
                        : 'bg-red-500/20 text-red-400'
                    }`}>
                      {coupon.isActive ? '✓ Active' : '✗ Expired'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <svg className="w-16 h-16 text-gray-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-gray-400 text-lg font-medium">No coupons created yet</p>
              <p className="text-gray-500 text-sm mt-2">Create your first coupon to get started</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
