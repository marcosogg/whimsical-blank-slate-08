import React from 'react';
import ImageUploader from '@/components/ImageUploader';

const Index = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 flex flex-col">
            <div className="flex items-center justify-center flex-col pt-24 px-4">
                <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent text-center">
                    Visual Dictionary
                </h1>
                <p className="text-lg text-gray-600 text-center mb-8">
                    Upload an image and get detailed word definitions and examples
                </p>
                <ImageUploader />
            </div>
        </div>
    );
};

export default Index;