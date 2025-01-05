import React from 'react';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';

interface WordRelatedProps {
  synonyms: string[];
  antonyms: string[];
}

const WordRelated = ({ synonyms, antonyms }: WordRelatedProps) => {
  const navigate = useNavigate();

  if (synonyms.length === 0 && antonyms.length === 0) return null;

  return (
    <div className="space-y-4">
      {synonyms.length > 0 && (
        <div>
          <h3 className="font-semibold mb-2">Synonyms</h3>
          <div className="flex flex-wrap gap-2">
            {synonyms.map((synonym, index) => (
              <Badge
                key={index}
                variant="outline"
                className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                onClick={() => navigate(`/word/${synonym}`)}
              >
                {synonym}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {antonyms.length > 0 && (
        <div>
          <h3 className="font-semibold mb-2">Antonyms</h3>
          <div className="flex flex-wrap gap-2">
            {antonyms.map((antonym, index) => (
              <Badge
                key={index}
                variant="outline"
                className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                onClick={() => navigate(`/word/${antonym}`)}
              >
                {antonym}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default WordRelated;