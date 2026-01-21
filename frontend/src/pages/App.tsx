import React from "react";
import { useNavigate } from "react-router-dom";
import { Nav } from "components/Nav";
import { Hero } from "components/Hero";
import { Footer } from "components/Footer";
import { featuredProducts } from "utils/sampleData";
import { FeaturedProducts } from "components/FeaturedProducts";

export default function App() {
  const navigate = useNavigate();
  return (

    <div className="min-h-screen flex flex-col">
      <Nav />
      <Hero />
      <FeaturedProducts products={featuredProducts} />

      {/* Call to Action */}
      <div className="py-16 bg-gradient-to-r from-[#ff3b9a] to-purple-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-extrabold mb-4">Start Selling Your Digital Products Today</h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto">Join thousands of creators who are monetizing their digital products and reaching customers worldwide.</p>
          <button
            onClick={() => navigate("/selling")}
            className="bg-black text-white font-bold py-3 px-8 rounded-lg hover:bg-gray-900 transition-all"
          >
            Create Your Store
          </button>
        </div>
      </div>

      <Footer />
    </div>
  );
}
