import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "./ui/button";
import { Book } from "lucide-react";

const TopNav = () => {
    const handleSignOut = async () => {
        await supabase.auth.signOut();
    };

    return (
        <nav className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex justify-between h-16">
                    <div className="flex">
                        <Link to="/" className="flex items-center">
                            <span className="text-xl font-bold text-gray-800">
                                Visual Dictionary
                            </span>
                        </Link>
                    </div>
                    <div className="flex items-center space-x-4">
                        <Link to="/my-dictionary">
                            <Button variant="ghost" className="flex items-center gap-2">
                                <Book className="h-5 w-5" />
                                My Dictionary
                            </Button>
                        </Link>
                        <Button
                            variant="ghost"
                            onClick={handleSignOut}
                        >
                            Sign Out
                        </Button>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default TopNav;