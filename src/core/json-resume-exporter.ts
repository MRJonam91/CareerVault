// SPDX-License-Identifier: Apache-2.0
// Copyright 2026 Manoj Rollo (MRJonam91)

import type { CareerProfile, LocalizedText, SupportedLanguage } from "./types.ts";

function resolveText(text?: LocalizedText, lang: SupportedLanguage = "en"): string {
  if (!text) return "";
  if (typeof text === "string") return text;
  return text[lang] || text.en || text.it || "";
}

export interface JsonResume {
  basics: {
    name: string;
    label?: string;
    email?: string;
    phone?: string;
    url?: string;
    summary?: string;
    location?: {
      city?: string;
      region?: string;
      countryCode?: string;
    };
    profiles?: Array<{
      network: string;
      username: string;
      url: string;
    }>;
  };
  work: Array<{
    name: string;
    position: string;
    url?: string;
    startDate: string;
    endDate?: string;
    summary?: string;
    highlights?: string[];
  }>;
  education: Array<{
    institution: string;
    area: string;
    studyType: string;
    startDate: string;
    endDate?: string;
    score?: string;
  }>;
  skills: Array<{
    name: string;
    level?: string;
    keywords?: string[];
  }>;
  projects: Array<{
    name: string;
    description: string;
    highlights?: string[];
    keywords?: string[];
    startDate?: string;
    endDate?: string;
    url?: string;
  }>;
  certificates: Array<{
    name: string;
    issuer: string;
    date: string;
    url?: string;
  }>;
  languages: Array<{
    language: string;
    fluency: string;
  }>;
  meta: {
    canonical: string;
    version: string;
    lastModified: string;
  };
}

export function exportJsonResume(
  profile: CareerProfile,
  options: { lang: SupportedLanguage } = { lang: "en" }
): JsonResume {
  const lang = options.lang;
  const b = profile.basics;

  const work = (profile.experiences ?? []).map((exp) => {
    const highlights = (exp.highlights ?? []).map((h) => resolveText(h, lang));
    if (exp.metrics) {
      for (const m of exp.metrics) {
        highlights.push(`${m.value} — ${resolveText(m.label, lang)}`);
      }
    }
    return {
      name: exp.company,
      position: resolveText(exp.role, lang),
      startDate: exp.startDate,
      endDate: exp.endDate ?? undefined,
      summary: resolveText(exp.summary, lang) || undefined,
      highlights: highlights.length > 0 ? highlights : undefined,
    };
  });

  const education = (profile.education ?? []).map((edu) => ({
    institution: edu.institution,
    area: resolveText(edu.area, lang),
    studyType: resolveText(edu.studyType, lang),
    startDate: edu.startDate,
    endDate: edu.endDate ?? undefined,
    score: edu.score,
  }));

  // Group skills by category
  const skillsMap = new Map<string, string[]>();
  for (const sk of profile.skills ?? []) {
    const cat = sk.category || "General";
    if (!skillsMap.has(cat)) skillsMap.set(cat, []);
    skillsMap.get(cat)!.push(sk.name);
  }

  const skills = Array.from(skillsMap.entries()).map(([cat, list]) => ({
    name: cat,
    keywords: list,
  }));

  const projects = (profile.projects ?? []).map((p) => ({
    name: p.name,
    description: resolveText(p.description, lang),
    highlights: (p.highlights ?? []).map((h) => resolveText(h, lang)),
    keywords: p.skills,
    startDate: p.startDate,
    endDate: p.endDate ?? undefined,
    url: p.url,
  }));

  const certificates = (profile.certifications ?? []).map((c) => ({
    name: c.name,
    issuer: c.issuer,
    date: c.issueDate,
    url: c.url,
  }));

  const languages = (profile.languages ?? []).map((l) => ({
    language: resolveText(l.language, lang),
    fluency: l.fluency,
  }));

  return {
    basics: {
      name: b.name,
      label: resolveText(b.label, lang) || undefined,
      email: b.email,
      phone: b.phone,
      url: b.url,
      summary: resolveText(b.summary, lang) || undefined,
      location: b.location,
      profiles: b.profiles,
    },
    work,
    education,
    skills,
    projects,
    certificates,
    languages,
    meta: {
      canonical: "https://github.com/MRJonam91/CareerVault",
      version: "1.0.0",
      lastModified: new Date().toISOString(),
    },
  };
}
