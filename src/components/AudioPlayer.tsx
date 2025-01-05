import React, { useEffect, useRef, useState } from 'react';
import { Volume2, Pause } from 'lucide-react';
import { Button } from './ui/button';
import { toast } from 'sonner';

interface AudioPlayerProps {
  word: string;
  onGenerateAudio: (word: string) => Promise<ArrayBuffer>;
  debug?: boolean;
}

export const AudioPlayer = ({ word, onGenerateAudio, debug = false }: AudioPlayerProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioInfo, setAudioInfo] = useState<{ size?: number; type?: string }>({});
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handlePlay = async () => {
    try {
      if (!audioRef.current?.src) {
        setIsLoading(true);
        console.log(`Requesting audio generation for: ${word}`);
        
        const audioData = await onGenerateAudio(word);
        
        if (!audioData || audioData.byteLength === 0) {
          throw new Error('Invalid audio data received');
        }

        console.log(`Received valid audio data. Size: ${audioData.byteLength} bytes`);
        
        const blob = new Blob([audioData], { type: 'audio/mpeg' });
        const url = URL.createObjectURL(blob);
        
        if (audioRef.current) {
          audioRef.current.src = url;
          setAudioInfo({
            size: audioData.byteLength,
            type: 'audio/mpeg'
          });
        }
      }

      if (audioRef.current) {
        if (isPlaying) {
          audioRef.current.pause();
        } else {
          const playPromise = audioRef.current.play();
          if (playPromise !== undefined) {
            await playPromise;
          }
        }
        setIsPlaying(!isPlaying);
      }
    } catch (error) {
      console.error('Error playing audio:', error);
      toast.error('Failed to play audio. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      const handleCanPlay = () => {
        console.log('Audio loaded and ready to play');
      };

      const handleError = (e: Event) => {
        const mediaError = audio.error;
        console.error('Audio error:', {
          code: mediaError?.code,
          message: mediaError?.message
        });
        toast.error('Error loading audio');
        setIsPlaying(false);
      };

      const handleEnded = () => {
        setIsPlaying(false);
      };

      audio.addEventListener('canplaythrough', handleCanPlay);
      audio.addEventListener('error', handleError);
      audio.addEventListener('ended', handleEnded);

      return () => {
        if (audio.src) {
          URL.revokeObjectURL(audio.src);
        }
        audio.removeEventListener('canplaythrough', handleCanPlay);
        audio.removeEventListener('error', handleError);
        audio.removeEventListener('ended', handleEnded);
      };
    }
  }, []);

  return (
    <div className="flex items-center gap-2">
      <Button
        onClick={handlePlay}
        variant="ghost"
        size="icon"
        disabled={isLoading}
        className="relative"
      >
        {isLoading ? (
          <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-primary" />
        ) : isPlaying ? (
          <Pause className="h-4 w-4" />
        ) : (
          <Volume2 className="h-4 w-4" />
        )}
      </Button>
      <audio ref={audioRef} />
      {debug && audioInfo.size && (
        <div className="text-xs text-gray-500">
          <p>Size: {(audioInfo.size / 1024).toFixed(2)} KB</p>
          <p>Type: {audioInfo.type}</p>
        </div>
      )}
    </div>
  );
};