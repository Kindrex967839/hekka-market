import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Nav } from "../components/Nav";
import { Footer } from "../components/Footer";
import { getMyProducts, deleteProduct } from "../utils/supabaseUtils";
import { useUser, useAuth } from "@clerk/clerk-react";
import { Product } from "../components/ProductCard";
import { Plus, Edit3, Trash2, Package, DollarSign, Users, ExternalLink, RefreshCw } from "lucide-react";
import { getProductImageUrl } from "../utils/imageUtils";

export default function Selling() {
    const navigate = useNavigate();
    const { user, isLoaded, isSignedIn } = useUser();
    const { getToken } = useAuth();
    const [products, setProducts] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Derive stats from products list
    const stats = useMemo(() => {
        const active = products.filter(p => p.is_published).length || 0;
        return {
            totalSales: products.reduce((acc, p) => acc + (p.sales_count || 0), 0),
            activeListings: active,
            totalRevenue: products.reduce((acc, p) => acc + ((p.sales_count || 0) * (parseFloat(p.price) || 0)), 0)
        };
    }, [products]);

    useEffect(() => {
        if (isLoaded && !isSignedIn) {
            navigate("/sign-in");
        }
        if (isLoaded && isSignedIn) {
            // Add a slight delay to handle eventual consistency if we just redirected
            const timer = setTimeout(() => {
                fetchSellerData();
            }, 500);
            return () => clearTimeout(timer);
        }

        // AUTO-REFRESH: Re-fetch when window gains focus (e.g. user returns to tab)
        const handleFocus = () => {
            console.log("Selling: Window focused, refreshing data...");
            fetchSellerData();
        };

        window.addEventListener('focus', handleFocus);
        return () => window.removeEventListener('focus', handleFocus);
    }, [isLoaded, isSignedIn, navigate]);

    const fetchSellerData = async () => {
        if (!user) return;

        setIsLoading(true);
        try {
            // Success! The dynamic token fetcher handles authentication automatically.
            const { data, error } = await getMyProducts(user.id);
            if (error) throw error;

            const productsWithImages = data ? [...data] : [];

            // Try to resolve missing images
            for (let product of productsWithImages) {
                if (!product.image_url) {
                    const resolvedUrl = await getProductImageUrl(product.id);
                    if (resolvedUrl) {
                        product.image_url = resolvedUrl;
                    }
                }
            }

            setProducts(productsWithImages);
        } catch (error) {
            console.error("Error fetching seller data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (productId: string) => {
        if (window.confirm("Are you sure you want to delete this product? This action cannot be undone.")) {
            try {
                const { error } = await deleteProduct(productId);
                if (error) throw error;
                setProducts(products.filter(p => p.id !== productId));
            } catch (error) {
                console.error("Error deleting product:", error);
                alert("Failed to delete product. Please try again.");
            }
        }
    };

    if (!isLoaded || !isSignedIn) {
        return (
            <div className="min-h-screen flex flex-col bg-gray-50">
                <Nav />
                <div className="flex-grow flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#ff3b9a] mx-auto mb-4"></div>
                        <p className="text-gray-600 font-bold">Checking authentication...</p>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Nav />

            {/* Seller Header */}
            <div className="bg-gradient-to-r from-purple-600 via-[#ff3b9a] to-yellow-500 py-12 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
                <div className="container mx-auto px-4 relative z-10">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-2">
                                Seller <span className="bg-white text-black px-2 py-1 rounded-lg inline-block transform -rotate-1">Dashboard</span>
                            </h1>
                            <p className="text-xl opacity-90 font-medium">
                                Manage your products, track sales, and grow your digital empire.
                            </p>
                        </div>
                        <button
                            onClick={() => navigate("/selling/new")}
                            className="bg-black text-white px-6 py-4 rounded-xl font-black text-lg flex items-center justify-center gap-2 hover:bg-gray-900 transition-all transform hover:scale-105 active:scale-95 shadow-2xl"
                        >
                            <Plus size={24} strokeWidth={3} />
                            List New Product
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex-grow container mx-auto px-4 py-12">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                    <StatCard
                        title="Total Sales"
                        value={stats.totalSales.toString()}
                        icon={<Package className="text-blue-500" />}
                        color="border-blue-500"
                    />
                    <StatCard
                        title="Active Listings"
                        value={stats.activeListings.toString()}
                        icon={<Users className="text-purple-500" />}
                        color="border-purple-500"
                    />
                    <StatCard
                        title="Total Revenue"
                        value={`$${stats.totalRevenue.toFixed(2)}`}
                        icon={<DollarSign className="text-green-500" />}
                        color="border-green-500"
                    />
                </div>

                {/* Products Table Area */}
                <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
                    <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                        <div className="flex items-center gap-4">
                            <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
                                <span className="w-2 h-8 bg-[#ff3b9a] rounded-full"></span>
                                Your Products
                            </h2>
                            <button
                                onClick={fetchSellerData}
                                disabled={isLoading}
                                className="p-2 text-gray-400 hover:text-[#ff3b9a] transition-all rounded-full hover:bg-gray-100"
                                title="Refresh Data"
                            >
                                <RefreshCw size={20} className={isLoading ? "animate-spin" : ""} />
                            </button>
                        </div>
                        <span className="text-sm font-bold text-gray-500 bg-gray-200 px-3 py-1 rounded-full">
                            {products.length} Items Total
                        </span>
                    </div>

                    {isLoading ? (
                        <div className="py-20 text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#ff3b9a] mx-auto"></div>
                        </div>
                    ) : products.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-gray-50 text-gray-400 text-xs font-black uppercase tracking-widest border-b border-gray-100">
                                        <th className="px-8 py-4">Product</th>
                                        <th className="px-8 py-4">Price</th>
                                        <th className="px-8 py-4">Status</th>
                                        <th className="px-8 py-4">Sales</th>
                                        <th className="px-8 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {products.map((product) => (
                                        <tr key={product.id} className="hover:bg-gray-50/50 transition-colors group">
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-16 h-16 rounded-xl bg-gray-100 flex-shrink-0 overflow-hidden border-2 border-transparent group-hover:border-[#ff3b9a] transition-all">
                                                        {product.image_url ? (
                                                            <img src={product.image_url} alt={product.title} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-gray-400 font-bold text-xs uppercase">
                                                                IMG
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="font-black text-gray-900 text-lg">{product.title}</div>
                                                        <div className="text-sm text-gray-500 font-bold">{product.categories?.name || 'Uncategorized'}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 font-bold text-gray-900">${parseFloat(product.price).toFixed(2)}</td>
                                            <td className="px-8 py-6">
                                                <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-tighter ${product.is_published
                                                    ? 'bg-green-100 text-green-600'
                                                    : 'bg-yellow-100 text-yellow-600'
                                                    }`}>
                                                    {product.is_published ? 'Published' : 'Draft'}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6 font-bold text-gray-600">{product.sales_count || 0}</td>
                                            <td className="px-8 py-6 text-right">
                                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => navigate(`/product/${product.id}`)}
                                                        className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all"
                                                        title="View Live"
                                                    >
                                                        <ExternalLink size={20} />
                                                    </button>
                                                    <button
                                                        onClick={() => navigate(`/selling/edit/${product.id}`)}
                                                        className="p-2 text-gray-400 hover:text-purple-500 hover:bg-purple-50 rounded-lg transition-all"
                                                        title="Edit"
                                                    >
                                                        <Edit3 size={20} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(product.id)}
                                                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                                        title="Delete"
                                                    >
                                                        <Trash2 size={20} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="py-20 text-center">
                            <div className="w-20 h-20 bg-gray-100 rounded-3xl flex items-center justify-center mx-auto mb-6 text-gray-300">
                                <Package size={40} />
                            </div>
                            <h3 className="text-xl font-black text-gray-900 mb-2">No products yet</h3>
                            <p className="text-gray-500 max-w-sm mx-auto mb-8">
                                Start your digital journey by listing your first product for the world to see!
                            </p>
                            <button
                                onClick={() => navigate("/selling/new")}
                                className="bg-[#ff3b9a] text-white px-8 py-3 rounded-xl font-black shadow-lg hover:shadow-[#ff3b9a]/20 transition-all"
                            >
                                List Your First Product
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <Footer />
        </div>
    );
}

function StatCard({ title, value, icon, color }: { title: string, value: string, icon: React.ReactNode, color: string }) {
    return (
        <div className={`bg-white p-8 rounded-3xl shadow-lg border-b-8 ${color} transform transition-all hover:-translate-y-1`}>
            <div className="flex items-center justify-between mb-4">
                <span className="text-gray-400 font-black uppercase text-xs tracking-widest">{title}</span>
                <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center">
                    {icon}
                </div>
            </div>
            <div className="text-4xl font-black text-gray-900 tracking-tighter">{value}</div>
        </div>
    );
}
