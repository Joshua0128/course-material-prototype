'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import type { Question } from '@/lib/types';

interface InteractiveQuestionProps {
  question: Question;
  index: number;
}

export function InteractiveQuestion({ question, index }: InteractiveQuestionProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const handleOptionClick = (optionKey: string) => {
    setSelectedOption(optionKey);
  };

  const resetQuestion = () => {
    setSelectedOption(null);
  };

  // 選擇題
  if (question.type === 'multiple_choice' && question.options) {
    const isCorrect = selectedOption === question.answer;
    const selectedExplanation = selectedOption
      ? question.options[selectedOption]?.explanation
      : null;

    return (
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <CardTitle className="text-lg">題目 {index + 1}</CardTitle>
            <Badge>選擇題</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-medium mb-3">題目：</h3>
            <p className="text-foreground/90 text-base">{question.question}</p>
          </div>

          <div>
            <h3 className="font-medium mb-3">選項：</h3>
            <div className="space-y-2">
              {Object.entries(question.options).map(([key, option]) => {
                const isSelected = selectedOption === key;
                const isAnswer = key === question.answer;
                const showResult = selectedOption !== null;

                return (
                  <Button
                    key={key}
                    variant="outline"
                    className={`w-full justify-start text-left h-auto py-4 px-4 transition-all ${
                      !showResult
                        ? 'hover:bg-accent hover:border-primary'
                        : isSelected && isAnswer
                        ? 'bg-green-50 border-green-500 dark:bg-green-950 dark:border-green-700'
                        : isSelected && !isAnswer
                        ? 'bg-red-50 border-red-500 dark:bg-red-950 dark:border-red-700'
                        : isAnswer
                        ? 'bg-green-50 border-green-300 dark:bg-green-950 dark:border-green-800'
                        : 'opacity-50'
                    }`}
                    onClick={() => !showResult && handleOptionClick(key)}
                    disabled={showResult}
                  >
                    <div className="flex items-start gap-3 w-full">
                      <span className="font-bold text-lg flex-shrink-0">{key}.</span>
                      <div className="flex-1 min-w-0">
                        <p className="whitespace-normal">{option.text}</p>
                      </div>
                      {showResult && isAnswer && (
                        <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                      )}
                      {showResult && isSelected && !isAnswer && (
                        <XCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                      )}
                    </div>
                  </Button>
                );
              })}
            </div>
          </div>

          {selectedExplanation && (
            <>
              <Separator />
              <div
                className={`rounded-lg p-4 border ${
                  isCorrect
                    ? 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800'
                    : 'bg-amber-50 border-amber-200 dark:bg-amber-950 dark:border-amber-800'
                }`}
              >
                <div className="flex gap-3">
                  {isCorrect ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <h4 className="font-medium mb-2">
                      {isCorrect ? '回答正確！' : '回答錯誤'}
                    </h4>
                    <p className="text-sm text-foreground/80">{selectedExplanation}</p>
                  </div>
                </div>
              </div>

              <Button onClick={resetQuestion} variant="outline" className="w-full">
                重新作答
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    );
  }

  // 簡答題
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <CardTitle className="text-lg">題目 {index + 1}</CardTitle>
          <Badge variant="secondary">簡答題</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="font-medium mb-2">題目：</h3>
          <p className="text-foreground/90">{question.question}</p>
        </div>

        <div>
          <h3 className="font-medium mb-2">參考答案：</h3>
          <div className="p-4 rounded-lg bg-blue-50 border border-blue-200 dark:bg-blue-950 dark:border-blue-800">
            <p className="text-foreground/90">{question.answer}</p>
          </div>
        </div>

        {question.explanation && (
          <>
            <Separator />
            <div>
              <h3 className="font-medium mb-2">解析：</h3>
              <p className="text-foreground/80">{question.explanation}</p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
