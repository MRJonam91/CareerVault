// SPDX-License-Identifier: Apache-2.0
// Copyright 2026 Manoj Rollo (MRJonam91)

import type { CareerProfile, CareerStats, LocalizedText, SupportedLanguage } from "./types.ts";

function parseYearMonth(dateStr?: string | null): { year: number; month: number } | null {
  if (!dateStr) return null;
  const parts = dateStr.split("-").map(Number);
  const year = parts[0];
  const month = parts[1] ?? 1;
  if (!year || isNaN(year)) return null;
  return { year, month };
}

function resolveText(text?: LocalizedText, lang: SupportedLanguage = "en"): string {
  if (!text) return "";
  if (typeof text === "string") return text;
  return text[lang] || text.en || text.it || "";
}

function isBilingual(text?: LocalizedText): boolean {
  if (!text) return false;
  if (typeof text === "string") return false;
  return Boolean(text.it && text.it.trim() && text.en && text.en.trim());
}

export function getCareerStats(profile: CareerProfile): CareerStats {
  const experiences = profile.experiences ?? [];
  const uniqueMonths = new Set<string>();

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  let activeRolesCount = 0;
  let evidenceCount = 0;
  let bilingualCheckCount = 0;
  let bilingualPassCount = 0;

  // Check basics
  if (profile.basics) {
    if (profile.basics.label) {
      bilingualCheckCount++;
      if (isBilingual(profile.basics.label)) bilingualPassCount++;
    }
    if (profile.basics.summary) {
      bilingualCheckCount++;
      if (isBilingual(profile.basics.summary)) bilingualPassCount++;
    }
  }

  let latestExp = experiences[0];

  for (const exp of experiences) {
    if (exp.isCurrent || !exp.endDate) {
      activeRolesCount++;
    }

    if (exp.evidence && exp.evidence.length > 0) {
      evidenceCount++;
    }

    // Bilingual checks
    if (exp.role) {
      bilingualCheckCount++;
      if (isBilingual(exp.role)) bilingualPassCount++;
    }
    if (exp.summary) {
      bilingualCheckCount++;
      if (isBilingual(exp.summary)) bilingualPassCount++;
    }
    if (Array.isArray(exp.highlights)) {
      for (const hl of exp.highlights) {
        bilingualCheckCount++;
        if (isBilingual(hl)) bilingualPassCount++;
      }
    }

    const start = parseYearMonth(exp.startDate);
    if (!start) continue;

    let end = parseYearMonth(exp.endDate);
    if (!end || exp.isCurrent) {
      end = { year: currentYear, month: currentMonth };
    }

    // Enumerate months between start and end
    let curYear = start.year;
    let curMonth = start.month;
    while (
      curYear < end.year ||
      (curYear === end.year && curMonth <= end.month)
    ) {
      uniqueMonths.add(`${curYear}-${String(curMonth).padStart(2, "0")}`);
      curMonth++;
      if (curMonth > 12) {
        curMonth = 1;
        curYear++;
      }
    }
  }

  const totalExperienceMonths = uniqueMonths.size;
  const years = Math.floor(totalExperienceMonths / 12);
  const remainingMonths = totalExperienceMonths % 12;

  const totalExperienceFormatted = {
    it:
      years > 0
        ? `${years} ${years === 1 ? "anno" : "anni"}${
            remainingMonths > 0 ? ` e ${remainingMonths} ${remainingMonths === 1 ? "mese" : "mesi"}` : ""
          }`
        : `${remainingMonths} ${remainingMonths === 1 ? "mese" : "mesi"}`,
    en:
      years > 0
        ? `${years} ${years === 1 ? "year" : "years"}${
            remainingMonths > 0 ? ` and ${remainingMonths} ${remainingMonths === 1 ? "month" : "months"}` : ""
          }`
        : `${remainingMonths} ${remainingMonths === 1 ? "month" : "months"}`,
  };

  // Skills by category
  const skillsByCategory: Record<string, number> = {};
  for (const s of profile.skills ?? []) {
    const cat = s.category || "other";
    skillsByCategory[cat] = (skillsByCategory[cat] ?? 0) + 1;
  }

  const evidenceCoveragePercent =
    experiences.length > 0 ? Math.round((evidenceCount / experiences.length) * 100) : 0;

  const bilingualCoveragePercent =
    bilingualCheckCount > 0 ? Math.round((bilingualPassCount / bilingualCheckCount) * 100) : 100;

  return {
    totalExperienceMonths,
    totalExperienceFormatted,
    activeRolesCount,
    totalRolesCount: experiences.length,
    skillsCount: (profile.skills ?? []).length,
    skillsByCategory,
    evidenceCoveragePercent,
    bilingualCoveragePercent,
    latestRoleTitle: latestExp ? resolveText(latestExp.role, "en") : undefined,
    latestCompany: latestExp?.company,
  };
}
