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
    error?: string;
  }>({});
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  const initializeWebAudio = async (arrayBuffer: ArrayBuffer) => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext();
      }
      
      const audioContext = audioContextRef.current;
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      
      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContext.destination);
      
      return source;
    } catch (error) {
      console.error('Web Audio API error:', error);
      throw error;
    }
  };

  const handlePlay = async () => {
    try {
      if (!audioRef.current?.src) {
        setIsLoading(true);
        console.log(`Generating audio for word: ${word}`);
        
        const audioData = await onGenerateAudio(word);
        console.log(`Received audio data. Size: ${audioData.byteLength} bytes`);
        
        // Try HTML5 Audio first
        try {
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
        } catch (error) {
          console.error('HTML5 Audio failed, trying Web Audio API:', error);
          setAudioInfo(prev => ({ ...prev, error: 'Falling back to Web Audio API' }));
          
          // Fallback to Web Audio API
          const source = await initializeWebAudio(audioData);
          source.start(0);
          setIsPlaying(true);
          source.onended = () => setIsPlaying(false);
          return;
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
      setAudioInfo(prev => ({ ...prev, error: error.message }));
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

      const handleError = (e: Event) => {
        const error = e.currentTarget instanceof HTMLMediaElement ? e.currentTarget.error : null;
        console.error('Audio error:', error);
        setAudioInfo(prev => ({ 
          ...prev, 
          status: 'error',
          error: error ? error.message : 'Unknown error'
        }));
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
      {debug && (
        <div className="text-xs text-gray-500">
          <p>Size: {audioInfo.size ? `${(audioInfo.size / 1024).toFixed(2)}KB` : 'N/A'}</p>
          <p>Type: {audioInfo.type || 'N/A'}</p>
          <p>Status: {audioInfo.status || 'N/A'}</p>
          {audioInfo.error && <p className="text-red-500">Error: {audioInfo.error}</p>}
        </div>
      )}
    </div>
  );
};