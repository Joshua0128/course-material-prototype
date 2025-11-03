'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Download, Save } from 'lucide-react';
import { InteractiveTheater } from '@/components/interactive-theater';
import { PodcastPlayer } from '@/components/podcast-player';
import { InteractiveQuestion } from '@/components/interactive-question';
import { SlidevRenderer } from '@/components/slidev-renderer';
import { IllustratorBook } from '@/components/illustrator-book';
import type { QuestionData, PlayAct, PodcastData, IllustratorData } from '@/lib/types';

interface ContentDisplayProps {
  questionData: QuestionData;
  playData?: PlayAct[];
  podcastData?: PodcastData;
  illustratorData?: IllustratorData;
  onBack?: () => void;
  onSave?: () => void;
  showSaveButton?: boolean;
}

export function ContentDisplay({
  questionData,
  playData,
  podcastData,
  illustratorData,
  onBack,
  onSave,
  showSaveButton = false
}: ContentDisplayProps) {
  const [slideMarkdown, setSlideMarkdown] = useState<string>('');

  useEffect(() => {
    // Load slide.md content
    console.log('Fetching slide.md...');
    fetch('/data/slide.md')
      .then(res => {
        console.log('Fetch response status:', res.status);
        return res.text();
      })
      .then(text => {
        console.log('Loaded slide.md, length:', text.length);
        setSlideMarkdown(text);
      })
      .catch(err => console.error('Failed to load slides:', err));
  }, []);

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {onBack && (
              <Button variant="ghost" size="icon" onClick={onBack}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <div>
              <h1 className="text-3xl font-bold">{questionData.title}</h1>
              <p className="text-muted-foreground mt-1">
                {showSaveButton ? '預覽內容' : '內容詳情'}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            {showSaveButton && onSave && (
              <Button onClick={onSave} size="sm">
                <Save className="h-4 w-4 mr-2" />
                儲存
              </Button>
            )}
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              匯出
            </Button>
          </div>
        </div>

        <Tabs defaultValue="questions" className="w-full">
          <TabsList className={`grid w-full ${
            [playData, podcastData, illustratorData].filter(Boolean).length === 3 ? 'grid-cols-5' :
            [playData, podcastData, illustratorData].filter(Boolean).length === 2 ? 'grid-cols-4' :
            [playData, podcastData, illustratorData].filter(Boolean).length === 1 ? 'grid-cols-3' : 'grid-cols-2'
          }`}>
            <TabsTrigger value="questions">例題</TabsTrigger>
            <TabsTrigger value="slides">投影片</TabsTrigger>
            {playData && <TabsTrigger value="theater">交互式劇場</TabsTrigger>}
            {podcastData && <TabsTrigger value="podcast">Podcast</TabsTrigger>}
            {illustratorData && <TabsTrigger value="illustrator">圖文</TabsTrigger>}
          </TabsList>

          <TabsContent value="questions" className="space-y-4 mt-6">
            {questionData.questions.map((question, index) => (
              <InteractiveQuestion
                key={question.id}
                question={question}
                index={index}
              />
            ))}
          </TabsContent>

          <TabsContent value="slides" className="space-y-4 mt-6">
            {slideMarkdown ? (
              <SlidevRenderer markdownContent={slideMarkdown} />
            ) : (
              <Card>
                <CardContent className="flex items-center justify-center h-64">
                  <p className="text-muted-foreground">載入投影片中...</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {playData && (
            <TabsContent value="theater" className="mt-6">
              <InteractiveTheater playData={playData} />
            </TabsContent>
          )}

          {podcastData && (
            <TabsContent value="podcast" className="mt-6">
              <PodcastPlayer podcastData={podcastData} />
            </TabsContent>
          )}

          {illustratorData && (
            <TabsContent value="illustrator" className="mt-6">
              <IllustratorBook illustratorData={illustratorData} />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
}
