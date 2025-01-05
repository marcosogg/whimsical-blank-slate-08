import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Image as ImageIcon, Book, Play, Star, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

interface Definition {
    definition: string;
    example?: string;
}

interface Meaning {
    partOfSpeech: string;
    definitions: Definition[];
}

interface DictionaryResponse {
    word: string;
    meanings: Meaning[];
}

interface AnalysisResult {
    word: string;
    definition: string;
    sampleSentence: string;
}

const getPartOfSpeechIcon = (partOfSpeech: string) => {
    switch (partOfSpeech.toLowerCase()) {
        case 'noun':
            return <Book className="h-4 w-4" />;
        case 'verb':
            return <Play className="h-4 w-4" />;
        case 'adjective':
            return <Star className="h-4 w-4" />;
        case 'adverb':
            return <ArrowRight className="h-4 w-4" />;
        default:
            return <Book className="h-4 w-4" />;
    }
};

const getPartOfSpeechColor = (partOfSpeech: string) => {
    switch (partOfSpeech.toLowerCase()) {
        case 'noun':
            return 'bg-blue-100 text-blue-800';
        case 'verb':
            return 'bg-green-100 text-green-800';
        case 'adjective':
            return 'bg-purple-100 text-purple-800';
        case 'adverb':
            return 'bg-orange-100 text-orange-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
};

const ImageUploader = () => {
    const [preview, setPreview] = useState<string | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisResults, setAnalysisResults] = useState<AnalysisResult[]>([]);
    const [wordDetails, setWordDetails] = useState<Record<string, DictionaryResponse>>({});

    const fetchWordDetails = async (word: string) => {
        try {
            const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
            if (!response.ok) {
                console.warn(`No definitions found for word: ${word}`);
                return null;
            }
            const data = await response.json();
            return data[0] as DictionaryResponse;
        } catch (error) {
            console.error('Error fetching word details:', error);
            return null;
        }
    };

    const uploadAndAnalyzeImage = async (file: File) => {
        try {
            setIsAnalyzing(true);

            const fileName = `${crypto.randomUUID()}.${file.name.split('.').pop()}`;
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('analyzed_images')
                .upload(fileName, file);

            if (uploadError) {
                console.error('Upload error:', uploadError);
                throw new Error('Failed to upload image');
            }

            const { data: { publicUrl } } = supabase.storage
                .from('analyzed_images')
                .getPublicUrl(fileName);

            console.log('Image uploaded, public URL:', publicUrl);

            const response = await supabase.functions.invoke('analyze-image', {
                body: { image: publicUrl },
            });

            console.log('Analysis response:', response);

            if (response.error) {
                console.error('Analysis error:', response.error);
                throw new Error('Failed to analyze image');
            }

            setAnalysisResults(response.data.analysis);

            // Fetch dictionary details for each word
            const details: Record<string, DictionaryResponse> = {};
            for (const result of response.data.analysis) {
                const wordDetail = await fetchWordDetails(result.word);
                if (wordDetail) {
                    details[result.word] = wordDetail;
                }
            }
            setWordDetails(details);

            toast.success('Image analyzed successfully!');
        } catch (error) {
            console.error('Error:', error);
            toast.error('Failed to process image');
        } finally {
            setIsAnalyzing(false);
        }
    };

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
            await uploadAndAnalyzeImage(file);
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
        },
        maxFiles: 1,
        multiple: false,
    });

    return (
        <div className="w-full max-w-4xl mx-auto p-4 space-y-8">
            <div
                {...getRootProps()}
                className={cn(
                    "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
                    isDragActive ? "border-primary bg-primary/5" : "border-gray-300 hover:border-primary",
                    "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                )}
            >
                <input {...getInputProps()} />
                <div className="space-y-4">
                    <div className="flex justify-center">
                        {preview ? (
                            <ImageIcon className="h-12 w-12 text-gray-400" />
                        ) : (
                            <Upload className="h-12 w-12 text-gray-400" />
                        )}
                    </div>
                    <p className="text-base font-medium text-gray-700">
                        Click here or drag an image of an object you want to learn about
                    </p>
                    <p className="text-xs text-gray-500">
                        Supports: JPG, PNG, GIF, WEBP
                    </p>
                </div>
            </div>
            {isAnalyzing && (
                <div className="text-center">
                    <p className="text-gray-600">Analyzing image...</p>
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary mx-auto"></div>
                </div>
            )}
            {preview && (
                <div className="mt-8 rounded-lg overflow-hidden">
                    <img
                        src={preview}
                        alt="Preview"
                        className="w-full h-auto object-cover rounded-lg"
                    />
                </div>
            )}
            {analysisResults.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                    {analysisResults.map((result, index) => (
                        <Card 
                            key={index} 
                            className="overflow-hidden transition-shadow duration-300 hover:shadow-lg bg-white"
                        >
                            <CardHeader className="border-b border-gray-100">
                                <div className="space-y-2">
                                    <h3 className="text-2xl font-bold text-gray-800">
                                        {result.word}
                                    </h3>
                                    {wordDetails[result.word]?.meanings && (
                                        <div className="flex flex-wrap gap-2">
                                            {wordDetails[result.word].meanings.map((meaning, mIndex) => (
                                                <span
                                                    key={mIndex}
                                                    className={cn(
                                                        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                                                        getPartOfSpeechColor(meaning.partOfSpeech)
                                                    )}
                                                >
                                                    {getPartOfSpeechIcon(meaning.partOfSpeech)}
                                                    <span className="ml-1">{meaning.partOfSpeech}</span>
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent className="p-6 space-y-4">
                                {wordDetails[result.word]?.meanings ? (
                                    <div className="space-y-4">
                                        {wordDetails[result.word].meanings.map((meaning, mIndex) => (
                                            <div key={mIndex} className="space-y-2">
                                                <h4 className="font-semibold text-sm text-gray-600">
                                                    As a {meaning.partOfSpeech}:
                                                </h4>
                                                <p className="text-gray-700 leading-relaxed">
                                                    {meaning.definitions[0].definition}
                                                </p>
                                                {meaning.definitions[0].example && (
                                                    <blockquote className="border-l-4 border-primary/20 pl-4 italic text-sm text-gray-600">
                                                        "{meaning.definitions[0].example}"
                                                    </blockquote>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <>
                                        <p className="text-gray-700 leading-relaxed">
                                            {result.definition}
                                        </p>
                                        <blockquote className="border-l-4 border-primary/20 pl-4 italic text-sm text-gray-600">
                                            "{result.sampleSentence}"
                                        </blockquote>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ImageUploader;