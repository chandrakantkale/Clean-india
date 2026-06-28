import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

export default function WorkerReport() {
  const { workerId } = useParams();
  const navigate = useNavigate();
  const [worker, setWorker] = useState(null);
  const [stats, setStats] = useState(null);
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWorkerDetails();
  }, [workerId]);

  const fetchWorkerDetails = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/auth/workers/${workerId}`);
      setWorker(res.data.worker);
      setStats(res.data.stats);
      setCollections(res.data.recentCollections || []);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching worker details:", err);
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'on-work': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'leave': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'not-in-work': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'on-work': return 'Working';
      case 'leave': return 'On Leave';
      case 'not-in-work': return 'Not Working';
      default: return status || 'Not Set';
    }
  };

  const getStatusDotColor = (status) => {
    switch (status) {
      case 'on-work': return 'bg-green-400';
      case 'leave': return 'bg-yellow-400';
      case 'not-in-work': return 'bg-red-400';
      default: return 'bg-gray-400';
    }
  };

  if (loading) {
    return (
      <section className="bg-gradient-to-br from-gray-900/30 via-gray-950/40 to-gray-900/30 backdrop-blur-md mt-6 mb-6 rounded-3xl py-20 shadow-black shadow-2xl border border-gray-600">
        <div className="max-w-6xl mx-auto px-6 flex justify-center items-center py-16">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-orange-500"></div>
        </div>
      </section>
    );
  }

  if (!worker) {
    return (
      <section className="bg-gradient-to-br from-gray-900/30 via-gray-950/40 to-gray-900/30 backdrop-blur-md mt-6 mb-6 rounded-3xl py-20 shadow-black shadow-2xl border border-gray-600">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-red-400 text-xl">Worker not found</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg transition-all"
          >
            Go Back
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-gradient-to-br from-gray-900/30 via-gray-950/40 to-gray-900/30 backdrop-blur-md mt-6 mb-6 rounded-3xl py-12 shadow-black shadow-2xl border border-gray-600">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">
            Worker Report
          </h1>
          <div className="w-12"></div>
        </div>

        {/* Worker Info Card */}
        <div className="bg-gradient-to-br from-gray-900/60 to-gray-950/80 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-8 mb-8 shadow-2xl">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-3xl">
                {worker.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">{worker.name}</h2>
                <p className="text-gray-400 font-mono text-lg">{worker.phone}</p>
                <p className="text-gray-500 text-sm mt-1">
                  {worker.city ? worker.city : (worker.village ? worker.village : 'N/A')}
                  {worker.taluka ? `, ${worker.taluka}` : ''}
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border ${getStatusColor(worker.workStatus)}`}>
                <span className={`w-2 h-2 rounded-full ${getStatusDotColor(worker.workStatus)}`}></span>
                {getStatusLabel(worker.workStatus)}
              </span>
              <p className="text-gray-400 text-sm mt-3">Work Score</p>
              <p className="text-orange-400 font-bold text-2xl">{worker.workScore || 0}</p>
            </div>
          </div>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Collections */}
          <div className="bg-gradient-to-br from-blue-900/40 to-blue-950/60 backdrop-blur-3xl border border-blue-700/50 rounded-2xl p-6 text-center">
            <div className="flex items-center justify-center mb-3">
              <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-gray-300 mb-2">Total Collections</h3>
            <p className="text-4xl font-bold text-blue-400">{stats?.totalCollections || 0}</p>
          </div>

          {/* Total Weight */}
          <div className="bg-gradient-to-br from-green-900/40 to-green-950/60 backdrop-blur-3xl border border-green-700/50 rounded-2xl p-6 text-center">
            <div className="flex items-center justify-center mb-3">
              <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M9 17l3 9m3-9l3-9" />
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-gray-300 mb-2">Total Weight</h3>
            <p className="text-4xl font-bold text-green-400">{stats?.totalWeight || 0} <span className="text-lg">kg</span></p>
          </div>

          {/* Verified Collections */}
          <div className="bg-gradient-to-br from-purple-900/40 to-purple-950/60 backdrop-blur-3xl border border-purple-700/50 rounded-2xl p-6 text-center">
            <div className="flex items-center justify-center mb-3">
              <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m7 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-gray-300 mb-2">Verified</h3>
            <p className="text-4xl font-bold text-purple-400">{stats?.verifiedCollections || 0}</p>
          </div>

          {/* Pending Collections */}
          <div className="bg-gradient-to-br from-orange-900/40 to-orange-950/60 backdrop-blur-3xl border border-orange-700/50 rounded-2xl p-6 text-center">
            <div className="flex items-center justify-center mb-3">
              <svg className="w-8 h-8 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-gray-300 mb-2">Pending</h3>
            <p className="text-4xl font-bold text-orange-400">{stats?.pendingCollections || 0}</p>
          </div>
        </div>

        {/* Recent Collections */}
        <div className="bg-gradient-to-br from-gray-900/60 to-gray-950/80 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-8 shadow-2xl">
          <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600 mb-6">
            Recent Collections
          </h2>

          {collections.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-gray-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <p className="text-gray-400 text-lg font-medium">No collections yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700/50 bg-gray-950/50">
                    <th className="text-left py-4 px-6 text-gray-300 font-semibold text-sm">Date</th>
                    <th className="text-left py-4 px-6 text-gray-300 font-semibold text-sm">Waste Type</th>
                    <th className="text-center py-4 px-6 text-gray-300 font-semibold text-sm">Weight (kg)</th>
                    <th className="text-center py-4 px-6 text-gray-300 font-semibold text-sm">Area</th>
                    <th className="text-center py-4 px-6 text-gray-300 font-semibold text-sm">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {collections.map((collection, index) => (
                    <tr key={collection._id} className={`border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors ${
                      index % 2 === 0 ? 'bg-gray-950/20' : 'bg-gray-900/20'
                    }`}>
                      <td className="py-4 px-6 text-gray-300 text-sm">
                        {new Date(collection.createdAt).toLocaleDateString('en-IN', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className="py-4 px-6 text-white font-medium text-sm">{collection.wasteType || 'N/A'}</td>
                      <td className="py-4 px-6 text-center text-gray-300 text-sm">{collection.weight || 0}</td>
                      <td className="py-4 px-6 text-center text-gray-300 text-sm">{collection.area || 'N/A'}</td>
                      <td className="py-4 px-6 text-center">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${
                          collection.verified 
                            ? 'bg-green-500/20 text-green-400 border-green-500/30' 
                            : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                        }`}>
                          {collection.verified ? 'Verified' : 'Pending'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
