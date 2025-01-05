import { useQuery } from "@tanstack/react-query";
import WordCard from "@/components/shared/WordCard";
import { supabase } from "@/integrations/supabase/client";

const MyDictionary = () => {
    const { data: words, isLoading } = useQuery({
        queryKey: ['dictionary-words'],
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
                    My Dictionary
                </h1>

                {words && words.length === 0 ? (
                    <div className="text-center text-gray-600">
                        <p>Your dictionary is empty. Upload some images to start learning new words!</p>
                    </div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2">
                        {words?.map((word) => (
                            <WordCard
                                key={word.id}
                                word={word.word}
                                definition={word.definition}
                                sampleSentence={word.sample_sentence}
                                showAudio={true}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyDictionary;