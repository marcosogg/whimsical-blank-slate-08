import React, { useCallback, useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { DropZone } from './DropZone';
import { AnalysisCard } from './AnalysisCard';

interface AnalysisResult {
    word: string;
    definition: string;
    sampleSentence: string;
}

const ImageUploader = () => {
    const [preview, setPreview] = useState<string | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisResults, setAnalysisResults] = useState<AnalysisResult[]>([]);
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
        await generateAudio(word);
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

            console.log('Sending request with body:', { image: publicUrl });
            const response = await supabase.functions.invoke('analyze-image', {
                body: { image: publicUrl },
            });

            console.log('Analysis response:', response);

            if (response.error) {
                console.error('Analysis error:', response.error);
                throw new Error('Failed to analyze image');
            }

            setAnalysisResults(response.data.analysis);
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

    return (
        <div className="w-full max-w-4xl mx-auto p-4 space-y-8">
            <DropZone onDrop={onDrop} preview={preview} />
            
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                    {analysisResults.map((result, index) => (
                        <AnalysisCard
                            key={index}
                            result={result}
                            onPlayAudio={handlePlayAudio}
                            isGeneratingAudio={isGeneratingAudio}
                            audioUrl={audioUrl}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default ImageUploader;