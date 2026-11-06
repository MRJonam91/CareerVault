// SPDX-License-Identifier: Apache-2.0
// Copyright 2026 Manoj Rollo (MRJonam91)

import test from "node:test";
import assert from "node:assert/strict";
import { anonymizeProfile } from "../src/core/anonymizer.ts";
import { exportMarkdownCv } from "../src/core/markdown-exporter.ts";
import { exportHtmlCv } from "../src/core/html-exporter.ts";
import type { CareerProfile } from "../src/core/types.ts";

const SAMPLE_PROFILE: CareerProfile = {
  schemaVersion: "1.0.0",
  basics: {
    name: "Marco Ferrari",
    label: "Senior Cloud Architect",
    email: "marco.ferrari@secret.corp",
    phone: "+39 347 1234567",
    url: "https://ferrari.io",
    summary: "Cloud architect with 10 years experience",
    location: { city: "Milano", region: "Lombardia", countryCode: "IT" },
    profiles: [{ network: "GitHub", username: "mferrari", url: "https://github.com/mferrari" }],
  },
  skills: [
    { name: "Kubernetes", category: "cloud-devops" },
    { name: "Go", category: "languages" },
  ],
  experiences: [
    {
      id: "exp-1",
      company: "Ferrari Systems SpA",
      role: "Lead Architect",
      employmentType: "full-time",
      startDate: "2020-01",
      endDate: "2024-01",
      highlights: ["Built private cloud"],
      skills: ["Kubernetes", "Go"],
      evidence: ["https://ferrari.io/patents/1"],
    },
  ],
};

test("anonymizeProfile redacts PII and company names", () => {
  const blind = anonymizeProfile(SAMPLE_PROFILE);
  assert.equal(blind.basics.name, "Candidate [Blind CV]");
  assert.equal(blind.basics.email, "blind.candidate@careervault.local");
  assert.equal(blind.basics.phone, "[redacted]");
  assert.equal(blind.basics.url, undefined);
  assert.equal(blind.basics.profiles?.length, 0);
  assert.equal(blind.basics.location?.city, undefined);
  assert.equal(blind.basics.location?.countryCode, "IT");

  assert.equal(blind.experiences[0]?.company, "[Organization #1]");
  assert.equal(blind.experiences[0]?.evidence?.length, 0);
});

test("exportMarkdownCv with anonymize flag produces blind CV", () => {
  const md = exportMarkdownCv(SAMPLE_PROFILE, { lang: "en", anonymize: true });
  assert.ok(md.includes("Candidate [Blind CV]"));
  assert.ok(!md.includes("Marco Ferrari"));
  assert.ok(!md.includes("marco.ferrari@secret.corp"));
  assert.ok(!md.includes("Ferrari Systems SpA"));
  assert.ok(md.includes("[Organization #1]"));
});

test("exportHtmlCv with anonymize flag produces blind HTML CV", () => {
  const html = exportHtmlCv(SAMPLE_PROFILE, { lang: "en", anonymize: true });
  assert.ok(html.includes("Candidate [Blind CV]"));
  assert.ok(!html.includes("Marco Ferrari"));
  assert.ok(html.includes("[Organization #1]"));
});
