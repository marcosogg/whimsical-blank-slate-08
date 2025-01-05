import { useQuery } from "@tanstack/react-query";
import WordCard from "@/components/shared/WordCard";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { ArrowUpDown } from "lucide-react";

const MyDictionary = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [sortAscending, setSortAscending] = useState(true);

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

    const filteredAndSortedWords = words
        ?.filter(word => 
            word.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
            word.definition.toLowerCase().includes(searchTerm.toLowerCase())
        )
        ?.sort((a, b) => {
            if (sortAscending) {
                return a.word.localeCompare(b.word);
            }
            return b.word.localeCompare(a.word);
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

                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <Input
                        type="text"
                        placeholder="Search words or definitions..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="flex-1"
                    />
                    <Button
                        variant="outline"
                        onClick={() => setSortAscending(!sortAscending)}
                        className="flex items-center gap-2"
                    >
                        Sort {sortAscending ? "Z-A" : "A-Z"}
                        <ArrowUpDown className="h-4 w-4" />
                    </Button>
                </div>

                {filteredAndSortedWords && filteredAndSortedWords.length === 0 ? (
                    <div className="text-center text-gray-600">
                        {searchTerm ? (
                            <p>No words found matching your search.</p>
                        ) : (
                            <p>Your dictionary is empty. Upload some images to start learning new words!</p>
                        )}
                    </div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2">
                        {filteredAndSortedWords?.map((word) => (
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