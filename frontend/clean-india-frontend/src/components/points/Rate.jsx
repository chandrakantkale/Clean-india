export default function Rate(){
    return(
        <>
        <section className="bg-gradient-to-br from-gray-900/30 via-gray-950/40 to-gray-900/30 
        backdrop-blur-md mt-6 mb-6 rounded-3xl py-20 shadow-black shadow-2xl border border-gray-600">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-white mb-14">
            Waste Reward Rates
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gray-950/60 backdrop-blur-3xl border border-gray-800 rounded-xl p-8 text-center">
              <h3 className="text-xl font-semibold text-white mb-2">
                Dry Waste
              </h3>
              <p className="text-gray-400 mb-4">
                Plastic, Paper, Metal
              </p>
              <p className="text-2xl font-bold text-orange-500">
                ₹5 / kg
              </p>
            </div>

            <div className="bg-gray-950/60 backdrop-blur-3xl border border-gray-800 rounded-xl p-8 text-center">
              <h3 className="text-xl font-semibold text-white mb-2">
                Wet Waste
              </h3>
              <p className="text-gray-400 mb-4">
                Food & Organic Waste
              </p>
              <p className="text-2xl font-bold text-orange-500">
                ₹3 / kg
              </p>
            </div>

            <div className="bg-gray-950/60 backdrop-blur-3xl border border-gray-800 rounded-xl p-8 text-center">
              <h3 className="text-xl font-semibold text-white mb-2">
                E-Waste
              </h3>
              <p className="text-gray-400 mb-4">
                Electronics & Batteries
              </p>
              <p className="text-2xl font-bold text-orange-500">
                ₹10 / kg
              </p>
            </div>
          </div>
        </div>
      </section>
        </>
    )
}