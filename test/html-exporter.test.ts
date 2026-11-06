// SPDX-License-Identifier: Apache-2.0
// Copyright 2026 Manoj Rollo (MRJonam91)

import test from "node:test";
import assert from "node:assert/strict";
import { exportHtmlCv } from "../src/core/html-exporter.ts";
import type { CareerProfile } from "../src/core/types.ts";

const SAMPLE_PROFILE: CareerProfile = {
  schemaVersion: "1.0.0",
  basics: {
    name: "Elena Romano",
    label: { it: "Ingegnere Cloud", en: "Cloud Engineer" },
    email: "elena@example.com",
    summary: { it: "Esperta in Kubernetes e Go.", en: "Kubernetes and Go expert." },
    location: { city: "Torino", countryCode: "IT" },
  },
  skills: [
    { name: "Go", category: "languages", level: "expert" },
    { name: "Kubernetes", category: "cloud-devops", level: "advanced" },
  ],
  experiences: [
    {
      id: "exp-1",
      company: "CloudScale Inc",
      role: { it: "Senior Platform Dev", en: "Senior Platform Dev" },
      employmentType: "full-time",
      startDate: "2021-03",
      endDate: "2024-01",
      highlights: [{ it: "Creato cluster multi-regione", en: "Built multi-region cluster" }],
      metrics: [
        { label: { it: "Risparmio computazione", en: "Compute savings" }, value: "35%" },
      ],
      skills: ["Go", "Kubernetes"],
    },
  ],
};

test("exportHtmlCv generates responsive, printable HTML with expected elements", () => {
  const html = exportHtmlCv(SAMPLE_PROFILE, { lang: "it" });
  assert.ok(html.includes("<!DOCTYPE html>"));
  assert.ok(html.includes("Elena Romano"));
  assert.ok(html.includes("Ingegnere Cloud"));
  assert.ok(html.includes("@media print"));
  assert.ok(html.includes("CloudScale Inc"));
  assert.ok(html.includes("35%"));
  assert.ok(html.includes("Torino, IT"));
  assert.ok(html.includes("Esperienza Professionale"));
  assert.ok(html.includes("Competenze Tecniche"));
});

test("exportHtmlCv properly escapes special characters to prevent XSS", () => {
  const maliciousProfile = structuredClone(SAMPLE_PROFILE);
  maliciousProfile.basics.name = "John <script>alert(1)</script>";
  const html = exportHtmlCv(maliciousProfile, { lang: "en" });
  assert.ok(!html.includes("<script>alert(1)</script>"));
  assert.ok(html.includes("&lt;script&gt;alert(1)&lt;/script&gt;"));
});
