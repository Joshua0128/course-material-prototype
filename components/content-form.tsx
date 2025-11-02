'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft } from 'lucide-react';
import type { FormData } from '@/lib/types';

interface ContentFormProps {
  onSubmit: (data: FormData) => void;
  onBack: () => void;
}

export function ContentForm({ onSubmit, onBack }: ContentFormProps) {
  const [formData, setFormData] = useState<FormData>({
    audience: '',
    keyPoints: '',
    style: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.audience && formData.keyPoints && formData.style) {
      onSubmit(formData);
    }
  };

  const isFormValid = formData.audience && formData.keyPoints && formData.style;

  return (
    <div className="flex items-center justify-center p-8">
      <Card className="w-full max-w-2xl">
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex items-center gap-4">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={onBack}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-3xl font-bold">內容設定</h1>
                <p className="text-muted-foreground mt-1">
                  請填寫以下資訊以生成您的內容
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="audience">目標受眾</Label>
                <Input
                  id="audience"
                  placeholder="例如：高中生、大學生、專業人士..."
                  value={formData.audience}
                  onChange={(e) =>
                    setFormData({ ...formData, audience: e.target.value })
                  }
                  required
                />
                <p className="text-sm text-muted-foreground">
                  請描述您的目標受眾群體
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="keyPoints">呈現重點</Label>
                <Textarea
                  id="keyPoints"
                  placeholder="請輸入您想要呈現的重點內容..."
                  value={formData.keyPoints}
                  onChange={(e) =>
                    setFormData({ ...formData, keyPoints: e.target.value })
                  }
                  rows={6}
                  required
                />
                <p className="text-sm text-muted-foreground">
                  描述您希望在內容中強調的重點
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="style">風格選擇</Label>
                <Select
                  value={formData.style}
                  onValueChange={(value) =>
                    setFormData({ ...formData, style: value })
                  }
                  required
                >
                  <SelectTrigger id="style">
                    <SelectValue placeholder="請選擇呈現風格" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="professional">專業正式</SelectItem>
                    <SelectItem value="casual">輕鬆活潑</SelectItem>
                    <SelectItem value="academic">學術研究</SelectItem>
                    <SelectItem value="creative">創意趣味</SelectItem>
                    <SelectItem value="simple">簡潔明瞭</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  選擇最適合您內容的呈現風格
                </p>
              </div>
            </div>

            <Button
              type="submit"
              disabled={!isFormValid}
              className="w-full"
              size="lg"
            >
              生成內容
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
