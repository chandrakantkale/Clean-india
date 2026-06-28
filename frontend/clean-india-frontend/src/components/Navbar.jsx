import {Link} from 'react-router-dom'
import { useAuth } from '../context/AuthContext';

export default function Navbar(){
    const { user, logout } = useAuth();

    return(
        <>
        <header className="w-full bg-gray-950/80 backdrop-blur-xl border-b
         border-gray-800 rounded-3xl shadow-black p-3 shadow-2xl mb-6">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

        <Link to="/" className="text-2xl font-bold">
          <span className="text-blue-400">CLEAN</span>
          <span className="text-orange-500">-INDIA</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-gray-400">
          <Link to="/help" className="hover:text-orange-500 transition">
            Help
          </Link>
          <Link to="/contact" className="hover:text-orange-500 transition">
            Contact
          </Link>
          <Link to="/rewards" className="hover:text-orange-500 transition">
            Rewards
          </Link>
          {user && (
            <Link to="/dashboard" className="hover:text-orange-500 transition">
              Dashboard
            </Link>
          )}
        </nav>

        {user ? (
          <div className="flex items-center gap-4">
            <span className="text-gray-300">Hi, {user.name}</span>
            <button
              onClick={logout}
              className="bg-red-500 text-white px-5 py-2 rounded-lg font-medium hover:bg-red-600 transition"
            >
              Logout
            </button>
          </div>
        ) : (
          <Link
            to="/register"
            className="bg-orange-500 text-black px-5 py-2 rounded-lg font-medium hover:bg-orange-600 transition"
          >
            Get Started
          </Link>
        )}
      </div>
    </header>
        </>
    )
}
