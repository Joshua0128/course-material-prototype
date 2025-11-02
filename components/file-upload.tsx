'use client';

import { useState, useCallback } from 'react';
import { Upload, File, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { UploadedFile } from '@/lib/types';

interface FileUploadProps {
  onFileSelect: (file: UploadedFile) => void;
  onNext: () => void;
}

export function FileUpload({ onFileSelect, onNext }: FileUploadProps) {
  const [file, setFile] = useState<UploadedFile | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (selectedFile: File) => {
    const uploadedFile: UploadedFile = {
      file: selectedFile,
      name: selectedFile.name,
      size: selectedFile.size,
    };
    setFile(uploadedFile);
    onFileSelect(uploadedFile);
  };

  const removeFile = () => {
    setFile(null);
  };

  const handleNext = () => {
    if (file) {
      onNext();
    }
  };

  return (
    <div className="flex items-center justify-center p-8">
      <Card className="w-full max-w-2xl">
        <CardContent className="pt-6">
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-bold">上傳檔案</h1>
              <p className="text-muted-foreground">
                請上傳您的文件以開始生成內容
              </p>
            </div>

            <div
              className={`relative border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
                dragActive
                  ? 'border-primary bg-primary/5'
                  : 'border-muted-foreground/25 hover:border-muted-foreground/50'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                type="file"
                id="file-upload"
                className="hidden"
                onChange={handleChange}
                accept=".pdf,.doc,.docx,.txt,.json,.md,.markdown"
              />

              {!file ? (
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer flex flex-col items-center gap-4"
                >
                  <div className="rounded-full bg-primary/10 p-4">
                    <Upload className="h-8 w-8 text-primary" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-lg font-medium">
                      拖曳檔案至此或點擊上傳
                    </p>
                    <p className="text-sm text-muted-foreground">
                      支援格式: PDF, DOC, DOCX, TXT, JSON, Markdown
                    </p>
                  </div>
                </label>
              ) : (
                <div className="flex items-center justify-between bg-muted rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <File className="h-8 w-8 text-primary" />
                    <div className="text-left">
                      <p className="font-medium">{file.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(file.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={removeFile}
                    className="h-8 w-8"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>

            <Button
              onClick={handleNext}
              disabled={!file}
              className="w-full"
              size="lg"
            >
              下一步
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
