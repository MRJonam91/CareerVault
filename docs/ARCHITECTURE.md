# CareerVault Architecture

CareerVault serves as the deterministic **Single Source of Truth** for career histories, professional achievements, and verifiable portfolios. It solves career drift, resume contradiction, and inconsistent credentials across different platforms and localized formats.

## System Design & Component Overview

```
                      ┌───────────────────────────┐
                      │    career.json Ledger     │
                      │  (CareerProfile Schema)   │
                      └─────────────┬─────────────┘
                                    │
                                    ▼
                      ┌───────────────────────────┐
                      │    Validator & Auditor    │
                      │  (Consistency & Anomalies)│
                      └─────────────┬─────────────┘
                                    │
         ┌──────────────────────────┼──────────────────────────┐
         │                          │                          │
         ▼                          ▼                          ▼
┌──────────────────┐      ┌──────────────────┐       ┌──────────────────┐
│ Markdown Export  │      │ JSON Resume Exp. │       │ Career Telemetry │
│ (Italian/English)│      │ (Schema.org Std) │       │ (Deduplication)  │
└──────────────────┘      └──────────────────┘       └──────────────────┘
```

## Core Modules (`src/core/`)

1. **`types.ts`**:
   - Comprehensive strongly typed schema representing career primitives: `Basics`, `WorkExperience`, `EducationEntry`, `SkillEntry`, `ProjectEntry`, `CertificationEntry`, and `LanguageEntry`.
   - Supports bilingual fields (`LocalizedText`: `{ it: string; en: string }` or plain strings).

2. **`validator.ts`**:
   - Schema validation and chronological integrity verification.
   - **Chronological Inversion Guard**: Ensures `endDate >= startDate`.
   - **Concurrency / Overlap Engine**: Detects conflicting overlapping full-time employments unless explicitly designated with `isConcurrent: true`.
   - **Skill Taxonomy Audit**: Identifies undeclared skills used in experiences and orphan skills declared but never demonstrated.
   - **Localization Completeness**: Audits bilingual balance between Italian and English text.

3. **`markdown-exporter.ts`**:
   - Produces clean, readable, publication-ready Markdown CVs in Italian (`--lang it`) or English (`--lang en`).
   - Localized headers, date formats ("Gen 2023 — Presente" vs "Jan 2023 — Present"), achievement bullet points, metrics, and skill tags.

4. **`json-resume-exporter.ts`**:
   - Seamlessly converts CareerVault profiles into standard [JSON Resume](https://jsonresume.org) files.

5. **`stats.ts`**:
   - Calculates true, deduplicated career experience duration (months/years) by resolving overlapping date intervals into a unified timeline.
   - Computes evidence coverage score and skill distribution.

## Core Size & Architectural Constraints

- **Strict Core Size Guard**: The core directory (`src/core/`) must stay strictly under **1,500 non-empty lines** to guarantee auditability and simplicity.
- **Zero External Runtime Dependencies**: Standard library only (`node:fs`, `node:path`).
