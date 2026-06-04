import { useState } from 'react';
import ProgressBar from './ui/ProgressBar';
import StepIndicator from './ui/StepIndicator';
import Welcome from './steps/Welcome';
import GroupSelection from './steps/GroupSelection';
import BasicInfo from './steps/BasicInfo';
import SubtleQuestions from './steps/SubtleQuestions';
import Review from './steps/Review';
import type {
  AssessmentFormData,
  ValidationErrors,
  GroupType,
  SubmissionResult,
  AIAnalysisPayload,
} from '../types/assessment';

const INITIAL_FORM_DATA: AssessmentFormData = {
  respondentName: '',
  group: 'IT_STUDENT',
  common: { organizationDepartment: '' },
  itStudent: { schoolProgram: '', expectedCompletionDate: '' },
  nyscCorpMember: { programStudied: '', degreeRequired: '', serviceEndDate: '' },
  interestsAndSkills: {
    careerInterests: [],
    enjoyedSkills: [],
    workEnvironment: '',
    primaryMotivation: '',
    biggestStrength: '',
    shortTermGoal: '',
    longTermGoal: '',
    scenarioResponses: {},
  },
};

type Step = 1 | 2 | 3 | 4 | 5;

function buildAIPayload(data: AssessmentFormData): AIAnalysisPayload {
  const base = {
    respondentName: data.respondentName,
    respondentGroup: data.group,
    organizationDepartment: data.common.organizationDepartment,
    careerInterests: data.interestsAndSkills.careerInterests,
    enjoyedSkills: data.interestsAndSkills.enjoyedSkills,
    workEnvironment: data.interestsAndSkills.workEnvironment,
    primaryMotivation: data.interestsAndSkills.primaryMotivation,
    biggestStrength: data.interestsAndSkills.biggestStrength,
    shortTermGoal: data.interestsAndSkills.shortTermGoal,
    longTermGoal: data.interestsAndSkills.longTermGoal,
    scenarioResponses: data.interestsAndSkills.scenarioResponses,
  };

  if (data.group === 'IT_STUDENT') {
    return {
      ...base,
      schoolProgram: data.itStudent.schoolProgram,
      expectedCompletionDate: data.itStudent.expectedCompletionDate,
    };
  }

  return {
    ...base,
    programStudied: data.nyscCorpMember.programStudied,
    degreeRequired: data.nyscCorpMember.degreeRequired,
    serviceEndDate: data.nyscCorpMember.serviceEndDate,
  };
}

export default function AssessmentForm() {
  const [step, setStep] = useState<Step>(1);
  const [slideDirection, setSlideDirection] = useState<'forward' | 'back'>('forward');
  const [formData, setFormData] = useState<AssessmentFormData>(INITIAL_FORM_DATA);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<SubmissionResult | null>(null);
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  const patchForm = (patch: Partial<AssessmentFormData>) =>
    setFormData(prev => ({ ...prev, ...patch }));

  const validateStep = (s: Step): ValidationErrors => {
    const errs: ValidationErrors = {};
    if (s === 1) {
      if (!formData.respondentName.trim() || formData.respondentName.trim().length < 2) {
        errs.respondentName = 'Please enter your full name (at least 2 characters).';
      }
    }
    if (s === 2) {
      if (!formData.group) errs.group = 'Please select your group to continue.';
    }
    if (s === 3) {
      if (!formData.common.organizationDepartment)
        errs.organizationDepartment = 'Please select your department.';
      if (formData.group === 'IT_STUDENT') {
        if (!formData.itStudent.schoolProgram) errs.schoolProgram = 'Please select your programme.';
        if (!formData.itStudent.expectedCompletionDate)
          errs.expectedCompletionDate = 'Please enter your expected completion date.';
      } else {
        if (!formData.nyscCorpMember.programStudied)
          errs.programStudied = 'Please enter your programme studied.';
        if (!formData.nyscCorpMember.degreeRequired)
          errs.degreeRequired = 'Please enter your degree.';
        if (!formData.nyscCorpMember.serviceEndDate)
          errs.serviceEndDate = 'Please enter your service end date.';
      }
    }
    if (s === 4) {
      const ias = formData.interestsAndSkills;
      if (ias.careerInterests.length === 0)
        errs.careerInterests = 'Please select at least one career interest.';
      if (ias.enjoyedSkills.length === 0)
        errs.enjoyedSkills = 'Please select at least one skill.';
      if (!ias.workEnvironment)
        errs.workEnvironment = 'Please select your preferred work environment.';
      if (!ias.primaryMotivation)
        errs.primaryMotivation = 'Please select your primary motivation.';
      if (!ias.biggestStrength)
        errs.biggestStrength = 'Please select your biggest strength.';
      if (!ias.shortTermGoal.trim())
        errs.shortTermGoal = 'Please describe your short-term goal.';
      if (!ias.longTermGoal.trim())
        errs.longTermGoal = 'Please describe your long-term goal.';
    }
    return errs;
  };

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  const handleNext = () => {
    const errs = validateStep(step);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setSlideDirection('forward');
    setStep(prev => Math.min(5, prev + 1) as Step);
    scrollToTop();
  };

  const handleBack = () => {
    setErrors({});
    setSlideDirection('back');
    setStep(prev => Math.max(1, prev - 1) as Step);
    scrollToTop();
  };

  const handleGroupSelect = (group: GroupType) => {
    patchForm({ group });
    setErrors({});
    setTimeout(() => {
      setSlideDirection('forward');
      setStep(3);
      scrollToTop();
    }, 200);
  };

  const handleSubmit = async () => {
    setSubmissionError(null);
    setIsSubmitting(true);
    try {
      const payload = buildAIPayload(formData);
      const res = await fetch('/api/assessments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) {
        setSubmissionError(json.detail ?? 'Something went wrong. Please try again.');
      } else {
        setSubmissionResult(json as SubmissionResult);
        scrollToTop();
      }
    } catch {
      setSubmissionError('Network error. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData(INITIAL_FORM_DATA);
    setErrors({});
    setSubmissionResult(null);
    setSubmissionError(null);
    setIsSubmitting(false);
    setSlideDirection('forward');
    setStep(1);
    scrollToTop();
  };

  const cardClass = `step-card step-card--${slideDirection}`;

  return (
    <div className="app-root">
      <ProgressBar step={step} totalSteps={5} />

      <div className="form-wrapper">
        <StepIndicator currentStep={step} />

        <div className={cardClass} key={step}>
          {step === 1 && (
            <Welcome
              respondentName={formData.respondentName}
              onChange={name => patchForm({ respondentName: name })}
              errors={errors}
              onNext={handleNext}
            />
          )}
          {step === 2 && (
            <GroupSelection
              selected={formData.group}
              onSelect={handleGroupSelect}
              errors={errors}
            />
          )}
          {step === 3 && (
            <BasicInfo
              formData={formData}
              errors={errors}
              onChange={patchForm}
              onNext={handleNext}
              onBack={handleBack}
            />
          )}
          {step === 4 && (
            <SubtleQuestions
              formData={formData}
              errors={errors}
              onChange={patchForm}
              onNext={handleNext}
              onBack={handleBack}
            />
          )}
          {step === 5 && (
            <Review
              formData={formData}
              isSubmitting={isSubmitting}
              submissionResult={submissionResult}
              submissionError={submissionError}
              onSubmit={handleSubmit}
              onBack={handleBack}
              onReset={handleReset}
            />
          )}
        </div>
      </div>
    </div>
  );
}
