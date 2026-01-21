import React from "react";
import { useNavigate } from "react-router-dom";

export function Hero() {
  const navigate = useNavigate();
  return (
    <div className="bg-gradient-to-r from-purple-600 via-pink-500 to-yellow-500 py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center">
          {/* Left content */}
          <div className="w-full md:w-1/2 mb-10 md:mb-0">
            <div className="max-w-lg">
              <div className="mb-4">
                <span className="inline-block bg-black text-white px-3 py-1 rounded-md text-sm font-bold uppercase tracking-wider">Digital Marketplace</span>
              </div>
              <h1 className="text-5xl md:text-6xl font-extrabold text-white tracking-tight mb-4">
                <span className="block">Discover & Sell</span>
                <span className="block bg-yellow-400 text-black px-2 mt-2 rounded-md inline-block">Digital Products</span>
              </h1>
              <p className="text-xl text-white mb-8">
                Join creators selling digital products, downloads, and subscriptions to buyers around the world.
              </p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <button
                  onClick={() => navigate("/explore")}
                  className="bg-black text-white font-bold py-3 px-6 rounded-lg hover:bg-gray-900 transition-all"
                >
                  Explore Products
                </button>
                <button
                  onClick={() => navigate("/selling")}
                  className="bg-white text-black font-bold py-3 px-6 rounded-lg hover:bg-gray-100 transition-all"
                >
                  Start Selling
                </button>
              </div>
            </div>
          </div>
          {/* Right content - geometric design */}
          <div className="w-full md:w-1/2 flex justify-center">
            <div className="grid grid-cols-2 gap-4 max-w-md">
              {/* Product preview cards with geometric shapes */}
              <div className="bg-cyan-400 h-40 rounded-xl flex items-center justify-center transform rotate-3 shadow-lg border-4 border-white">
                <span className="font-bold text-xl text-black">Digital Art</span>
              </div>
              <div className="bg-yellow-300 h-32 rounded-xl flex items-center justify-center transform -rotate-6 shadow-lg border-4 border-white">
                <span className="font-bold text-xl text-black">E-books</span>
              </div>
              <div className="bg-green-400 h-36 rounded-xl flex items-center justify-center transform -rotate-3 shadow-lg border-4 border-white">
                <span className="font-bold text-xl text-black">Templates</span>
              </div>
              <div className="bg-purple-400 h-44 rounded-xl flex items-center justify-center transform rotate-6 shadow-lg border-4 border-white">
                <span className="font-bold text-xl text-black">Software</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
