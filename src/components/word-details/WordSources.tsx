import React from 'react';
import { ExternalLink } from 'lucide-react';

interface WordSourcesProps {
  sourceUrls: string[];
}

const WordSources = ({ sourceUrls }: WordSourcesProps) => {
  if (!sourceUrls?.length) return null;

  return (
    <div>
      <h3 className="font-semibold mb-2">Sources</h3>
      <div className="space-y-2">
        {sourceUrls.map((url, index) => (
          <a
            key={index}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-blue-600 hover:underline"
          >
            {url}
            <ExternalLink className="h-4 w-4" />
          </a>
        ))}
      </div>
    </div>
  );
};

export default WordSources;