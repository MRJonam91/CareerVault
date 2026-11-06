// SPDX-License-Identifier: Apache-2.0
// Copyright 2026 Manoj Rollo (MRJonam91)

import test from "node:test";
import assert from "node:assert/strict";
import { validateProfile } from "../src/core/validator.ts";
import type { CareerProfile } from "../src/core/types.ts";

const BASE_VALID_PROFILE: CareerProfile = {
  schemaVersion: "1.0.0",
  basics: {
    name: "Mario Rossi",
    label: { it: "Ingegnere del Software", en: "Software Engineer" },
    email: "mario@example.com",
    summary: {
      it: "Ingegnere del software con solida esperienza.",
      en: "Software engineer with solid experience.",
    },
  },
  skills: [
    { name: "TypeScript", category: "languages", lastUsed: "2026" },
    { name: "Node.js", category: "frameworks", lastUsed: "2026" },
  ],
  experiences: [
    {
      id: "exp-1",
      company: "Acme Corp",
      role: { it: "Sviluppatore Senior", en: "Senior Developer" },
      employmentType: "full-time",
      startDate: "2020-01",
      endDate: "2023-01",
      highlights: [{ it: "Creato portale API", en: "Built API gateway" }],
      metrics: [
        { label: { it: "Latenza ridotta", en: "Reduced latency" }, value: "30%" },
      ],
      skills: ["TypeScript", "Node.js"],
      evidence: ["https://example.com/proof"],
    },
  ],
  education: [
    {
      id: "edu-1",
      institution: "Università di Roma",
      area: { it: "Informatica", en: "Computer Science" },
      studyType: { it: "Laurea", en: "BSc" },
      startDate: "2015-09",
      endDate: "2018-07",
    },
  ],
  certifications: [
    {
      id: "cert-1",
      name: "CKA",
      issuer: "CNCF",
      issueDate: "2022-01",
    },
  ],
};

test("validator accepts a fully compliant profile", () => {
  const result = validateProfile(BASE_VALID_PROFILE);
  assert.equal(result.valid, true);
  assert.equal(result.errors.length, 0);
});

test("validator detects chronological inversion in experience", () => {
  const badProfile = structuredClone(BASE_VALID_PROFILE);
  badProfile.experiences[0]!.startDate = "2023-05";
  badProfile.experiences[0]!.endDate = "2021-02";

  const result = validateProfile(badProfile);
  assert.equal(result.valid, false);
  const chronError = result.errors.find((e) => e.code === "CHRONOLOGICAL_INVERSION");
  assert.ok(chronError);
  assert.match(chronError.message, /chronological inconsistency/i);
});

test("validator detects chronological inversion in education", () => {
  const badEdu = structuredClone(BASE_VALID_PROFILE);
  badEdu.education![0]!.startDate = "2020-09";
  badEdu.education![0]!.endDate = "2018-07";

  const result = validateProfile(badEdu);
  assert.equal(result.valid, false);
  const eduError = result.errors.find((e) => e.field.startsWith("education"));
  assert.ok(eduError);
  assert.equal(eduError.code, "CHRONOLOGICAL_INVERSION");
});

test("validator detects invalid certification date format", () => {
  const badCert = structuredClone(BASE_VALID_PROFILE);
  badCert.certifications![0]!.issueDate = "invalid-date";

  const result = validateProfile(badCert);
  assert.equal(result.valid, false);
  const certError = result.errors.find((e) => e.field.startsWith("certifications"));
  assert.ok(certError);
  assert.equal(certError.code, "INVALID_DATE_FORMAT");
});

test("validator detects undeclared skills used in experience", () => {
  const profileWithExtraSkill = structuredClone(BASE_VALID_PROFILE);
  profileWithExtraSkill.experiences[0]!.skills.push("Kubernetes");

  const result = validateProfile(profileWithExtraSkill);
  assert.equal(result.valid, true);
  const warn = result.warnings.find((w) => w.code === "UNDECLARED_SKILL");
  assert.ok(warn);
  assert.match(warn.message, /Kubernetes/);
});

test("validator detects conflicting overlapping full-time roles without concurrency flag", () => {
  const profileWithOverlap = structuredClone(BASE_VALID_PROFILE);
  profileWithOverlap.experiences.push({
    id: "exp-2",
    company: "Beta Ltd",
    role: { it: "Consulente", en: "Consultant" },
    employmentType: "full-time",
    startDate: "2021-06",
    endDate: "2024-06",
    highlights: [{ it: "Audit di sicurezza", en: "Security audit" }],
    skills: ["TypeScript"],
  });

  const result = validateProfile(profileWithOverlap);
  assert.equal(result.valid, true);
  const overlapWarning = result.warnings.find((w) => w.code === "OVERLAPPING_FULLTIME_ROLE");
  assert.ok(overlapWarning, "Should flag overlapping full-time roles");
});

test("validator detects employment gaps between consecutive roles", () => {
  const profileWithGap = structuredClone(BASE_VALID_PROFILE);
  profileWithGap.experiences.push({
    id: "exp-2",
    company: "Next Corp",
    role: { it: "Sviluppatore", en: "Developer" },
    employmentType: "full-time",
    startDate: "2024-06",
    endDate: "2025-01",
    highlights: [{ it: "Progetti", en: "Projects" }],
    skills: ["TypeScript"],
  });

  const result = validateProfile(profileWithGap);
  const gapWarn = result.warnings.find((w) => w.code === "EMPLOYMENT_GAP");
  assert.ok(gapWarn, "Should detect gap > 3 months between roles");
});

test("validator alerts when senior roles lack quantifiable metrics", () => {
  const profileNoSeniorMetrics = structuredClone(BASE_VALID_PROFILE);
  profileNoSeniorMetrics.experiences[0]!.metrics = [];

  const result = validateProfile(profileNoSeniorMetrics);
  const seniorWarn = result.warnings.find((w) => w.code === "MISSING_SENIOR_METRICS");
  assert.ok(seniorWarn, "Should suggest adding metrics for senior positions");
});

test("validator warns about stale skills", () => {
  const profileWithStaleSkill = structuredClone(BASE_VALID_PROFILE);
  profileWithStaleSkill.skills[0]!.lastUsed = "2018";

  const result = validateProfile(profileWithStaleSkill);
  const staleWarn = result.warnings.find((w) => w.code === "STALE_SKILL");
  assert.ok(staleWarn, "Should warn about stale skills not used recently");
});
