'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX } from 'lucide-react';
import type { PodcastData } from '@/lib/types';

interface PodcastPlayerProps {
  podcastData: PodcastData;
}

export function PodcastPlayer({ podcastData }: PodcastPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [currentSegmentIndex, setCurrentSegmentIndex] = useState<number | null>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  // 根據當前時間更新當前片段
  useEffect(() => {
    const index = podcastData.segments.findIndex((segment, idx) => {
      const nextSegment = podcastData.segments[idx + 1];
      const isInRange = currentTime >= segment.start_sec &&
        (nextSegment ? currentTime < nextSegment.start_sec : true);
      return isInRange;
    });
    setCurrentSegmentIndex(index >= 0 ? index : null);
  }, [currentTime, podcastData.segments]);

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (value: number[]) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = value[0];
    setCurrentTime(value[0]);
  };

  const handleVolumeChange = (value: number[]) => {
    const audio = audioRef.current;
    if (!audio) return;
    const newVolume = value[0];
    audio.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isMuted) {
      audio.volume = volume || 0.5;
      setIsMuted(false);
    } else {
      audio.volume = 0;
      setIsMuted(true);
    }
  };

  const skipTo = (seconds: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Math.max(0, Math.min(duration, currentTime + seconds));
  };

  const jumpToSegment = (startTime: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = startTime;
    setCurrentTime(startTime);
    if (!isPlaying) {
      audio.play();
      setIsPlaying(true);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getSpeakerColor = (name: string) => {
    const colors: Record<string, string> = {
      'Amy': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      'Ben': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    };
    return colors[name] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  };

  return (
    <div className="space-y-6">
      {/* Audio Player Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-2xl">🎙️</span>
            Podcast 播放器
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Hidden Audio Element */}
          <audio ref={audioRef} src={podcastData.audioUrl} preload="metadata" />

          {/* Progress Bar */}
          <div className="space-y-2">
            <Slider
              value={[currentTime]}
              max={duration || 100}
              step={0.1}
              onValueChange={handleSeek}
              className="cursor-pointer"
            />
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => skipTo(-10)}
              disabled={currentTime === 0}
            >
              <SkipBack className="h-4 w-4" />
            </Button>

            <Button
              size="icon"
              onClick={togglePlayPause}
              className="h-14 w-14"
            >
              {isPlaying ? (
                <Pause className="h-6 w-6" />
              ) : (
                <Play className="h-6 w-6" />
              )}
            </Button>

            <Button
              variant="outline"
              size="icon"
              onClick={() => skipTo(10)}
              disabled={currentTime >= duration}
            >
              <SkipForward className="h-4 w-4" />
            </Button>
          </div>

          {/* Volume Control */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMute}
              className="flex-shrink-0"
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="h-4 w-4" />
              ) : (
                <Volume2 className="h-4 w-4" />
              )}
            </Button>
            <Slider
              value={[isMuted ? 0 : volume]}
              max={1}
              step={0.01}
              onValueChange={handleVolumeChange}
              className="w-32"
            />
          </div>
        </CardContent>
      </Card>

      {/* Transcript */}
      <Card>
        <CardHeader>
          <CardTitle>逐字稿</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px] pr-4">
            <div className="space-y-4">
              {podcastData.segments.map((segment, index) => {
                const isActive = currentSegmentIndex === index;
                const isPast = currentSegmentIndex !== null && index < currentSegmentIndex;

                return (
                  <div
                    key={segment.index}
                    className={`rounded-lg p-4 transition-all cursor-pointer ${
                      isActive
                        ? 'bg-primary/10 border-2 border-primary shadow-md scale-[1.02]'
                        : isPast
                        ? 'bg-muted/50 opacity-60'
                        : 'bg-muted/30 hover:bg-muted/50'
                    }`}
                    onClick={() => jumpToSegment(segment.start_sec)}
                  >
                    <div className="flex items-start gap-3">
                      <Badge
                        className={`flex-shrink-0 ${getSpeakerColor(segment.name)}`}
                        variant="secondary"
                      >
                        {segment.name}
                      </Badge>
                      <div className="flex-1 space-y-1">
                        <p className={`leading-relaxed ${isActive ? 'font-medium' : ''}`}>
                          {segment.text}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{formatTime(segment.start_sec)}</span>
                          <span>•</span>
                          <span>{formatTime(segment.duration_sec)} 長度</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
