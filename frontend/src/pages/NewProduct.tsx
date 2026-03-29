import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser, useAuth } from "@clerk/clerk-react";
import { Nav } from "../components/Nav";
import { Footer } from "../components/Footer";
import { ProductForm } from "../components/ProductForm";
import { createProduct, uploadProductImage, updateProduct } from "../utils/supabaseUtils";
import { ArrowLeft, Sparkles } from "lucide-react";

export default function NewProduct() {
    const navigate = useNavigate();
    const { user, isLoaded, isSignedIn } = useUser();
    const { getToken } = useAuth();
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isLoaded && !isSignedIn) {
            navigate("/sign-in");
            return;
        }
    }, [isLoaded, isSignedIn, navigate]);

    const handleSubmit = async (data: any, imageFiles: File[]) => {
        if (!user) {
            alert("You must be logged in to create a product.");
            return;
        }

        setIsLoading(true);
        try {
            // 1. Create the product with Clerk user ID
            const { data: productData, error: productError } = await createProduct(data, user.id);
            if (productError) {
                console.error("DATABASE ERROR creating product:", productError);
                throw productError;
            }

            if (!productData || productData.length === 0) {
                throw new Error("Product was created but no data was returned from the database.");
            }

            const productId = productData[0].id;
            console.log("✅ Product created successfully with ID:", productId);

            // 2. Upload images if any
            if (imageFiles.length > 0) {
                let firstImageUrl = "";
                for (let i = 0; i < imageFiles.length; i++) {
                    const uploadResult = await uploadProductImage({
                        productId,
                        file: imageFiles[i],
                        displayOrder: i
                    });

                    if (i === 0 && uploadResult.publicUrl) {
                        firstImageUrl = uploadResult.publicUrl;
                        console.log("📸 Primary image URL generated:", firstImageUrl);
                    } else if (uploadResult.error) {
                        console.error(`❌ Failed to upload image ${i}:`, uploadResult.error);
                    }
                }

                // 3. Update product with the first image URL if available
                if (firstImageUrl) {
                    console.log("🔄 Updating product with final image URL...");
                    const { error: updateError } = await updateProduct(productId, { image_url: firstImageUrl, is_published: true }, user.id);
                    if (updateError) {
                        console.error("❌ Failed to update product with image_url:", updateError);
                    } else {
                        console.log("✅ Product image_url updated successfully!");
                    }
                }
            }

            // 3. Redirect back to dashboard with a slight delay to allow for indexing
            console.log("⏳ Waiting for database to index...");
            setTimeout(() => {
                navigate("/selling");
            }, 1000);
        } catch (error: any) {
            console.error("DETAILED ERROR creating product:", {
                message: error.message,
                details: error.details,
                hint: error.hint,
                code: error.code,
                fullError: error
            });
            alert(`Failed to create product: ${error.message || "Unknown error"}. Please try again.`);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isLoaded || !isSignedIn) {
        return null;
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
                                <span className="p-2 bg-yellow-400 rounded-lg">
                                    <Sparkles size={16} className="text-black" />
                                </span>
                                <span className="text-xs font-black uppercase tracking-widest text-gray-400">Creation Mode</span>
                            </div>
                            <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
                                Launch something <span className="text-[#ff3b9a]">incredible.</span>
                            </h1>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex-grow container mx-auto px-4 py-12">
                <div className="max-w-5xl mx-auto">
                    <ProductForm onSubmit={handleSubmit} isLoading={isLoading} />
                </div>
            </div>

            <Footer />
        </div>
    );
}
