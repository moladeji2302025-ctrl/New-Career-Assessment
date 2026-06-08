export type QuestionType =
  | 'text'
  | 'text-autofill'
  | 'single-select-card'
  | 'single-select-dropdown'
  | 'multi-select-pill'
  | 'categorized-multi-select'
  | 'date'
  | 'textarea';

export type AnswerValue = string | string[];
export type AnswerMap = Record<string, AnswerValue>;

export interface QuestionOption {
  value: string;
  label: string;
  description?: string;
}

export interface QuestionOptionGroup {
  group: string;
  options: QuestionOption[];
}

export interface Question {
  id: string;
  type: QuestionType;
  question: string;
  hint?: string;
  required: boolean;
  shuffleable: boolean;
  condition?: (answers: AnswerMap) => boolean;
  options?: QuestionOption[];
  optionGroups?: QuestionOptionGroup[];
  placeholder?: string;
  rows?: number;
  datalistOptions?: string[];
  minSelections?: number;
  columns?: 1 | 2;
  multiSelect?: boolean; // single-select-card questions that allow multiple picks
}
