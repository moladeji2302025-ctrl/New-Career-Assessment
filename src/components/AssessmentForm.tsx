import { useState, useMemo, useEffect } from 'react';
import type { AnswerMap, AnswerValue } from '../types/question';
import type { SubmissionResult } from '../types/assessment';
import {
  getActiveQuestions,
  buildPayload,
  resolveAutofill,
} from '../data/questionBank';
import ProgressBar from './ui/ProgressBar';
import QuestionPage from './QuestionPage';
import ReviewPage from './ReviewPage';

const STORAGE_KEY = 'career-assessment-v1';

interface PersistedState {
  answers: AnswerMap;
  currentIndex: number;
  showReview: boolean;
}

function loadProgress(): PersistedState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PersistedState;
  } catch {
    return null;
  }
}

function saveProgress(state: PersistedState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // storage quota exceeded or private browsing — fail silently
  }
}

function clearProgress() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

export default function AssessmentForm() {
  const saved = useMemo(() => loadProgress(), []);

  const [answers, setAnswers] = useState<AnswerMap>(saved?.answers ?? {});
  const [currentIndex, setCurrentIndex] = useState(saved?.currentIndex ?? 0);
  const [slideDirection, setSlideDirection] = useState<'forward' | 'back'>('forward');
  const [showReview, setShowReview] = useState(saved?.showReview ?? false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<SubmissionResult | null>(null);
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  // Recompute active questions whenever answers change (handles group switching)
  const activeQuestions = useMemo(() => getActiveQuestions(answers), [answers]);

  // Clamp restored index in case question list shrank (e.g. group changed)
  const safeIndex = Math.min(currentIndex, Math.max(0, activeQuestions.length - 1));
  useEffect(() => {
    if (safeIndex !== currentIndex) setCurrentIndex(safeIndex);
  }, [safeIndex, currentIndex]);

  // Persist progress on every meaningful state change
  useEffect(() => {
    if (submissionResult) return; // don't overwrite with a completed state
    saveProgress({ answers, currentIndex: safeIndex, showReview });
  }, [answers, safeIndex, showReview, submissionResult]);

  const currentQuestion = activeQuestions[safeIndex];
  const totalQuestions = activeQuestions.length;

  const handleAnswer = (id: string, value: AnswerValue) => {
    setError(null);
    setAnswers(prev => {
      const next = { ...prev, [id]: value };

      // Auto-fill degree when program studied changes
      if (id === 'q_program_studied') {
        const resolved = resolveAutofill('q_degree', next);
        if (resolved) next.q_degree = resolved;
      }

      // Clear group-specific answers when group changes
      if (id === 'q_group' && prev.q_group !== value) {
        delete next.q_school_program;
        delete next.q_completion_date;
        delete next.q_program_studied;
        delete next.q_degree;
        delete next.q_service_end;
      }

      return next;
    });
  };

  const validateCurrent = (): string | null => {
    if (!currentQuestion) return null;
    if (!currentQuestion.required) return null;

    const val = answers[currentQuestion.id];
    if (!val) return 'Please answer this question to continue.';
    if (typeof val === 'string' && val.trim() === '') return 'Please answer this question to continue.';
    if (Array.isArray(val)) {
      const min = currentQuestion.minSelections ?? 1;
      if (val.length < min) return `Please select at least ${min} option${min > 1 ? 's' : ''}.`;
    }
    if (currentQuestion.id === 'q_name' && (val as string).trim().length < 2) {
      return 'Please enter your full name (at least 2 characters).';
    }
    return null;
  };

  const scrollTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  const handleNext = () => {
    const err = validateCurrent();
    if (err) { setError(err); return; }
    setError(null);

    if (safeIndex >= totalQuestions - 1) {
      setSlideDirection('forward');
      setShowReview(true);
      scrollTop();
    } else {
      setSlideDirection('forward');
      setCurrentIndex(i => i + 1);
      scrollTop();
    }
  };

  const handleBack = () => {
    setError(null);
    if (showReview) {
      setSlideDirection('back');
      setShowReview(false);
      scrollTop();
      return;
    }
    if (safeIndex > 0) {
      setSlideDirection('back');
      setCurrentIndex(i => i - 1);
      scrollTop();
    }
  };

  const handleSubmit = async () => {
    setSubmissionError(null);
    setIsSubmitting(true);
    try {
      const payload = buildPayload(answers);
      const res = await fetch('/api/assessments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json() as Record<string, unknown>;
      if (!res.ok) {
        setSubmissionError((json.detail as string) ?? 'Something went wrong. Please try again.');
      } else {
        clearProgress(); // wipe saved progress — report is ready
        setSubmissionResult(json as unknown as SubmissionResult);
        scrollTop();
      }
    } catch {
      setSubmissionError('Network error — please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    clearProgress();
    setAnswers({});
    setCurrentIndex(0);
    setSlideDirection('forward');
    setShowReview(false);
    setError(null);
    setIsSubmitting(false);
    setSubmissionResult(null);
    setSubmissionError(null);
    scrollTop();
  };

  // Progress: question index out of total + review step
  const progressStep = showReview ? totalQuestions + 1 : safeIndex + 1;
  const progressTotal = totalQuestions + 1;

  return (
    <div className="app-root">
      <ProgressBar step={progressStep} totalSteps={progressTotal} />

      <header className="org-header">
        <img
          src="/WhatsApp_Image_2026-03-09_at_13.36.49-removebg-preview.png"
          alt="NigComSat — African Rooted, Globally Positioned"
          className="org-header__logo"
        />
      </header>

      <div className="form-wrapper">
        {showReview ? (
          <div className="step-card step-card--forward" key="review">
            <ReviewPage
              activeQuestions={activeQuestions}
              answers={answers}
              isSubmitting={isSubmitting}
              submissionResult={submissionResult}
              submissionError={submissionError}
              onSubmit={handleSubmit}
              onBack={handleBack}
              onReset={handleReset}
            />
          </div>
        ) : currentQuestion ? (
          <QuestionPage
            key={currentQuestion.id}
            question={currentQuestion}
            value={answers[currentQuestion.id]}
            allAnswers={answers}
            onChange={handleAnswer}
            error={error}
            questionNumber={safeIndex + 1}
            totalQuestions={totalQuestions}
            onNext={handleNext}
            onBack={handleBack}
            isFirst={safeIndex === 0}
            slideDirection={slideDirection}
          />
        ) : null}
      </div>
    </div>
  );
}
