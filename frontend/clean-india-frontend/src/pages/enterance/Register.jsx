import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { locationData, getDistricts, getTalukas, getVillages } from "../../data/locationData";
import { useToast } from "../../context/ToastContext";

export default function Register() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    mobile: "",
    password: "",
    address: "",
    state: "",
    district: "",
    taluka: "",
    village: "",
    role: "citizen"
  });

  const [errors, setErrors] = useState({});
  const [otpStep, setOtpStep] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [timer, setTimer] = useState(0);
  const [loading, setLoading] = useState(false);
  
  // Location state
  const [districts, setDistricts] = useState([]);
  const [talukas, setTalukas] = useState([]);
  const [villages, setVillages] = useState([]);

  function handleChange(e) {
    const { name, value } = e.target;
    
    // Validate name fields to not contain numbers
    if (name === 'firstName' || name === 'lastName') {
      const nameRegex = /^[a-zA-Z\s]*$/;
      if (!nameRegex.test(value)) {
        return; // Don't update if contains numbers or special characters
      }
    }
    
    // Handle location changes
    if (name === 'state') {
      setDistricts(getDistricts(value));
      setTalukas([]);
      setVillages([]);
      setFormData({ ...formData, state: value, district: "", taluka: "", village: "" });
      return;
    }
    
    if (name === 'district') {
      setTalukas(getTalukas(formData.state, value));
      setVillages([]);
      setFormData({ ...formData, district: value, taluka: "", village: "" });
      return;
    }
    
    if (name === 'taluka') {
      setVillages(getVillages(formData.state, formData.district, value));
      setFormData({ ...formData, taluka: value, village: "" });
      return;
    }
    
    setFormData({ ...formData, [name]: value });
  }

  function validate() {
    const err = {};
    if (!formData.firstName.trim()) err.firstName = "First name is required";
    if (!formData.lastName.trim()) err.lastName = "Last name is required";
    if (!formData.mobile || formData.mobile.length !== 10)
      err.mobile = "Enter valid 10-digit mobile number";
    if (formData.mobile && !/^[789]/.test(formData.mobile))
      err.mobile = "Mobile number must start with 7, 8, or 9";
    if (!formData.address.trim()) err.address = "Address is required";
    if (!formData.password.trim()) err.password = "Password is required";
    if (!formData.state) err.state = "State is required";
    if (!formData.district) err.district = "District is required";
    if (!formData.taluka) err.taluka = "Taluka is required";
    if (!formData.village) err.village = "Village is required";
    
    const nameRegex = /^[a-zA-Z\s]+$/;
    if (formData.firstName && !nameRegex.test(formData.firstName)) {
      err.firstName = "First name should only contain letters";
    }
    if (formData.lastName && !nameRegex.test(formData.lastName)) {
      err.lastName = "Last name should only contain letters";
    }
    
    return err;
  }

  async function sendOTP() {
    if (!formData.mobile || formData.mobile.length !== 10) {
      setErrors({ mobile: "Enter valid 10-digit mobile number" });
      return;
    }
    if (!/^[789]/.test(formData.mobile)) {
      setErrors({ mobile: "Mobile number must start with 7, 8, or 9" });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: formData.mobile })
      });

      const data = await res.json();

      if (res.ok) {
        setOtpSent(true);
        setOtpStep(true);
        setTimer(300); // 5 minutes
        startTimer();
        showToast("OTP sent to your mobile number!", "success");
      } else {
        showToast(data.message || "Failed to send OTP", "error");
      }
    } catch (error) {
      showToast("Network error. Please try again.", "error");
    }
    setLoading(false);
  }

  function startTimer() {
    const interval = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }

  async function verifyOTP() {
    if (!otp || otp.length !== 6) {
      showToast("Enter valid 6-digit OTP", "error");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: formData.mobile, otp })
      });

      const data = await res.json();

      if (res.ok) {
        setOtpVerified(true);
        showToast("OTP verified successfully!", "success");
      } else {
        showToast(data.message || "Invalid OTP", "error");
      }
    } catch (error) {
      showToast("Network error. Please try again.", "error");
    }
    setLoading(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!otpVerified) {
      showToast("Please verify your mobile number first", "error");
      return;
    }

    const err = validate();
    if (Object.keys(err).length) {
      setErrors(err);
      return;
    }

    setErrors({});
    setLoading(true);

    const endpoint = formData.role === "worker" 
      ? "http://localhost:5000/api/auth/register-worker"
      : formData.role === "owner"
      ? "http://localhost:5000/api/auth/register-owner"
      : "http://localhost:5000/api/auth/register";

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `${formData.firstName} ${formData.lastName}`.trim(),
          phone: formData.mobile,
          password: formData.password,
          address: formData.address,
          state: formData.state,
          district: formData.district,
          taluka: formData.taluka,
          village: formData.village
        })
      });

      const data = await res.json();

      if (res.ok) {
        showToast("Registration successful! Please login.", "success");
        setTimeout(() => navigate("/login"), 1500);
      } else {
        showToast(data.message || "Registration failed", "error");
      }
    } catch (error) {
      showToast("Network error. Please try again.", "error");
    }
    setLoading(false);
  }

  return (
    <main className="min-h-screen mt-3 mb-3 bg-gradient-to-br from-black/30 via-gray-900/50 to-black/30 flex items-center justify-center px-6 rounded-3xl backdrop-blur-sm">
      <div className="w-full max-w-lg bg-gradient-to-br from-gray-900/60 to-gray-950/80 backdrop-blur-3xl border border-gray-700/50 rounded-3xl shadow-2xl p-10">

        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">Create Account</h2>
          <p className="text-gray-400">Join CLEAN-INDIA and start earning</p>
        </div>

        <div className="mb-8 flex justify-center bg-gray-800/30 backdrop-blur-3xl rounded-xl p-1">
          <Link to='/login'
            className="flex-1 text-center text-lg font-semibold text-gray-400 hover:text-white px-8 py-3 rounded-lg transition-all">
            Login
          </Link>
          <Link
            className="flex-1 text-center text-lg font-semibold text-white bg-orange-500 px-8 py-3 rounded-lg transition-all"
            to='/register'>
            Register
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-gray-300 block mb-2">First Name</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="Enter first name"
                className="w-full rounded-xl bg-gray-950/80 border border-gray-700 px-4 py-3.5 text-gray-200 placeholder-gray-500 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30 transition-all"
              />
              {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
            </div>
            
            <div>
              <label className="text-sm font-semibold text-gray-300 block mb-2">Last Name</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Enter last name"
                className="w-full rounded-xl bg-gray-950/80 border border-gray-700 px-4 py-3.5 text-gray-200 placeholder-gray-500 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30 transition-all"
              />
              {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-300 block mb-2">Mobile Number</label>
            <div className="flex gap-2">
              <input
                type="number"
                name="mobile"
                value={formData.mobile}
                onChange={handleChange}
                placeholder="10-digit mobile number"
                disabled={otpSent}
                className="flex-1 rounded-xl bg-gray-950/80 border border-gray-700 px-4 py-3.5 text-gray-200 placeholder-gray-500 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30 transition-all disabled:opacity-50"
              />
              {!otpSent && (
                <button
                  type="button"
                  onClick={sendOTP}
                  disabled={loading}
                  className="px-6 py-3.5 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl transition-all disabled:opacity-50"
                >
                  {loading ? "Sending..." : "Send OTP"}
                </button>
              )}
            </div>
            {errors.mobile && <p className="text-red-500 text-xs mt-1">{errors.mobile}</p>}
          </div>

          {otpStep && (
            <div>
              <label className="text-sm font-semibold text-gray-300 block mb-2">Enter OTP</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="6-digit OTP"
                  maxLength="6"
                  disabled={otpVerified}
                  className="flex-1 rounded-xl bg-gray-950/80 border border-gray-700 px-4 py-3.5 text-gray-200 placeholder-gray-500 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30 transition-all disabled:opacity-50"
                />
                {!otpVerified && (
                  <button
                    type="button"
                    onClick={verifyOTP}
                    disabled={loading}
                    className="px-6 py-3.5 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl transition-all disabled:opacity-50"
                  >
                    {loading ? "Verifying..." : "Verify"}
                  </button>
                )}
              </div>
              {timer > 0 && (
                <p className="text-orange-400 text-xs mt-1">
                  OTP expires in {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}
                </p>
              )}
              {otpVerified && (
                <p className="text-green-400 text-xs mt-1 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Mobile number verified
                </p>
              )}
            </div>
          )}

          <div>
            <label className="text-sm font-semibold text-gray-300 block mb-2">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Strong password"
              className="w-full rounded-xl bg-gray-950/80 border border-gray-700 px-4 py-3.5 text-gray-200 placeholder-gray-500 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30 transition-all"
            />
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">{errors.password}</p>
            )}
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-300 block mb-2">Address</label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="House no, street, area"
              rows="3"
              className="w-full rounded-xl bg-gray-950/80 border border-gray-700 px-4 py-3.5 text-gray-200 placeholder-gray-500 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30 transition-all"
            />
            {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-gray-300 block mb-2">State</label>
              <select
                name="state"
                value={formData.state}
                onChange={handleChange}
                className="w-full rounded-xl bg-gray-950/80 border border-gray-700 px-4 py-3.5 text-gray-200 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30 transition-all"
              >
                <option value="">Select State</option>
                {locationData.states.map(state => (
                  <option key={state.id} value={state.id}>{state.name}</option>
                ))}
              </select>
              {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state}</p>}
            </div>
            
            <div>
              <label className="text-sm font-semibold text-gray-300 block mb-2">District</label>
              <select
                name="district"
                value={formData.district}
                onChange={handleChange}
                disabled={!formData.state}
                className="w-full rounded-xl bg-gray-950/80 border border-gray-700 px-4 py-3.5 text-gray-200 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30 transition-all disabled:opacity-50"
              >
                <option value="">Select District</option>
                {districts.map(district => (
                  <option key={district.id} value={district.id}>{district.name}</option>
                ))}
              </select>
              {errors.district && <p className="text-red-500 text-xs mt-1">{errors.district}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-gray-300 block mb-2">Taluka</label>
              <select
                name="taluka"
                value={formData.taluka}
                onChange={handleChange}
                disabled={!formData.district}
                className="w-full rounded-xl bg-gray-950/80 border border-gray-700 px-4 py-3.5 text-gray-200 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30 transition-all disabled:opacity-50"
              >
                <option value="">Select Taluka</option>
                {talukas.map(taluka => (
                  <option key={taluka.id} value={taluka.id}>{taluka.name}</option>
                ))}
              </select>
              {errors.taluka && <p className="text-red-500 text-xs mt-1">{errors.taluka}</p>}
            </div>
            
            <div>
              <label className="text-sm font-semibold text-gray-300 block mb-2">Village/City</label>
              <select
                name="village"
                value={formData.village}
                onChange={handleChange}
                disabled={!formData.taluka}
                className="w-full rounded-xl bg-gray-950/80 border border-gray-700 px-4 py-3.5 text-gray-200 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30 transition-all disabled:opacity-50"
              >
                <option value="">Select Village/City</option>
                {villages.map(village => (
                  <option key={village} value={village}>{village}</option>
                ))}
              </select>
              {errors.village && <p className="text-red-500 text-xs mt-1">{errors.village}</p>}
            </div>
          </div>

          <button
            type="submit"
            disabled={!otpVerified || loading}
            className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg hover:shadow-orange-500/50 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <p className="text-center text-gray-500 text-sm mt-6">
          Already have an account? <Link to="/login" className="text-orange-500 hover:text-orange-400 font-semibold">Login here</Link>
        </p>
      </div>
    </main>
  );
}
