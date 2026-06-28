import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import axios from "axios";

export default function WorkerStartShift() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [shiftActive, setShiftActive] = useState(false);
  const [shiftStartTime, setShiftStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState("00:00:00");
  const [loading, setLoading] = useState(false);
  const [totalHours, setTotalHours] = useState(0);

  // Load shift state from localStorage on mount
  useEffect(() => {
    if (user?.phone) {
      const savedShiftState = localStorage.getItem(`shift_${user.phone}`);
      if (savedShiftState) {
        const { isActive, startTime } = JSON.parse(savedShiftState);
        if (isActive) {
          setShiftActive(true);
          setShiftStartTime(startTime);
        }
      }
      setTotalHours(user.totalShiftHours || 0);
    }
  }, [user]);

  // Timer effect - continues even if tab is closed
  useEffect(() => {
    let interval;
    if (shiftActive && shiftStartTime) {
      interval = setInterval(() => {
        const now = new Date();
        const diff = now - new Date(shiftStartTime);
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setElapsedTime(
          `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
        );
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [shiftActive, shiftStartTime]);

  // Save shift state to localStorage whenever it changes
  useEffect(() => {
    if (user?.phone) {
      if (shiftActive && shiftStartTime) {
        localStorage.setItem(`shift_${user.phone}`, JSON.stringify({
          isActive: true,
          startTime: shiftStartTime
        }));
      } else {
        localStorage.removeItem(`shift_${user.phone}`);
      }
    }
  }, [shiftActive, shiftStartTime, user?.phone]);

  const startShift = async () => {
    if (!user?.phone) {
      showToast("Phone number not found. Please login again.", "error");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post("http://localhost:5000/api/auth/shift/start", { 
        phone: user.phone 
      });
      setShiftActive(true);
      setShiftStartTime(res.data.shiftStartTime);
      setElapsedTime("00:00:00");
      showToast("Shift started successfully!", "success");
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Failed to start shift";
      showToast(errorMsg, "error");
    } finally {
      setLoading(false);
    }
  };

  const endShift = async () => {
    if (!user?.phone) {
      showToast("Phone number not found. Please login again.", "error");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post("http://localhost:5000/api/auth/shift/end", { 
        phone: user.phone 
      });
      setShiftActive(false);
      setShiftStartTime(null);
      setElapsedTime("00:00:00");
      setTotalHours(parseFloat(res.data.totalShiftHours));
      showToast(`Shift ended! Duration: ${res.data.shiftDuration} hours`, "success");
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Failed to end shift";
      showToast(errorMsg, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="bg-gradient-to-br from-gray-900/30 via-gray-950/40 to-gray-900/30 backdrop-blur-md mt-6 mb-6 rounded-3xl py-12 shadow-black shadow-2xl border border-gray-600">
      <div className="max-w-2xl mx-auto px-6">
        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600 mb-12 text-center">
          Start Your Shift
        </h1>

        <div className="bg-gradient-to-br from-gray-900/60 to-gray-950/80 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-8 shadow-2xl">
          {/* Current Status */}
          <div className="mb-8 text-center">
            <div className="flex items-center justify-center mb-4">
              <div className={`w-20 h-20 rounded-full flex items-center justify-center ${
                shiftActive 
                  ? "bg-green-500/20 border-2 border-green-500" 
                  : "bg-gray-700/20 border-2 border-gray-600"
              }`}>
                <svg className={`w-10 h-10 ${shiftActive ? "text-green-400" : "text-gray-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              {shiftActive ? "Shift Active" : "Shift Inactive"}
            </h2>
            <p className="text-gray-400">
              {shiftActive ? "You are currently working" : "Start your shift to begin tracking"}
            </p>
          </div>

          {/* Elapsed Time Display */}
          {shiftActive && (
            <div className="mb-8 bg-gradient-to-r from-green-900/30 to-emerald-900/30 border border-green-700/30 rounded-xl p-6 text-center">
              <p className="text-gray-400 text-sm mb-2">Elapsed Time</p>
              <p className="text-5xl font-bold text-green-400 font-mono">{elapsedTime}</p>
              <p className="text-gray-400 text-sm mt-2">
                Started at {shiftStartTime ? new Date(shiftStartTime).toLocaleTimeString('en-IN') : 'N/A'}
              </p>
            </div>
          )}

          {/* Shift Info */}
          <div className="mb-8 grid grid-cols-2 gap-4">
            <div className="bg-gray-900/40 border border-gray-700/30 rounded-lg p-4">
              <p className="text-gray-400 text-sm mb-2">Phone Number</p>
              <p className="text-white font-semibold font-mono">{user?.phone || "Not set"}</p>
            </div>
            <div className="bg-gray-900/40 border border-gray-700/30 rounded-lg p-4">
              <p className="text-gray-400 text-sm mb-2">Total Hours</p>
              <p className="text-white font-semibold">{totalHours.toFixed(2)} hrs</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            {!shiftActive ? (
              <button
                onClick={startShift}
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 disabled:from-gray-600 disabled:to-gray-600 text-white font-bold py-4 px-6 rounded-lg transition-all transform hover:scale-105 disabled:scale-100 flex items-center justify-center gap-2"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {loading ? "Starting..." : "Start Shift"}
              </button>
            ) : (
              <button
                onClick={endShift}
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 disabled:from-gray-600 disabled:to-gray-600 text-white font-bold py-4 px-6 rounded-lg transition-all transform hover:scale-105 disabled:scale-100 flex items-center justify-center gap-2"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                {loading ? "Ending..." : "End Shift"}
              </button>
            )}
          </div>

          {/* Info Box */}
          <div className="mt-8 bg-blue-900/20 border border-blue-700/30 rounded-lg p-4">
            <p className="text-blue-300 text-sm">
              <span className="font-semibold">💡 Tip:</span> Your shift time is tracked in real-time. Click "Start Shift" when you begin work and "End Shift" when you finish. The total hours will be recorded in your profile.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
