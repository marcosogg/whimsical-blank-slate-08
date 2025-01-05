import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Volume2, ThumbsUp, ThumbsDown } from 'lucide-react';
import { toast } from 'sonner';

interface AnalysisResult {
    word: string;
    definition: string;
    sampleSentence: string;
}

interface AnalysisCardProps {
    result: AnalysisResult;
    onPlayAudio: (word: string) => Promise<void>;
    isGeneratingAudio: boolean;
    audioUrl: string | null;
}

export const AnalysisCard: React.FC<AnalysisCardProps> = ({
    result,
    onPlayAudio,
    isGeneratingAudio,
    audioUrl
}) => {
    const handleFeedback = (type: 'like' | 'dislike') => {
        toast(
            type === 'like' ? 'Thank you for your feedback!' : 'We appreciate your feedback and will use it to improve our service.',
            {
                action: {
                    label: type === 'like' ? 'Undo' : 'Dismiss',
                    onClick: () => console.log(type === 'like' ? 'Undo like' : 'Dismiss dislike'),
                },
            }
        );
    };

    return (
        <Card className="overflow-hidden">
            <CardHeader className="flex justify-between items-center">
                <h3 className="text-xl font-bold p-6">{result.word}</h3>
                <Button
                    onClick={() => onPlayAudio(result.word)}
                    variant="ghost"
                    size="icon"
                    disabled={isGeneratingAudio}
                >
                    {isGeneratingAudio ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-primary mx-auto" />
                    ) : (
                        <Volume2 className="h-4 w-4" />
                    )}
                </Button>
            </CardHeader>
            <CardContent className="p-6 relative">
                <p className="text-gray-600 mb-4">{result.definition}</p>
                <p className="text-sm text-gray-500 italic">"{result.sampleSentence}"</p>
                {audioUrl && <audio src={audioUrl} controls />}
                <div className="absolute right-4 bottom-4 flex gap-2">
                    <Button onClick={() => handleFeedback('like')} variant="ghost" size="icon">
                        <ThumbsUp className="h-4 w-4" />
                    </Button>
                    <Button onClick={() => handleFeedback('dislike')} variant="ghost" size="icon">
                        <ThumbsDown className="h-4 w-4" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};