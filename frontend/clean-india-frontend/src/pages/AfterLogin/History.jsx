import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";

export default function History() {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.phone) {
      fetchHistory();
    }
  }, [user]);

  const fetchHistory = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/waste/history/${user.phone}`);
      setHistory(res.data.history);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <section className="bg-gradient-to-br from-gray-900/30 via-gray-950/40 to-gray-900/30 backdrop-blur-md mt-6 mb-6 rounded-3xl py-20 shadow-black shadow-2xl border border-gray-600">
      <div className="max-w-6xl mx-auto px-6">
        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600 mb-8 text-center">
          Waste Collection History
        </h1>
        
        <div className="space-y-4">
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
              <div key={item._id} className="bg-gradient-to-r from-gray-950/80 to-gray-900/60 border border-gray-700/50 rounded-xl p-6 hover:border-orange-500/70 hover:shadow-lg hover:shadow-orange-500/10 transition-all">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="px-4 py-2 bg-orange-500/20 border border-orange-500/30 rounded-full text-orange-400 font-semibold">
                        {item.wasteType}
                      </span>
                      <span className="text-gray-400">
                        {new Date(item.date).toLocaleDateString('en-IN', { 
                          day: 'numeric', 
                          month: 'long', 
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-gray-300">
                      <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                        </svg>
                        <span className="font-bold text-white text-lg">{item.weight} kg</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span>{item.city}, {item.area}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right ml-6">
                    <p className="text-green-400 font-bold text-3xl">₹{item.earning}</p>
                    <p className="text-gray-500 text-sm mt-1">Earned</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}