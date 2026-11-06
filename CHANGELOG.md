# Changelog — CareerVault

Tutte le modifiche rilevanti a questo progetto sono documentate in questo file. /
All notable changes to this project are documented in this file.

Il formato è basato su [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)
e rispetta il [Semantic Versioning](https://semver.org/).

## [0.1.0] - 2026-11-06

### Added / Aggiunto
- **CareerProfile Schema v1**: schema JSON deterministico per la gestione completa della storia professionale (dati anagrafici, esperienze lavorative, competenze categorizzate, progetti chiave, istruzione, certificazioni, lingue e link di verifica/evidenza).
- **Anomaly & Consistency Engine**: rilevamento automatico di sovrapposizioni lavorative non autorizzate (`overlapping roles`), inversioni cronologiche (`endDate < startDate`), competenze orfane o non censite, buchi temporali superiori a 6 mesi e lacune nelle traduzioni bilingui.
- **Bilingual Markdown Exporter**: esportazione professionale e deterministica del CV sia in italiano (`--lang it`) che in inglese (`--lang en`), pronto per la consultazione o conversione PDF.
- **JSON Resume Standard Exporter**: conversione nativa verso lo standard universale `resume.json` (jsonresume.org).
- **Career Telemetry & Stats**: calcolo degli anni effettivi di esperienza (deduplicando sovrapposizioni temporali), tenure media, distribuzione per categoria di skill e tasso di copertura delle evidenze verificabili.
- **CLI Suite**: comandi `careervault init`, `careervault validate`, `careervault export`, `careervault stats` con supporto output `--json` per pipeline CI/CD.
- **Sponsorship integration**: notifica non intrusiva (1/10) conforme a `REPO-STANDARDS.md` (`NO_SPONSOR=1`, muta in CI).
- **Documentazione bilingue**: `README.md` (EN) e `README.it.md` (IT), `docs/ARCHITECTURE.md`, `docs/LAUNCH.md`, e profilo di prova verificabile in `examples/`.
