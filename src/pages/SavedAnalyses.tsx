import { useQuery } from "@tanstack/react-query";
import WordCard from "@/components/shared/WordCard";
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
                        <WordCard
                            key={analysis.id}
                            word={analysis.word}
                            definition={analysis.definition}
                            sampleSentence={analysis.sample_sentence}
                            showAudio={true}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default SavedAnalyses;