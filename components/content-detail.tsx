'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ContentDisplay } from '@/components/content-display';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import { storageService } from '@/lib/storage';
import type { ContentAsset } from '@/lib/types';

interface ContentDetailProps {
  id: string;
}

export function ContentDetail({ id }: ContentDetailProps) {
  const router = useRouter();
  const [asset, setAsset] = useState<ContentAsset | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAsset = () => {
      const foundAsset = storageService.getById(id);
      setAsset(foundAsset);
      setLoading(false);
    };

    loadAsset();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-muted-foreground">載入中...</p>
        </div>
      </div>
    );
  }

  if (!asset) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="rounded-full bg-destructive/10 p-3">
                <AlertCircle className="h-8 w-8 text-destructive" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">找不到內容</h3>
                <p className="text-muted-foreground mt-1">
                  此內容可能已被刪除或不存在
                </p>
              </div>
              <Button onClick={() => router.push('/')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                返回 Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <ContentDisplay
      questionData={asset.questionData}
      playData={asset.playData}
      podcastData={asset.podcastData}
    />
  );
}
