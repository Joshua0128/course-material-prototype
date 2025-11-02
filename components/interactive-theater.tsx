'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { CheckCircle2, ArrowRight, RotateCcw } from 'lucide-react';
import type { PlayAct } from '@/lib/types';

interface InteractiveTheaterProps {
  playData: PlayAct[];
}

interface HistoryItem {
  actId: string;
  response: string;
  feedback: string;
}

export function InteractiveTheater({ playData }: InteractiveTheaterProps) {
  const [currentActId, setCurrentActId] = useState<string>('1');
  const [userInput, setUserInput] = useState<string>('');
  const [currentFeedback, setCurrentFeedback] = useState<string>('');
  const [showFeedback, setShowFeedback] = useState<boolean>(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  const currentAct = playData.find(act => act.act_id === currentActId);
  const currentIndex = playData.findIndex(act => act.act_id === currentActId);
  const progress = ((currentIndex + 1) / playData.length) * 100;

  if (!currentAct) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">找不到劇本內容</p>
      </div>
    );
  }

  const handleButtonClick = (buttonText: string, feedback: string) => {
    setCurrentFeedback(feedback);
    setHistory([...history, {
      actId: currentActId,
      response: buttonText,
      feedback: feedback
    }]);
    setShowFeedback(true);
  };

  const handleInputSubmit = (inputOption: { placeholder: string; interaction_check: string }) => {
    if (!userInput.trim()) return;

    setCurrentFeedback(inputOption.interaction_check);
    setHistory([...history, {
      actId: currentActId,
      response: userInput,
      feedback: inputOption.interaction_check
    }]);
    setShowFeedback(true);
  };

  const handleNext = () => {
    setUserInput('');
    setCurrentFeedback('');
    setShowFeedback(false);

    if (currentAct.next_do === '1' && currentIndex === playData.length - 1) {
      // 重新開始
      setCurrentActId('1');
      setHistory([]);
    } else {
      setCurrentActId(currentAct.next_do);
    }
  };

  const handleRestart = () => {
    setCurrentActId('1');
    setUserInput('');
    setCurrentFeedback('');
    setShowFeedback(false);
    setHistory([]);
  };

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">進度</span>
              <span className="text-muted-foreground">
                第 {currentIndex + 1} / {playData.length} 幕
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Main Act Card */}
      <Card className="border-2">
        <CardHeader>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="secondary">第 {currentAct.display_order} 幕</Badge>
              <Badge variant="outline">{currentAct.act_id}</Badge>
            </div>
            <CardTitle className="text-2xl">{currentAct.name}</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Content */}
          <div className="prose prose-neutral dark:prose-invert max-w-none">
            <p className="text-lg leading-relaxed whitespace-pre-wrap">{currentAct.content}</p>
          </div>

          <Separator />

          {/* Interaction Area */}
          {!showFeedback ? (
            <div className="space-y-4">
              <h3 className="font-semibold text-sm text-muted-foreground">
                請選擇或輸入您的回應：
              </h3>

              {currentAct.interaction_type === 'buttons' && currentAct.interaction_data.buttons && (
                <div className="grid grid-cols-1 gap-3">
                  {currentAct.interaction_data.buttons.map((button, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="lg"
                      className="justify-start h-auto py-4 px-6 text-left whitespace-normal"
                      onClick={() => handleButtonClick(button.text, button.interaction_check)}
                    >
                      <span className="flex-1">{button.text}</span>
                      <ArrowRight className="h-4 w-4 ml-2 flex-shrink-0" />
                    </Button>
                  ))}
                </div>
              )}

              {currentAct.interaction_type === 'input' && currentAct.interaction_data.inputs && (
                <div className="space-y-3">
                  {currentAct.interaction_data.inputs.map((inputOption, index) => (
                    <div key={index} className="space-y-3">
                      <Input
                        placeholder={inputOption.placeholder}
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleInputSubmit(inputOption)}
                        className="text-base"
                      />
                      <Button
                        onClick={() => handleInputSubmit(inputOption)}
                        disabled={!userInput.trim()}
                        size="lg"
                        className="w-full"
                      >
                        提交回應
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {/* User Response */}
              <div className="bg-primary/5 rounded-lg p-4 border-l-4 border-primary">
                <p className="text-sm text-muted-foreground mb-1">您的回應：</p>
                <p className="font-medium">
                  {history[history.length - 1]?.response}
                </p>
              </div>

              {/* Feedback */}
              <div className="bg-green-50 dark:bg-green-950 rounded-lg p-4 border border-green-200 dark:border-green-800">
                <div className="flex gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium text-green-900 dark:text-green-100 mb-1">
                      反饋
                    </p>
                    <p className="text-green-800 dark:text-green-200">
                      {currentFeedback}
                    </p>
                  </div>
                </div>
              </div>

              {/* Next Button */}
              <Button
                onClick={handleNext}
                size="lg"
                className="w-full"
              >
                {currentAct.next_do === '1' && currentIndex === playData.length - 1
                  ? '重新開始'
                  : '繼續下一幕'}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* History and Controls */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={handleRestart}
          disabled={currentIndex === 0 && history.length === 0}
        >
          <RotateCcw className="h-3 w-3 mr-2" />
          重新開始
        </Button>

        {history.length > 0 && (
          <p className="text-sm text-muted-foreground">
            已完成 {history.length} 次互動
          </p>
        )}
      </div>

      {/* History Display */}
      {history.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">互動歷程</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {history.map((item, index) => {
                const act = playData.find(a => a.act_id === item.actId);
                return (
                  <div key={index} className="space-y-2 pb-4 border-b last:border-b-0">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="flex-shrink-0">
                        第 {act?.display_order} 幕
                      </Badge>
                      <p className="font-medium text-sm">{act?.name}</p>
                    </div>
                    <div className="pl-4 space-y-1 text-sm">
                      <p className="text-muted-foreground">
                        回應：<span className="text-foreground">{item.response}</span>
                      </p>
                      <p className="text-muted-foreground">
                        反饋：<span className="text-foreground">{item.feedback}</span>
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
