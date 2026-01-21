import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Nav } from "../components/Nav";
import { Footer } from "../components/Footer";
import { ProductCard, Product } from "../components/ProductCard";
import { getProduct, getSimilarProducts } from "../utils/supabaseUtils";
import { Loader2, ArrowLeft, ShoppingCart, ShieldCheck, Download, Zap } from "lucide-react";

export default function ProductDetails() {
    const { productId } = useParams<{ productId: string }>();
    const navigate = useNavigate();
    const [product, setProduct] = useState<any>(null);
    const [similarProducts, setSimilarProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSimilarLoading, setIsSimilarLoading] = useState(true);

    useEffect(() => {
        if (productId) {
            fetchProductData();
        }
    }, [productId]);

    const fetchProductData = async () => {
        setIsLoading(true);
        try {
            const { data, error } = await getProduct(productId!);
            if (error) throw error;
            setProduct(data);

            // Fetch similar products
            if (data?.category_id) {
                fetchSimilar(data.id, data.category_id);
            }
        } catch (error) {
            console.error("Error fetching product:", error);
            // navigate("/explore");
        } finally {
            setIsLoading(false);
        }
    };

    const fetchSimilar = async (id: string, catId: string) => {
        setIsSimilarLoading(true);
        try {
            const { data, error } = await getSimilarProducts(id, catId);
            if (error) throw error;

            const mapped: Product[] = (data || []).map(p => ({
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
            setSimilarProducts(mapped);
        } catch (error) {
            console.error("Error fetching similar products:", error);
        } finally {
            setIsSimilarLoading(false);
        }
    };

    const handleBuyNow = () => {
        // Direct Lemon Squeezy Overlay Integration
        if (product?.lemon_squeezy_url) {
            window.location.href = product.lemon_squeezy_url;
        } else {
            alert("Checkout is coming soon for this product!");
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex flex-col bg-gray-50">
                <Nav />
                <div className="flex-grow flex items-center justify-center">
                    <Loader2 className="animate-spin text-[#ff3b9a]" size={64} />
                </div>
                <Footer />
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen flex flex-col bg-gray-50">
                <Nav />
                <div className="flex-grow flex flex-col items-center justify-center p-4">
                    <h2 className="text-3xl font-black text-gray-900 mb-4">Product Not Found</h2>
                    <button onClick={() => navigate("/explore")} className="text-[#ff3b9a] font-bold flex items-center gap-2 hover:underline">
                        <ArrowLeft size={20} /> Back to Explore
                    </button>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Nav />

            {/* Product Header / Hero */}
            <div className="bg-white border-b border-gray-100">
                <div className="container mx-auto px-4 py-8">
                    <button
                        onClick={() => navigate("/explore")}
                        className="flex items-center gap-2 text-gray-400 hover:text-[#ff3b9a] font-bold transition-colors mb-8 group"
                    >
                        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                        Back to Marketplace
                    </button>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        {/* Image Section */}
                        <div className="relative">
                            <div className="aspect-square rounded-3xl overflow-hidden bg-gray-100 border-4 border-white shadow-2xl relative z-10">
                                <img
                                    src={product.image_url || `https://source.unsplash.com/800x800/?digital,${product.categories?.name}`}
                                    alt={product.title}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            {/* Geometric Accents */}
                            <div className="absolute -top-6 -left-6 w-32 h-32 bg-yellow-400 rounded-full opacity-50 z-0 blur-xl"></div>
                            <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-purple-500 rounded-lg rotate-12 opacity-30 z-0 blur-2xl"></div>
                        </div>

                        {/* Info Section */}
                        <div className="flex flex-col justify-center">
                            <div className="mb-4">
                                <span className="bg-black text-white px-3 py-1 rounded-md text-xs font-black uppercase tracking-widest inline-block">
                                    {product.categories?.name}
                                </span>
                            </div>
                            <h1 className="text-4xl md:text-5xl font-black text-gray-900 leading-tight mb-4 tracking-tighter">
                                {product.title}
                            </h1>
                            <div className="flex items-center gap-4 mb-8">
                                <div className="text-3xl font-black text-[#ff3b9a]">
                                    ${parseFloat(product.price).toFixed(2)}
                                </div>
                                <div className="h-8 w-px bg-gray-200"></div>
                                <div className="text-gray-500 font-bold">
                                    by <span className="text-gray-900">{(product.profiles as any)?.full_name || (product.profiles as any)?.username || "Unknown Seller"}</span>
                                </div>
                            </div>

                            <p className="text-lg text-gray-600 mb-10 leading-relaxed font-medium">
                                {product.description}
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4">
                                <button
                                    onClick={handleBuyNow}
                                    className="flex-grow bg-[#ff3b9a] text-white py-5 rounded-2xl font-black text-2xl shadow-xl hover:shadow-[#ff3b9a]/20 transition-all transform hover:-translate-y-1 active:translate-y-0 flex items-center justify-center gap-3"
                                >
                                    <Zap size={24} fill="currentColor" />
                                    Buy Now
                                </button>
                                <button className="px-8 py-5 rounded-2xl bg-white border-2 border-gray-100 text-gray-900 font-black hover:bg-gray-50 transition-all">
                                    <ShoppingCart size={24} />
                                </button>
                            </div>

                            {/* Trust Badges */}
                            <div className="mt-12 grid grid-cols-3 gap-4">
                                <div className="flex flex-col items-center text-center gap-2">
                                    <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center text-green-500">
                                        <ShieldCheck size={20} />
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Secure Payment</span>
                                </div>
                                <div className="flex flex-col items-center text-center gap-2">
                                    <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-500">
                                        <Download size={20} />
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Instant Access</span>
                                </div>
                                <div className="flex flex-col items-center text-center gap-2">
                                    <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center text-purple-500">
                                        <Sparkles size={20} />
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Lifetime Updates</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Detailed Content Section (Geometric/Modular) */}
            <div className="py-20 bg-gray-50 relative overflow-hidden">
                {/* Geometric Background Element */}
                <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-white to-transparent"></div>

                <div className="container mx-auto px-4 relative z-10">
                    <div className="max-w-4xl mx-auto space-y-12">
                        {/* Features Block */}
                        <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-gray-100 relative overflow-hidden group">
                            <div className="absolute -top-12 -right-12 w-48 h-48 bg-yellow-400 opacity-5 rounded-full transition-all group-hover:scale-110"></div>
                            <h3 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-3">
                                <span className="w-2 h-8 bg-yellow-400 rounded-full"></span>
                                Product Features
                            </h3>
                            <div className="prose prose-lg max-w-none text-gray-600 font-medium whitespace-pre-line">
                                {product.description}
                                {/* In a real app, this would be a separate 'features' or 'content' field */}
                            </div>
                        </div>

                        {/* Similar Products */}
                        <div className="pt-20">
                            <div className="flex items-center justify-between mb-12">
                                <h2 className="text-3xl font-black text-gray-900 flex items-center gap-3">
                                    <span className="w-2 h-10 bg-[#ff3b9a] rounded-full"></span>
                                    Similar Masterpieces
                                </h2>
                                <button onClick={() => navigate("/explore")} className="text-[#ff3b9a] font-bold hover:underline underline-offset-4">
                                    View All
                                </button>
                            </div>

                            {isSimilarLoading ? (
                                <div className="flex justify-center py-12">
                                    <Loader2 className="animate-spin text-[#ff3b9a]" />
                                </div>
                            ) : similarProducts.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                                    {similarProducts.map(p => (
                                        <ProductCard key={p.id} product={p} />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 bg-white rounded-3xl border-2 border-dashed border-gray-200">
                                    <p className="text-gray-400 font-bold">No similar products found in this category.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
}

function Sparkles({ size, className }: { size: number, className?: string }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
            <path d="M5 3v4" />
            <path d="M19 17v4" />
            <path d="M3 5h4" />
            <path d="M17 19h4" />
        </svg>
    )
}
