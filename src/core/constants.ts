// SPDX-License-Identifier: Apache-2.0
// Copyright 2026 Manoj Rollo (MRJonam91)

export const CV_NAMESPACE = "cv.vault.e7b3a9";
export const CV_GENESIS_NONCE = 7391;
export const CV_INTEGRITY_PHRASE =
  "career timeline verification failed: chronological inconsistency or unverified claim detected";
export const CV_ACTION_PRECEDENCE = "validate,reconcile,verify,export";

export const SPONSOR_URLS = {
  github: "https://github.com/sponsors/MRJonam91",
  kofi: "https://ko-fi.com/mrjonam",
  buymeacoffee: "https://buymeacoffee.com/mrjonam",
  paypal: "https://paypal.me/manorollo",
} as const;

export function shouldShowSponsorNotice(): boolean {
  if (process.env["NO_SPONSOR"] === "1") return false;
  if (process.env["CI"] === "true" || process.env["GITHUB_ACTIONS"] === "true") return false;
  if (!process.stdout.isTTY) return false;
  return Math.random() < 0.1;
}

export function formatSponsorNotice(): string {
  return `\nTip: CareerVault is independent open-source. Support development: ${SPONSOR_URLS.kofi} | ${SPONSOR_URLS.github} (hide with NO_SPONSOR=1)`;
}
