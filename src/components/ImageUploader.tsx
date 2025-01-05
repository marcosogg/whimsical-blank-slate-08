// Inside ImageUploader.tsx
import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Image as ImageIcon, Volume2 } from 'lucide-react'; //Added Volume2 icon
import { cn } from '@/lib/utils';
import { Button } from './ui/button';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';

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


    const generateAudio = async (text: string) => {
        try {
            const response = await fetch("https://api.openai.com/v1/audio/speech", {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    model: "tts-1",
                    input: text,
                    voice: "alloy",
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(`Failed to generate audio: ${error.message}`);
              }

            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            setAudioUrl(url);
        } catch (error) {
            console.error("Error generating audio:", error);
            toast.error("Failed to generate audio for the word");
        }
    };


    const handlePlayAudio = async (word: string) => {
        await generateAudio(word)
    };


    const uploadAndAnalyzeImage = async (file: File) => {
        try {
            setIsAnalyzing(true);
    
            // Upload to Supabase Storage
            const fileName = `${crypto.randomUUID()}.${file.name.split('.').pop()}`;
            const { data: uploadData, error: uploadError } = await supabase.storage
              .from('analyzed_images')
              .upload(fileName, file);
    
            if (uploadError) {
                console.error('Upload error:', uploadError);
                throw new Error('Failed to upload image');
            }
    
            // Get public URL
            const { data: { publicUrl } } = supabase.storage
              .from('analyzed_images')
              .getPublicUrl(fileName);
    
            console.log('Image uploaded, public URL:', publicUrl);
    
            // Call analysis function with corrected body
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                {analysisResults.map((result, index) => (
                    <Card key={index} className="overflow-hidden">
                        <CardContent className="p-6">
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="text-xl font-bold">{result.word}</h3>
                                <Button
                                    onClick={() => handlePlayAudio(result.word)}
                                    variant='ghost'
                                    size='icon'>
                                    <Volume2 className="h-4 w-4"/>
                                </Button>
                            </div>
                            <p className="text-gray-600 mb-4">
                                {result.definition}
                            </p>
                            <p className="text-sm text-gray-500 italic">
                                "{result.sampleSentence}"
                            </p>
                           {audioUrl && <audio src={audioUrl} controls />}
                        </CardContent>
                    </Card>
                ))}
            </div>
        )}
        </div>
    );
};

export default ImageUploader;
