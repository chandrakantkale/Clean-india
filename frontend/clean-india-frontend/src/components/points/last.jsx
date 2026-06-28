import { Link } from 'react-router-dom'
import wasteImg from '../../images/waste.png'

export default function Last() {
  return (
    <section className="bg-gradient-to-br from-gray-900/30 via-gray-950/60 to-gray-900/40 
    backdrop-blur-md rounded-3xl shadow-black shadow-2xl border border-gray-600">
      <div className="max-w-7xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-12 items-center">

        <div className="relative w-full h-72 border-2 border-gray-800 rounded-2xl overflow-hidden">
          <img
            src={wasteImg}
            className="w-full h-full object-cover floating-img"
          />

          <div className="absolute inset-0 bg-black/70"></div>

          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
            <h1 className="text-white text-4xl font-bold">
              CLEAN INDIA
            </h1>
            <p className="text-gray-300 mt-2">
              Responsible waste disposal
            </p>
          </div>
        </div>


        <div className="flex flex-col justify-center items-center">
          <p className="text-gray-400 mb-8 leading-relaxed">
            CLEAN-INDIA is a civic-tech initiative that encourages proper waste disposal
            by allowing citizens to submit waste through government vehicles and earn
            incentives based on waste type and quantity.
          </p>

          <div className="flex gap-4">
            <Link to="/register" className="bg-orange-500 text-black px-15 py-3.5 rounded-lg font-medium hover:bg-orange-600 transition">
              Get Started
            </Link>
          </div>
        </div>

      </div>
    </section>
  );
}
