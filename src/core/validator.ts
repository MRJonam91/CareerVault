// SPDX-License-Identifier: Apache-2.0
// Copyright 2026 Manoj Rollo (MRJonam91)

import { CV_INTEGRITY_PHRASE } from "./constants.ts";
import type {
  CareerProfile,
  ValidationError,
  ValidationResult,
  ValidationWarning,
  WorkExperience,
  LocalizedText,
  SupportedLanguage,
} from "./types.ts";

const DATE_REGEX = /^\d{4}-(?:0[1-9]|1[0-2])(?:-(?:0[1-9]|[12]\d|3[01]))?$/;

function parseDateToNumber(dateStr: string): number {
  const parts = dateStr.split("-").map(Number);
  const year = parts[0] ?? 1970;
  const month = parts[1] ?? 1;
  const day = parts[2] ?? 1;
  return year * 10000 + month * 100 + day;
}

function resolveText(text?: LocalizedText, lang: SupportedLanguage = "en"): string {
  if (!text) return "";
  if (typeof text === "string") return text;
  return text[lang] || text.en || text.it || "";
}

function hasBothLanguages(text?: LocalizedText): boolean {
  if (!text) return true;
  if (typeof text === "string") return true;
  return Boolean(text.it && text.it.trim() && text.en && text.en.trim());
}

export function validateProfile(profile: unknown): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  if (!profile || typeof profile !== "object") {
    errors.push({
      field: "root",
      code: "INVALID_JSON",
      message: `${CV_INTEGRITY_PHRASE}: root profile must be an object`,
    });
    return { valid: false, errors, warnings };
  }

  const p = profile as Partial<CareerProfile>;

  // Schema version
  if (!p.schemaVersion || typeof p.schemaVersion !== "string") {
    errors.push({
      field: "schemaVersion",
      code: "MISSING_SCHEMA_VERSION",
      message: "Profile must specify schemaVersion (e.g. '1.0.0')",
    });
  }

  // Basics
  if (!p.basics || typeof p.basics !== "object") {
    errors.push({
      field: "basics",
      code: "MISSING_BASICS",
      message: "Profile basics section is required",
    });
  } else {
    if (!p.basics.name || typeof p.basics.name !== "string") {
      errors.push({
        field: "basics.name",
        code: "MISSING_NAME",
        message: "Candidate name is required",
      });
    }
    if (!p.basics.email || typeof p.basics.email !== "string") {
      errors.push({
        field: "basics.email",
        code: "MISSING_EMAIL",
        message: "Contact email is required",
      });
    }
    if (!p.basics.label) {
      warnings.push({
        field: "basics.label",
        code: "MISSING_LABEL",
        message: "Professional label/headline is recommended",
        suggestion: "Add a concise title like 'Senior Platform Engineer'",
      });
    } else if (!hasBothLanguages(p.basics.label)) {
      warnings.push({
        field: "basics.label",
        code: "PARTIAL_LOCALIZATION",
        message: "Professional label is missing either Italian or English translation",
      });
    }

    if (!p.basics.summary) {
      warnings.push({
        field: "basics.summary",
        code: "MISSING_SUMMARY",
        message: "Executive career summary is recommended for CV exports",
      });
    } else if (!hasBothLanguages(p.basics.summary)) {
      warnings.push({
        field: "basics.summary",
        code: "PARTIAL_LOCALIZATION",
        message: "Executive summary is missing either Italian or English translation",
      });
    }
  }

  // Skills registry check
  const skillInventory = new Set<string>();
  const currentYear = new Date().getFullYear();
  if (Array.isArray(p.skills)) {
    for (const s of p.skills) {
      if (s && typeof s.name === "string") {
        skillInventory.add(s.name.toLowerCase().trim());
        if (s.lastUsed && parseInt(s.lastUsed, 10) < currentYear - 4) {
          warnings.push({
            field: `skills.${s.name}`,
            code: "STALE_SKILL",
            message: `Skill '${s.name}' was last used in ${s.lastUsed} (>4 years ago)`,
            suggestion: "Consider verifying current proficiency level or refreshing references",
          });
        }
      }
    }
  } else {
    warnings.push({
      field: "skills",
      code: "MISSING_SKILLS_ARRAY",
      message: "Skills inventory is empty or missing",
      suggestion: "Define categorized skills in the skills array",
    });
  }

  const referencedSkills = new Set<string>();

  // Experiences validation
  if (!Array.isArray(p.experiences) || p.experiences.length === 0) {
    warnings.push({
      field: "experiences",
      code: "EMPTY_EXPERIENCES",
      message: "No work experiences defined in profile",
    });
  } else {
    const fullTimeRanges: Array<{
      id: string;
      company: string;
      start: number;
      end: number;
      startDateStr: string;
      endDateStr: string | null;
      isConcurrent: boolean;
    }> = [];

    const SENIOR_KEYWORDS = ["senior", "lead", "staff", "principal", "head", "director", "architect"];

    p.experiences.forEach((exp: WorkExperience, idx: number) => {
      const fieldPrefix = `experiences[${idx}]`;

      if (!exp.id || typeof exp.id !== "string") {
        errors.push({
          field: `${fieldPrefix}.id`,
          code: "MISSING_ID",
          message: "Work experience missing unique ID",
        });
      }
      if (!exp.company || typeof exp.company !== "string") {
        errors.push({
          field: `${fieldPrefix}.company`,
          code: "MISSING_COMPANY",
          message: "Company name is required",
        });
      }
      if (!exp.role) {
        errors.push({
          field: `${fieldPrefix}.role`,
          code: "MISSING_ROLE",
          message: "Role title is required",
        });
      } else {
        if (!hasBothLanguages(exp.role)) {
          warnings.push({
            field: `${fieldPrefix}.role`,
            code: "PARTIAL_LOCALIZATION",
            message: `Role at '${exp.company || idx}' is missing Italian or English translation`,
          });
        }

        const roleText = resolveText(exp.role, "en").toLowerCase();
        const isSeniorRole = SENIOR_KEYWORDS.some((kw) => roleText.includes(kw));
        if (isSeniorRole && (!exp.metrics || exp.metrics.length === 0)) {
          warnings.push({
            field: `${fieldPrefix}.metrics`,
            code: "MISSING_SENIOR_METRICS",
            message: `Senior role '${resolveText(exp.role, "en")}' at '${exp.company}' has no quantified metrics`,
            suggestion: "Add business metrics (e.g. latency reduction %, team size led, cost saved)",
          });
        }
      }

      // Date validation
      if (!exp.startDate || !DATE_REGEX.test(exp.startDate)) {
        errors.push({
          field: `${fieldPrefix}.startDate`,
          code: "INVALID_DATE_FORMAT",
          message: `Invalid startDate format '${exp.startDate}'. Use YYYY-MM or YYYY-MM-DD`,
        });
      }

      let startNum = 0;
      let endNum = 99999999;

      if (exp.startDate && DATE_REGEX.test(exp.startDate)) {
        startNum = parseDateToNumber(exp.startDate);
      }

      if (exp.endDate) {
        if (!DATE_REGEX.test(exp.endDate)) {
          errors.push({
            field: `${fieldPrefix}.endDate`,
            code: "INVALID_DATE_FORMAT",
            message: `Invalid endDate format '${exp.endDate}'. Use YYYY-MM or YYYY-MM-DD`,
          });
        } else {
          endNum = parseDateToNumber(exp.endDate);
          if (endNum < startNum) {
            errors.push({
              field: `${fieldPrefix}.endDate`,
              code: "CHRONOLOGICAL_INVERSION",
              message: `${CV_INTEGRITY_PHRASE}: role at '${exp.company}' endDate (${exp.endDate}) is earlier than startDate (${exp.startDate})`,
            });
          }
        }
      } else if (!exp.isCurrent) {
        warnings.push({
          field: `${fieldPrefix}.endDate`,
          code: "AMBIGUOUS_CURRENT_ROLE",
          message: `Role at '${exp.company}' has no endDate but isCurrent is not explicitly true`,
          suggestion: "Set isCurrent: true or specify an endDate",
        });
      }

      // Track full-time overlap
      if (exp.employmentType === "full-time" && startNum > 0) {
        fullTimeRanges.push({
          id: exp.id || `${exp.company}-${idx}`,
          company: exp.company || `Role #${idx}`,
          start: startNum,
          end: endNum,
          startDateStr: exp.startDate,
          endDateStr: exp.endDate ?? null,
          isConcurrent: Boolean(exp.isConcurrent),
        });
      }

      // Skills in experience
      if (Array.isArray(exp.skills)) {
        for (const sk of exp.skills) {
          if (typeof sk === "string" && sk.trim()) {
            const clean = sk.toLowerCase().trim();
            referencedSkills.add(clean);
            if (!skillInventory.has(clean)) {
              warnings.push({
                field: `${fieldPrefix}.skills`,
                code: "UNDECLARED_SKILL",
                message: `Skill '${sk}' used in experience '${exp.company}' is not declared in root skills inventory`,
                suggestion: `Add '${sk}' to the skills list with appropriate category and proficiency`,
              });
            }
          }
        }
      }

      // Evidence check
      if (!exp.evidence || exp.evidence.length === 0) {
        warnings.push({
          field: `${fieldPrefix}.evidence`,
          code: "MISSING_EVIDENCE",
          message: `No verifiable proof (links, deliverables, references) attached to '${exp.company}'`,
          suggestion: "Provide URLs or public verification anchors for verifiable career audits",
        });
      }

      // Localization of highlights
      if (Array.isArray(exp.highlights)) {
        exp.highlights.forEach((hl, hlIdx) => {
          if (!hasBothLanguages(hl)) {
            warnings.push({
              field: `${fieldPrefix}.highlights[${hlIdx}]`,
              code: "PARTIAL_LOCALIZATION",
              message: `Highlight in '${exp.company}' lacks bilingual translation`,
            });
          }
        });
      }
    });

    // Check overlapping full-time roles
    for (let i = 0; i < fullTimeRanges.length; i++) {
      for (let j = i + 1; j < fullTimeRanges.length; j++) {
        const a = fullTimeRanges[i]!;
        const b = fullTimeRanges[j]!;
        if (a.isConcurrent || b.isConcurrent) continue;

        const overlaps = a.start <= b.end && b.start <= a.end;
        if (overlaps) {
          warnings.push({
            field: "experiences",
            code: "OVERLAPPING_FULLTIME_ROLE",
            message: `Conflicting concurrent full-time roles detected between '${a.company}' and '${b.company}' without isConcurrent: true`,
            suggestion: "If roles were genuinely concurrent, add 'isConcurrent: true'; otherwise reconcile start/end dates",
          });
        }
      }
    }

    // Gap analysis between chronological roles
    const sortedRanges = [...fullTimeRanges].sort((a, b) => a.start - b.start);
    for (let i = 0; i < sortedRanges.length - 1; i++) {
      const current = sortedRanges[i]!;
      const next = sortedRanges[i + 1]!;
      if (current.end < 99999999 && next.start > current.end) {
        const curYear = Math.floor(current.end / 10000);
        const curMonth = Math.floor((current.end % 10000) / 100);
        const nextYear = Math.floor(next.start / 10000);
        const nextMonth = Math.floor((next.start % 10000) / 100);
        const gapMonths = (nextYear - curYear) * 12 + (nextMonth - curMonth);

        if (gapMonths > 3) {
          warnings.push({
            field: "experiences",
            code: "EMPLOYMENT_GAP",
            message: `Employment gap of ${gapMonths} months detected between '${current.company}' and '${next.company}'`,
            suggestion: "Clarify whether this period was education, sabbatical, or independent consulting",
          });
        }
      }
    }
  }

  // Projects skills check
  if (Array.isArray(p.projects)) {
    p.projects.forEach((proj, idx) => {
      if (Array.isArray(proj.skills)) {
        for (const sk of proj.skills) {
          if (typeof sk === "string" && sk.trim()) {
            const clean = sk.toLowerCase().trim();
            referencedSkills.add(clean);
            if (!skillInventory.has(clean)) {
              warnings.push({
                field: `projects[${idx}].skills`,
                code: "UNDECLARED_SKILL",
                message: `Skill '${sk}' referenced in project '${proj.name}' is missing in skills inventory`,
              });
            }
          }
        }
      }
    });
  }

  // Education validation
  if (Array.isArray(p.education)) {
    p.education.forEach((edu, idx) => {
      const field = `education[${idx}]`;
      if (!edu.institution) errors.push({ field: `${field}.institution`, code: "MISSING_INSTITUTION", message: "Education institution is required" });
      if (edu.startDate && !DATE_REGEX.test(edu.startDate)) {
        errors.push({ field: `${field}.startDate`, code: "INVALID_DATE_FORMAT", message: `Invalid education startDate '${edu.startDate}'` });
      }
      if (edu.endDate && !DATE_REGEX.test(edu.endDate)) {
        errors.push({ field: `${field}.endDate`, code: "INVALID_DATE_FORMAT", message: `Invalid education endDate '${edu.endDate}'` });
      }
      if (edu.startDate && edu.endDate && DATE_REGEX.test(edu.startDate) && DATE_REGEX.test(edu.endDate)) {
        if (parseDateToNumber(edu.endDate) < parseDateToNumber(edu.startDate)) {
          errors.push({ field: `${field}.endDate`, code: "CHRONOLOGICAL_INVERSION", message: `Education at '${edu.institution}' endDate is earlier than startDate` });
        }
      }
    });
  }

  // Certifications validation
  if (Array.isArray(p.certifications)) {
    p.certifications.forEach((c, idx) => {
      const field = `certifications[${idx}]`;
      if (!c.name) errors.push({ field: `${field}.name`, code: "MISSING_CERT_NAME", message: "Certification name is required" });
      if (c.issueDate && !DATE_REGEX.test(c.issueDate)) {
        errors.push({ field: `${field}.issueDate`, code: "INVALID_DATE_FORMAT", message: `Invalid certification issueDate '${c.issueDate}'` });
      }
    });
  }

  // Orphan skills check
  for (const declared of skillInventory) {
    if (!referencedSkills.has(declared)) {
      warnings.push({
        field: "skills",
        code: "ORPHAN_SKILL",
        message: `Skill '${declared}' is declared in inventory but never demonstrated in any experience or project`,
        suggestion: "Associate the skill with relevant projects/roles or verify why it is listed",
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}
