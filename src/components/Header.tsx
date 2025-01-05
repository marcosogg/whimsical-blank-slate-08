import React from 'react';
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

const Header = () => {
    const navigate = useNavigate();

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/auth');
    };

    return (
        <header className="bg-white/80 backdrop-blur-md z-50 border-b">
            <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                <div className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    ImageToDict
                </div>
                <Button
                    onClick={handleLogout}
                    variant="outline"
                    className="border-primary text-primary hover:bg-primary hover:text-white"
                >
                    Sign Out
                </Button>
            </div>
        </header>
    );
};

export default Header;