export default function Info(){
    return(
        <>
        <section className="bg-gradient-to-br from-gray-900/20 via-gray-950/40 to-gray-900/30 
        backdrop-blur-md shadow-black shadow-2xl rounded-3xl py-20 border border-gray-600">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-white mb-14">
            How CLEAN-INDIA Works
          </h2>

          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div className="bg-gray-950/60 backdrop-blur-3xl shadow-black shadow-2xl border border-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-2">
                Get QR Code
              </h3>
              <p className="text-gray-400 text-sm">
                Citizens register and receive a unique QR code from our system.
              </p>
            </div>

            <div className="bg-gray-950/60 backdrop-blur-3xl shadow-black shadow-2xl border border-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-2">
                Daily Pickup
              </h3>
              <p className="text-gray-400 text-sm">
                Government cleaning vehicles arrive daily in your area.
              </p>
            </div>

            <div className="bg-gray-950/60 backdrop-blur-3xl shadow-black shadow-2xl border border-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-2">
                Scan & Weigh
              </h3>
              <p className="text-gray-400 text-sm">
                QR is scanned and waste is weighed using a digital machine.
              </p>
            </div>

            <div className="bg-gray-950/60 backdrop-blur-3xl shadow-black shadow-2xl border border-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-2">
                Earn Money
              </h3>
              <p className="text-gray-400 text-sm">
                Amount is calculated and added to the citizen’s wallet.
              </p>
            </div>
          </div>
        </div>
      </section>
        </>
    )
}