import React from 'react';
import { Button } from "@/components/ui/button";

const CallToAction = () => {
  return (
    <section className="py-20 bg-gradient-to-r from-primary to-secondary text-white">
      <div className="container px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Ready to Get Started?
        </h2>
        <p className="text-lg mb-8 opacity-90">
          Join us today and start building something amazing
        </p>
        <Button className="bg-white text-primary hover:bg-white/90 px-8 py-6">
          Get Started Now
        </Button>
      </div>
    </section>
  );
};

export default CallToAction;