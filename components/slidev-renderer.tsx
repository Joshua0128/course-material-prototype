'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface SlideContent {
  layout: string;
  content: string;
  metadata?: {
    background?: string;
    image?: string;
    title?: string;
    subtitle?: string;
  };
}

interface ThemeConfig {
  name: string;
  colors: {
    primary: string;
    background: string;
    text: string;
    muted: string;
  };
  fonts: {
    heading: string;
    body: string;
  };
}

interface SlidevRendererProps {
  markdownContent: string;
}

const themes: Record<string, ThemeConfig> = {
  'apple-basic': {
    name: 'Apple Basic',
    colors: {
      primary: '#007AFF',
      background: '#FFFFFF',
      text: '#1D1D1F',
      muted: '#86868B',
    },
    fonts: {
      heading: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", sans-serif',
      body: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", sans-serif',
    },
  },
  default: {
    name: 'Default',
    colors: {
      primary: '#3B82F6',
      background: '#FFFFFF',
      text: '#1F2937',
      muted: '#6B7280',
    },
    fonts: {
      heading: 'system-ui, sans-serif',
      body: 'system-ui, sans-serif',
    },
  },
};

export function SlidevRenderer({ markdownContent }: SlidevRendererProps) {
  const [slides, setSlides] = useState<SlideContent[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [theme, setTheme] = useState<ThemeConfig>(themes['apple-basic']);

  useEffect(() => {
    parseSlides(markdownContent);
  }, [markdownContent]);

  const parseSlides = (content: string) => {
    if (!content) {
      console.log('No content to parse');
      return;
    }

    console.log('Parsing slides, content length:', content.length);

    // Split by --- that's on its own line
    const slideBlocks = content.split(/^---$/m);
    console.log('Found slide blocks:', slideBlocks.length);
    const parsedSlides: SlideContent[] = [];
    let detectedTheme: string | null = null;

    slideBlocks.forEach((block, idx) => {
      const trimmedBlock = block.trim();
      if (!trimmedBlock) {
        console.log(`Block ${idx} is empty, skipping`);
        return;
      }

      const lines = trimmedBlock.split('\n');
      let layout = 'default';
      let metadata: any = {};
      let contentLines: string[] = [];
      let parsingFrontmatter = false;

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // Check if line contains frontmatter key
        if (line.startsWith('theme:')) {
          const themeName = line.replace('theme:', '').trim();
          if (themes[themeName]) {
            detectedTheme = themeName;
          }
          parsingFrontmatter = true;
        } else if (line.startsWith('layout:')) {
          layout = line.replace('layout:', '').trim();
          parsingFrontmatter = true;
        } else if (line.startsWith('background:')) {
          metadata.background = line.replace('background:', '').trim();
          parsingFrontmatter = true;
        } else if (line.startsWith('image:')) {
          metadata.image = line.replace('image:', '').trim();
          parsingFrontmatter = true;
        } else if (line.startsWith('title:')) {
          metadata.title = line.replace('title:', '').replace(/['"]/g, '').trim();
          parsingFrontmatter = true;
        } else if (line.startsWith('subtitle:')) {
          metadata.subtitle = line.replace('subtitle:', '').replace(/['"]/g, '').trim();
          parsingFrontmatter = true;
        } else if (line === '::right::') {
          contentLines.push('<!-- split -->');
          parsingFrontmatter = false;
        } else if (line.trim() === '') {
          // Empty line might signal end of frontmatter
          if (parsingFrontmatter && i > 0) {
            parsingFrontmatter = false;
          }
          contentLines.push(line);
        } else {
          // Regular content line
          parsingFrontmatter = false;
          contentLines.push(line);
        }
      }

      const slide = {
        layout,
        content: contentLines.join('\n').trim(),
        metadata,
      };
      console.log(`Parsed slide ${idx}:`, slide.layout, 'content length:', slide.content.length);
      parsedSlides.push(slide);
    });

    // Set theme if detected
    if (detectedTheme && themes[detectedTheme]) {
      console.log('Detected theme:', detectedTheme);
      setTheme(themes[detectedTheme]);
    }

    console.log('Total parsed slides:', parsedSlides.length);
    setSlides(parsedSlides);
  };

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const renderMarkdown = (content: string) => {
    const lines = content.split('\n');
    return lines.map((line, idx) => {
      // Skip split markers - they're used for layout, not rendering
      if (line.trim() === '<!-- split -->') {
        return null;
      }

      // Headers
      if (line.startsWith('### ')) {
        return (
          <h3
            key={idx}
            className="text-3xl font-semibold mb-6 tracking-tight"
            style={{ fontFamily: theme.fonts.heading, color: theme.colors.text }}
          >
            {line.replace('### ', '')}
          </h3>
        );
      }
      if (line.startsWith('## ')) {
        return (
          <h2
            key={idx}
            className="text-4xl font-semibold mb-6 tracking-tight"
            style={{ fontFamily: theme.fonts.heading, color: theme.colors.text }}
          >
            {line.replace('## ', '')}
          </h2>
        );
      }
      if (line.startsWith('# ')) {
        return (
          <h1
            key={idx}
            className="text-5xl font-bold mb-8 tracking-tight"
            style={{ fontFamily: theme.fonts.heading, color: theme.colors.text }}
          >
            {line.replace('# ', '')}
          </h1>
        );
      }

      // Blockquote
      if (line.startsWith('> ')) {
        return (
          <blockquote
            key={idx}
            className="border-l-4 pl-6 italic text-2xl my-6 leading-relaxed"
            style={{
              borderColor: theme.colors.primary,
              color: theme.colors.text,
              fontFamily: theme.fonts.body
            }}
          >
            {line.replace('> ', '')}
          </blockquote>
        );
      }

      // Lists
      if (line.startsWith('- ')) {
        return (
          <li
            key={idx}
            className="ml-8 mb-3 text-xl leading-relaxed"
            style={{ fontFamily: theme.fonts.body, color: theme.colors.text }}
          >
            {line.replace('- ', '')}
          </li>
        );
      }

      if (line.match(/^\d+️⃣/)) {
        return (
          <p
            key={idx}
            className="text-xl mb-3 leading-relaxed"
            style={{ fontFamily: theme.fonts.body, color: theme.colors.text }}
          >
            {line}
          </p>
        );
      }

      // Images
      if (line.startsWith('![](')) {
        const url = line.match(/!\[\]\((.*?)\)/)?.[1];
        if (url) {
          return <img key={idx} src={url} alt="" className="w-full h-72 object-cover rounded-2xl mb-6" />;
        }
      }

      // Empty lines
      if (!line.trim()) {
        return <div key={idx} className="h-3" />;
      }

      // Regular text
      return (
        <p
          key={idx}
          className="text-xl mb-3 leading-relaxed"
          style={{ fontFamily: theme.fonts.body, color: theme.colors.text }}
        >
          {line}
        </p>
      );
    });
  };

  const renderSlide = (slide: SlideContent) => {
    const { layout, content, metadata } = slide;

    switch (layout) {
      case 'cover':
        return (
          <div
            className="flex flex-col items-center justify-center h-full p-16"
            style={{
              backgroundImage: metadata?.background ? `url(${metadata.background})` : 'none',
              backgroundColor: metadata?.background ? 'transparent' : theme.colors.background,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            <div
              className="p-12 rounded-3xl text-center max-w-4xl"
              style={{
                backgroundColor: metadata?.background ? 'rgba(0, 0, 0, 0.5)' : 'transparent',
              }}
            >
              {metadata?.title && (
                <h1
                  className="text-6xl font-bold mb-6 tracking-tight"
                  style={{
                    fontFamily: theme.fonts.heading,
                    color: metadata?.background ? '#FFFFFF' : theme.colors.text,
                  }}
                >
                  {metadata.title}
                </h1>
              )}
              {metadata?.subtitle && (
                <h2
                  className="text-3xl font-medium mb-8"
                  style={{
                    fontFamily: theme.fonts.heading,
                    color: metadata?.background ? '#FFFFFF' : theme.colors.muted,
                  }}
                >
                  {metadata.subtitle}
                </h2>
              )}
              <div style={{ color: metadata?.background ? '#FFFFFF' : theme.colors.text }}>
                {renderMarkdown(content)}
              </div>
            </div>
          </div>
        );

      case 'quote':
        return (
          <div
            className="flex items-center justify-center h-full p-16"
            style={{ backgroundColor: theme.colors.background }}
          >
            <div className="max-w-5xl">
              {renderMarkdown(content)}
            </div>
          </div>
        );

      case 'two-cols':
        const parts = content.split('<!-- split -->');
        return (
          <div
            className="grid grid-cols-2 gap-12 h-full p-16"
            style={{ backgroundColor: theme.colors.background }}
          >
            <div>{renderMarkdown(parts[0] || '')}</div>
            <div>{renderMarkdown(parts[1] || '')}</div>
          </div>
        );

      case 'image-right':
        return (
          <div
            className="grid grid-cols-2 gap-12 h-full p-16"
            style={{ backgroundColor: theme.colors.background }}
          >
            <div className="flex flex-col justify-center">
              {renderMarkdown(content)}
            </div>
            <div className="flex items-center justify-center">
              {metadata?.image && (
                <img
                  src={metadata.image}
                  alt=""
                  className="w-full h-full object-cover rounded-2xl"
                />
              )}
            </div>
          </div>
        );

      case 'image-left':
        return (
          <div
            className="grid grid-cols-2 gap-12 h-full p-16"
            style={{ backgroundColor: theme.colors.background }}
          >
            <div className="flex items-center justify-center">
              {metadata?.image && (
                <img
                  src={metadata.image}
                  alt=""
                  className="w-full h-full object-cover rounded-2xl"
                />
              )}
            </div>
            <div className="flex flex-col justify-center">
              {renderMarkdown(content)}
            </div>
          </div>
        );

      case 'center':
        return (
          <div
            className="flex items-center justify-center h-full p-16"
            style={{ backgroundColor: theme.colors.background }}
          >
            <div className="text-center max-w-5xl">
              {renderMarkdown(content)}
            </div>
          </div>
        );

      case 'end':
        return (
          <div
            className="flex items-center justify-center h-full p-16"
            style={{ backgroundColor: theme.colors.background }}
          >
            <div className="text-center">
              {renderMarkdown(content)}
            </div>
          </div>
        );

      default:
        return (
          <div
            className="h-full p-16 overflow-auto"
            style={{ backgroundColor: theme.colors.background }}
          >
            {renderMarkdown(content)}
          </div>
        );
    }
  };

  if (slides.length === 0) {
    return (
      <div className="flex items-center justify-center h-[600px]">
        <p className="text-muted-foreground">載入投影片中...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="border-2">
        <CardContent className="p-0">
          <div className="bg-background rounded-lg overflow-hidden">
            <div className="h-[600px] relative">
              {renderSlide(slides[currentSlide])}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <Button
          onClick={prevSlide}
          disabled={currentSlide === 0}
          variant="outline"
          size="sm"
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          上一頁
        </Button>

        <div className="text-sm text-muted-foreground">
          {currentSlide + 1} / {slides.length}
        </div>

        <Button
          onClick={nextSlide}
          disabled={currentSlide === slides.length - 1}
          variant="outline"
          size="sm"
        >
          下一頁
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </div>

      {/* Thumbnail navigation */}
      <div className="grid grid-cols-8 gap-2">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentSlide(idx)}
            className={`aspect-video border-2 rounded text-xs flex items-center justify-center transition-colors ${
              currentSlide === idx
                ? 'border-primary bg-primary/10'
                : 'border-muted hover:border-muted-foreground/50'
            }`}
          >
            {idx + 1}
          </button>
        ))}
      </div>
    </div>
  );
}
