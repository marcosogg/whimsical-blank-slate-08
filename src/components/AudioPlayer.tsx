import React, { useEffect, useRef, useState } from 'react';
import { Volume2, Pause, Play } from 'lucide-react';
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
  const [audioInfo, setAudioInfo] = useState<{
    size?: number;
    type?: string;
    status?: string;
  }>({});
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handlePlay = async () => {
    try {
      if (!audioRef.current?.src) {
        setIsLoading(true);
        console.log(`Generating audio for word: ${word}`);
        
        const audioData = await onGenerateAudio(word);
        console.log(`Received audio data. Size: ${audioData.byteLength} bytes`);
        
        const blob = new Blob([audioData], { type: 'audio/mpeg' });
        const url = URL.createObjectURL(blob);
        
        if (audioRef.current) {
          audioRef.current.src = url;
          setAudioInfo({
            size: blob.size,
            type: blob.type,
            status: 'loaded'
          });
        }
      }

      if (audioRef.current) {
        if (isPlaying) {
          audioRef.current.pause();
        } else {
          await audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
      }
    } catch (error) {
      console.error('Error playing audio:', error);
      toast.error('Failed to play audio');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      const handleCanPlay = () => {
        console.log('Audio can play');
        setAudioInfo(prev => ({ ...prev, status: 'ready' }));
      };

      const handleError = (e: ErrorEvent) => {
        console.error('Audio error:', e);
        setAudioInfo(prev => ({ ...prev, status: 'error' }));
        toast.error('Error loading audio');
      };

      const handleEnded = () => {
        setIsPlaying(false);
      };

      audio.addEventListener('canplaythrough', handleCanPlay);
      audio.addEventListener('error', handleError);
      audio.addEventListener('ended', handleEnded);

      return () => {
        audio.removeEventListener('canplaythrough', handleCanPlay);
        audio.removeEventListener('error', handleError);
        audio.removeEventListener('ended', handleEnded);
      };
    }
  }, []);

  return (
    <div className="flex flex-col items-center gap-2">
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
      {debug && audioInfo.status && (
        <div className="text-xs text-gray-500">
          <p>Size: {audioInfo.size ? `${(audioInfo.size / 1024).toFixed(2)}KB` : 'N/A'}</p>
          <p>Type: {audioInfo.type || 'N/A'}</p>
          <p>Status: {audioInfo.status}</p>
        </div>
      )}
    </div>
  );
};