import Hero from "./points/Hero";
import Info from "./points/Info";
import Last from "./points/last";
import Rate from "./points/Rate";
import dayWasteImg from "../images/waste3.png";

export default function Home() {
    return (
        <>
            {/* Fixed background */}
            <div
                className="fixed inset-0 bg-cover bg-center bg-no-repeat -z-10"
                // style={{ backgroundImage: `url(${dayWasteImg})` }}
            >
                <div className="absolute inset-0 bg-black/10"></div>
            </div>


            {/* Page content */}
            <div className="relative">
                <Hero />
                <Info />
                <Rate />
                <Last />
            </div>
        </>
    );
}
