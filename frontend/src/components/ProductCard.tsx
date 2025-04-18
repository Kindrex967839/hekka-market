import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getFallbackImageUrl } from "utils/imageUtils";

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  image: string;
  category: string;
  seller: {
    name: string;
    id: string;
  };
}

interface Props {
  product: Product;
}

export function ProductCard({ product }: Props) {
  const navigate = useNavigate();
  const [imageError, setImageError] = useState(false);

  const handleClick = () => {
    navigate(`/product/${product.id}`);
  };

  const handleImageError = () => {
    // Only log in development environment
    if (import.meta.env.DEV) {
      console.log(`Image error for product ${product.id}:`, product.image);
    }
    setImageError(true);
  };

  // Determine the image source
  const getImageSource = () => {
    if (imageError) {
      return getFallbackImageUrl(product.id);
    }

    // If the image URL is from Supabase storage
    if (product.image && product.image.includes('supabase.co')) {
      return product.image;
    }

    // If the image URL is from an external source (like Unsplash)
    if (product.image && (product.image.startsWith('http://') || product.image.startsWith('https://'))) {
      return product.image;
    }

    // Default fallback
    return getFallbackImageUrl(product.id);
  };

  return (
    <div
      className="bg-white rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 hover:scale-[1.02] hover:shadow-xl cursor-pointer"
      onClick={handleClick}
    >
      {/* Product Image */}
      <div className="relative overflow-hidden h-48 md:h-56">
        <img
          src={getImageSource()}
          alt={product.title}
          className="w-full h-full object-cover"
          onError={handleImageError}
        />

        {/* Price Tag - distinctive ribbon shape */}
        <div className="absolute -right-2 top-4">
          <div className="bg-yellow-400 text-black font-bold px-4 py-2 rounded-l-lg shadow-md relative">
            ${product.price.toFixed(2)}
            {/* Triangle at the bottom */}
            <div className="absolute top-full right-0 w-2 h-2 bg-yellow-600"></div>
          </div>
        </div>

        {/* Category badge */}
        <div className="absolute bottom-3 left-3">
          <span className="bg-black bg-opacity-70 text-white text-xs font-bold px-2 py-1 rounded-full">
            {product.category}
          </span>
        </div>
      </div>

      {/* Product Details */}
      <div className="p-4">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-bold text-gray-900 truncate">{product.title}</h3>
        </div>
        <p className="text-gray-600 text-sm mt-1 line-clamp-2">{product.description}</p>

        {/* Seller Info */}
        <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between items-center">
          <span className="text-sm font-medium text-gray-500">By {product.seller.name}</span>
          <button className="bg-purple-600 hover:bg-purple-700 text-white text-sm font-bold py-1 px-3 rounded-lg transition-all">
            View
          </button>
        </div>
      </div>
    </div>
  );
}
