import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";

// QR Scanner component using getUserMedia API and jsQR library
const QRScanner = ({ onScan, onClose }) => {
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState("");
  const [jsQRLoaded, setJsQRLoaded] = useState(false);
  const streamRef = useRef(null);
  const animationFrameRef = useRef(null);

  useEffect(() => {
    // Load jsQR library
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.js';
    script.onload = () => setJsQRLoaded(true);
    script.onerror = () => {
      console.error('Failed to load jsQR library');
      setError('Failed to load QR decoder');
    };
    document.head.appendChild(script);
    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  const stopScanning = () => {
    setScanning(false);
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    const video = document.getElementById('qr-video');
    if (video) {
      video.srcObject = null;
    }
  };

  useEffect(() => {
    return () => {
      stopScanning();
    };
  }, []);

  const startScanning = async () => {
    if (!jsQRLoaded) {
      setError("QR decoder loading... please wait");
      return;
    }

    try {
      setScanning(true);
      setError("");
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      
      streamRef.current = stream;
      const video = document.getElementById('qr-video');
      video.srcObject = stream;
      video.onloadedmetadata = () => {
        video.play();
      };
      
      const canvas = document.getElementById('qr-canvas');
      const context = canvas.getContext('2d', { willReadFrequently: true });
      let frameCount = 0;
      let lastDetectionTime = 0;
      
      const scanFrame = () => {
        if (!scanning) return;
        
        if (video.readyState === video.HAVE_ENOUGH_DATA) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          context.drawImage(video, 0, 0, canvas.width, canvas.height);
          
          try {
            const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
            
            let code = window.jsQR(imageData.data, imageData.width, imageData.height, {
              inversionAttempts: 'attemptBoth'
            });
            
            if (code) {
              const now = Date.now();
              if (now - lastDetectionTime > 500) {
                lastDetectionTime = now;
                const qrData = code.data;
                console.log('QR Code detected:', qrData);
                
                const match = qrData.match(/\d{5}/);
                if (match) {
                  console.log('5-digit code found:', match[0]);
                  onScan(match[0]);
                  stopScanning();
                  return;
                } else if (/^\d+$/.test(qrData) && qrData.length >= 5) {
                  console.log('Using first 5 digits:', qrData.substring(0, 5));
                  onScan(qrData.substring(0, 5));
                  stopScanning();
                  return;
                }
              }
            }
          } catch (err) {
            console.error('QR detection error:', err);
          }
        }
        
        frameCount++;
        if (frameCount < 600) {
          animationFrameRef.current = requestAnimationFrame(scanFrame);
        } else {
          setError("No QR code detected. Try manual input.");
          stopScanning();
        }
      };
      
      animationFrameRef.current = requestAnimationFrame(scanFrame);
      
    } catch (err) {
      console.error('Camera error:', err);
      setError("Camera access denied or not available");
      setScanning(false);
    }
  };
  
  const handleManualInput = () => {
    stopScanning();
    onScan(null);
  };
  
  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-2xl p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-white">Scan QR Code</h3>
          <button
            onClick={() => { stopScanning(); onClose(); }}
            className="text-gray-400 hover:text-white p-2"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {!scanning && !error && (
          <div className="text-center py-8">
            <div className="bg-orange-500/10 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <svg className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M12 12h-4.01M12 12v4m6-4h.01M12 8h.01" />
              </svg>
            </div>
            <p className="text-gray-300 mb-4">Position QR code within the camera frame</p>
            <button
              onClick={startScanning}
              disabled={!jsQRLoaded}
              className="bg-orange-500 hover:bg-orange-600 disabled:bg-gray-600 text-white px-6 py-3 rounded-xl font-semibold transition-all mb-3"
            >
              {jsQRLoaded ? "Start Camera" : "Loading QR decoder..."}
            </button>
            <br />
            <button
              onClick={handleManualInput}
              className="text-gray-400 hover:text-white text-sm underline"
            >
              Enter code manually instead
            </button>
          </div>
        )}
        
        {error && (
          <div className="text-center py-8">
            <div className="bg-red-500/10 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-red-400 mb-4">{error}</p>
            <button
              onClick={handleManualInput}
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-xl font-semibold transition-all"
            >
              Enter Code Manually
            </button>
          </div>
        )}
        
        {scanning && (
          <div className="text-center">
            <div className="relative mb-4">
              <video
                id="qr-video"
                className="w-full h-64 bg-black rounded-xl object-cover"
                playsInline
              />
              <canvas id="qr-canvas" className="hidden" />
              
              <div className="absolute inset-0 border-2 border-orange-500 rounded-xl">
                <div className="absolute top-4 left-4 w-6 h-6 border-t-4 border-l-4 border-orange-500"></div>
                <div className="absolute top-4 right-4 w-6 h-6 border-t-4 border-r-4 border-orange-500"></div>
                <div className="absolute bottom-4 left-4 w-6 h-6 border-b-4 border-l-4 border-orange-500"></div>
                <div className="absolute bottom-4 right-4 w-6 h-6 border-b-4 border-r-4 border-orange-500"></div>
                
                <div className="absolute inset-x-4 top-1/2 h-0.5 bg-orange-500 animate-pulse"></div>
              </div>
            </div>
            
            <p className="text-gray-300 mb-4">Scanning for QR code...</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => { stopScanning(); onClose(); }}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleManualInput}
                className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-all"
              >
                Manual Input
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default function WorkerVerify() {
  const { user } = useAuth();
  const [verificationCode, setVerificationCode] = useState("");
  const [qrImage, setQrImage] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [inputMethod, setInputMethod] = useState("");

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setQrImage(event.target.result);
      setInputMethod("upload");
      setMessage("Image uploaded. Now enter the 5-digit code visible in the image.");
    };
    reader.readAsDataURL(file);
  };

  const handleScanResult = (result) => {
    if (result === null) {
      setInputMethod("manual");
      setShowScanner(false);
      setMessage("Enter the 5-digit verification code from the QR image.");
    } else if (result) {
      setVerificationCode(result);
      setShowScanner(false);
      setInputMethod("scan");
      setMessage("QR code scanned successfully! Click Verify Collection to confirm.");
    }
  };

  const startScanning = () => {
    setShowScanner(true);
    setQrImage(null);
    setMessage("");
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    if (user?.role !== 'worker') {
      setMessage("Access denied. Worker role required.");
      return;
    }

    if (user?.workStatus !== 'on-work') {
      setMessage("You must be marked as 'On Work' to verify waste collection. Please activate your work status first.");
      return;
    }

    if (!inputMethod) {
      setMessage("Please scan QR code, upload image, or enter code manually.");
      return;
    }

    if (!verificationCode || verificationCode.length !== 5) {
      setMessage("Please enter the 5-digit verification code.");
      return;
    }

    setLoading(true);
    try {
      await axios.post("http://localhost:5000/api/waste/verify", {
        verificationCode,
        workerPhone: user.phone
      });
      
      setMessage("Waste collection verified successfully!");
      setVerificationCode("");
      setQrImage(null);
      setInputMethod("");
    } catch (err) {
      setMessage(err.response?.data?.message || "Verification failed. Invalid code.");
    }
    setLoading(false);
  };

  if (user?.role !== 'worker') {
    return (
      <div className="text-center py-20">
        <p className="text-red-400 text-xl">Access Denied</p>
        <p className="text-gray-400 mt-2">Worker role required</p>
      </div>
    );
  }

  if (user?.workStatus !== 'on-work') {
    return (
      <section className="bg-gradient-to-br from-gray-900/30 via-gray-950/40 to-gray-900/30 backdrop-blur-md mt-6 mb-6 rounded-3xl py-20 shadow-black shadow-2xl border border-gray-600">
        <div className="max-w-2xl mx-auto px-6">
          <div className="bg-gray-900/40 backdrop-blur-xl border border-red-500/50 rounded-2xl p-8 text-center">
            <div className="bg-red-500/10 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-red-400 mb-2">Work Status Inactive</h2>
            <p className="text-gray-300 mb-4">You must be marked as "On Work" to verify waste collection.</p>
            <p className="text-gray-400 text-sm">Please activate your work status in the Workers Monitoring page before proceeding with verification.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-gradient-to-br from-gray-900/30 via-gray-950/40 to-gray-900/30 backdrop-blur-md mt-6 mb-6 rounded-3xl py-20 shadow-black shadow-2xl border border-gray-600">
      <div className="max-w-2xl mx-auto px-6">
        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600 mb-8 text-center">
          Worker Verification
        </h1>
        
        <div className="bg-gray-900/40 backdrop-blur-xl border border-gray-700 rounded-2xl p-8">
          <form onSubmit={handleVerify} className="space-y-6">
            
            {!inputMethod && (
              <div className="text-center space-y-4">
                <h3 className="text-lg font-semibold text-white mb-6">Choose Verification Method</h3>
                
                <div className="grid gap-4">
                  <button
                    type="button"
                    onClick={startScanning}
                    className="flex items-center justify-center gap-3 w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold p-4 rounded-xl transition-all shadow-lg"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M12 12h-4.01M12 12v4m6-4h.01M12 8h.01" />
                    </svg>
                    Scan QR Code with Camera
                  </button>
                  
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="flex items-center justify-center gap-3 w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold p-4 rounded-xl transition-all shadow-lg cursor-pointer">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      Upload QR Code Image
                    </div>
                  </div>
                  
                  <button
                    type="button"
                    onClick={() => { setInputMethod("manual"); setMessage("Enter the 5-digit verification code."); }}
                    className="flex items-center justify-center gap-3 w-full bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-semibold p-4 rounded-xl transition-all shadow-lg"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Enter Code Manually
                  </button>
                </div>
              </div>
            )}
            
            {inputMethod === "upload" && qrImage && (
              <div>
                <label className="text-gray-300 font-semibold mb-3 block text-lg">
                  Uploaded QR Code Image
                </label>
                <div className="bg-white p-4 rounded-lg mb-4">
                  <img src={qrImage} alt="QR Code" className="max-w-full mx-auto rounded-lg" />
                  <p className="text-center text-gray-700 mt-2 text-sm font-semibold">Look for the 5-digit code in the image</p>
                </div>
                <button
                  type="button"
                  onClick={() => { setInputMethod(""); setQrImage(null); setMessage(""); }}
                  className="text-orange-400 hover:text-orange-300 text-sm underline mb-4"
                >
                  Choose different method
                </button>
              </div>
            )}
            
            {inputMethod && (
              <div>
                <label htmlFor="verificationCode" className="text-gray-300 font-semibold mb-2 block">
                  Enter 5-Digit Verification Code
                </label>
                <input
                  id="verificationCode"
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 5))}
                  placeholder="Enter 5-digit code"
                  maxLength="5"
                  className="w-full bg-gray-950/80 border border-gray-600 p-4 rounded-xl text-white text-center text-2xl font-bold tracking-widest focus:border-orange-500 focus:outline-none transition mb-4"
                  required
                />
                
                {inputMethod !== "upload" && (
                  <button
                    type="button"
                    onClick={() => { setInputMethod(""); setMessage(""); }}
                    className="text-orange-400 hover:text-orange-300 text-sm underline mb-4"
                  >
                    Choose different method
                  </button>
                )}
              </div>
            )}
            
            {inputMethod && (
              <button
                type="submit"
                disabled={loading || verificationCode.length !== 5}
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold p-4 rounded-xl transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Verifying..." : "Verify Collection"}
              </button>
            )}
          </form>
          
          {message && (
            <div className={`mt-4 p-4 rounded-lg ${message.includes('successfully') ? 'bg-green-500/20 border border-green-500/50 text-green-400' : message.includes('uploaded') || message.includes('Enter') ? 'bg-blue-500/20 border border-blue-500/50 text-blue-400' : 'bg-red-500/20 border border-red-500/50 text-red-400'}`}>
              {message}
            </div>
          )}
        </div>
        
        {showScanner && (
          <QRScanner
            onScan={handleScanResult}
            onClose={() => setShowScanner(false)}
          />
        )}
      </div>
    </section>
  );
}
