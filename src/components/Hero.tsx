import React from 'react';
import { Button } from "@/components/ui/button";

const Hero = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/5">
      <div className="container px-4 py-32 animate-fade-up">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Welcome to Your Next Project
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Build something amazing with modern tools and beautiful design
          </p>
          <div className="flex gap-4 justify-center">
            <Button className="bg-primary hover:bg-primary/90 text-white px-8 py-6">
              Get Started
            </Button>
            <Button variant="outline" className="px-8 py-6">
              Learn More
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;