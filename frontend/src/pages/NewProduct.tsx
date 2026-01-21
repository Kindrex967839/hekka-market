import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser, useAuth } from "@clerk/clerk-react";
import { Nav } from "../components/Nav";
import { Footer } from "../components/Footer";
import { ProductForm } from "../components/ProductForm";
import { createProduct, uploadProductImage } from "../utils/supabaseUtils";
import { supabase, getSupabaseTokenStatus } from "../utils/supabaseClient";
import { ArrowLeft, Sparkles } from "lucide-react";

export default function NewProduct() {
    const navigate = useNavigate();
    const { user, isLoaded, isSignedIn } = useUser();
    const { getToken } = useAuth();
    const [isLoading, setIsLoading] = useState(false);

    // Diagnostic State
    const [diagStatus, setDiagStatus] = useState<{
        clerkId: string;
        supabaseSession: boolean;
        profileFound: boolean | null;
        tokenSubject: string | null;
        jwtAud: string | null;
        jwtRole: string | null;
        error: string | null;
        checksComplete: boolean;
    }>({
        clerkId: '',
        supabaseSession: false,
        profileFound: null,
        tokenSubject: null,
        jwtAud: null,
        jwtRole: null,
        error: null,
        checksComplete: false
    });

    const runDiagnostics = async () => {
        if (!user) return;

        try {
            // 1. Check Token Status
            const { hasToken } = getSupabaseTokenStatus();

            let aud = null;
            let role = null;
            let sub = null;

            // Try to get more info from Clerk if possible
            try {
                const { getSupabaseToken, decodeJWT } = await import("../utils/clerkSupabaseIntegration");
                // We don't want to trigger a refresh here, just check if we can get a token
                // But for diagnostics, maybe we should just rely on what's in the client
                // Actually, let's just use the current token if it exists
                const { tokenPreview } = getSupabaseTokenStatus();
                // We can't easily get the full token here without calling getToken again
                // So let's just call getToken once to see what it looks like
                const token = await getToken({ template: 'supabase' });
                if (token) {
                    const claims = decodeJWT(token);
                    aud = claims?.aud;
                    role = claims?.role;
                    sub = claims?.sub;
                }
            } catch (e) { }

            // 2. Check Profile (direct DB query via our injected token)
            let profileExists = false;
            if (hasToken) {
                const { data } = await supabase.from('profiles').select('id').eq('id', user.id).single();
                profileExists = !!data;
            }

            setDiagStatus({
                clerkId: user.id,
                supabaseSession: hasToken,
                profileFound: profileExists,
                tokenSubject: sub || null,
                jwtAud: aud,
                jwtRole: role,
                error: null,
                checksComplete: true
            });
        } catch (e: any) {
            setDiagStatus(prev => ({ ...prev, error: e.message, checksComplete: true }));
        }
    };

    useEffect(() => {
        if (isLoaded && !isSignedIn) {
            navigate("/sign-in");
            return;
        }

        if (isLoaded && user) {
            runDiagnostics();
        }
    }, [isLoaded, isSignedIn, navigate, user]);

    const handleManualConnect = async () => {
        if (!user) return;
        setIsLoading(true);
        try {
            const { getSupabaseToken } = await import("../utils/clerkSupabaseIntegration");
            const result = await getSupabaseToken(getToken);

            if (result && !result.errorMessage) {
                alert("Supabase session established!");
                setDiagStatus(prev => ({ ...prev, error: null }));
            } else {
                const msg = result?.errorMessage || "Unknown Error";
                alert("Connection Failed: " + msg);
                setDiagStatus(prev => ({ ...prev, error: msg }));
            }
            await runDiagnostics();
        } catch (e: any) {
            alert("Connection error: " + e.message);
            setDiagStatus(prev => ({ ...prev, error: e.message }));
        } finally {
            setIsLoading(false);
        }
    };

    const handleFixProfile = async () => {
        if (!user) return;
        setIsLoading(true);
        try {
            alert("Attempting to sync profile...");
            // Force sync
            await import("../utils/userService").then(m => m.syncUserProfile(user));
            window.location.reload();
        } catch (e: any) {
            alert("Sync failed: " + e.message);
        } finally {
            setIsLoading(false);
        }
    };
    const handleSubmit = async (data: any, imageFiles: File[]) => {
        if (!user) {
            alert("You must be logged in to create a product.");
            return;
        }

        // DIAGNOSTIC: Check Supabase Session
        const { data: { session } } = await supabase.auth.getSession();
        console.log("Supabase Session Diagnostic:", {
            hasSession: !!session,
            userSubject: session?.user?.id,
            jwtClaimsPresent: !!session?.access_token,
            clerkUserId: user.id,
            match: session?.user?.id === user.id ? "YES" : "NO"
        });

        if (!session) {
            console.error("DIAGNOSTIC ERROR: No Supabase session found! RLS will block the insert.");
        }

        setIsLoading(true);
        try {
            // 1. Create the product with Clerk user ID
            const { data: productData, error: productError } = await createProduct(data, user.id);
            if (productError) throw productError;

            if (!productData || productData.length === 0) {
                throw new Error("Product was created but no data was returned from the database.");
            }

            const productId = productData[0].id;

            // 2. Upload images if any
            if (imageFiles.length > 0) {
                // For now, we'll upload images sequentially, but in a real app 
                // we might want Promise.all or a more robust retry system
                for (let i = 0; i < imageFiles.length; i++) {
                    await uploadProductImage({
                        productId,
                        file: imageFiles[i],
                        displayOrder: i
                    });
                }
            }

            // 3. Redirect back to dashboard
            navigate("/selling");
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
                    <div className="bg-slate-900 text-white p-4 rounded-xl mb-6 font-mono text-sm border-2 border-[#ff3b9a]/30 shadow-2xl">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-[#ff3b9a] font-black flex items-center gap-2 tracking-tighter italic">
                                <Sparkles size={16} /> HEKKA AUTH MONITOR 2.0
                            </h3>
                            <button
                                type="button"
                                onClick={handleManualConnect}
                                className="text-[10px] bg-[#ff3b9a] px-2 py-1 rounded font-bold hover:bg-white hover:text-[#ff3b9a] transition-all"
                            >
                                FORCE RE-CONNECT
                            </button>
                        </div>

                        <div className="space-y-2 border-l-2 border-[#ff3b9a]/20 pl-4">
                            <div className="flex justify-between">
                                <span className="text-gray-400">CLERK ID:</span>
                                <span className="text-blue-300 truncate max-w-[200px]">{diagStatus.clerkId || '...'}</span>
                            </div>

                            <div className="flex justify-between">
                                <span className="text-gray-400">SUPA SESSION:</span>
                                <span className={diagStatus.supabaseSession ? "text-green-400 font-bold" : "text-red-500 font-bold"}>
                                    {diagStatus.supabaseSession ? "CONNECTED ✅" : "NOT CONNECTED ❌"}
                                </span>
                            </div>

                            <div className="flex justify-between">
                                <span className="text-gray-400">ID MATCH (JWT):</span>
                                <span className={diagStatus.tokenSubject === diagStatus.clerkId ? "text-green-400" : "text-red-500"}>
                                    {diagStatus.tokenSubject ? (diagStatus.tokenSubject === diagStatus.clerkId ? "MATCH ✅" : "MISMATCH ⚠️") : "N/A"}
                                </span>
                            </div>

                            <div className="flex justify-between text-[10px] opacity-70">
                                <span className="text-gray-500">JWT AUD:</span>
                                <span className={diagStatus.jwtAud === 'authenticated' ? "text-blue-300" : "text-yellow-500"}>
                                    {diagStatus.jwtAud || 'none'}
                                </span>
                            </div>

                            <div className="flex justify-between text-[10px] opacity-70">
                                <span className="text-gray-500">JWT ROLE:</span>
                                <span className={diagStatus.jwtRole === 'authenticated' ? "text-blue-300" : "text-yellow-500"}>
                                    {diagStatus.jwtRole || 'none'}
                                </span>
                            </div>

                            <div className="flex justify-between">
                                <span className="text-gray-400">PROFILE IN DB:</span>
                                <span className={diagStatus.profileFound ? "text-green-400" : "text-red-500"}>
                                    {diagStatus.profileFound ? "FOUND ✅" : "MISSING ❌"}
                                </span>
                            </div>

                            {diagStatus.error && (
                                <div className="mt-2 text-red-400 text-[10px] bg-red-950/50 p-2 rounded">
                                    ERROR: {diagStatus.error}
                                </div>
                            )}
                        </div>

                        {!diagStatus.profileFound && diagStatus.checksComplete && diagStatus.supabaseSession && (
                            <div className="mt-4 p-3 bg-[#ff3b9a]/10 border border-[#ff3b9a]/30 rounded-lg text-center">
                                <p className="mb-3 text-[#ff3b9a] text-xs font-bold uppercase tracking-widest">Initialization Required</p>
                                <button
                                    type="button"
                                    onClick={handleFixProfile}
                                    className="w-full py-2 bg-[#ff3b9a] hover:bg-white hover:text-[#ff3b9a] rounded-lg text-white font-black text-xs uppercase transition-all shadow-lg"
                                >
                                    Sync Identity to Database
                                </button>
                            </div>
                        )}

                        {!diagStatus.supabaseSession && diagStatus.checksComplete && (
                            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-center">
                                <p className="mb-1 text-red-500 text-[10px] font-bold">SUPABASE SESSION FAILED</p>
                                <p className="text-gray-400 text-[9px] mb-3">Ensure Clerk 'supabase' JWT template is properly configured.</p>
                            </div>
                        )}
                    </div>
                    <ProductForm onSubmit={handleSubmit} isLoading={isLoading} />
                </div>
            </div>

            <Footer />
        </div>
    );
}
