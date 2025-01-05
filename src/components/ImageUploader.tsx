import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from './ui/card';

interface AnalysisResult {
  word: string;
  definition: string;
  sampleSentence: string;
}

const ImageUploader = () => {
  const [preview, setPreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<AnalysisResult[]>([]);

  const uploadAndAnalyzeImage = async (file: File) => {
    try {
      setIsAnalyzing(true);
      
      // Upload to Supabase Storage
      const fileName = `${crypto.randomUUID()}.${file.name.split('.').pop()}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('analyzed_images')
        .upload(fileName, file);

      if (uploadError) {
        throw new Error('Failed to upload image');
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('analyzed_images')
        .getPublicUrl(fileName);

      // Call analysis function
      const response = await supabase.functions.invoke('analyze-image', {
        body: { imageUrl: publicUrl },
      });

      if (response.error) {
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
          <div className="space-y-2">
            <p className="text-base font-medium text-gray-700">
              {isDragActive ? "Drop the image here" : "Drag & drop an image here"}
            </p>
            <p className="text-sm text-gray-500">or</p>
            <Button
              type="button"
              variant="outline"
              className="mx-auto"
              disabled={isAnalyzing}
            >
              Select Image
            </Button>
          </div>
          <p className="text-xs text-gray-500">
            Supports: JPG, PNG, GIF, WEBP
          </p>
        </div>
      </div>

      {isAnalyzing && (
        <div className="text-center">
          <p className="text-gray-600">Analyzing image...</p>
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
                <h3 className="text-xl font-bold mb-2">{result.word}</h3>
                <p className="text-gray-600 mb-4">{result.definition}</p>
                <p className="text-sm text-gray-500 italic">
                  "{result.sampleSentence}"
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageUploader;