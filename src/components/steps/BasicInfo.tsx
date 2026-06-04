import { useEffect } from 'react';
import FormField from '../ui/FormField';
import type { AssessmentFormData, ValidationErrors } from '../../types/assessment';
import { ORGANIZATION_DEPARTMENTS } from '../../data/organizationDepartments';
import { NIGERIAN_UNIVERSITY_PROGRAM_LIST } from '../../data/nigerianUniversityPrograms';
import { PROGRAM_NAMES, getDegreeForProgram } from '../../data/programDegreeMapping';

interface BasicInfoProps {
  formData: AssessmentFormData;
  errors: ValidationErrors;
  onChange: (patch: Partial<AssessmentFormData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function BasicInfo({ formData, errors, onChange, onNext, onBack }: BasicInfoProps) {
  const isNYSC = formData.group === 'NYSC_CORP_MEMBER';

  const setCommon = (key: string, value: string) =>
    onChange({ common: { ...formData.common, [key]: value } });

  const setIT = (key: string, value: string) =>
    onChange({ itStudent: { ...formData.itStudent, [key]: value } });

  const setNYSC = (key: string, value: string) =>
    onChange({ nyscCorpMember: { ...formData.nyscCorpMember, [key]: value } });

  useEffect(() => {
    if (!isNYSC) return;
    const program = formData.nyscCorpMember.programStudied;
    if (!program) return;
    const resolved = getDegreeForProgram(program);
    if (resolved) {
      setNYSC('degreeRequired', resolved);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.nyscCorpMember.programStudied]);

  const programStudied = formData.nyscCorpMember.programStudied;
  const degreeResolved = programStudied ? getDegreeForProgram(programStudied) : '';
  const programTyped = programStudied.length > 1;
  const isUnrecognised = programTyped && !degreeResolved;
  const isAutoFilled = programTyped && !!degreeResolved;

  return (
    <div>
      <h2 className="step-title">Your Background</h2>
      <p className="step-subtitle">Tell us a little about your programme and department.</p>
      <div className="step-divider" aria-hidden="true" />

      <div className="form-stack">
        {/* Department */}
        <FormField label="Organisation Department" htmlFor="orgDept" error={errors.organizationDepartment}>
          <select
            id="orgDept"
            value={formData.common.organizationDepartment}
            onChange={e => setCommon('organizationDepartment', e.target.value)}
          >
            <option value="">Select department</option>
            {ORGANIZATION_DEPARTMENTS.map(group => (
              <optgroup key={group.group} label={group.group}>
                {group.departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </optgroup>
            ))}
          </select>
        </FormField>

        {/* IT Student */}
        {!isNYSC && (
          <>
            <FormField label="Programme / Department in School" htmlFor="schoolProgram" error={errors.schoolProgram}>
              <select
                id="schoolProgram"
                value={formData.itStudent.schoolProgram}
                onChange={e => setIT('schoolProgram', e.target.value)}
              >
                <option value="">Select your programme</option>
                {NIGERIAN_UNIVERSITY_PROGRAM_LIST.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </FormField>

            <FormField label="Expected Completion Date" htmlFor="completionDate" error={errors.expectedCompletionDate}>
              <input
                id="completionDate"
                type="date"
                value={formData.itStudent.expectedCompletionDate}
                onChange={e => setIT('expectedCompletionDate', e.target.value)}
              />
            </FormField>
          </>
        )}

        {/* NYSC */}
        {isNYSC && (
          <>
            <FormField label="Programme Studied" htmlFor="programStudied" error={errors.programStudied}>
              <input
                id="programStudied"
                type="text"
                list="program-list"
                placeholder="E.g. Computer Science, Law, Accounting"
                value={formData.nyscCorpMember.programStudied}
                onChange={e => setNYSC('programStudied', e.target.value)}
                autoComplete="off"
              />
              <datalist id="program-list">
                {PROGRAM_NAMES.map(p => <option key={p} value={p} />)}
              </datalist>
            </FormField>

            <FormField
              label="Degree Required"
              htmlFor="degreeRequired"
              error={errors.degreeRequired}
              badge={
                isAutoFilled
                  ? <span className="badge-autofill">✦ Auto-filled</span>
                  : isUnrecognised
                  ? <span className="badge-warning">⚠ Not recognised — enter manually</span>
                  : undefined
              }
            >
              <input
                id="degreeRequired"
                type="text"
                placeholder="E.g. B.Sc. Computer Science"
                value={formData.nyscCorpMember.degreeRequired}
                onChange={e => setNYSC('degreeRequired', e.target.value)}
              />
            </FormField>

            <FormField label="Service End Date" htmlFor="serviceEndDate" error={errors.serviceEndDate}>
              <input
                id="serviceEndDate"
                type="date"
                value={formData.nyscCorpMember.serviceEndDate}
                onChange={e => setNYSC('serviceEndDate', e.target.value)}
              />
            </FormField>
          </>
        )}
      </div>

      <div className="nav-row">
        <button type="button" className="btn-secondary" onClick={onBack}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
          </svg>
          Back
        </button>
        <button type="button" className="btn-primary" onClick={onNext}>
          Continue
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
          </svg>
        </button>
      </div>
    </div>
  );
}
