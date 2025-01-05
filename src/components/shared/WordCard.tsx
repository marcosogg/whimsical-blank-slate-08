import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import AudioPlayer from '@/components/AudioPlayer';

interface WordCardProps {
    word: string;
    definition: string;
    sampleSentence: string;
    showAudio?: boolean;
}

const WordCard = ({ word, definition, sampleSentence, showAudio = true }: WordCardProps) => {
    return (
        <Card className="overflow-hidden transition-shadow duration-300 hover:shadow-lg bg-white">
            <CardHeader className="border-b border-gray-100">
                <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-bold text-gray-800">
                        {word}
                    </h3>
                    {showAudio && <AudioPlayer word={word} />}
                </div>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
                <div>
                    <h4 className="text-sm font-medium text-gray-600 mb-2">Definition</h4>
                    <p className="text-gray-700 leading-relaxed">
                        {definition}
                    </p>
                </div>
                <div>
                    <h4 className="text-sm font-medium text-gray-600 mb-2">Example</h4>
                    <blockquote className="border-l-4 border-primary/20 pl-4 italic text-sm text-gray-600">
                        "{sampleSentence}"
                    </blockquote>
                </div>
            </CardContent>
        </Card>
    );
};

export default WordCard;