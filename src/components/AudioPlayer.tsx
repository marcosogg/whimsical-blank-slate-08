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
  const audioGenerationInProgress = useRef(false);

  const handlePlay = async () => {
    try {
      if (!audioRef.current?.src && !audioGenerationInProgress.current) {
        audioGenerationInProgress.current = true;
        setIsLoading(true);
        console.log(`[AudioPlayer] Requesting audio generation for: ${word}`);
        
        const audioData = await onGenerateAudio(word);
        console.log(`[AudioPlayer] Received response from generate-audio`);
        
        if (!audioData || !(audioData instanceof ArrayBuffer)) {
          console.error('[AudioPlayer] Invalid audio data received:', audioData);
          throw new Error('Invalid audio data received');
        }
        
        console.log(`[AudioPlayer] Audio data type:`, Object.prototype.toString.call(audioData));
        console.log(`[AudioPlayer] Audio data size: ${audioData.byteLength} bytes`);
        
        const blob = new Blob([audioData], { type: 'audio/mpeg' });
        console.log('[AudioPlayer] Created audio blob:', {
          size: blob.size,
          type: blob.type,
          valid: blob.size > 0
        });
        
        const url = URL.createObjectURL(blob);
        console.log('[AudioPlayer] Created object URL:', url);
        
        if (audioRef.current) {
          audioRef.current.src = url;
          setAudioInfo({
            size: audioData.byteLength,
            type: 'audio/mpeg'
          });
        }
        audioGenerationInProgress.current = false;
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
      console.error('[AudioPlayer] Error playing audio:', error);
      toast.error('Failed to play audio');
      audioGenerationInProgress.current = false;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      const handleCanPlay = () => {
        console.log('[AudioPlayer] Audio can play');
      };

      const handleError = (e: Event) => {
        const error = e.currentTarget instanceof HTMLMediaElement ? e.currentTarget.error : null;
        console.error('[AudioPlayer] Audio error:', error);
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
        if (audio.src) {
          URL.revokeObjectURL(audio.src);
        }
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