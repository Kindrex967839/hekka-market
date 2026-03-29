import React, { useState, useEffect, useCallback } from "react";
import { Nav } from "../components/Nav";
import { Footer } from "../components/Footer";
import { ProductCard, Product } from "../components/ProductCard";
import { getProducts, getCategories } from "../utils/supabaseUtils";
import { Loader2, Search as SearchIcon } from "lucide-react";

export default function Explore() {
    const [selectedCategory, setSelectedCategory] = useState<string>("All");
    const [selectedCategoryId, setSelectedCategoryId] = useState<string | undefined>(undefined);
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<{ id: string, name: string }[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCategoriesLoading, setIsCategoriesLoading] = useState(true);

    // Initial category fetch
    useEffect(() => {
        const fetchCategories = async () => {
            setIsCategoriesLoading(true);
            try {
                const { data, error } = await getCategories();
                if (error) throw error;
                // Prepend "All" category
                const allCategory = { id: 'all', name: 'All' };
                setCategories([allCategory, ...(data || [])]);
            } catch (error) {
                console.error("Error fetching categories:", error);
            } finally {
                setIsCategoriesLoading(false);
            }
        };
        fetchCategories();
    }, []);

    const fetchProducts = useCallback(async () => {
        setIsLoading(true);
        try {
            const { data, error } = await getProducts({
                categoryId: selectedCategoryId === 'all' ? undefined : selectedCategoryId,
                search: searchQuery || undefined,
                limit: 20
            });
            if (error) throw error;

            // Map Supabase data to Product interface expected by ProductCard
            const mappedProducts: Product[] = (data || []).map(p => ({
                id: p.id,
                title: p.title,
                description: p.description,
                price: parseFloat(p.price),
                image: p.image_url || "",
                category: p.categories?.name || "Uncategorized",
                seller: {
                    name: (p.profiles as any)?.full_name || (p.profiles as any)?.username || "Unknown Seller",
                    id: p.seller_id
                }
            }));

            setProducts(mappedProducts);
        } catch (error) {
            console.error("Error fetching products:", error);
        } finally {
            setIsLoading(false);
        }
    }, [selectedCategoryId, searchQuery]);

    // Use a debounce for search if possible, or just trigger on dependency change
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchProducts();
        }, 300); // 300ms debounce for search

        // AUTO-REFRESH: Re-fetch when window gains focus
        const handleFocus = () => {
            console.log("Explore: Window focused, refreshing data...");
            fetchProducts();
        };

        window.addEventListener('focus', handleFocus);
        return () => {
            clearTimeout(timer);
            window.removeEventListener('focus', handleFocus);
        };
    }, [fetchProducts]);

    const handleCategorySelect = (name: string, id: string) => {
        setSelectedCategory(name);
        setSelectedCategoryId(id);
    };

    // Helper function to get a color based on category name (consistent with App.tsx)
    function getCategoryColor(categoryName: string): string {
        const colorMap: Record<string, string> = {
            'Digital Art': 'bg-purple-500',
            'Templates': 'bg-blue-500',
            'E-books': 'bg-green-500',
            'Music': 'bg-yellow-500',
            'Software': 'bg-red-500',
            'Courses': 'bg-indigo-500',
            'Photography': 'bg-pink-500',
            'Graphics': 'bg-indigo-400',
            'All': 'bg-black'
        };
        return colorMap[categoryName] || 'bg-gray-500';
    }

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Nav />

            {/* Mini Hero */}
            <div className="bg-gradient-to-r from-[#ff3b9a] to-purple-600 py-12 text-white">
                <div className="container mx-auto px-4">
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 text-center">
                        Explore the Marketplace
                    </h1>
                    <p className="text-xl text-center max-w-2xl mx-auto opacity-90">
                        Discover thousands of high-quality digital products created by experts worldwide.
                    </p>
                </div>
            </div>

            {/* Discovery Ribbon & Search */}
            <div className="bg-white border-b sticky top-[72px] z-40 shadow-sm">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        {/* Category Pills */}
                        <div className="flex overflow-x-auto pb-2 md:pb-0 gap-2 no-scrollbar">
                            {categories.map((cat) => (
                                <button
                                    key={cat.id}
                                    onClick={() => handleCategorySelect(cat.name, cat.id)}
                                    className={`whitespace-nowrap px-4 py-2 rounded-full font-bold text-sm transition-all transform hover:scale-105 ${selectedCategory === cat.name
                                        ? `${getCategoryColor(cat.name)} text-white shadow-md`
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                >
                                    {cat.name}
                                </button>
                            ))}
                        </div>

                        {/* Search Integration */}
                        <div className="w-full md:w-64 relative">
                            <input
                                type="text"
                                placeholder="Search products..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#ff3b9a] focus:border-transparent"
                            />
                            <SearchIcon className="absolute left-3 top-2.5 text-gray-400" size={18} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Results Section */}
            <div className="flex-grow py-12">
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-bold text-gray-900">
                            {selectedCategory === "All" ? "All Products" : selectedCategory}
                            <span className="ml-3 text-sm font-medium text-gray-500 bg-gray-200 px-2 py-1 rounded-md">
                                {products.length} Results
                            </span>
                        </h2>
                    </div>

                    {isLoading ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 className="animate-spin text-[#ff3b9a]" size={48} />
                        </div>
                    ) : products.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                            {products.map((product) => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20">
                            <div className="text-6xl mb-4 text-gray-300">🔍</div>
                            <h3 className="text-2xl font-bold text-gray-900">No products found</h3>
                            <p className="text-gray-600 mt-2">Try adjusting your search or category filters.</p>
                            <button
                                onClick={() => { handleCategorySelect("All", "all"); setSearchQuery(""); }}
                                className="mt-6 text-[#ff3b9a] font-bold hover:underline"
                            >
                                Clear all filters
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <Footer />
        </div>
    );
}
