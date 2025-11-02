'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FileUpload } from '@/components/file-upload';
import { ContentForm } from '@/components/content-form';
import { ContentDisplay } from '@/components/content-display';
import { storageService } from '@/lib/storage';
import type { UploadedFile, FormData, QuestionData, PlayAct, PodcastSegment } from '@/lib/types';
import questionData from '@/data/question.json';
import playData from '@/data/interaction_play.json';
import podcastSegments from '@/data/out_tts/timestamps_detail.json';

type Step = 'upload' | 'form' | 'preview';

export function CreateContent() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<Step>('upload');
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [formData, setFormData] = useState<FormData | null>(null);

  const handleFileSelect = (file: UploadedFile) => {
    setUploadedFile(file);
  };

  const handleFileNext = () => {
    setCurrentStep('form');
  };

  const handleFormSubmit = (data: FormData) => {
    setFormData(data);
    setCurrentStep('preview');
  };

  const handleBackToForm = () => {
    setCurrentStep('form');
  };

  const handleBackToUpload = () => {
    setCurrentStep('upload');
  };

  const handleSave = () => {
    if (!uploadedFile || !formData) return;

    // 儲存到 localStorage
    const asset = storageService.create({
      title: (questionData as QuestionData).title,
      fileName: uploadedFile.name,
      fileSize: uploadedFile.size,
      formData: formData,
      questionData: questionData as QuestionData,
      playData: playData as PlayAct[],
      podcastData: {
        audioUrl: '/data/out_tts/podcast_combined.mp3',
        segments: podcastSegments as PodcastSegment[]
      },
    });

    // 導航到新建立的內容詳情頁
    router.push(`/content/${asset.id}`);
  };

  return (
    <>
      {currentStep === 'upload' && (
        <FileUpload
          onFileSelect={handleFileSelect}
          onNext={handleFileNext}
        />
      )}

      {currentStep === 'form' && (
        <ContentForm
          onSubmit={handleFormSubmit}
          onBack={handleBackToUpload}
        />
      )}

      {currentStep === 'preview' && (
        <div className="space-y-4">
          <ContentDisplay
            questionData={questionData as QuestionData}
            playData={playData as PlayAct[]}
            podcastData={{
              audioUrl: '/data/out_tts/podcast_combined.mp3',
              segments: podcastSegments as PodcastSegment[]
            }}
            onBack={handleBackToForm}
            onSave={handleSave}
            showSaveButton={true}
          />
        </div>
      )}
    </>
  );
}
