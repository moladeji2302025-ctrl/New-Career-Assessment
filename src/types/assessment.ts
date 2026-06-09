export type GroupType = 'IT_STUDENT' | 'NYSC_CORP_MEMBER';

export interface WelcomeFields {
  respondentName: string;
}

export interface CommonFields {
  organizationDepartment: string;
}

export interface ITStudentFields {
  schoolProgram: string;
  expectedCompletionDate: string;
}

export interface NYSCCorpMemberFields {
  programStudied: string;
  degreeRequired: string;
  serviceEndDate: string;
}

export interface InterestsAndSkillsFields {
  careerInterests: string[];
  enjoyedSkills: string[];
  workEnvironment: string;
  primaryMotivation: string;
  biggestStrength: string;
  shortTermGoal: string;
  longTermGoal: string;
  scenarioResponses: Record<string, string>;
}

export interface AssessmentFormData {
  respondentName: string;
  group: GroupType;
  common: CommonFields;
  itStudent: ITStudentFields;
  nyscCorpMember: NYSCCorpMemberFields;
  interestsAndSkills: InterestsAndSkillsFields;
}

export interface AIAnalysisPayload {
  respondentName: string;
  respondentGroup: GroupType;
  organizationDepartment: string;

  schoolProgram?: string;
  expectedCompletionDate?: string;

  programStudied?: string;
  degreeRequired?: string;
  serviceEndDate?: string;

  careerInterests: string[];
  enjoyedSkills: string[];
  workEnvironment: string;
  primaryMotivation: string;
  biggestStrength: string;
  shortTermGoal: string;
  longTermGoal: string;
  scenarioResponses: Record<string, string>;
  organizationRolePreference?: string;
  collaborationStyle?: string;
}

export type ValidationErrors = Partial<
  Record<
    | keyof WelcomeFields
    | keyof CommonFields
    | keyof ITStudentFields
    | keyof NYSCCorpMemberFields
    | keyof InterestsAndSkillsFields
    | 'group',
    string
  >
>;

export interface SubmissionResult {
  id: string;
  submittedAt: string;
  aiReport: string;
  recommendedDepartment: string;
  departmentReason: string;
}
