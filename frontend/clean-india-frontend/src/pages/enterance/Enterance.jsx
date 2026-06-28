import { useState } from "react"
import { Link } from "react-router-dom";


export default function Enterance() {

    const [register, login] = useState(false);

    return (
        <>
            <main className="mt-3 mb-3 min-h-screen bg-linear-to-br from-black/30 via-gray-900/50 to-black/30 
    flex items-center justify-center px-6 rounded-3xl backdrop-blur-sm">
                <div className="p-4 ">

                    <Link
                        to="/login"
                        className="bg-red-400 px-10 py-4"

                    >
                        Login
                    </Link>

                    <Link
                        to="/register"
                        className="bg-red-400 px-10 py-4"

                    >
                        Register
                    </Link>

                </div>
            </main>
        </>
    )
}