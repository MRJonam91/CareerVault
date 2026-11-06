#!/usr/bin/env node
// SPDX-License-Identifier: Apache-2.0
// Copyright 2026 Manoj Rollo (MRJonam91)

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { validateProfile } from "../core/validator.ts";
import { exportMarkdownCv } from "../core/markdown-exporter.ts";
import { exportHtmlCv } from "../core/html-exporter.ts";
import { exportJsonResume, importJsonResume } from "../core/json-resume-exporter.ts";
import { anonymizeProfile } from "../core/anonymizer.ts";
import { diffProfiles } from "../core/diff.ts";
import { getCareerStats } from "../core/stats.ts";
import { formatSponsorNotice, shouldShowSponsorNotice } from "../core/constants.ts";
import type { CareerProfile, SupportedLanguage, CvStyle } from "../core/types.ts";

const VERSION = "1.0.0";

const SAMPLE_PROFILE: CareerProfile = {
  schemaVersion: "1.0.0",
  basics: {
    name: "Alex Rossi",
    label: {
      it: "Ingegnere del Software Senior & System Architect",
      en: "Senior Software Engineer & System Architect",
    },
    email: "alex.rossi@example.com",
    phone: "+39 02 1234567",
    url: "https://alexrossi.dev",
    summary: {
      it: "Ingegnere del software con oltre 8 anni di esperienza nella progettazione di sistemi distribuiti, piattaforme cloud e architetture resilienti. Focalizzato su affidabilità, verificabilità del codice e standard aperti.",
      en: "Software engineer with 8+ years of experience designing distributed systems, cloud platforms, and resilient architectures. Passionate about reliability, verifiable code, and open standards.",
    },
    location: {
      city: "Milano",
      region: "Lombardia",
      countryCode: "IT",
    },
    profiles: [
      {
        network: "GitHub",
        username: "alexrossi",
        url: "https://github.com/alexrossi",
      },
      {
        network: "LinkedIn",
        username: "alex-rossi",
        url: "https://linkedin.com/in/alex-rossi",
      },
    ],
  },
  experiences: [
    {
      id: "exp-techcorp-2023",
      company: "TechCorp Global",
      role: {
        it: "Staff Platform Engineer",
        en: "Staff Platform Engineer",
      },
      employmentType: "full-time",
      location: "Milano, IT (Hybrid)",
      startDate: "2023-01",
      endDate: null,
      isCurrent: true,
      summary: {
        it: "Guida tecnica dell'infrastruttura dati e delle piattaforme microservizi aziendali.",
        en: "Technical leadership for enterprise data infrastructure and microservice platforms.",
      },
      highlights: [
        {
          it: "Riprogettata la pipeline di ingestione dati, riducendo la latenza del 45% a parità di costi.",
          en: "Redesigned data ingestion pipeline, reducing processing latency by 45% under identical infrastructure costs.",
        },
        {
          it: "Coordinato team cross-funzionale di 7 ingegneri nella migrazione zero-downtime a Kubernetes.",
          en: "Led a cross-functional team of 7 engineers during a zero-downtime Kubernetes migration.",
        },
      ],
      metrics: [
        {
          label: {
            it: "Latenza di ingestione dati",
            en: "Data ingestion latency",
          },
          value: "-45%",
          impact: {
            it: "Risparmio di 120k€/anno di computazione",
            en: "Saved €120k/year in computing overhead",
          },
        },
        {
          label: {
            it: "Disponibilità piattaforma",
            en: "Platform availability",
          },
          value: "99.98%",
        },
      ],
      skills: ["TypeScript", "Node.js", "Kubernetes", "PostgreSQL", "Go", "Docker"],
      evidence: [
        "https://github.com/alexrossi/k8s-migration-case-study",
      ],
    },
    {
      id: "exp-cloudwave-2019",
      company: "CloudWave Solutions",
      role: {
        it: "Senior Backend Developer",
        en: "Senior Backend Developer",
      },
      employmentType: "full-time",
      location: "Torino, IT",
      startDate: "2019-03",
      endDate: "2022-12",
      isCurrent: false,
      summary: {
        it: "Sviluppo di API REST ed event-driven per clienti del settore bancario ed eCommerce.",
        en: "Developed REST and event-driven APIs for banking and eCommerce enterprise customers.",
      },
      highlights: [
        {
          it: "Implementato gateway di pagamento conforme a PSD2 gestendo picchi di 15.000 req/sec.",
          en: "Implemented PSD2-compliant payment gateway handling peak traffic of 15,000 req/sec.",
        },
      ],
      metrics: [
        {
          label: {
            it: "Throughput transazioni di picco",
            en: "Peak transaction throughput",
          },
          value: "15,000 req/sec",
        },
      ],
      skills: ["Node.js", "TypeScript", "PostgreSQL", "Redis", "Docker"],
      evidence: [
        "https://example.com/press/cloudwave-banking-gateway",
      ],
    },
  ],
  education: [
    {
      id: "edu-polito-2018",
      institution: "Politecnico di Torino",
      area: {
        it: "Ingegneria Informatica",
        en: "Computer Engineering",
      },
      studyType: {
        it: "Laurea Magistrale",
        en: "Master of Science",
      },
      startDate: "2016-10",
      endDate: "2018-10",
      score: "110/110 cum laude",
    },
  ],
  skills: [
    { name: "TypeScript", category: "languages", level: "expert", yearsOfExperience: 7 },
    { name: "Node.js", category: "frameworks", level: "expert", yearsOfExperience: 8 },
    { name: "Go", category: "languages", level: "intermediate", yearsOfExperience: 3 },
    { name: "PostgreSQL", category: "databases", level: "advanced", yearsOfExperience: 6 },
    { name: "Redis", category: "databases", level: "advanced", yearsOfExperience: 5 },
    { name: "Kubernetes", category: "cloud-devops", level: "advanced", yearsOfExperience: 4 },
    { name: "Docker", category: "cloud-devops", level: "expert", yearsOfExperience: 7 },
  ],
  projects: [
    {
      id: "proj-vault-core",
      name: "OpenDataGateway",
      role: {
        it: "Creatore & Maintainer",
        en: "Creator & Maintainer",
      },
      description: {
        it: "Gateway leggero open source per la normalizzazione di API aperte con validazione a schema.",
        en: "Lightweight open-source gateway for open API normalization and schema validation.",
      },
      url: "https://github.com/alexrossi/open-data-gateway",
      highlights: [
        {
          it: "Raggiunte oltre 1.200 stelle su GitHub e 50k download mensili.",
          en: "Achieved 1,200+ GitHub stars and 50k monthly downloads.",
        },
      ],
      skills: ["TypeScript", "Node.js", "Docker"],
      startDate: "2021-05",
      endDate: null,
    },
  ],
  certifications: [
    {
      id: "cert-cka-2023",
      name: "Certified Kubernetes Administrator (CKA)",
      issuer: "Cloud Native Computing Foundation (CNCF)",
      issueDate: "2023-04",
      credentialId: "CKA-78901234",
    },
  ],
  languages: [
    {
      language: { it: "Italiano", en: "Italian" },
      fluency: "native",
    },
    {
      language: { it: "Inglese", en: "English" },
      fluency: "c1",
    },
  ],
  meta: {
    lastUpdated: "2026-11-06",
    version: "1.0.0",
  },
};

function printHelp(): void {
  console.log(`
CareerVault v${VERSION} — Single Source of Truth for Career History & Resume Integrity

USAGE:
  careervault <command> [options]

COMMANDS:
  init [path]                    Create a new verifiable career profile (default: career.json)
  validate <file>                Validate profile schema and audit for inconsistencies/anomalies
  export <file>                  Export deterministic CV (Markdown, HTML, or JSON Resume)
  diff <fileA> <fileB>           Compare two career profiles and report added/modified/removed items
  import <resume.json>           Convert a JSON Resume (jsonresume.org) to CareerVault profile
  anonymize <file>               Generate a blind-screening profile with PII redacted
  stats <file>                   Calculate career metrics, tenure, and verifiable evidence score

OPTIONS:
  -l, --lang <it|en>             Target language for export (default: en)
  -f, --format <md|html|json-resume> Export format (default: md)
  -s, --style <standard|compact|detailed> Presentation style (default: standard)
  --anonymize, --blind           Redact personal information & company names for blind review
  --filter-skills <skills>       Comma-separated skills to emphasize/filter
  --max-years <years>            Filter roles to recent N years
  --limit <count>                Limit number of experiences displayed
  --strict                       Fail validation (exit code 1) on any warning or anomaly
  -o, --out <file>               Write output to file instead of stdout
  --json                         Output machine-readable JSON (for validate, stats, and diff)
  -v, --version                  Display version
  -h, --help                     Display this help message

EXAMPLES:
  careervault init career.json
  careervault validate career.json
  careervault export career.json --lang it --format md --out cv-italiano.md
  careervault export career.json --lang en --format html --out resume.html
  careervault diff career-2024.json career-2026.json
  careervault import resume.json --out career.json
  careervault stats career.json
`);
}

function loadProfile(filePath: string): CareerProfile {
  try {
    if (filePath === "-") {
      const raw = readFileSync(process.stdin.fd, "utf8");
      return JSON.parse(raw) as CareerProfile;
    }
    const fullPath = resolve(process.cwd(), filePath);
    if (!existsSync(fullPath)) {
      console.error(`Error: File not found: ${filePath}`);
      process.exit(1);
    }
    const raw = readFileSync(fullPath, "utf8");
    return JSON.parse(raw) as CareerProfile;
  } catch (err: unknown) {
    console.error(`Error: Failed to parse JSON from ${filePath}:`, (err as Error).message);
    process.exit(1);
  }
}

export function main(): void {
  const args = process.argv.slice(2);
  if (args.length === 0 || args.includes("-h") || args.includes("--help")) {
    printHelp();
    return;
  }

  if (args.includes("-v") || args.includes("--version")) {
    console.log(`careervault v${VERSION}`);
    return;
  }

  const command = args[0];

  if (command === "init") {
    const targetFile = args[1] && !args[1].startsWith("-") ? args[1] : "career.json";
    const targetPath = resolve(process.cwd(), targetFile);
    if (existsSync(targetPath)) {
      console.error(`Error: Target file already exists: ${targetFile}`);
      process.exit(1);
    }
    mkdirSync(dirname(targetPath), { recursive: true });
    writeFileSync(targetPath, JSON.stringify(SAMPLE_PROFILE, null, 2) + "\n", "utf8");
    console.log(`[OK] Scaffolded new career ledger at: ${targetFile}`);
    console.log("Next steps:");
    console.log(`  1. Edit ${targetFile} with your actual experiences and achievements.`);
    console.log(`  2. Run 'careervault validate ${targetFile}' to audit coherence.`);
    console.log(`  3. Run 'careervault export ${targetFile} --lang it' to generate your Italian CV.`);
    return;
  }

  if (command === "validate") {
    const fileArg = args[1];
    if (!fileArg || fileArg.startsWith("-")) {
      console.error("Error: Please provide a career profile JSON file to validate.");
      process.exit(1);
    }

    const isJson = args.includes("--json");
    const isStrict = args.includes("--strict");
    const profile = loadProfile(fileArg);
    const result = validateProfile(profile);

    const hasFailed = !result.valid || (isStrict && result.warnings.length > 0);

    if (isJson) {
      console.log(JSON.stringify(result, null, 2));
      process.exit(hasFailed ? 1 : 0);
    }

    console.log(`\nAuditing career profile: ${fileArg}`);
    console.log("─".repeat(50));

    if (result.errors.length > 0) {
      console.log(`\n❌ ERRORS (${result.errors.length}):`);
      for (const err of result.errors) {
        console.log(`  • [${err.code}] ${err.field}: ${err.message}`);
      }
    }

    if (result.warnings.length > 0) {
      console.log(`\n⚠️  WARNINGS & ANOMALIES (${result.warnings.length}):`);
      for (const w of result.warnings) {
        console.log(`  • [${w.code}] ${w.field}: ${w.message}`);
        if (w.suggestion) {
          console.log(`    ↳ Suggestion: ${w.suggestion}`);
        }
      }
    }

    if (result.valid && (!isStrict || result.warnings.length === 0)) {
      console.log(`\n✅ Profile structure is valid! (0 blocking errors, ${result.warnings.length} warnings)`);
    } else {
      console.log(`\n❌ Validation failed: ${result.errors.length} blocking error(s)${isStrict ? `, ${result.warnings.length} warning(s) under strict mode` : ""}.`);
    }

    if (shouldShowSponsorNotice()) {
      console.log(formatSponsorNotice());
    }

    process.exit(hasFailed ? 1 : 0);
  }

  if (command === "diff") {
    const fileA = args[1];
    const fileB = args[2];
    if (!fileA || !fileB || fileA.startsWith("-") || fileB.startsWith("-")) {
      console.error("Error: Please provide two career profile JSON files: careervault diff <old.json> <new.json>");
      process.exit(1);
    }

    const isJson = args.includes("--json");
    const profA = loadProfile(fileA);
    const profB = loadProfile(fileB);
    const diff = diffProfiles(profA, profB);

    if (isJson) {
      console.log(JSON.stringify(diff, null, 2));
      return;
    }

    console.log(`\nCareer Ledger Diff: ${fileA} ➔ ${fileB}`);
    console.log("─".repeat(50));

    if (!diff.hasDifferences) {
      console.log("✓ No differences detected between the two career profiles.");
      return;
    }

    console.log(`Summary: +${diff.summary.added} added, ~${diff.summary.modified} modified, -${diff.summary.removed} removed\n`);

    for (const c of diff.changes) {
      const icon = c.type === "added" ? "➕" : c.type === "removed" ? "➖" : "✏️";
      console.log(`${icon} [${c.category.toUpperCase()}] ${c.item}`);
      if (c.details) console.log(`   ↳ ${c.details}`);
    }
    return;
  }

  if (command === "import") {
    const resumeFile = args[1];
    if (!resumeFile || resumeFile.startsWith("-")) {
      console.error("Error: Please provide a JSON Resume file: careervault import <resume.json>");
      process.exit(1);
    }

    let outPath = "career.json";
    const outIdx = args.findIndex((a) => a === "-o" || a === "--out");
    if (outIdx !== -1 && args[outIdx + 1]) {
      outPath = args[outIdx + 1]!;
    }

    const raw = JSON.parse(readFileSync(resolve(process.cwd(), resumeFile), "utf8"));
    const imported = importJsonResume(raw);

    const fullOut = resolve(process.cwd(), outPath);
    mkdirSync(dirname(fullOut), { recursive: true });
    writeFileSync(fullOut, JSON.stringify(imported, null, 2) + "\n", "utf8");

    console.log(`[OK] Successfully imported JSON Resume into CareerVault format: ${outPath}`);
    console.log("Next: audit profile with 'careervault validate " + outPath + "'");
    return;
  }

  if (command === "anonymize") {
    const fileArg = args[1];
    if (!fileArg || fileArg.startsWith("-")) {
      console.error("Error: Please provide a career profile JSON file: careervault anonymize <career.json>");
      process.exit(1);
    }

    const profile = loadProfile(fileArg);
    const anonymized = anonymizeProfile(profile);

    let outPath: string | undefined;
    const outIdx = args.findIndex((a) => a === "-o" || a === "--out");
    if (outIdx !== -1 && args[outIdx + 1]) {
      outPath = resolve(process.cwd(), args[outIdx + 1]!);
    }

    const output = JSON.stringify(anonymized, null, 2) + "\n";
    if (outPath) {
      mkdirSync(dirname(outPath), { recursive: true });
      writeFileSync(outPath, output, "utf8");
      console.log(`[OK] Successfully generated anonymized blind-screening profile: ${outPath}`);
    } else {
      process.stdout.write(output);
    }
    return;
  }

  if (command === "export") {
    const fileArg = args[1];
    if (!fileArg || fileArg.startsWith("-")) {
      console.error("Error: Please provide a career profile JSON file to export.");
      process.exit(1);
    }

    const profile = loadProfile(fileArg);

    let lang: SupportedLanguage = "en";
    const langIdx = args.findIndex((a) => a === "-l" || a === "--lang");
    if (langIdx !== -1 && args[langIdx + 1]) {
      const parsedLang = args[langIdx + 1]?.toLowerCase();
      if (parsedLang === "it" || parsedLang === "en") {
        lang = parsedLang;
      } else {
        console.error(`Invalid language '${parsedLang}'. Supported: it, en`);
        process.exit(1);
      }
    }

    let format = "md";
    const fmtIdx = args.findIndex((a) => a === "-f" || a === "--format");
    if (fmtIdx !== -1 && args[fmtIdx + 1]) {
      format = args[fmtIdx + 1]!.toLowerCase();
    }

    let style: CvStyle = "standard";
    const styleIdx = args.findIndex((a) => a === "-s" || a === "--style");
    if (styleIdx !== -1 && args[styleIdx + 1]) {
      style = args[styleIdx + 1] as CvStyle;
    }

    let filterSkills: string[] | undefined;
    const skillsIdx = args.findIndex((a) => a === "--filter-skills");
    if (skillsIdx !== -1 && args[skillsIdx + 1]) {
      filterSkills = args[skillsIdx + 1]!.split(",").map((s) => s.trim());
    }

    let maxYears: number | undefined;
    const yearsIdx = args.findIndex((a) => a === "--max-years");
    if (yearsIdx !== -1 && args[yearsIdx + 1]) {
      maxYears = parseInt(args[yearsIdx + 1]!, 10);
    }

    let limitExperiences: number | undefined;
    const limitIdx = args.findIndex((a) => a === "--limit");
    if (limitIdx !== -1 && args[limitIdx + 1]) {
      limitExperiences = parseInt(args[limitIdx + 1]!, 10);
    }

    const anonymize = args.includes("--anonymize") || args.includes("--blind");

    let outPath: string | undefined;
    const outIdx = args.findIndex((a) => a === "-o" || a === "--out");
    if (outIdx !== -1 && args[outIdx + 1]) {
      outPath = resolve(process.cwd(), args[outIdx + 1]!);
    }

    let output = "";
    if (format === "md" || format === "markdown") {
      output = exportMarkdownCv(profile, { lang, style, filterSkills, maxYears, limitExperiences, anonymize });
    } else if (format === "html") {
      output = exportHtmlCv(profile, { lang, style, filterSkills, maxYears, limitExperiences, anonymize });
    } else if (format === "json-resume" || format === "json") {
      output = JSON.stringify(exportJsonResume(profile, { lang, anonymize }), null, 2) + "\n";
    } else {
      console.error(`Unsupported format '${format}'. Supported: md, html, json-resume`);
      process.exit(1);
    }

    if (outPath) {
      mkdirSync(dirname(outPath), { recursive: true });
      writeFileSync(outPath, output, "utf8");
      console.log(`[OK] Successfully exported ${format.toUpperCase()} CV (${lang.toUpperCase()}) to: ${outPath}`);
    } else {
      process.stdout.write(output);
    }

    if (shouldShowSponsorNotice()) {
      console.error(formatSponsorNotice());
    }
    return;
  }

  if (command === "stats") {
    const fileArg = args[1];
    if (!fileArg || fileArg.startsWith("-")) {
      console.error("Error: Please provide a career profile JSON file for stats.");
      process.exit(1);
    }

    const isJson = args.includes("--json");
    const profile = loadProfile(fileArg);
    const stats = getCareerStats(profile);

    if (isJson) {
      console.log(JSON.stringify(stats, null, 2));
      return;
    }

    console.log(`\nCareer Telemetry: ${profile.basics.name}`);
    console.log("─".repeat(50));
    console.log(`Total Career Duration:  ${stats.totalExperienceFormatted.en} (${stats.totalExperienceMonths} months deduplicated)`);
    console.log(`Total Roles Held:       ${stats.totalRolesCount} (${stats.activeRolesCount} currently active)`);
    console.log(`Skills Inventory:       ${stats.skillsCount} skills across ${Object.keys(stats.skillsByCategory).length} categories`);
    for (const [cat, count] of Object.entries(stats.skillsByCategory)) {
      console.log(`  • ${cat}: ${count}`);
    }
    console.log(`Evidence Coverage:      ${stats.evidenceCoveragePercent}% (roles with verifiable anchors)`);
    console.log(`Bilingual Completeness: ${stats.bilingualCoveragePercent}% (fields available in IT & EN)`);

    if (shouldShowSponsorNotice()) {
      console.log(formatSponsorNotice());
    }
    return;
  }

  console.error(`Unknown command: '${command}'. Run 'careervault --help' for usage.`);
  process.exit(1);
}

if (import.meta.url === `file://${process.argv[1]?.replace(/\\/g, "/")}` || process.argv[1]?.endsWith("careervault") || process.argv[1]?.endsWith("index.ts") || process.argv[1]?.endsWith("index.js")) {
  main();
}
