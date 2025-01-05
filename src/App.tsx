import { Toaster as Sonner } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { useEffect, useState } from "react"
import { supabase } from "@/integrations/supabase/client"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/AppSidebar"
import Index from "./pages/Index"
import AuthPage from "./pages/Auth"
import SavedAnalyses from "./pages/SavedAnalyses"

const queryClient = new QueryClient()

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)

    useEffect(() => {
        supabase.auth.onAuthStateChange((event, session) => {
            setIsAuthenticated(!!session)
        })
    }, [])

    if (isAuthenticated === null) {
        return <div>Loading...</div>
    }

    return isAuthenticated ? <>{children}</> : <Navigate to="/auth" />
}

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
                                <SidebarProvider>
                                    <div className="min-h-screen flex w-full">
                                        <AppSidebar />
                                        <main className="flex-1">
                                            <SidebarTrigger className="m-4" />
                                            <Index />
                                        </main>
                                    </div>
                                </SidebarProvider>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/saved-analyses"
                        element={
                            <ProtectedRoute>
                                <SidebarProvider>
                                    <div className="min-h-screen flex w-full">
                                        <AppSidebar />
                                        <main className="flex-1">
                                            <SidebarTrigger className="m-4" />
                                            <SavedAnalyses />
                                        </main>
                                    </div>
                                </SidebarProvider>
                            </ProtectedRoute>
                        }
                    />
                </Routes>
            </BrowserRouter>
        </TooltipProvider>
    </QueryClientProvider>
)

export default App