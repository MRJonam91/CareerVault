// SPDX-License-Identifier: Apache-2.0
// Copyright 2026 Manoj Rollo (MRJonam91)

import test from "node:test";
import assert from "node:assert/strict";
import { exportMarkdownCv } from "../src/core/markdown-exporter.ts";
import type { CareerProfile } from "../src/core/types.ts";

const SAMPLE_PROFILE: CareerProfile = {
  schemaVersion: "1.0.0",
  basics: {
    name: "Giulia Verdi",
    label: { it: "Cloud Architect", en: "Cloud Architect" },
    email: "giulia@example.com",
    summary: {
      it: "Architetto cloud specializzata su AWS e Kubernetes.",
      en: "Cloud architect specialized in AWS and Kubernetes.",
    },
    location: { city: "Roma", countryCode: "IT" },
  },
  skills: [
    { name: "AWS", category: "cloud-devops", level: "expert" },
    { name: "Kubernetes", category: "cloud-devops", level: "advanced" },
    { name: "Python", category: "languages", level: "intermediate" },
  ],
  experiences: [
    {
      id: "exp-1",
      company: "Enterprise Cloud SpA",
      role: { it: "Architetto Soluzioni Cloud", en: "Cloud Solutions Architect" },
      employmentType: "full-time",
      startDate: "2023-01",
      endDate: "2024-05",
      highlights: [
        { it: "Progettata architettura AWS", en: "Designed AWS architecture" },
        { it: "Punto 2", en: "Point 2" },
        { it: "Punto 3", en: "Point 3" },
      ],
      metrics: [
        { label: { it: "Risparmio annuo", en: "Annual savings" }, value: "€450k" },
      ],
      skills: ["AWS", "Kubernetes"],
      evidence: ["https://example.com/case-study"],
    },
    {
      id: "exp-2",
      company: "Legacy Systems Srl",
      role: { it: "Sviluppatore Python", en: "Python Developer" },
      employmentType: "full-time",
      startDate: "2015-01",
      endDate: "2017-12",
      highlights: [{ it: "Script batch", en: "Batch scripts" }],
      skills: ["Python"],
    },
  ],
  education: [
    {
      id: "edu-1",
      institution: "Università La Sapienza",
      area: { it: "Sicurezza Informatica", en: "Cybersecurity" },
      studyType: { it: "Laurea Magistrale", en: "Master's Degree" },
      startDate: "2018-10",
      endDate: "2020-10",
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
};

test("exportMarkdownCv produces Italian CV with expected sections", () => {
  const md = exportMarkdownCv(SAMPLE_PROFILE, { lang: "it" });
  assert.ok(md.includes("# Giulia Verdi"));
  assert.ok(md.includes("## Profilo Professionale"));
  assert.ok(md.includes("## Esperienza Professionale"));
  assert.ok(md.includes("Architetto Soluzioni Cloud — **Enterprise Cloud SpA**"));
  assert.ok(md.includes("Gen 2023 — Mag 2024"));
  assert.ok(md.includes("€450k"));
  assert.ok(md.includes("## Formazione e Titoli di Studio"));
  assert.ok(md.includes("## Competenze Tecniche"));
  assert.ok(md.includes("## Lingue"));
  assert.ok(md.includes("**Italiano:** Madrelingua"));
  assert.ok(md.includes("**Inglese:** C1 (Avanzato)"));
});

test("exportMarkdownCv produces English CV with expected sections", () => {
  const md = exportMarkdownCv(SAMPLE_PROFILE, { lang: "en" });
  assert.ok(md.includes("# Giulia Verdi"));
  assert.ok(md.includes("## Executive Summary"));
  assert.ok(md.includes("## Work Experience"));
  assert.ok(md.includes("Cloud Solutions Architect — **Enterprise Cloud SpA**"));
  assert.ok(md.includes("Jan 2023 — May 2024"));
  assert.ok(md.includes("## Education & Credentials"));
  assert.ok(md.includes("## Technical Skills"));
  assert.ok(md.includes("## Languages"));
  assert.ok(md.includes("**Italian:** Native"));
  assert.ok(md.includes("**English:** C1 (Advanced)"));
});

test("exportMarkdownCv supports compact style", () => {
  const md = exportMarkdownCv(SAMPLE_PROFILE, { lang: "en", style: "compact" });
  assert.ok(!md.includes("Point 3"), "Compact mode should truncate highlights");
  assert.ok(md.includes("Point 2"));
});

test("exportMarkdownCv filters by skill", () => {
  const md = exportMarkdownCv(SAMPLE_PROFILE, { lang: "en", filterSkills: ["AWS"] });
  assert.ok(md.includes("Enterprise Cloud SpA"));
  assert.ok(!md.includes("Legacy Systems Srl"), "Should exclude roles not using AWS");
});

test("exportMarkdownCv filters by maxYears", () => {
  const md = exportMarkdownCv(SAMPLE_PROFILE, { lang: "en", maxYears: 5 });
  assert.ok(md.includes("Enterprise Cloud SpA"));
  assert.ok(!md.includes("Legacy Systems Srl"), "Should exclude roles older than 5 years");
});
