import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

const SavedAnalyses = () => {
    const { data: analyses, isLoading } = useQuery({
        queryKey: ['word-analyses'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('word_analyses')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data;
        },
    });

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary mx-auto"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4">
            <div className="max-w-4xl mx-auto space-y-6">
                <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
                    Saved Word Analyses
                </h1>

                <div className="grid gap-6 md:grid-cols-2">
                    {analyses?.map((analysis) => (
                        <Card 
                            key={analysis.id} 
                            className="overflow-hidden transition-shadow duration-300 hover:shadow-lg bg-white"
                        >
                            <CardHeader className="border-b border-gray-100">
                                <h3 className="text-2xl font-bold text-gray-800">
                                    {analysis.word}
                                </h3>
                            </CardHeader>
                            <CardContent className="p-6 space-y-4">
                                <div>
                                    <h4 className="text-sm font-medium text-gray-600 mb-2">Definition</h4>
                                    <p className="text-gray-700">{analysis.definition}</p>
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-gray-600 mb-2">Example</h4>
                                    <p className="text-gray-700 italic">"{analysis.sample_sentence}"</p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default SavedAnalyses;