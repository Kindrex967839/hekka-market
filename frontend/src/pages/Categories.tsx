import React from "react";
import { useNavigate } from "react-router-dom";
import { Nav } from "../components/Nav";
import { Footer } from "../components/Footer";

export default function Categories() {
    const navigate = useNavigate();

    const categories = [
        { title: "Digital Art", count: 152, color: "bg-purple-500", icon: "🎨", description: "Illustrations, paintings, and 3D assets." },
        { title: "Templates", count: 89, color: "bg-blue-500", icon: "📋", description: "Design systems, website templates, and kits." },
        { title: "E-books", count: 124, color: "bg-green-500", icon: "📚", description: "Business guides, fiction, and educational books." },
        { title: "Music", count: 67, color: "bg-yellow-500", icon: "🎵", description: "Sample packs, loops, and full tracks." },
        { title: "Software", count: 43, color: "bg-red-500", icon: "💻", description: "Plugins, scripts, and standalone applications." },
        { title: "Courses", count: 76, color: "bg-indigo-500", icon: "🎓", description: "Video masterclasses and interactive workshops." },
        { title: "Photography", count: 92, color: "bg-pink-500", icon: "📷", description: "Stock photos, presets, and textures." },
        { title: "Graphics", count: 115, color: "bg-indigo-400", icon: "✨", description: "Icons, fonts, and vector elements." }
    ];

    const handleCategoryClick = (title: string) => {
        navigate(`/explore`);
    };

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Nav />

            {/* Refined Gradient Hero (Consistent with Homepage & Explore) */}
            <div className="bg-gradient-to-r from-purple-600 via-[#ff3b9a] to-yellow-500 py-16 text-white relative overflow-hidden">
                {/* Abstract geometric shapes in background */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-yellow-400 opacity-20 rounded-lg rotate-45 -ml-10 -mb-10 blur-2xl"></div>

                <div className="container mx-auto px-4 text-center relative z-10">
                    <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-4">
                        Product <span className="bg-white text-black px-3 py-1 rounded-lg inline-block transform -rotate-2">Categories</span>
                    </h1>
                    <p className="text-xl max-w-2xl mx-auto opacity-90 font-medium">
                        Discover specialized collections curated just for your creative needs.
                    </p>
                </div>
            </div>

            {/* Categories Grid with Geometric Accents */}
            <div className="flex-grow py-16 relative">
                {/* Geometric Background Elements (Consistent with FeaturedProducts) */}
                <div className="absolute top-20 left-10 w-32 h-32 bg-yellow-400 rounded-full opacity-10 blur-2xl"></div>
                <div className="absolute bottom-40 right-10 w-48 h-48 bg-purple-500 rounded-lg rotate-12 opacity-10 blur-2xl"></div>

                <div className="container mx-auto px-4">
                    {/* Section Heading Pattern */}
                    <div className="flex flex-col items-center mb-16 relative">
                        <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 w-20 h-20 bg-yellow-400 rounded-full opacity-50 z-0"></div>
                        <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 rotate-45 w-16 h-16 bg-purple-500 rounded-lg opacity-30 z-0"></div>

                        <h2 className="text-4xl font-extrabold text-center relative z-10 text-gray-900">
                            Browse Collections
                        </h2>
                        <div className="h-1.5 w-24 bg-[#ff3b9a] rounded-full mt-6 relative z-10"></div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
                        {categories.map((cat) => (
                            <div
                                key={cat.title}
                                onClick={() => handleCategoryClick(cat.title)}
                                className="group relative bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer transform hover:-translate-y-2 hover:scale-[1.02]"
                            >
                                {/* Visual Header with geometric overlay (Matched to ProductCard height h-48) */}
                                <div className={`${cat.color} h-48 flex items-center justify-center relative overflow-hidden border-b border-gray-100`}>
                                    <div className="absolute inset-0 opacity-20 transform scale-150 group-hover:rotate-12 transition-transform duration-700">
                                        <div className="grid grid-cols-4 gap-2">
                                            {[...Array(16)].map((_, i) => (
                                                <div key={i} className="w-10 h-10 bg-white rounded-lg"></div>
                                            ))}
                                        </div>
                                    </div>
                                    <span className="text-6xl z-10 filter drop-shadow-xl group-hover:scale-110 transition-transform duration-500 ease-out">
                                        {cat.icon}
                                    </span>

                                    {/* Item count badge (Consistent with Explore badges) */}
                                    <div className="absolute top-3 right-3">
                                        <span className="bg-black bg-opacity-70 text-white text-[10px] font-bold px-2 py-0.5 rounded-full border border-white border-opacity-30">
                                            {cat.count} Items
                                        </span>
                                    </div>
                                </div>

                                {/* Content (Matched to ProductCard padding p-4) */}
                                <div className="p-4">
                                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-[#ff3b9a] transition-colors mb-1 tracking-tight truncate">
                                        {cat.title}
                                    </h3>
                                    <p className="text-gray-600 text-sm line-clamp-2">
                                        {cat.description}
                                    </p>

                                    {/* Action Link (Refined to match View button style) */}
                                    <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-[#ff3b9a] font-bold text-sm">
                                        <span>Browse Collection</span>
                                        <div className="bg-purple-600 group-hover:bg-[#ff3b9a] text-white p-1 rounded-md transition-colors">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* CTA Section (Reusing App.tsx pattern for flow consistency) */}
            <div className="py-16 bg-white border-t border-gray-100">
                <div className="container mx-auto px-4 text-center">
                    <div className="inline-block bg-yellow-400 text-black px-4 py-1 rounded-md text-sm font-black uppercase tracking-widest mb-4">Join The Market</div>
                    <h2 className="text-4xl font-extrabold text-gray-900 mb-6">Don't see your niche?</h2>
                    <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">We're constantly expanding. Start your own store and define a new category today.</p>
                    <button className="bg-[#ff3b9a] text-white font-bold py-4 px-10 rounded-xl hover:bg-opacity-90 transition-all shadow-lg hover:shadow-[#ff3b9a]/20">
                        Become a Seller
                    </button>
                </div>
            </div>

            <Footer />
        </div>
    );
}
