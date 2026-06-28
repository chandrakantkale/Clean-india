import { useState, useEffect } from "react";
import axios from "axios";

export default function WorkersMonitoring() {
  const [workers, setWorkers] = useState([]);
  const [filteredWorkers, setFilteredWorkers] = useState([]);
  const [stats, setStats] = useState({ total: 0, working: 0, onLeave: 0, notWorking: 0 });
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState(null);
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [workerDetails, setWorkerDetails] = useState(null);
  const [workerLoading, setWorkerLoading] = useState(false);

  useEffect(() => { fetchWorkers(); }, []);
  useEffect(() => { filterWorkers(selectedFilter); }, [workers, selectedFilter]);

  const fetchWorkers = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/auth/workers");
      setWorkers(res.data.workers);
      setStats(res.data.stats);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching workers:", err);
      setLoading(false);
    }
  };

  const filterWorkers = (status) => {
    setFilteredWorkers(!status ? workers : workers.filter(w => w.workStatus === status));
  };

  const handleFilterClick = (status) => setSelectedFilter(selectedFilter === status ? null : status);

  const handleWorkerClick = async (worker) => {
    setSelectedWorker(worker);
    setWorkerLoading(true);
    try {
      const res = await axios.get(`http://localhost:5000/api/auth/workers/${worker._id}`);
      setWorkerDetails(res.data);
      setWorkerLoading(false);
    } catch (err) {
      console.error("Error fetching worker details:", err);
      setWorkerLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'on-work': return 'bg-green-900/40 text-green-400 border-green-700';
      case 'leave': return 'bg-yellow-900/40 text-yellow-400 border-yellow-700';
      case 'not-in-work': return 'bg-red-900/40 text-red-400 border-red-700';
      default: return 'bg-gray-800 text-gray-400 border-gray-600';
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
      case 'on-work': return 'bg-green-500';
      case 'leave': return 'bg-yellow-500';
      case 'not-in-work': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const formatTime = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-IN');
  };

  return (
    <section className="bg-gray-950/60 backdrop-blur-md mt-6 mb-6 rounded-3xl py-12 shadow-sm border border-gray-700/50">
      <div className="max-w-7xl mx-auto px-6">
        <h1 className="text-4xl font-bold text-white mb-12">Workers Monitoring</h1>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div onClick={() => handleFilterClick(null)} className={`bg-gray-900/60 border border-gray-700/50 rounded-2xl p-8 text-center hover:border-blue-500 transition-all cursor-pointer ${selectedFilter === null ? 'ring-2 ring-blue-500' : 'hover:scale-105'}`}>
            <div className="flex items-center justify-center mb-3">
              <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.856-1.487M15 10a3 3 0 11-6 0 3 3 0 016 0zM6 20h12a6 6 0 00-6-6 6 6 0 00-6 6z" />
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-gray-400 mb-2">Total Workers</h3>
            <p className="text-4xl font-bold text-blue-400">{stats.total}</p>
            {selectedFilter === null && <p className="text-xs text-blue-400 mt-2">✓ Showing All</p>}
          </div>

          <div onClick={() => handleFilterClick('on-work')} className={`bg-gray-900/60 border border-gray-700/50 rounded-2xl p-8 text-center hover:border-green-500 transition-all cursor-pointer ${selectedFilter === 'on-work' ? 'ring-2 ring-green-500' : 'hover:scale-105'}`}>
            <div className="flex items-center justify-center mb-3">
              <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-gray-400 mb-2">Working</h3>
            <p className="text-4xl font-bold text-green-400">{stats.working}</p>
            {selectedFilter === 'on-work' && <p className="text-xs text-green-400 mt-2">✓ Filtered</p>}
          </div>

          <div onClick={() => handleFilterClick('leave')} className={`bg-gray-900/60 border border-gray-700/50 rounded-2xl p-8 text-center hover:border-yellow-500 transition-all cursor-pointer ${selectedFilter === 'leave' ? 'ring-2 ring-yellow-500' : 'hover:scale-105'}`}>
            <div className="flex items-center justify-center mb-3">
              <svg className="w-8 h-8 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-gray-400 mb-2">On Leave</h3>
            <p className="text-4xl font-bold text-yellow-400">{stats.onLeave}</p>
            {selectedFilter === 'leave' && <p className="text-xs text-yellow-400 mt-2">✓ Filtered</p>}
          </div>

          <div onClick={() => handleFilterClick('not-in-work')} className={`bg-gray-900/60 border border-gray-700/50 rounded-2xl p-8 text-center hover:border-red-500 transition-all cursor-pointer ${selectedFilter === 'not-in-work' ? 'ring-2 ring-red-500' : 'hover:scale-105'}`}>
            <div className="flex items-center justify-center mb-3">
              <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-gray-400 mb-2">Not Working</h3>
            <p className="text-4xl font-bold text-red-400">{stats.notWorking}</p>
            {selectedFilter === 'not-in-work' && <p className="text-xs text-red-400 mt-2">✓ Filtered</p>}
          </div>
        </div>

        {/* Workers Table */}
        <div className="bg-gray-900/60 border border-gray-700/50 rounded-2xl p-8">
          <div className="flex items-center justify-between mb-8 border-b border-gray-700/50 pb-4">
            <h2 className="text-2xl font-bold text-orange-400">Workers List</h2>
            {selectedFilter && (
              <div className="flex items-center gap-3">
                <span className="text-gray-400 text-sm">Filtered by:</span>
                <span className={`px-4 py-2 rounded-full text-sm font-semibold border ${getStatusColor(selectedFilter)}`}>
                  {getStatusLabel(selectedFilter)}
                </span>
                <button onClick={() => setSelectedFilter(null)} className="text-gray-400 hover:text-white transition-colors text-sm font-medium">
                  Clear Filter
                </button>
              </div>
            )}
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-16">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-orange-500"></div>
            </div>
          ) : filteredWorkers.length === 0 ? (
            <div className="text-center py-16">
              <svg className="w-16 h-16 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.856-1.487M15 10a3 3 0 11-6 0 3 3 0 016 0zM6 20h12a6 6 0 00-6-6 6 6 0 00-6 6z" />
              </svg>
              <p className="text-gray-400 text-lg font-medium">
                {selectedFilter ? `No ${getStatusLabel(selectedFilter).toLowerCase()} workers` : 'No workers registered yet'}
              </p>
              <p className="text-gray-500 text-sm mt-2">
                {selectedFilter ? 'Try selecting a different status' : 'Workers will appear here once they register'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700/50">
                    <th className="text-left py-4 px-6 text-gray-400 font-semibold text-sm">Name</th>
                    <th className="text-left py-4 px-6 text-gray-400 font-semibold text-sm">Phone</th>
                    <th className="text-left py-4 px-6 text-gray-400 font-semibold text-sm">Location</th>
                    <th className="text-center py-4 px-6 text-gray-400 font-semibold text-sm">Work Score</th>
                    <th className="text-center py-4 px-6 text-gray-400 font-semibold text-sm">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredWorkers.map((worker, index) => (
                    <tr
                      key={worker._id}
                      onClick={() => handleWorkerClick(worker)}
                      className={`border-b border-gray-700/30 hover:bg-gray-800/50 transition-colors cursor-pointer ${index % 2 === 0 ? 'bg-transparent' : 'bg-gray-900/30'}`}
                    >
                      <td className="py-4 px-6 text-white font-medium">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                            {worker.name.charAt(0).toUpperCase()}
                          </div>
                          <span>{worker.name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-gray-300 font-mono text-sm">{worker.phone}</td>
                      <td className="py-4 px-6 text-gray-300 text-sm">
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          </svg>
                          <span>{worker.city ? worker.city : (worker.village ? worker.village : 'N/A')}{worker.taluka ? `, ${worker.taluka}` : ''}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <div className="inline-flex items-center justify-center">
                          <div className="relative w-16 h-16">
                            <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 100 100">
                              <circle cx="50" cy="50" r="45" fill="none" stroke="#374151" strokeWidth="3" />
                              <circle cx="50" cy="50" r="45" fill="none" stroke="#f59e0b" strokeWidth="3"
                                strokeDasharray={`${(worker.workScore || 0) * 2.83} 283`} strokeLinecap="round" />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-orange-400 font-bold text-sm">{worker.workScore || 0}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold border ${getStatusColor(worker.workStatus)}`}>
                          <span className={`w-2 h-2 rounded-full ${getStatusDotColor(worker.workStatus)}`}></span>
                          {getStatusLabel(worker.workStatus)}
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

      {/* Worker Report Modal */}
      {selectedWorker && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-700/50 rounded-2xl shadow-lg max-w-2xl w-full h-[90vh] flex flex-col">
            <div className="border-b border-gray-700/50 p-6 flex items-center justify-between flex-shrink-0">
              <h2 className="text-2xl font-bold text-white">Worker Report</h2>
              <button onClick={() => setSelectedWorker(null)} className="text-gray-400 hover:text-white transition-colors p-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {workerLoading ? (
                <div className="flex justify-center items-center h-full">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
                </div>
              ) : workerDetails ? (
                <div className="space-y-6">
                  {/* Worker Info */}
                  <div className="bg-gray-800/60 border border-gray-700/50 rounded-xl p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-2xl flex-shrink-0">
                        {selectedWorker.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-white">{selectedWorker.name}</h3>
                        <p className="text-gray-400 font-mono">{selectedWorker.phone}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-gray-500 text-sm">Location</p>
                        <p className="text-white font-semibold">{selectedWorker.city ? selectedWorker.city : (selectedWorker.village ? selectedWorker.village : 'N/A')}{selectedWorker.taluka ? `, ${selectedWorker.taluka}` : ''}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-sm">Status</p>
                        <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border mt-1 ${getStatusColor(selectedWorker.workStatus)}`}>
                          <span className={`w-2 h-2 rounded-full ${getStatusDotColor(selectedWorker.workStatus)}`}></span>
                          {getStatusLabel(selectedWorker.workStatus)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Shift Times */}
                  <div className="bg-gray-800/60 border border-cyan-700/40 rounded-xl p-6">
                    <h4 className="text-lg font-bold text-cyan-400 mb-4 flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Shift Information
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-gray-500 text-sm mb-1">Shift Start Time</p>
                        <p className="text-cyan-400 font-semibold">{formatTime(workerDetails.worker?.shiftStartTime)}</p>
                        <p className="text-gray-500 text-xs">{formatDate(workerDetails.worker?.shiftStartTime)}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-sm mb-1">Shift End Time</p>
                        <p className="text-cyan-400 font-semibold">{formatTime(workerDetails.worker?.shiftEndTime)}</p>
                        <p className="text-gray-500 text-xs">{formatDate(workerDetails.worker?.shiftEndTime)}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-gray-500 text-sm mb-1">Total Shift Hours</p>
                        <p className="text-2xl font-bold text-cyan-400">{(workerDetails.worker?.totalShiftHours || 0).toFixed(2)} <span className="text-sm">hours</span></p>
                      </div>
                    </div>
                  </div>

                  {/* Last Month Working Hours */}
                  <div className="bg-gray-800/60 border border-indigo-700/40 rounded-xl p-6">
                    <h4 className="text-lg font-bold text-indigo-400 mb-4 flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Last Month Working Hours
                    </h4>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-gray-900/60 rounded-lg p-4 text-center">
                        <p className="text-gray-500 text-sm mb-2">Total Hours</p>
                        <p className="text-3xl font-bold text-indigo-400">{(workerDetails.stats?.lastMonthTotalHours || 0).toFixed(1)}</p>
                        <p className="text-gray-500 text-xs mt-1">hours</p>
                      </div>
                      <div className="bg-gray-900/60 rounded-lg p-4 text-center">
                        <p className="text-gray-500 text-sm mb-2">Working Days</p>
                        <p className="text-3xl font-bold text-indigo-400">{workerDetails.stats?.lastMonthWorkingDays || 0}</p>
                        <p className="text-gray-500 text-xs mt-1">days</p>
                      </div>
                      <div className="bg-gray-900/60 rounded-lg p-4 text-center">
                        <p className="text-gray-500 text-sm mb-2">Avg Daily Hours</p>
                        <p className="text-3xl font-bold text-indigo-400">{(workerDetails.stats?.lastMonthAvgDailyHours || 0).toFixed(1)}</p>
                        <p className="text-gray-500 text-xs mt-1">hours/day</p>
                      </div>
                    </div>
                  </div>

                  {/* Statistics */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-800/60 border border-blue-700/40 rounded-xl p-4 text-center">
                      <p className="text-gray-500 text-sm mb-2">Total Collections</p>
                      <p className="text-3xl font-bold text-blue-400">{workerDetails.stats?.totalCollections || 0}</p>
                    </div>
                    <div className="bg-gray-800/60 border border-green-700/40 rounded-xl p-4 text-center">
                      <p className="text-gray-500 text-sm mb-2">Total Weight</p>
                      <p className="text-3xl font-bold text-green-400">{workerDetails.stats?.totalWeight || 0} <span className="text-sm">kg</span></p>
                    </div>
                    <div className="bg-gray-800/60 border border-purple-700/40 rounded-xl p-4 text-center">
                      <p className="text-gray-500 text-sm mb-2">Verified</p>
                      <p className="text-3xl font-bold text-purple-400">{workerDetails.stats?.verifiedCollections || 0}</p>
                    </div>
                    <div className="bg-gray-800/60 border border-orange-700/40 rounded-xl p-4 text-center">
                      <p className="text-gray-500 text-sm mb-2">Pending</p>
                      <p className="text-3xl font-bold text-orange-400">{workerDetails.stats?.pendingCollections || 0}</p>
                    </div>
                  </div>

                  {/* Recent Collections */}
                  <div>
                    <h4 className="text-lg font-bold text-white mb-4">Recent Collections</h4>
                    {workerDetails.recentCollections && workerDetails.recentCollections.length > 0 ? (
                      <div className="space-y-2">
                        {workerDetails.recentCollections.map((collection) => (
                          <div key={collection._id} className="bg-gray-800/60 border border-gray-700/50 rounded-lg p-3 flex items-center justify-between">
                            <div>
                              <p className="text-white font-semibold text-sm">{collection.wasteType || 'N/A'}</p>
                              <p className="text-gray-500 text-xs">{new Date(collection.date).toLocaleDateString('en-IN')}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-orange-400 font-bold">{collection.weight || 0} kg</p>
                              <span className={`inline-flex text-xs font-semibold px-2 py-1 rounded mt-1 ${collection.status === 'verified' ? 'bg-green-900/40 text-green-400' : 'bg-yellow-900/40 text-yellow-400'}`}>
                                {collection.status === 'verified' ? 'Verified' : 'Pending'}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-4">No collections yet</p>
                    )}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
