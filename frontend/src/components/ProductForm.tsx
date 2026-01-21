import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { getCategories, uploadProductImage } from "../utils/supabaseUtils";
import { Category } from "../utils/supabaseTypes";
import { Upload, X, Loader2, Sparkles, Image as ImageIcon } from "lucide-react";

const productSchema = z.object({
    title: z.string().min(5, "Title must be at least 5 characters").max(100),
    description: z.string().min(20, "Description must be at least 20 characters").max(2000),
    price: z.coerce.number().min(0, "Price must be positive"),
    category_id: z.string().uuid("Please select a category"),
    product_type: z.enum(["digital_download", "subscription", "service"]),
    is_published: z.boolean().default(false),
});

type ProductFormData = z.infer<typeof productSchema>;

interface Props {
    initialData?: any;
    onSubmit: (data: ProductFormData, imageFiles: File[]) => Promise<void>;
    isLoading?: boolean;
}

export function ProductForm({ initialData, onSubmit, isLoading = false }: Props) {
    const [categories, setCategories] = useState<Category[]>([]);
    const [imageFiles, setImageFiles] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [isCategoriesLoading, setIsCategoriesLoading] = useState(true);

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset
    } = useForm<ProductFormData>({
        resolver: zodResolver(productSchema),
        defaultValues: initialData || {
            title: "",
            description: "",
            price: 0,
            product_type: "digital_download",
            is_published: false
        }
    });

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        setIsCategoriesLoading(true);
        try {
            const { data, error } = await getCategories();
            if (error) throw error;
            setCategories(data || []);
        } catch (error) {
            console.error("Error fetching categories:", error);
        } finally {
            setIsCategoriesLoading(false);
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const filesArray = Array.from(e.target.files);
            setImageFiles(prev => [...prev, ...filesArray]);

            const newPreviews = filesArray.map(file => URL.createObjectURL(file));
            setImagePreviews(prev => [...prev, ...newPreviews]);
        }
    };

    const removeImage = (index: number) => {
        setImageFiles(prev => prev.filter((_, i) => i !== index));
        setImagePreviews(prev => prev.filter((_, i) => i !== index));
    };

    const onFormSubmit = (data: ProductFormData) => {
        onSubmit(data, imageFiles);
    };

    return (
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Info */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Title */}
                    <div className="space-y-2">
                        <label className="text-sm font-black uppercase tracking-widest text-gray-500">Product Title</label>
                        <input
                            {...register("title")}
                            className={`w-full px-6 py-4 rounded-2xl bg-white border-2 transition-all outline-none text-lg font-bold ${errors.title ? 'border-red-500 focus:ring-red-500' : 'border-gray-100 focus:border-[#ff3b9a] focus:ring-4 focus:ring-[#ff3b9a]/10'
                                }`}
                            placeholder="Epic Digital Asset Pack..."
                        />
                        {errors.title && <p className="text-red-500 text-sm font-bold">{errors.title.message}</p>}
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <label className="text-sm font-black uppercase tracking-widest text-gray-500">Description</label>
                        <textarea
                            {...register("description")}
                            rows={8}
                            className={`w-full px-6 py-4 rounded-2xl bg-white border-2 transition-all outline-none text-base font-medium ${errors.description ? 'border-red-500 focus:ring-red-500' : 'border-gray-100 focus:border-[#ff3b9a] focus:ring-4 focus:ring-[#ff3b9a]/10'
                                }`}
                            placeholder="Tell the world about your masterpiece..."
                        />
                        {errors.description && <p className="text-red-500 text-sm font-bold">{errors.description.message}</p>}
                    </div>

                    {/* Product Settings Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Price */}
                        <div className="space-y-2">
                            <label className="text-sm font-black uppercase tracking-widest text-gray-500">Price ($)</label>
                            <input
                                type="number"
                                step="0.01"
                                {...register("price")}
                                className={`w-full px-6 py-4 rounded-2xl bg-white border-2 transition-all outline-none text-lg font-bold ${errors.price ? 'border-red-500 focus:ring-red-500' : 'border-gray-100 focus:border-[#ff3b9a] focus:ring-4 focus:ring-[#ff3b9a]/10'
                                    }`}
                                placeholder="0.00"
                            />
                            {errors.price && <p className="text-red-500 text-sm font-bold">{errors.price.message}</p>}
                        </div>

                        {/* Category */}
                        <div className="space-y-2">
                            <label className="text-sm font-black uppercase tracking-widest text-gray-500">Category</label>
                            <select
                                {...register("category_id")}
                                className={`w-full px-6 py-4 rounded-2xl bg-white border-2 transition-all outline-none text-lg font-bold appearance-none ${errors.category_id ? 'border-red-500 focus:ring-red-500' : 'border-gray-100 focus:border-[#ff3b9a] focus:ring-4 focus:ring-[#ff3b9a]/10'
                                    }`}
                                disabled={isCategoriesLoading}
                            >
                                <option value="">Select a category</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                            {errors.category_id && <p className="text-red-500 text-sm font-bold">{errors.category_id.message}</p>}
                        </div>

                        {/* Product Type */}
                        <div className="space-y-2">
                            <label className="text-sm font-black uppercase tracking-widest text-gray-500">Product Type</label>
                            <select
                                {...register("product_type")}
                                className="w-full px-6 py-4 rounded-2xl bg-white border-2 border-gray-100 focus:border-[#ff3b9a] focus:ring-4 focus:ring-[#ff3b9a]/10 transition-all outline-none text-lg font-bold appearance-none"
                            >
                                <option value="digital_download">Digital Download</option>
                                <option value="subscription">Subscription</option>
                                <option value="service" disabled>Service (Coming Soon)</option>
                            </select>
                        </div>

                        {/* Status */}
                        <div className="flex items-center space-x-4 h-full pt-8">
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    {...register("is_published")}
                                    className="sr-only peer"
                                />
                                <div className="w-14 h-8 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-[#ff3b9a]"></div>
                                <span className="ml-3 text-sm font-black uppercase tracking-widest text-gray-500">Published</span>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Media & Sidebar */}
                <div className="space-y-6">
                    {/* Image Upload Area */}
                    <div className="space-y-4">
                        <label className="text-sm font-black uppercase tracking-widest text-gray-500 flex items-center gap-2">
                            <ImageIcon size={16} /> Product Images
                        </label>

                        <div className="bg-white p-6 rounded-3xl border-2 border-dashed border-gray-200 hover:border-[#ff3b9a] transition-all group relative">
                            <input
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={handleImageChange}
                                className="absolute inset-0 opacity-0 cursor-pointer z-10"
                            />
                            <div className="text-center space-y-2">
                                <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto group-hover:bg-[#ff3b9a]/10 transition-colors">
                                    <Upload className="text-gray-400 group-hover:text-[#ff3b9a] transition-colors" />
                                </div>
                                <div className="font-bold text-gray-900">Drop images here</div>
                                <div className="text-xs text-gray-500 font-bold uppercase tracking-widest">or click to browse</div>
                            </div>
                        </div>

                        {/* Image Previews */}
                        {imagePreviews.length > 0 && (
                            <div className="grid grid-cols-2 gap-4 mt-4">
                                {imagePreviews.map((preview, index) => (
                                    <div key={index} className="relative group rounded-xl overflow-hidden aspect-square border-2 border-gray-100">
                                        <img src={preview} alt="preview" className="w-full h-full object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => removeImage(index)}
                                            className="absolute top-1 right-1 p-1 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Tips Sidebar */}
                    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-3xl border border-indigo-100">
                        <h4 className="font-black text-indigo-900 uppercase text-xs tracking-widest mb-4 flex items-center gap-2">
                            <Sparkles size={14} /> Pro Tips
                        </h4>
                        <ul className="space-y-4 text-sm font-bold text-indigo-700">
                            <li className="flex gap-2">
                                <span className="text-indigo-400">01</span>
                                Use high-resolution images to increase conversions.
                            </li>
                            <li className="flex gap-2">
                                <span className="text-indigo-400">02</span>
                                Detailed descriptions help buyers understand the value.
                            </li>
                            <li className="flex gap-2">
                                <span className="text-indigo-400">03</span>
                                Competitive pricing is key for new products.
                            </li>
                        </ul>
                    </div>

                    {/* Action Button */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-[#ff3b9a] text-white py-5 rounded-2xl font-black text-xl shadow-xl hover:shadow-[#ff3b9a]/20 transition-all transform hover:-translate-y-1 active:translate-y-0 disabled:opacity-50 disabled:transform-none flex items-center justify-center gap-2"
                    >
                        {isLoading ? (
                            <Loader2 className="animate-spin" size={24} />
                        ) : (
                            initialData ? "Save Changes" : "Launch Product"
                        )}
                    </button>
                </div>
            </div>
        </form>
    );
}
