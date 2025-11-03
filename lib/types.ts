export interface QuestionOption {
  text: string;
  explanation: string;
}

export interface Question {
  id: number;
  type: 'multiple_choice' | 'short_answer';
  question: string;
  options?: {
    [key: string]: QuestionOption;
  };
  answer: string;
  explanation?: string; // 用於簡答題
}

export interface QuestionData {
  title: string;
  questions: Question[];
}

export interface FormData {
  audience: string;
  keyPoints: string;
  style: string;
}

export interface UploadedFile {
  file: File;
  name: string;
  size: number;
}

export interface InteractionButton {
  text: string;
  interaction_check: string;
}

export interface InteractionInput {
  placeholder: string;
  interaction_check: string;
}

export interface InteractionData {
  buttons?: InteractionButton[];
  inputs?: InteractionInput[];
}

export interface PlayAct {
  name: string;
  act_id: string;
  content: string;
  interaction_type: 'buttons' | 'input';
  interaction_data: InteractionData;
  next_do: string;
  display_order: string;
}

export interface PodcastSegment {
  index: number;
  name: string;
  voice: string;
  start_sec: number;
  duration_sec: number;
  file: string;
  text: string;
}

export interface PodcastData {
  audioUrl: string;
  segments: PodcastSegment[];
}

export interface IllustratorPage {
  page: string;
  text: string;
  prompt: string;
  emotion: string;
  illustrator_image?: string;
}

export interface IllustratorData {
  pages: IllustratorPage[];
}

export interface ContentAsset {
  id: string;
  title: string;
  fileName: string;
  fileSize: number;
  formData: FormData;
  questionData: QuestionData;
  playData?: PlayAct[];
  podcastData?: PodcastData;
  illustratorData?: IllustratorData;
  createdAt: string;
}