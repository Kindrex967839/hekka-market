import React from "react";
import { Product, ProductCard } from "components/ProductCard";

interface Props {
  products: Product[];
  title?: string;
  subtitle?: string;
}

export function FeaturedProducts({ products, title = "Featured Products", subtitle = "Discover our top digital products" }: Props) {
  return (
    <div className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Section header with geometric accent */}
        <div className="flex flex-col items-center mb-12 relative">
          <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 w-20 h-20 bg-yellow-400 rounded-full opacity-50 z-0"></div>
          <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 rotate-45 w-16 h-16 bg-purple-500 rounded-lg opacity-30 z-0"></div>
          
          <h2 className="text-4xl font-extrabold text-center relative z-10">
            {title}
          </h2>
          <p className="text-xl text-gray-600 mt-2 max-w-2xl text-center">
            {subtitle}
          </p>
          <div className="h-1 w-24 bg-[#ff3b9a] rounded-full mt-6"></div>
        </div>

        {/* Products grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* View all button with geometric accent */}
        <div className="flex justify-center mt-12">
          <div className="relative">
            <div className="absolute -top-6 -right-6 w-12 h-12 bg-yellow-400 rounded-full opacity-50 z-0"></div>
            <button className="relative z-10 bg-[#ff3b9a] text-white font-bold py-3 px-8 rounded-lg hover:bg-opacity-90 transition-all">
              View All Products
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
