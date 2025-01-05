import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';
import { toast } from 'sonner';

const ImageUploader = () => {
  const [preview, setPreview] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      toast.success('Image uploaded successfully!');
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
    <div className="w-full max-w-2xl mx-auto p-4">
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
              onClick={(e) => e.stopPropagation()}
            >
              Select Image
            </Button>
          </div>
          <p className="text-xs text-gray-500">
            Supports: JPG, PNG, GIF, WEBP
          </p>
        </div>
      </div>

      {preview && (
        <div className="mt-8 rounded-lg overflow-hidden">
          <img
            src={preview}
            alt="Preview"
            className="w-full h-auto object-cover rounded-lg"
          />
        </div>
      )}
    </div>
  );
};

export default ImageUploader;