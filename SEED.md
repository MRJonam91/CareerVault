# CareerVault: decision seed & v1.0.0 status

IT — Scopo: CV, portfolio e profili riportano versioni incoerenti della carriera. Soluzione: Single Source of Truth deterministico, audit di coerenza ed esportazione bilingue Markdown, HTML e JSON Resume.
EN — Purpose: CVs, portfolios and profiles contain inconsistent career histories. Solution: Deterministic single source of truth, consistency audits, and bilingual Markdown, HTML, and JSON Resume exports.

## Stato di Rilascio / Release Status: v1.0.0 Stable
- [x] Schema unificato della carriera (`CareerProfile`) con supporto bilingue (IT/EN), metriche ed evidenze verificabili.
- [x] Motore di rilevamento anomalie (inversioni cronologiche, ruoli full-time sovrapposti non concorrenti, competenze orfane o non dichiarate, buchi temporali superiori a 3 mesi, verifiche per ruoli senior).
- [x] Generatore di CV in Markdown bilingue (italiano e inglese) e supporto per JSON Resume standard (import ed export).
- [x] Esportatore HTML reattivo, autonomo e ottimizzato per stampa e conversione PDF via browser (`@media print`).
- [x] Funzionalità Blind CV & Privacy (`careervault anonymize`, opzione `--anonymize`) per selezioni imparziali e screening riservato.
- [x] Motore di diff semantico della carriera (`careervault diff <old> <new>`) per tracciare evoluzioni e disallineamenti nel tempo.
- [x] Calcolo della telemetria di carriera (anni/mesi deduplicati unificando le sovrapposizioni temporali).
- [x] Suite CLI completa (`init`, `validate`, `export`, `diff`, `import`, `anonymize`, `stats`, supporto stdin `-` e `--strict`).
- [x] Suite di test automatizzati nativi con 26 test verdi e zero dipendenze di runtime.
- [x] Standard di repository MRJonam91 applicati (Apache-2.0, NOTICE, LICENSING.md, FUNDING.yml, CI con guardia core < 1500 righe).
