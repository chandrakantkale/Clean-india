import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function Login() {
    const [number, setNumber] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            const res = await axios.post("http://localhost:5000/api/auth/login", {
                phone: number,
                password,
            });

            login(res.data);
            navigate("/dashboard");
        } catch (err) {
            alert(err.response?.data?.message || "Login Failed");
        }
    };

    return (
        <main className="min-h-screen mt-3 mb-3 bg-gradient-to-br from-black/30 via-gray-900/50 to-black/30 flex items-center justify-center px-6 rounded-3xl backdrop-blur-sm">

            <div className="w-full max-w-lg bg-gradient-to-br from-gray-900/60 to-gray-950/80 backdrop-blur-3xl border border-gray-700/50 rounded-3xl shadow-2xl p-10">

                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-white mb-2">Welcome Back</h2>
                    <p className="text-gray-400">Login to continue to CLEAN-INDIA</p>
                </div>

                <div className="mb-8 flex justify-center bg-gray-800/30 backdrop-blur-3xl rounded-xl p-1">
                    <Link to="/login"
                        className="flex-1 text-center text-lg font-semibold text-white bg-orange-500 px-8 py-3 rounded-lg transition-all">
                        Login
                    </Link>
                    <Link to="/register"
                        className="flex-1 text-center text-lg font-semibold text-gray-400 hover:text-white px-8 py-3 rounded-lg transition-all">
                        Register
                    </Link>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">

                    <div>
                        <label className="text-sm font-semibold text-gray-300 block mb-2">Mobile Number</label>
                        <input
                            type="text"
                            placeholder="Enter 10-digit mobile number"
                            onChange={(e) => setNumber(e.target.value)}
                            className="w-full rounded-xl bg-gray-950/80 border border-gray-700 px-4 py-3.5 text-gray-200 placeholder-gray-500 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30 transition-all"
                            required
                        />
                    </div>

                    <div>
                        <label className="text-sm font-semibold text-gray-300 block mb-2">Password</label>
                        <input
                            type="password"
                            placeholder="Enter your password"
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full rounded-xl bg-gray-950/80 border border-gray-700 px-4 py-3.5 text-gray-200 placeholder-gray-500 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30 transition-all"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg hover:shadow-orange-500/50 hover:scale-[1.02]">
                        Login to Dashboard
                    </button>

                </form>

                <p className="text-center text-gray-500 text-sm mt-6">
                    Don't have an account? <Link to="/register" className="text-orange-500 hover:text-orange-400 font-semibold">Register here</Link>
                </p>
            </div>
        </main>
    );
}
