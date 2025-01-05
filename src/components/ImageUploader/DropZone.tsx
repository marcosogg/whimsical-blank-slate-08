import React from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DropZoneProps {
    onDrop: (acceptedFiles: File[]) => void;
    preview: string | null;
}

export const DropZone: React.FC<DropZoneProps> = ({ onDrop, preview }) => {
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
        },
        maxFiles: 1,
        multiple: false,
    });

    return (
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
    );
};