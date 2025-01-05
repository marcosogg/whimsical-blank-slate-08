import React from 'react';
import { Sparkles, Zap, Shield } from 'lucide-react';

const FeatureCard = ({ icon: Icon, title, description }: { icon: any, title: string, description: string }) => (
  <div className="p-6 rounded-lg border bg-white shadow-sm hover:shadow-md transition-all duration-300 animate-fade-up">
    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
      <Icon className="h-6 w-6 text-primary" />
    </div>
    <h3 className="text-xl font-semibold mb-2">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </div>
);

const Features = () => {
  const features = [
    {
      icon: Sparkles,
      title: "Modern Design",
      description: "Beautiful, responsive layouts that look great on any device"
    },
    {
      icon: Zap,
      title: "Fast Performance",
      description: "Optimized for speed and efficiency right out of the box"
    },
    {
      icon: Shield,
      title: "Secure & Reliable",
      description: "Built with security best practices and reliable technologies"
    }
  ];

  return (
    <section id="features" className="py-20 bg-gray-50">
      <div className="container px-4">
        <h2 className="text-3xl font-bold text-center mb-12">Amazing Features</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <FeatureCard key={index} {...feature} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;