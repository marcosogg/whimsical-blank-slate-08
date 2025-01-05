import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Volume2 } from "lucide-react";
import React, {useState} from "react";
import { toast } from 'sonner';

const SavedAnalyses = () => {
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);

    const generateAudio = async (text: string) => {
        try {
            setIsGeneratingAudio(true);
              const response = await supabase.functions.invoke('generate-audio', {
                 body: { text },
             });

             if (response.error) {
                 console.error("Error generating audio:", response.error);
                toast.error("Failed to generate audio for the word");
                return;
            }

              const blob = new Blob([response.data], { type: "audio/mpeg" });
              const url = URL.createObjectURL(blob);
               setAudioUrl(url);
        } catch (error) {
            console.error("Error generating audio:", error);
            toast.error("Failed to generate audio for the word");
        } finally {
             setIsGeneratingAudio(false);
        }
    };

    const handlePlayAudio = async (word: string) => {
        await generateAudio(word)
    };

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
                <p>Loading saved analyses...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
            <div className="max-w-4xl mx-auto space-y-6">
                <h1 className="text-3xl font-bold text-center bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
                    Saved Word Analyses
                </h1>

                <div className="grid gap-6 md:grid-cols-2">
                    {analyses?.map((analysis) => (
                        <Card key={analysis.id} className="overflow-hidden transition-all duration-200 hover:shadow-lg">
                             <CardHeader className="flex justify-between items-center">
                                <h3 className="text-xl font-bold p-6">{analysis.word}</h3>
                                <Button
                                    onClick={() => handlePlayAudio(analysis.word)}
                                    variant='ghost'
                                    size='icon'
                                    disabled={isGeneratingAudio}
                                >
                                {isGeneratingAudio ?
                                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-primary mx-auto"></div>
                                  :   <Volume2 className="h-4 w-4"/>
                                }
                                </Button>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <h4 className="text-sm font-medium text-muted-foreground mb-2">Definition</h4>
                                    <p className="text-sm">{analysis.definition}</p>
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-muted-foreground mb-2">Example</h4>
                                    <p className="text-sm italic">{analysis.sample_sentence}</p>
                                </div>
                                 {audioUrl && <audio src={audioUrl} controls />}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default SavedAnalyses;
