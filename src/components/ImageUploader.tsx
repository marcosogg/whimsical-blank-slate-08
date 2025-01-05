import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card, CardContent, CardHeader } from './ui/card';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface AnalysisResult {
    word: string;
    definition: string;
    sample_sentence: string;
}

export const ImageUploader = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [analysisResults, setAnalysisResults] = useState<AnalysisResult[]>([]);

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        if (acceptedFiles.length === 0) return;

        const file = acceptedFiles[0];
        setIsLoading(true);

        try {
            const timestamp = Date.now();
            const fileExt = file.name.split('.').pop();
            const filePath = `${timestamp}.${fileExt}`;

            const { error: uploadError, data: uploadData } = await supabase.storage
                .from('analyzed_images')
                .upload(filePath, file);

            if (uploadError) {
                throw new Error('Error uploading image');
            }

            const { data: { publicUrl } } = supabase.storage
                .from('analyzed_images')
                .getPublicUrl(filePath);

            const { data: analysisData, error: analysisError } = await supabase.functions
                .invoke('analyze-image', {
                    body: { image_url: publicUrl },
                });

            if (analysisError) {
                throw new Error('Error analyzing image');
            }

            const results = analysisData.map((item: any) => ({
                word: item.word,
                definition: item.definition,
                sample_sentence: item.sample_sentence,
            }));

            setAnalysisResults(results);

            const { error: dbError } = await supabase
                .from('word_analyses')
                .insert(results);

            if (dbError) {
                console.error('Error saving to database:', dbError);
                toast.error('Error saving analysis results');
            }

        } catch (error) {
            console.error('Error:', error);
            toast.error('Error processing image');
        } finally {
            setIsLoading(false);
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/*': ['.jpeg', '.jpg', '.png', '.gif']
        },
        maxFiles: 1
    });

    return (
        <div className="container mx-auto p-4 max-w-4xl">
            <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
                    ${isDragActive ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-primary'}`}
            >
                <input {...getInputProps()} />
                {isLoading ? (
                    <div className="flex flex-col items-center space-y-4">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div>
                        <p>Analyzing image...</p>
                    </div>
                ) : (
                    <div>
                        <p className="text-lg mb-2">
                            {isDragActive ? "Drop the image here" : "Drag & drop an image here, or click to select"}
                        </p>
                        <p className="text-sm text-gray-500">Supported formats: JPEG, PNG, GIF</p>
                    </div>
                )}
            </div>

            {analysisResults.length > 0 && (
                <div className="mt-8 space-y-6">
                    <h2 className="text-2xl font-bold text-center mb-6">Analysis Results</h2>
                    <div className="grid gap-6 md:grid-cols-2">
                        {analysisResults.map((result, index) => (
                            <Card 
                                key={index} 
                                className="overflow-hidden transition-shadow duration-300 hover:shadow-lg bg-white"
                            >
                                <CardHeader className="border-b border-gray-100">
                                    <h3 className="text-2xl font-bold text-gray-800">
                                        {result.word}
                                    </h3>
                                </CardHeader>
                                <CardContent className="p-6 space-y-4">
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-600 mb-2">Definition</h4>
                                        <p className="text-gray-700">{result.definition}</p>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-600 mb-2">Example</h4>
                                        <p className="text-gray-700 italic">"{result.sample_sentence}"</p>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ImageUploader;