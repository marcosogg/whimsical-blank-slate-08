import React, { useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { Button } from './ui/button';
import { toast } from 'sonner';

interface AudioPlayerProps {
  word: string;
}

interface DictionaryResponse {
  word: string;
  phonetics: Array<{
    text?: string;
    audio?: string;
  }>;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ word }) => {
  const [isLoading, setIsLoading] = useState(false);

  const playAudio = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`);
      
      if (!response.ok) {
        throw new Error('Word not found');
      }

      const data = await response.json() as DictionaryResponse[];
      
      // Find the first phonetic entry with a non-empty audio URL
      const audioUrl = data[0]?.phonetics.find(p => p.audio)?.audio;

      if (!audioUrl) {
        toast.error('No pronunciation available for this word');
        return;
      }

      const audio = new Audio(audioUrl);
      await audio.play();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to load pronunciation');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={playAudio}
      disabled={isLoading}
      className="h-8 w-8"
    >
      {isLoading ? (
        <div className="animate-spin h-4 w-4 border-2 border-primary rounded-full border-t-transparent" />
      ) : (
        <Volume2 className="h-4 w-4" />
      )}
    </Button>
  );
};

export default AudioPlayer;