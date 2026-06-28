import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { useToast } from "../../context/ToastContext";
import { locationData, getDistricts, getTalukas, getVillages } from "../../data/locationData";

export default function OwnerRegister() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    mobile: "",
    email: "",
    password: "",
    address: "",
    state: "",
    district: "",
    taluka: "",
    village: "",
    role: "owner"
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
    if (!formData.email.trim()) err.email = "Email is required";
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      err.email = "Enter valid email address";
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
        setTimer(300);
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

    try {
      const res = await fetch("http://localhost:5000/api/auth/register-owner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `${formData.firstName} ${formData.lastName}`.trim(),
          phone: formData.mobile,
          email: formData.email,
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
        showToast("Owner registration successful! Please login.", "success");
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
          <div className="inline-block bg-purple-500/10 p-4 rounded-full mb-4">
            <svg className="w-12 h-12 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">Owner Registration</h2>
          <p className="text-gray-400">Register to start offering coupons</p>
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
                className="w-full rounded-xl bg-gray-950/80 border border-gray-700 px-4 py-3.5 text-gray-200 placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 transition-all"
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
                className="w-full rounded-xl bg-gray-950/80 border border-gray-700 px-4 py-3.5 text-gray-200 placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 transition-all"
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
                className="flex-1 rounded-xl bg-gray-950/80 border border-gray-700 px-4 py-3.5 text-gray-200 placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 transition-all disabled:opacity-50"
              />
              {!otpSent && (
                <button
                  type="button"
                  onClick={sendOTP}
                  disabled={loading}
                  className="px-6 py-3.5 bg-purple-500 hover:bg-purple-600 text-white font-semibold rounded-xl transition-all disabled:opacity-50"
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
                  className="flex-1 rounded-xl bg-gray-950/80 border border-gray-700 px-4 py-3.5 text-gray-200 placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 transition-all disabled:opacity-50"
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
                <p className="text-purple-400 text-xs mt-1">
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
            <label className="text-sm font-semibold text-gray-300 block mb-2">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter email address"
              className="w-full rounded-xl bg-gray-950/80 border border-gray-700 px-4 py-3.5 text-gray-200 placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 transition-all"
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-300 block mb-2">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Strong password"
              className="w-full rounded-xl bg-gray-950/80 border border-gray-700 px-4 py-3.5 text-gray-200 placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 transition-all"
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
              className="w-full rounded-xl bg-gray-950/80 border border-gray-700 px-4 py-3.5 text-gray-200 placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 transition-all"
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
                className="w-full rounded-xl bg-gray-950/80 border border-gray-700 px-4 py-3.5 text-gray-200 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 transition-all"
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
                className="w-full rounded-xl bg-gray-950/80 border border-gray-700 px-4 py-3.5 text-gray-200 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 transition-all disabled:opacity-50"
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
                className="w-full rounded-xl bg-gray-950/80 border border-gray-700 px-4 py-3.5 text-gray-200 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 transition-all disabled:opacity-50"
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
                className="w-full rounded-xl bg-gray-950/80 border border-gray-700 px-4 py-3.5 text-gray-200 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 transition-all disabled:opacity-50"
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
            className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg hover:shadow-purple-500/50 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {loading ? "Registering..." : "Register as Owner"}
          </button>
        </form>

        <p className="text-center text-gray-500 text-sm mt-6">
          Already have an account? <Link to="/login" className="text-purple-500 hover:text-purple-400 font-semibold">Login here</Link>
        </p>
      </div>
    </main>
  );
}
