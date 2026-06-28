import dayWasteImg from '../../images/waste2.png'
import { Link } from "react-router-dom"


export default function Hero() {
    return (
        <>
            <section className="backdrop-blur-xl bg-gradient-to-br from-gray-900/40 via-black/50 to-gray-900/40 rounded-3xl mt-6 mb-6 border border-gray-700/50 shadow-2xl shadow-black/50">
                <div className="max-w-7xl mx-auto px-6 py-24 grid md:grid-cols-2 gap-16 items-center">

                    {/* Left Content */}
                    <div className="flex flex-col justify-center space-y-6">
                        <div className="inline-block">
                            <span className="bg-orange-500/10 text-orange-500 px-4 py-2 rounded-full text-sm font-semibold border border-orange-500/30">
                                🇮🇳 Swachh Bharat Mission
                            </span>
                        </div>
                        
                        <h1 className="text-5xl md:text-6xl font-bold leading-tight">
                            <span className="text-white">Let's make </span>
                            <span className="text-orange-500">IN</span>
                            <span className="text-white">D</span>
                            <span className="text-green-500">IA </span>
                            <span className="block mt-2 text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600">cleaner together</span>
                        </h1>

                        <p className="text-gray-400 text-lg leading-relaxed">
                            CLEAN-INDIA helps citizens dispose of waste responsibly using government cleaning vehicles and earn money based on the type and weight of waste.
                        </p>

                        <div className="flex gap-4 pt-4">
                            <Link
                                to="/register"
                                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-8 py-4 rounded-xl font-semibold shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 transition-all hover:scale-105"
                            >
                                Get Started →
                            </Link>

                            <Link
                                to="/help"
                                className="border-2 border-gray-700 hover:border-orange-500 px-8 py-4 rounded-xl text-gray-300 hover:text-orange-500 font-semibold transition-all hover:bg-orange-500/10"
                            >
                                Learn more
                            </Link>
                        </div>
                    </div>

                    {/* Right Illustration */}
                    <div className="relative w-full h-96 rounded-2xl overflow-hidden group">
                        <img
                            src={dayWasteImg}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            alt="Clean India"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20"></div>
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
                            <h1 className="text-white text-5xl font-bold drop-shadow-2xl">
                                CLEAN INDIA
                            </h1>
                            <p className="text-gray-200 mt-2 text-sm">Building a sustainable future</p>
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}