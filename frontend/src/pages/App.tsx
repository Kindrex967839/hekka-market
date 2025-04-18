import React from "react";
import { Nav } from "components/Nav";
import { Hero } from "components/Hero";
import { Footer } from "components/Footer";
import { featuredProducts } from "utils/sampleData";
import { FeaturedProducts } from "components/FeaturedProducts";

export default function App() {
  return (

    <div className="min-h-screen flex flex-col">
      <Nav />
      <Hero />
      <FeaturedProducts products={featuredProducts} />

      {/* Categories Section */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-extrabold">Popular Categories</h2>
            <p className="text-xl text-gray-600 mt-2">Browse our most popular product categories</p>
            <div className="h-1 w-24 bg-[#ff3b9a] rounded-full mt-6 mx-auto"></div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <CategoryCard title="Digital Art" count={152} color="bg-purple-500" />
            <CategoryCard title="Templates" count={89} color="bg-blue-500" />
            <CategoryCard title="E-books" count={124} color="bg-green-500" />
            <CategoryCard title="Music" count={67} color="bg-yellow-500" />
            <CategoryCard title="Software" count={43} color="bg-red-500" />
            <CategoryCard title="Courses" count={76} color="bg-indigo-500" />
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="py-16 bg-gradient-to-r from-[#ff3b9a] to-purple-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-extrabold mb-4">Start Selling Your Digital Products Today</h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto">Join thousands of creators who are monetizing their digital products and reaching customers worldwide.</p>
          <button className="bg-black text-white font-bold py-3 px-8 rounded-lg hover:bg-gray-900 transition-all">
            Create Your Store
          </button>
        </div>
      </div>

      <Footer />
    </div>
  );
}

interface CategoryCardProps {
  title: string;
  count: number;
  color: string;
}

function CategoryCard({ title, count, color }: CategoryCardProps) {
  return (
    <div className="rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all cursor-pointer">
      <div className={`${color} h-24 flex items-center justify-center`}>
        <span className="text-white font-bold text-xl">{title}</span>
      </div>
      <div className="bg-white p-3 text-center">
        <span className="text-sm text-gray-600">{count} products</span>
      </div>
    </div>
  );
}

// Helper function to get a color based on category name
function getCategoryColor(categoryName: string): string {
  // Map of category names to colors
  const colorMap: Record<string, string> = {
    'Digital Art': 'bg-purple-500',
    'Templates': 'bg-blue-500',
    'E-books': 'bg-green-500',
    'Music': 'bg-yellow-500',
    'Software': 'bg-red-500',
    'Courses': 'bg-indigo-500',
    'Photography': 'bg-pink-500',
    'Graphics': 'bg-indigo-400'
  };

  // Return the color for the category or a default color
  return colorMap[categoryName] || 'bg-gray-500';
}
