import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import axios from "axios";
import { QRCodeCanvas } from "qrcode.react";

export default function Dashboard() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    weight: "",
    wasteType: "",
    area: ""
  });

  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userStats, setUserStats] = useState({
    totalEarning: 0,
    totalWaste: 0,
    ciPoints: 0
  });
  const [showWasteModal, setShowWasteModal] = useState(false);
  const [wasteBreakdown, setWasteBreakdown] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const historyRef = useRef(null);

  useEffect(() => {
    if (user?.phone) {
      fetchHistory();
    }
  }, [user]);

  const fetchHistory = async () => {
    try {
      if (user?.role === 'worker') {
        // Fetch worker verification stats
        const res = await axios.get(`http://localhost:5000/api/waste/worker-stats/${user.phone}`);
        setHistory(res.data.verifications);
        
        // Calculate unique citizens verified
        const uniqueCitizens = new Set(res.data.verifications.map(item => item.phone)).size;
        
        // Calculate waste breakdown by type
        const breakdown = {};
        res.data.verifications.forEach(item => {
          if (breakdown[item.wasteType]) {
            breakdown[item.wasteType].count += 1;
            breakdown[item.wasteType].weight += item.weight;
          } else {
            breakdown[item.wasteType] = {
              count: 1,
              weight: item.weight
            };
          }
        });
        
        setWasteBreakdown(Object.entries(breakdown).map(([type, data]) => ({
          type,
          count: data.count,
          weight: data.weight
        })));
        
        setUserStats({
          totalEarning: 0, // Workers don't earn
          totalWaste: res.data.stats.totalWasteProcessed,
          ciPoints: res.data.stats.totalVerifications,
          workScore: res.data.stats.workScore || 0,
          uniqueCitizens: uniqueCitizens
        });
      } else {
        // Fetch citizen history
        const res = await axios.get(`http://localhost:5000/api/waste/history/${user.phone}`);
        setHistory(res.data.history);
        
        // Calculate stats only from verified entries
        const verifiedEntries = res.data.history.filter(item => item.status === 'verified');
        const totalEarning = verifiedEntries.reduce((sum, item) => sum + item.earning, 0);
        const totalWaste = verifiedEntries.reduce((sum, item) => sum + item.weight, 0);

        // Fetch ciPoints from citizen profile
        const profileRes = await axios.get(`http://localhost:5000/api/auth/profile/${user.phone}`);
        const ciPoints = profileRes.data.user.ciPoints || Math.floor(totalEarning / 3);

        setUserStats({ totalEarning, totalWaste, ciPoints });
      }
      setLoading(false);
    } catch (err) {
      console.error(err);
      showToast("Failed to fetch history", "error");
      setLoading(false);
    }
  };

  const scrollToHistory = () => {
    historyRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const openWasteModal = () => {
    setShowWasteModal(true);
  };

  const closeWasteModal = () => {
    setShowWasteModal(false);
  };

  const getWastePrice = (wasteType) => {
    const prices = {
      "Wet Waste": 3,
      "Dry Waste": 5,
      "Electronics Waste": 10
    };
    return prices[wasteType] || 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const weight = parseFloat(formData.weight);
    
    // Validation
    if (!weight || weight <= 0) {
      setError("Weight must be greater than 0 kg");
      return;
    }

    if (!formData.wasteType) {
      setError("Please select a waste type");
      return;
    }

    if (!formData.area) {
      setError("Please enter an area");
      return;
    }

    const pricePerKg = getWastePrice(formData.wasteType);
    const earning = weight * pricePerKg;

    try {
      await axios.post("http://localhost:5000/api/waste/submit", {
        phone: user.phone,
        weight,
        wasteType: formData.wasteType,
        state: user.state,
        district: user.district,
        taluka: user.taluka,
        village: user.village,
        area: formData.area,
        earning
      });

      setFormData({ weight: "", wasteType: "", area: "" });
      setSuccess("Waste collection submitted successfully! Awaiting verification.");
      showToast("Waste collection submitted!", "success");
      setTimeout(() => setSuccess(""), 5000);
      fetchHistory();
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Failed to submit. Please try again.";
      setError(errorMsg);
      showToast(errorMsg, "error");
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  return (
    <>
      <section className="bg-gradient-to-br from-gray-900/30 via-gray-950/40 to-gray-900/30 
        backdrop-blur-md mt-6 mb-6 rounded-3xl py-20 shadow-black shadow-2xl border border-gray-600">
        <div className="max-w-7xl mx-auto px-6">

          <div className="grid md:grid-cols-3 gap-8">
            <div 
              onClick={user?.role === 'worker' ? scrollToHistory : undefined}
              className={`bg-gray-950/60 backdrop-blur-3xl border border-gray-800 rounded-xl p-8 text-center ${user?.role === 'worker' ? 'cursor-pointer hover:border-orange-500/50 hover:shadow-lg hover:shadow-orange-500/20 transition-all' : ''}`}
            >
              <h3 className="text-xl font-semibold text-white mb-2">
                {user?.role === 'worker' ? 'Verifications' : 'Total Earning'}
              </h3>
              <p className="text-2xl font-bold text-orange-500">
                {user?.role === 'worker' ? userStats.ciPoints : `₹ ${userStats.totalEarning}`}
              </p>
              {user?.role === 'worker' && (
                <p className="text-gray-400 text-xs mt-2">Click to view history</p>
              )}
            </div>

            <div 
              onClick={user?.role === 'worker' ? openWasteModal : undefined}
              className={`bg-gray-950/60 backdrop-blur-3xl border border-gray-800 rounded-xl p-8 text-center ${user?.role === 'worker' ? 'cursor-pointer hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/20 transition-all' : ''}`}
            >
              <h3 className="text-xl font-semibold text-white mb-2">
                {user?.role === 'worker' ? 'Waste Collected' : 'Total Waste'}
              </h3>
              <p className="text-2xl font-bold text-orange-500">
                {userStats.totalWaste} kg
              </p>
              {user?.role === 'worker' && (
                <p className="text-gray-400 text-xs mt-2">Click for breakdown</p>
              )}
            </div>

            <div className="bg-gray-950/60 backdrop-blur-3xl border border-gray-800 rounded-xl p-8 text-center">
              <h3 className="text-xl font-semibold text-white mb-2">
                {user?.role === 'worker' ? 'Citizens Verified' : 'CI Points'}
              </h3>
              <p className="text-2xl font-bold text-orange-500">
                {user?.role === 'worker' ? userStats.uniqueCitizens : userStats.ciPoints}
              </p>
            </div>
          </div>
        </div>


        <div className="grid md:grid-cols-3 gap-6 max-w-7xl mx-auto px-6 mt-8">
          {user?.role !== 'worker' ? (
            <div className="md:col-span-1 bg-gradient-to-br from-gray-900/60 to-gray-950/80 backdrop-blur-xl border
             border-gray-700/50 rounded-2xl p-8 shadow-2xl">
              <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400
               to-orange-600 mb-6 border-b border-gray-700/50 pb-4">Submit Waste Collection</h2>
              
              {error && (
                <div className="mb-4 p-4 bg-red-500/20 border border-red-500/50 rounded-lg flex items-start gap-3">
                  <svg className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              {success && (
                <div className="mb-4 p-4 bg-green-500/20 border border-green-500/50 rounded-lg flex items-start gap-3">
                  <svg className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-green-400 text-sm">{success}</p>
                </div>
              )}

              <form
                className="flex flex-col gap-5 text-left"
                onSubmit={handleSubmit}>
                <div>
                  <label htmlFor="weight" className="text-gray-300 font-semibold mb-2 block text-sm">Weight (Kg)</label>
                  <input
                    id="weight"
                    name="weight"
                    className="w-full bg-gray-950/90 border border-gray-600/50 p-3.5 rounded-xl text-white
                     placeholder-gray-500 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 
                     focus:outline-none transition-all"
                    placeholder="Enter weight"
                    type="number"
                    step="0.01"
                    value={formData.weight}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="wasteType" className="text-gray-300 font-semibold mb-2 block text-sm">Waste Type</label>
                  <select
                    id="wasteType"
                    name="wasteType"
                    className="w-full bg-gray-950/90 border border-gray-600/50 p-3.5 rounded-xl text-white
                     focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 focus:outline-none transition-all"
                    value={formData.wasteType}
                    onChange={handleChange}
                    required>
                    <option value="">Select waste type</option>
                    <option value="Dry Waste">Dry Waste (₹5/kg)</option>
                    <option value="Wet Waste">Wet Waste (₹3/kg)</option>
                    <option value="Electronics Waste">Electronics Waste (₹10/kg)</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="area" className="text-gray-300 font-semibold mb-2 block text-sm">Area</label>
                  <input
                    id="area"
                    name="area"
                    className="w-full bg-gray-950/90 border border-gray-600/50 p-3.5 rounded-xl text-white
                     placeholder-gray-500 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 focus:outline-none transition-all"
                    placeholder="Enter area"
                    type="text"
                    value={formData.area}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^a-zA-Z\s]/g, '');
                      setFormData({ ...formData, area: value });
                    }}
                    required
                  />
                </div>

                <div className="bg-gray-900/50 border border-gray-700/30 rounded-lg p-3 text-sm">
                  <p className="text-gray-400 mb-2"><span className="font-semibold">Location:</span></p>
                  <p className="text-gray-300">{user?.state}, {user?.district}, {user?.taluka}, {user?.village}</p>
                </div>

                <button type="submit" className="w-full bg-gradient-to-r from-orange-500 to-orange-600
                 hover:from-orange-600 hover:to-orange-700 text-white font-bold p-4 rounded-xl transition-all shadow-lg hover:shadow-orange-500/50 mt-2">Submit Collection</button>
              </form>
            </div>
          ) : (
            <div className="md:col-span-1 bg-gradient-to-br from-blue-900/40 to-blue-950/60 backdrop-blur-xl border
             border-blue-700/30 rounded-2xl p-6 shadow-2xl">
              <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400
               to-blue-600 mb-4 border-b border-blue-700/30 pb-3">Worker Panel</h2>
              <div className="text-center py-4">
                <div className="inline-block bg-blue-500/10 p-3 rounded-full mb-3">
                  <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-gray-300 text-sm mb-2 font-semibold">Verification Only</p>
                <p className="text-gray-500 text-xs leading-relaxed">Workers verify citizen submissions via QR codes</p>
              </div>
            </div>
          )}

          <div ref={historyRef} className={`${user?.role !== 'worker' ? 'md:col-span-2' : 'md:col-span-3'} bg-gradient-to-br from-gray-900/60 to-gray-950/80 backdrop-blur-xl 
          border border-gray-700/50 rounded-2xl p-8 shadow-2xl`}>
            <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400
             to-purple-600 mb-6 border-b border-gray-700/50 pb-4">
              {user?.role === 'worker' ? 'Verification History' : 'Submission History'}
            </h2>
            <div className="space-y-4 max-h-125 overflow-y-auto pr-2 custom-scrollbar">
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
                </div>
              ) : history.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-400 text-lg">No submissions yet</p>
                  <p className="text-gray-500 text-sm mt-2">Start by submitting your first waste collection</p>
                </div>
              ) : (
                history.map((item) => (
                  <div key={item._id} className="bg-gradient-to-r from-gray-950/80 to-gray-900/60 border
                   border-gray-700/50 rounded-xl p-5 hover:border-orange-500/70 hover:shadow-lg 
                   hover:shadow-orange-500/10 transition-all">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="px-3 py-1 bg-orange-500/20 border border-orange-500/30 rounded-full
                           text-orange-400 font-semibold text-sm">
                            {item.wasteType}
                          </span>
                          <span className="text-gray-400">
                            {new Date(item.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-300 mb-2">
                          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                          </svg>
                          <span className="font-bold text-white">{item.weight} kg</span>
                          <span className="text-gray-500">•</span>
                          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span>{item.state}, {item.district}, {item.taluka}, {item.village}</span>
                        </div>
                        {item.area && (
                          <div className="text-gray-400 text-sm">
                            <span className="font-semibold">Area:</span> {item.area}
                          </div>
                        )}
                      </div>
                      <div className="text-right ml-4">
                        {user?.role === 'worker' ? (
                          <div>
                            <p className="text-blue-400 font-bold text-lg">VERIFIED</p>
                            <p className="text-gray-500 text-xs mt-1">by you</p>
                          </div>
                        ) : item.status === 'pending' ? (
                          <div className="text-center">
                            <div className="bg-white p-2 rounded-lg mb-2 inline-block">
                              <QRCodeCanvas value={item.qrCode} size={80} />
                              {item.verificationCode && (
                                <p className="text-gray-900 font-bold text-2xl mt-2">{item.verificationCode}</p>
                              )}
                            </div>
                            <p className="text-yellow-400 font-bold text-sm">PENDING</p>
                            {item.verificationCode ? (
                              <p className="text-gray-400 text-xs mt-1">Code: {item.verificationCode}</p>
                            ) : (
                              <p className="text-gray-500 text-xs mt-1">Old entry - no code</p>
                            )}
                          </div>
                        ) : (
                          <div>
                            <p className="text-green-400 font-bold text-2xl">₹{item.earning}</p>
                            <p className="text-gray-500 text-xs mt-1">Earned</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Waste Breakdown Modal */}
      {showWasteModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-gray-900/95 to-gray-950/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">
                Waste Collection Breakdown
              </h2>
              <button
                onClick={closeWasteModal}
                className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-800/50 rounded-lg"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="grid gap-4 mb-6">
              <div className="bg-gray-950/60 border border-gray-700/50 rounded-xl p-6 text-center">
                <h3 className="text-lg font-semibold text-white mb-2">Total Collections</h3>
                <div className="flex justify-center items-center gap-8">
                  <div>
                    <p className="text-3xl font-bold text-blue-500">{history.length}</p>
                    <p className="text-gray-400 text-sm">Verifications</p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-green-500">{userStats.totalWaste} kg</p>
                    <p className="text-gray-400 text-sm">Total Weight</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white mb-4">Waste Types Breakdown</h3>
              {wasteBreakdown.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-400">No waste collections verified yet</p>
                </div>
              ) : (
                wasteBreakdown.map((item, index) => {
                  const percentage = ((item.weight / userStats.totalWaste) * 100).toFixed(1);
                  const getWasteColor = (type) => {
                    switch (type) {
                      case 'Wet Waste': return 'from-green-500 to-green-600';
                      case 'Dry Waste': return 'from-yellow-500 to-yellow-600';
                      case 'Electronics Waste': return 'from-purple-500 to-purple-600';
                      default: return 'from-gray-500 to-gray-600';
                    }
                  };
                  
                  return (
                    <div key={index} className="bg-gray-950/40 border border-gray-700/30 rounded-xl p-5">
                      <div className="flex justify-between items-center mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-4 h-4 rounded-full bg-gradient-to-r ${getWasteColor(item.type)}`}></div>
                          <h4 className="text-white font-semibold">{item.type}</h4>
                        </div>
                        <span className="text-gray-400 text-sm">{percentage}%</span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mb-3">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-blue-400">{item.count}</p>
                          <p className="text-gray-500 text-xs">Collections</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-green-400">{item.weight} kg</p>
                          <p className="text-gray-500 text-xs">Total Weight</p>
                        </div>
                      </div>
                      
                      <div className="w-full bg-gray-800 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full bg-gradient-to-r ${getWasteColor(item.type)}`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-gray-700/50">
              <button
                onClick={closeWasteModal}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-3 rounded-xl transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
