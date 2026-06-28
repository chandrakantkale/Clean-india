import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AuthNavbar() {
    const { user, logout } = useAuth();
    const location = useLocation();

    const handleLogout = () => {
        logout();
    };

    const isActive = (path) => location.pathname === path;

    return (
        <header className="w-full bg-gray-950/90 backdrop-blur-xl border-b border-gray-700 rounded-3xl shadow-black p-3 shadow-2xl mb-6">
            <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                <Link to={user?.role === 'owner' ? '/owner-coupons' : user?.role === 'worker' ? '/worker-start-shift' : '/dashboard'} className="text-2xl font-bold">
                    <span className="text-blue-400">CLEAN</span>
                    <span className="text-orange-500">-INDIA</span>
                </Link>

                <nav className="hidden md:flex items-center gap-6">
                    {user?.role === 'owner' ? (
                        <>
                            <Link 
                                to="/owner-coupons" 
                                className={`px-4 py-2 rounded-lg font-medium transition ${
                                    isActive('/owner-coupons') 
                                        ? 'bg-orange-500 text-black' 
                                        : 'text-gray-400 hover:text-orange-500'
                                }`}>
                                Coupons
                            </Link>
                            <Link 
                                to="/workers-monitoring" 
                                className={`px-4 py-2 rounded-lg font-medium transition ${
                                    isActive('/workers-monitoring') 
                                        ? 'bg-orange-500 text-black' 
                                        : 'text-gray-400 hover:text-orange-500'
                                }`}>
                                Workers
                            </Link>
                            <Link 
                                to="/profile" 
                                className={`px-4 py-2 rounded-lg font-medium transition ${
                                    isActive('/profile') 
                                        ? 'bg-orange-500 text-black' 
                                        : 'text-gray-400 hover:text-orange-500'
                                }`}>
                                Profile
                            </Link>
                        </>
                    ) : (
                        <>
                            {user?.role === 'worker' && (
                                <>
                                    <Link 
                                        to="/worker-start-shift" 
                                        className={`px-4 py-2 rounded-lg font-medium transition ${
                                            isActive('/worker-start-shift') 
                                                ? 'bg-orange-500 text-black' 
                                                : 'text-gray-400 hover:text-orange-500'
                                        }`}>
                                        Start Shift
                                    </Link>
                                    <Link 
                                        to="/worker-verify" 
                                        className={`px-4 py-2 rounded-lg font-medium transition ${
                                            isActive('/worker-verify') 
                                                ? 'bg-orange-500 text-black' 
                                                : 'text-gray-400 hover:text-orange-500'
                                        }`}>
                                        Verify QR
                                    </Link>
                                </>
                            )}
                            <Link 
                                to="/dashboard" 
                                className={`px-4 py-2 rounded-lg font-medium transition ${
                                    isActive('/dashboard') 
                                        ? 'bg-orange-500 text-black' 
                                        : 'text-gray-400 hover:text-orange-500'
                                }`}>
                                Dashboard
                            </Link>
                            {user?.role !== 'worker' && (
                                <Link 
                                    to="/rewards" 
                                    className={`px-4 py-2 rounded-lg font-medium transition ${
                                        isActive('/rewards') 
                                            ? 'bg-orange-500 text-black' 
                                            : 'text-gray-400 hover:text-orange-500'
                                    }`}>
                                    Rewards
                                </Link>
                            )}
                            <Link 
                                to="/profile" 
                                className={`px-4 py-2 rounded-lg font-medium transition ${
                                    isActive('/profile') 
                                        ? 'bg-orange-500 text-black' 
                                        : 'text-gray-400 hover:text-orange-500'
                                }`}>
                                Profile
                            </Link>
                        </>
                    )}
                </nav>

                <div className="flex items-center gap-4">
                    <span className="text-gray-300">Hi, {user?.name}</span>
                    <button
                        onClick={handleLogout}
                        className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-lg font-medium transition"
                    >
                        Logout
                    </button>
                </div>
            </div>
        </header>
    );
}
