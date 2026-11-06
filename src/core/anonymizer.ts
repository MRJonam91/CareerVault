// SPDX-License-Identifier: Apache-2.0
// Copyright 2026 Manoj Rollo (MRJonam91)

import type { CareerProfile } from "./types.ts";

export function anonymizeProfile(profile: CareerProfile): CareerProfile {
  const p = structuredClone(profile);

  p.basics = {
    ...p.basics,
    name: "Candidate [Blind CV]",
    email: "blind.candidate@careervault.local",
    phone: p.basics.phone ? "[redacted]" : undefined,
    url: undefined,
    profiles: [],
    location: p.basics.location
      ? { countryCode: p.basics.location.countryCode }
      : undefined,
  };

  p.experiences = (p.experiences ?? []).map((exp, idx) => ({
    ...exp,
    company: `[Organization #${idx + 1}]`,
    location: exp.location ? "[redacted]" : undefined,
    evidence: [],
  }));

  p.projects = (p.projects ?? []).map((proj, idx) => ({
    ...proj,
    name: `[Project #${idx + 1}]`,
    url: undefined,
  }));

  if (p.meta) {
    p.meta = {
      ...p.meta,
      notes: "Anonymized via CareerVault blind-screening profile transformer",
    };
  }

  return p;
}
