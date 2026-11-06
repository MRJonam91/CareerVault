// SPDX-License-Identifier: Apache-2.0
// Copyright 2026 Manoj Rollo (MRJonam91)

import type {
  CareerProfile,
  LocalizedText,
  SupportedLanguage,
  WorkExperience,
  EducationEntry,
  SkillEntry,
  ProjectEntry,
  CertificationEntry,
  LanguageEntry,
  SkillCategory,
  LanguageFluency,
} from "./types.ts";

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

export function importJsonResume(raw: unknown): CareerProfile {
  if (!raw || typeof raw !== "object") {
    throw new Error("Invalid JSON Resume input: must be an object");
  }
  const r = raw as Record<string, any>;
  const b = r["basics"] ?? {};

  const experiences: WorkExperience[] = Array.isArray(r["work"])
    ? r["work"].map((w: any, idx: number) => ({
        id: `exp-${idx + 1}-${String(w.name || "role").toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
        company: w.name || "Company",
        role: w.position || "Developer",
        employmentType: "full-time",
        startDate: w.startDate || "2020-01",
        endDate: w.endDate ?? null,
        isCurrent: !w.endDate,
        summary: w.summary || undefined,
        highlights: Array.isArray(w.highlights) ? w.highlights : [],
        skills: Array.isArray(w.keywords) ? w.keywords : [],
      }))
    : [];

  const skills: SkillEntry[] = [];
  if (Array.isArray(r["skills"])) {
    for (const s of r["skills"]) {
      if (Array.isArray(s.keywords) && s.keywords.length > 0) {
        for (const kw of s.keywords) {
          skills.push({
            name: String(kw),
            category: (s.name?.toLowerCase().includes("lang") ? "languages" : "tools") as SkillCategory,
            level: s.level ? (String(s.level).toLowerCase() as any) : undefined,
          });
        }
      } else if (s.name) {
        skills.push({
          name: String(s.name),
          category: "tools",
          level: s.level ? (String(s.level).toLowerCase() as any) : undefined,
        });
      }
    }
  }

  const education: EducationEntry[] = Array.isArray(r["education"])
    ? r["education"].map((edu: any, idx: number) => ({
        id: `edu-${idx + 1}`,
        institution: edu.institution || "University",
        area: edu.area || "Studies",
        studyType: edu.studyType || "Degree",
        startDate: edu.startDate || "2015-09",
        endDate: edu.endDate ?? null,
        score: edu.score,
      }))
    : [];

  const projects: ProjectEntry[] = Array.isArray(r["projects"])
    ? r["projects"].map((p: any, idx: number) => ({
        id: `proj-${idx + 1}`,
        name: p.name || "Project",
        description: p.description || "",
        highlights: Array.isArray(p.highlights) ? p.highlights : [],
        skills: Array.isArray(p.keywords) ? p.keywords : [],
        startDate: p.startDate,
        endDate: p.endDate ?? null,
        url: p.url,
      }))
    : [];

  const certifications: CertificationEntry[] = Array.isArray(r["certificates"])
    ? r["certificates"].map((c: any, idx: number) => ({
        id: `cert-${idx + 1}`,
        name: c.name || "Certificate",
        issuer: c.issuer || "Issuer",
        issueDate: c.date || "2023-01",
        url: c.url,
      }))
    : [];

  const languages: LanguageEntry[] = Array.isArray(r["languages"])
    ? r["languages"].map((l: any) => ({
        language: l.language || "English",
        fluency: (String(l.fluency || "fluent").toLowerCase() as LanguageFluency) || "fluent",
      }))
    : [];

  return {
    schemaVersion: "1.0.0",
    basics: {
      name: b.name || "Unnamed",
      label: b.label || "Professional",
      email: b.email || "email@example.com",
      phone: b.phone,
      url: b.url,
      summary: b.summary || "",
      location: b.location,
      profiles: b.profiles,
    },
    experiences,
    skills,
    education,
    projects,
    certifications,
    languages,
    meta: {
      lastUpdated: new Date().toISOString().split("T")[0],
      version: "1.0.0",
      notes: "Imported from JSON Resume format",
    },
  };
}
