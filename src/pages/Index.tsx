import React from 'react';
import ImageUploader from '@/components/ImageUploader';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 pt-24">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Image to Dictionary
          </h1>
          <p className="text-lg text-gray-600">
            Upload an image and get detailed word definitions and examples
          </p>
        </div>
        <ImageUploader />
      </div>
    </div>
  );
};

export default Index;