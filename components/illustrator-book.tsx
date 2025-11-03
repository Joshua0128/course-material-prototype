'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, BookOpen } from 'lucide-react';
import type { IllustratorData } from '@/lib/types';
import Image from 'next/image';

interface IllustratorBookProps {
  illustratorData: IllustratorData;
}

export function IllustratorBook({ illustratorData }: IllustratorBookProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const pages = illustratorData.pages;

  const goToNextPage = () => {
    if (currentPage < pages.length - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const currentPageData = pages[currentPage];

  return (
    <div className="space-y-6">
      {/* Header with page indicator */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BookOpen className="h-5 w-5 text-primary" />
          <h2 className="text-2xl font-bold">圖文繪本</h2>
        </div>
        <Badge variant="outline" className="text-sm">
          第 {currentPage + 1} 頁 / 共 {pages.length} 頁
        </Badge>
      </div>

      {/* Main book content - single page layout */}
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="min-h-[80vh] flex flex-col">
            {/* Image section - takes up space if image exists, otherwise leaves whitespace */}
            {currentPageData.illustrator_image ? (
              <div className="relative w-full h-[600px] bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
                <Image
                  src={currentPageData.illustrator_image.startsWith('/') ? currentPageData.illustrator_image : `/${currentPageData.illustrator_image}`}
                  alt={currentPageData.page}
                  fill
                  className="object-contain p-8"
                  priority={currentPage === 0}
                  unoptimized
                />
              </div>
            ) : (
              <div className="w-full h-[600px] bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800" />
            )}

            {/* Text section - always at bottom */}
            <div className="p-8 md:p-12 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800">
              <div className="max-w-3xl mx-auto space-y-6">
                {/* Main text */}
                <div className="prose prose-slate dark:prose-invert max-w-none">
                  <p className="text-xl leading-relaxed whitespace-pre-line">
                    {currentPageData.text}
                  </p>
                </div>

                {/* Navigation buttons */}
                <div className="flex justify-between items-center pt-6">
                  <Button
                    variant="outline"
                    onClick={goToPreviousPage}
                    disabled={currentPage === 0}
                    className="gap-2"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    上一頁
                  </Button>

                  <div className="text-sm text-muted-foreground">
                    {currentPage + 1} / {pages.length}
                  </div>

                  <Button
                    variant="outline"
                    onClick={goToNextPage}
                    disabled={currentPage === pages.length - 1}
                    className="gap-2"
                  >
                    下一頁
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Page thumbnails */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {pages.map((page, index) => (
          <button
            key={index}
            onClick={() => setCurrentPage(index)}
            className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              currentPage === index
                ? 'bg-primary text-primary-foreground'
                : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {page.page.match(/^(封面|封底|第\d+頁)/)?.[0] || `頁 ${index + 1}`}
          </button>
        ))}
      </div>
    </div>
  );
}
