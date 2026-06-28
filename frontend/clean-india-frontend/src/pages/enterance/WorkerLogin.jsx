import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function WorkerLogin() {
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

            if (res.data.role !== 'worker') {
                alert("This login is only for workers. Please use the citizen login.");
                return;
            }

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
                    <div className="inline-block bg-blue-500/10 p-4 rounded-full mb-4">
                        <svg className="w-12 h-12 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-2">Worker Login</h2>
                    <p className="text-gray-400">Access your worker dashboard</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">

                    <div>
                        <label className="text-sm font-semibold text-gray-300 block mb-2">Mobile Number</label>
                        <input
                            type="text"
                            placeholder="Enter 10-digit mobile number"
                            onChange={(e) => setNumber(e.target.value)}
                            className="w-full rounded-xl bg-gray-950/80 border border-gray-700 px-4 py-3.5 text-gray-200 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition-all"
                            required
                        />
                    </div>

                    <div>
                        <label className="text-sm font-semibold text-gray-300 block mb-2">Password</label>
                        <input
                            type="password"
                            placeholder="Enter your password"
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full rounded-xl bg-gray-950/80 border border-gray-700 px-4 py-3.5 text-gray-200 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition-all"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg hover:shadow-blue-500/50 hover:scale-[1.02]">
                        Login as Worker
                    </button>

                </form>

                <p className="text-center text-gray-500 text-sm mt-6">
                    Not a worker? <Link to="/login" className="text-blue-500 hover:text-blue-400 font-semibold">Citizen Login</Link>
                </p>
            </div>
        </main>
    );
}
