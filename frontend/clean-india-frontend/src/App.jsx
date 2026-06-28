import './App.css'
import Home from './components/Home';
import Footer from './components/Footer';
import Navbar from './components/Navbar';
import AuthNavbar from './components/AuthNavbar';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Register from './pages/enterance/Register';
import WorkerRegister from './pages/enterance/WorkerRegister';
import OwnerRegister from './pages/enterance/OwnerRegister';
import Rewards from './pages/Rewards';
import Contact from './pages/Contact';
import Help from './pages/Help';
import Login from './pages/enterance/Login';
import Profile from './pages/AfterLogin/Profile';
import History from './pages/AfterLogin/History';
import WorkerVerify from './pages/AfterLogin/WorkerVerify';
import OwnerCoupons from './pages/AfterLogin/OwnerCoupons';
import WorkersMonitoring from './pages/AfterLogin/WorkersMonitoring';
import WorkerShiftControl from './pages/AfterLogin/WorkerShiftControl';
import WorkerStartShift from './pages/AfterLogin/WorkerStartShift';
import ProtectedRoute from "./components/ProtectedRoute";
import Dashboard from './pages/AfterLogin/Dashboard'
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import ToastContainer from './components/ToastContainer';

function AppContent() {
  const { user } = useAuth();

  return (
    <>
      <div className='fixed inset-0 bg-cover bg-center bg-no-repeat -z-10 bg-gradient-to-bl from-black via-gray-900 to-black'></div>
      <ToastContainer />
      <BrowserRouter>
        {user ? <AuthNavbar /> : <Navbar />}
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/register' element={<Register />} />
          <Route path='/worker-register' element={<WorkerRegister />} />
          <Route path='/owner-register' element={<OwnerRegister />} />
          <Route path='/login' element={<Login />} />
          <Route path='/rewards' element={<Rewards />} />
          <Route path='/contact' element={<Contact />} />
          <Route path='/help' element={<Help />} />
          <Route path='/profile' element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path='/history' element={<ProtectedRoute><History /></ProtectedRoute>} />
          <Route path='/dashboard' element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path='/worker-verify' element={<ProtectedRoute><WorkerVerify /></ProtectedRoute>} />
          <Route path='/owner-coupons' element={<ProtectedRoute><OwnerCoupons /></ProtectedRoute>} />
          <Route path='/workers-monitoring' element={<ProtectedRoute><WorkersMonitoring /></ProtectedRoute>} />
          <Route path='/worker-shift' element={<ProtectedRoute><WorkerShiftControl /></ProtectedRoute>} />
          <Route path='/worker-start-shift' element={<ProtectedRoute><WorkerStartShift /></ProtectedRoute>} />
        </Routes>
        <Footer />
      </BrowserRouter>
    </>
  )
}

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </AuthProvider>
  )
}

export default App
