import React from "react";

export function Search() {
  return (
    <div className="bg-white py-8 shadow-md relative z-10">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search digital products..."
                  className="w-full px-6 py-4 rounded-lg text-lg border-2 border-gray-200 focus:border-purple-500 focus:outline-none"
                />
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
              </div>
            </div>
            <div>
              <button className="w-full md:w-auto px-6 py-4 bg-[#ff3b9a] text-white font-bold rounded-lg hover:bg-opacity-90 transition-all">
                Search
              </button>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mt-4">
            <CategoryPill category="Templates" />
            <CategoryPill category="E-books" />
            <CategoryPill category="Digital Art" />
            <CategoryPill category="Software" />
            <CategoryPill category="Music" />
            <CategoryPill category="Courses" />
          </div>
        </div>
      </div>
    </div>
  );
}

interface CategoryPillProps {
  category: string;
}

function CategoryPill({ category }: CategoryPillProps) {
  return (
    <span className="inline-block px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-full text-sm font-medium cursor-pointer transition-all">
      {category}
    </span>
  );
}
