// SPDX-License-Identifier: Apache-2.0
// Copyright 2026 Manoj Rollo (MRJonam91)

import { anonymizeProfile } from "./anonymizer.ts";
import type {
  CareerProfile,
  ExportOptions,
  LocalizedText,
  SupportedLanguage,
} from "./types.ts";

const MONTHS_IT = ["Gen", "Feb", "Mar", "Apr", "Mag", "Giu", "Lug", "Ago", "Set", "Ott", "Nov", "Dic"];
const MONTHS_EN = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function resolveText(text?: LocalizedText, lang: SupportedLanguage = "en"): string {
  if (!text) return "";
  if (typeof text === "string") return text;
  return text[lang] || text.en || text.it || "";
}

function formatDateString(dateStr?: string | null, lang: SupportedLanguage = "en"): string {
  if (!dateStr) return "";
  const parts = dateStr.split("-");
  const year = parts[0];
  const monthIdx = parts[1] ? parseInt(parts[1], 10) - 1 : undefined;

  if (monthIdx !== undefined && monthIdx >= 0 && monthIdx < 12) {
    const monthName = lang === "it" ? MONTHS_IT[monthIdx] : MONTHS_EN[monthIdx];
    return `${monthName} ${year}`;
  }
  return year ?? "";
}

function formatPeriod(
  startDate: string,
  endDate: string | null | undefined,
  isCurrent: boolean | undefined,
  lang: SupportedLanguage
): string {
  const start = formatDateString(startDate, lang);
  if (isCurrent || !endDate) {
    const presentLabel = lang === "it" ? "Presente" : "Present";
    return `${start} — ${presentLabel}`;
  }
  const end = formatDateString(endDate, lang);
  return `${start} — ${end}`;
}

const CATEGORY_LABELS: Record<string, { it: string; en: string }> = {
  languages: { it: "Linguaggi", en: "Programming Languages" },
  frameworks: { it: "Framework e Librerie", en: "Frameworks & Libraries" },
  databases: { it: "Basi di Dati", en: "Databases & Storage" },
  "cloud-devops": { it: "Cloud e DevOps", en: "Cloud & DevOps" },
  architecture: { it: "Architettura e Metodologie", en: "Architecture & Patterns" },
  tools: { it: "Strumenti", en: "Tools & Ecosystem" },
  management: { it: "Leadership e Gestione", en: "Leadership & Management" },
  other: { it: "Altre Competenze", en: "Other Competencies" },
};

const FLUENCY_LABELS: Record<string, { it: string; en: string }> = {
  native: { it: "Madrelingua", en: "Native" },
  fluent: { it: "Fluente", en: "Fluent" },
  c2: { it: "C2 (Padronanza)", en: "C2 (Mastery)" },
  c1: { it: "C1 (Avanzato)", en: "C1 (Advanced)" },
  b2: { it: "B2 (Intermedio Superiore)", en: "B2 (Upper Intermediate)" },
  b1: { it: "B1 (Intermedio)", en: "B1 (Intermediate)" },
  a2: { it: "A2 (Elementare)", en: "A2 (Elementary)" },
  a1: { it: "A1 (Base)", en: "A1 (Beginner)" },
};

export function exportMarkdownCv(
  rawProfile: CareerProfile,
  options: ExportOptions = { lang: "en" }
): string {
  const profile = options.anonymize ? anonymizeProfile(rawProfile) : rawProfile;
  const lang = options.lang;
  const isIt = lang === "it";
  const isCompact = options.style === "compact";
  const b = profile.basics;

  const lines: string[] = [];

  // Header
  lines.push(`# ${b.name}`);
  const title = resolveText(b.label, lang);
  if (title) lines.push(`**${title}**\n`);

  // Contact info
  const contactParts: string[] = [];
  if (b.email) contactParts.push(`[${b.email}](mailto:${b.email})`);
  if (b.phone) contactParts.push(b.phone);
  if (b.location) {
    const loc = [b.location.city, b.location.region, b.location.countryCode].filter(Boolean).join(", ");
    if (loc) contactParts.push(loc);
  }
  if (b.url) contactParts.push(`[${b.url.replace(/^https?:\/\//, "")}](${b.url})`);
  if (Array.isArray(b.profiles)) {
    for (const p of b.profiles) contactParts.push(`[${p.network}: ${p.username}](${p.url})`);
  }

  if (contactParts.length > 0) lines.push(contactParts.join(" • ") + "\n");
  lines.push("---");

  // Summary
  const summaryText = resolveText(b.summary, lang);
  if (summaryText) {
    lines.push(`\n## ${isIt ? "Profilo Professionale" : "Executive Summary"}\n`);
    lines.push(summaryText);
  }

  // Filter experiences
  let experiences = profile.experiences ?? [];
  if (options.filterSkills && options.filterSkills.length > 0) {
    const filterSet = new Set(options.filterSkills.map((s) => s.toLowerCase().trim()));
    experiences = experiences.filter((exp) =>
      exp.skills?.some((s) => filterSet.has(s.toLowerCase().trim()))
    );
  }

  if (options.maxYears && options.maxYears > 0) {
    const currentYear = new Date().getFullYear();
    const minYear = currentYear - options.maxYears;
    experiences = experiences.filter((exp) => {
      const year = parseInt(exp.startDate.split("-")[0] ?? "1970", 10);
      return year >= minYear;
    });
  }

  if (options.limitExperiences && options.limitExperiences > 0) {
    experiences = experiences.slice(0, options.limitExperiences);
  }

  // Work Experiences
  if (experiences.length > 0) {
    lines.push(`\n## ${isIt ? "Esperienza Professionale" : "Work Experience"}\n`);

    for (const exp of experiences) {
      const roleStr = resolveText(exp.role, lang);
      lines.push(`### ${roleStr} — **${exp.company}**`);

      const period = formatPeriod(exp.startDate, exp.endDate, exp.isCurrent, lang);
      const metaTokens: string[] = [period];
      if (exp.location) metaTokens.push(exp.location);
      if (exp.employmentType) metaTokens.push(exp.employmentType);

      lines.push(`*${metaTokens.join(" | ")}*\n`);

      const expSummary = resolveText(exp.summary, lang);
      if (expSummary && !isCompact) lines.push(`${expSummary}\n`);

      const highlights = isCompact ? (exp.highlights ?? []).slice(0, 2) : exp.highlights ?? [];
      for (const hl of highlights) {
        const item = resolveText(hl, lang);
        if (item) lines.push(`- ${item}`);
      }

      if (Array.isArray(exp.metrics)) {
        for (const m of exp.metrics) {
          const label = resolveText(m.label, lang);
          const impact = m.impact ? ` (${resolveText(m.impact, lang)})` : "";
          lines.push(`- **${m.value}** — ${label}${impact}`);
        }
      }

      if (Array.isArray(exp.skills) && exp.skills.length > 0) {
        lines.push(`\n*${isIt ? "Competenze chiave" : "Key skills"}:* ${exp.skills.join(", ")}`);
      }

      if (!isCompact && Array.isArray(exp.evidence) && exp.evidence.length > 0) {
        const evLinks = exp.evidence.map((u, i) => `[#${i + 1}](${u})`).join(" ");
        lines.push(`*${isIt ? "Evidenze verificabili" : "Verifiable evidence"}:* ${evLinks}`);
      }

      lines.push("");
    }
  }

  // Key Projects
  if (!isCompact && Array.isArray(profile.projects) && profile.projects.length > 0) {
    lines.push(`## ${isIt ? "Progetti Rilevanti" : "Key Projects"}\n`);

    for (const proj of profile.projects) {
      const projTitle = proj.url ? `[${proj.name}](${proj.url})` : proj.name;
      const role = proj.role ? ` — *${resolveText(proj.role, lang)}*` : "";
      lines.push(`### ${projTitle}${role}`);

      if (proj.startDate) {
        const pPeriod = formatPeriod(proj.startDate, proj.endDate, false, lang);
        lines.push(`*${pPeriod}*\n`);
      }

      const desc = resolveText(proj.description, lang);
      if (desc) lines.push(`${desc}\n`);

      if (Array.isArray(proj.highlights)) {
        for (const hl of proj.highlights) {
          const item = resolveText(hl, lang);
          if (item) lines.push(`- ${item}`);
        }
      }

      if (Array.isArray(proj.skills) && proj.skills.length > 0) {
        lines.push(`\n*${isIt ? "Stack tecnologico" : "Tech stack"}:* ${proj.skills.join(", ")}\n`);
      }
    }
  }

  // Skills by Category
  if (Array.isArray(profile.skills) && profile.skills.length > 0) {
    lines.push(`## ${isIt ? "Competenze Tecniche" : "Technical Skills"}\n`);

    const grouped: Record<string, string[]> = {};
    for (const sk of profile.skills) {
      const cat = sk.category || "other";
      if (!grouped[cat]) grouped[cat] = [];
      const levelSuffix = sk.level ? ` (${sk.level})` : "";
      grouped[cat]!.push(`${sk.name}${levelSuffix}`);
    }

    for (const [catKey, items] of Object.entries(grouped)) {
      const labelObj = CATEGORY_LABELS[catKey] ?? { it: catKey, en: catKey };
      const catTitle = isIt ? labelObj.it : labelObj.en;
      lines.push(`- **${catTitle}:** ${items.join(", ")}`);
    }
    lines.push("");
  }

  // Education
  if (Array.isArray(profile.education) && profile.education.length > 0) {
    lines.push(`## ${isIt ? "Formazione e Titoli di Studio" : "Education & Credentials"}\n`);

    for (const edu of profile.education) {
      const area = resolveText(edu.area, lang);
      const studyType = resolveText(edu.studyType, lang);
      lines.push(`### ${studyType} in ${area} — **${edu.institution}**`);

      const eduPeriod = formatPeriod(edu.startDate, edu.endDate, false, lang);
      const score = edu.score ? ` • ${isIt ? "Votazione" : "Grade"}: ${edu.score}` : "";
      lines.push(`*${eduPeriod}${score}*\n`);
    }
  }

  // Certifications
  if (Array.isArray(profile.certifications) && profile.certifications.length > 0) {
    lines.push(`## ${isIt ? "Certificazioni" : "Certifications"}\n`);

    for (const cert of profile.certifications) {
      const certTitle = cert.url ? `[${cert.name}](${cert.url})` : cert.name;
      const credId = cert.credentialId ? ` (ID: \`${cert.credentialId}\`)` : "";
      const date = formatDateString(cert.issueDate, lang);
      lines.push(`- **${certTitle}** — ${cert.issuer} (${date})${credId}`);
    }
    lines.push("");
  }

  // Languages
  if (Array.isArray(profile.languages) && profile.languages.length > 0) {
    lines.push(`## ${isIt ? "Lingue" : "Languages"}\n`);

    const langItems = profile.languages.map((l) => {
      const name = resolveText(l.language, lang);
      const fl = FLUENCY_LABELS[l.fluency] ?? { it: l.fluency, en: l.fluency };
      const level = isIt ? fl.it : fl.en;
      return `**${name}:** ${level}`;
    });
    lines.push(langItems.join(" • ") + "\n");
  }

  // Footer metadata
  lines.push("---");
  const exportNotice = isIt
    ? "*Documento generato deterministicamente tramite [CareerVault](https://github.com/MRJonam91/CareerVault) — Single Source of Truth.*"
    : "*Deterministically generated via [CareerVault](https://github.com/MRJonam91/CareerVault) — Career Single Source of Truth.*";
  lines.push(exportNotice);

  return lines.join("\n").replace(/\n{3,}/g, "\n\n").trim() + "\n";
}
