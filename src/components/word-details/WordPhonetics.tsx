import React from 'react';
import AudioPlayer from '@/components/AudioPlayer';

interface WordPhoneticsProps {
  word: string;
  phonetics: Array<{
    text?: string;
    audio?: string;
  }>;
}

const WordPhonetics = ({ word, phonetics }: WordPhoneticsProps) => {
  return (
    <div className="flex items-center justify-between">
      <h1 className="text-4xl font-bold">{word}</h1>
      <AudioPlayer word={word} />
      <div>
        {phonetics.map((phonetic, index) => (
          phonetic.text && (
            <span key={index} className="text-gray-600">
              {phonetic.text}
            </span>
          )
        ))}
      </div>
    </div>
  );
};

export default WordPhonetics;