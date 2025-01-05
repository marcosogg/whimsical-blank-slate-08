import React from 'react';
import { Badge } from '@/components/ui/badge';

interface Definition {
  definition: string;
  example?: string;
  synonyms?: string[];
  antonyms?: string[];
}

interface WordDefinitionsProps {
  meanings: Array<{
    partOfSpeech: string;
    definitions: Definition[];
  }>;
}

const WordDefinitions = ({ meanings }: WordDefinitionsProps) => {
  return (
    <div className="space-y-6">
      {meanings.map((meaning, index) => (
        <div key={index} className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Badge variant="secondary">
              {meaning.partOfSpeech}
            </Badge>
          </h2>
          
          <div className="space-y-4">
            {meaning.definitions.map((def, defIndex) => (
              <div key={defIndex} className="pl-4 border-l-2 border-gray-200">
                <p className="text-gray-900">{def.definition}</p>
                {def.example && (
                  <p className="text-gray-600 mt-2 italic">
                    "{def.example}"
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default WordDefinitions;