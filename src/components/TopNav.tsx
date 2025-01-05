import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

const TopNav = () => {
    const navigate = useNavigate();

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/auth');
    };

    return (
        <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md z-50 border-b">
            <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                <div className="flex items-center gap-8">
                    <div className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                        ImageToDict
                    </div>
                    <div className="flex items-center gap-6">
                        <Link 
                            to="/" 
                            className="text-gray-600 hover:text-primary transition-colors"
                        >
                            Home
                        </Link>
                        <Link 
                            to="/saved-analyses" 
                            className="text-gray-600 hover:text-primary transition-colors"
                        >
                            Dictionary
                        </Link>
                    </div>
                </div>
                <Button
                    onClick={handleLogout}
                    variant="outline"
                    className="border-primary text-primary hover:bg-primary hover:text-white"
                >
                    Sign Out
                </Button>
            </div>
        </nav>
    );
};

export default TopNav;