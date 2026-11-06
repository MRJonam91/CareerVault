// SPDX-License-Identifier: Apache-2.0
// Copyright 2026 Manoj Rollo (MRJonam91)

export type SupportedLanguage = "it" | "en";

export type LocalizedText =
  | string
  | {
      it: string;
      en: string;
    };

export interface SocialProfile {
  network: string;
  username: string;
  url: string;
}

export interface ProfileLocation {
  city?: string;
  region?: string;
  countryCode?: string;
}

export interface Basics {
  name: string;
  label: LocalizedText;
  email: string;
  phone?: string;
  url?: string;
  summary: LocalizedText;
  location?: ProfileLocation;
  profiles?: SocialProfile[];
}

export type EmploymentType =
  | "full-time"
  | "part-time"
  | "contract"
  | "freelance"
  | "internship";

export interface CareerMetric {
  label: LocalizedText;
  value: string;
  impact?: LocalizedText;
}

export interface WorkExperience {
  id: string;
  company: string;
  role: LocalizedText;
  employmentType: EmploymentType;
  location?: string;
  startDate: string; // YYYY-MM or YYYY-MM-DD
  endDate?: string | null;
  isCurrent?: boolean;
  isConcurrent?: boolean;
  summary?: LocalizedText;
  highlights: LocalizedText[];
  metrics?: CareerMetric[];
  skills: string[];
  evidence?: string[];
}

export interface EducationEntry {
  id: string;
  institution: string;
  area: LocalizedText;
  studyType: LocalizedText;
  startDate: string;
  endDate?: string | null;
  score?: string;
  courses?: LocalizedText[];
}

export type SkillCategory =
  | "languages"
  | "frameworks"
  | "databases"
  | "cloud-devops"
  | "architecture"
  | "tools"
  | "management"
  | "other";

export type SkillLevel = "beginner" | "intermediate" | "advanced" | "expert";

export interface SkillEntry {
  name: string;
  category: SkillCategory;
  level?: SkillLevel;
  yearsOfExperience?: number;
  lastUsed?: string;
}

export interface ProjectEntry {
  id: string;
  name: string;
  role?: LocalizedText;
  description: LocalizedText;
  url?: string;
  highlights?: LocalizedText[];
  skills: string[];
  startDate?: string;
  endDate?: string | null;
}

export interface CertificationEntry {
  id: string;
  name: string;
  issuer: string;
  issueDate: string;
  expiryDate?: string | null;
  credentialId?: string;
  url?: string;
}

export type LanguageFluency =
  | "native"
  | "fluent"
  | "c2"
  | "c1"
  | "b2"
  | "b1"
  | "a2"
  | "a1";

export interface LanguageEntry {
  language: LocalizedText;
  fluency: LanguageFluency;
}

export interface CareerProfile {
  schemaVersion: "1.0.0" | string;
  basics: Basics;
  experiences: WorkExperience[];
  education?: EducationEntry[];
  skills: SkillEntry[];
  projects?: ProjectEntry[];
  certifications?: CertificationEntry[];
  languages?: LanguageEntry[];
  meta?: {
    lastUpdated?: string;
    version?: string;
    notes?: string;
  };
}

export interface ValidationError {
  field: string;
  code: string;
  message: string;
}

export interface ValidationWarning {
  field: string;
  code: string;
  message: string;
  suggestion?: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface CareerStats {
  totalExperienceMonths: number;
  totalExperienceFormatted: {
    it: string;
    en: string;
  };
  activeRolesCount: number;
  totalRolesCount: number;
  skillsCount: number;
  skillsByCategory: Record<string, number>;
  evidenceCoveragePercent: number;
  bilingualCoveragePercent: number;
  latestRoleTitle?: string;
  latestCompany?: string;
}
