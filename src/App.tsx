import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Index from "./pages/Index";
import AuthPage from "./pages/Auth";
import MyDictionary from "./pages/MyDictionary";
import WordPage from "./pages/WordPage";
import TopNav from "./components/TopNav";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

    useEffect(() => {
        supabase.auth.onAuthStateChange((event, session) => {
            setIsAuthenticated(!!session);
        });
    }, []);

    if (isAuthenticated === null) {
        return <div>Loading...</div>;
    }

    return isAuthenticated ? (
        <>
            <TopNav />
            <div className="pt-16">
                {children}
            </div>
        </>
    ) : (
        <Navigate to="/auth" />
    );
};

const App = () => (
    <QueryClientProvider client={queryClient}>
        <TooltipProvider>
            <Sonner />
            <BrowserRouter>
                <Routes>
                    <Route path="/auth" element={<AuthPage />} />
                    <Route
                        path="/"
                        element={
                            <ProtectedRoute>
                                <Index />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/my-dictionary"
                        element={
                            <ProtectedRoute>
                                <MyDictionary />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/word/:word"
                        element={
                            <ProtectedRoute>
                                <WordPage />
                            </ProtectedRoute>
                        }
                    />
                </Routes>
            </BrowserRouter>
        </TooltipProvider>
    </QueryClientProvider>
);

export default App;