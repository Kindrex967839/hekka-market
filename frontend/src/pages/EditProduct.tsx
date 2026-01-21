import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { Nav } from "../components/Nav";
import { Footer } from "../components/Footer";
import { ProductForm } from "../components/ProductForm";
import { getProduct, updateProduct, uploadProductImage } from "../utils/supabaseUtils";
import { ArrowLeft, Loader2, Settings } from "lucide-react";

export default function EditProduct() {
    const { productId } = useParams<{ productId: string }>();
    const navigate = useNavigate();
    const { user, isLoaded, isSignedIn } = useUser();
    const [product, setProduct] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (isLoaded && !isSignedIn) {
            navigate("/sign-in");
        }
    }, [isLoaded, isSignedIn, navigate]);

    useEffect(() => {
        if (isLoaded && isSignedIn && productId) {
            fetchProduct();
        }
    }, [productId, isLoaded, isSignedIn]);

    const fetchProduct = async () => {
        setIsLoading(true);
        try {
            const { data, error } = await getProduct(productId!);
            if (error) throw error;
            setProduct(data);
        } catch (error) {
            console.error("Error fetching product:", error);
            alert("Failed to load product data.");
            navigate("/selling");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (data: any, imageFiles: File[]) => {
        if (!user) {
            alert("You must be logged in to update a product.");
            return;
        }

        setIsSaving(true);
        try {
            // 1. Update the product info with Clerk user ID for RLS/security check
            const { error: productError } = await updateProduct(productId!, data, user.id);
            if (productError) throw productError;

            // 2. Upload new images if any
            if (imageFiles.length > 0) {
                for (let i = 0; i < imageFiles.length; i++) {
                    await uploadProductImage({
                        productId: productId!,
                        file: imageFiles[i],
                        displayOrder: i // Note: In a real app, we'd handle ordering better
                    });
                }
            }

            // 3. Redirect back to dashboard
            navigate("/selling");
        } catch (error) {
            console.error("Error updating product:", error);
            alert("Failed to update product. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex flex-col bg-gray-50">
                <Nav />
                <div className="flex-grow flex items-center justify-center">
                    <div className="text-center">
                        <Loader2 className="animate-spin h-12 w-12 border-t-2 border-b-2 border-[#ff3b9a] mx-auto mb-4 text-[#ff3b9a]" />
                        <p className="text-gray-600 font-bold">Loading product details...</p>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Nav />

            {/* Header */}
            <div className="bg-white border-b border-gray-100 py-8">
                <div className="container mx-auto px-4">
                    <button
                        onClick={() => navigate("/selling")}
                        className="flex items-center gap-2 text-gray-400 hover:text-[#ff3b9a] font-bold transition-colors mb-6 group"
                    >
                        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                        Back to Dashboard
                    </button>

                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="p-2 bg-purple-500 rounded-lg">
                                    <Settings size={16} className="text-white" />
                                </span>
                                <span className="text-xs font-black uppercase tracking-widest text-gray-400">Editing Product</span>
                            </div>
                            <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight line-clamp-1">
                                Refine your <span className="text-[#ff3b9a]">message.</span>
                            </h1>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex-grow container mx-auto px-4 py-12">
                <div className="max-w-5xl mx-auto">
                    <ProductForm initialData={product} onSubmit={handleSubmit} isLoading={isSaving} />
                </div>
            </div>

            <Footer />
        </div>
    );
}
