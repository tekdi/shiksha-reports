# User Data Deletion — Design Spec
**Date:** 2026-06-03  
**Author:** Shubham Kumar  
**Status:** Approved

---

## Overview

Delete approximately 5,65,000 inactive users (NULL lastLogin, no tracker activity) from two databases. An S3 encrypted backup exists before deletion proceeds.

---

## Files Produced

| File | Purpose |
|------|---------|
| `shiksha-migration/delete-users-pratham.js` | Deletes from Pratham User DB |
| `shiksha-migration/delete-users-reports.js` | Deletes from Shiksha Reports DB |
| `shiksha-migration/users-to-delete.csv` | Input: one UUID per row, header `userId` |
| `shiksha-migration/logs/deletion-pratham-YYYY-MM-DD.json` | Run log for Script 1 |
| `shiksha-migration/logs/deletion-reports-YYYY-MM-DD.json` | Run log for Script 2 |
| `deletion-runbook.html` | Static operator runbook |

---

## Script Design (both scripts identical pattern)

### CLI Flags
- `--dry-run` — runs SELECT COUNT(*) instead of DELETE. Mandatory.
- `--live` — executes actual DELETE. Must be passed explicitly.
- No flag → script exits with error and usage instructions.

### Input
- Reads `users-to-delete.csv` using Node.js `fs`. Parses UUIDs, skips header and invalid rows, warns on skip count.

### Pre-flight
- Connects to DB.
- Runs SELECT COUNT(*) per table for the full user ID set before any deletion — prints and logs these counts.

### Batch Loop
- Chunks user IDs into arrays of 5,000.
- Per batch: opens a PostgreSQL transaction, deletes (or counts in dry-run) each table in FK-safe order, commits. On error: ROLLBACK, log error, continue to next batch.
- 100ms pause between batches to avoid I/O spikes.

### Table Order

**Script 1 — Pratham User DB:**
1. FieldValues (child)
2. UserRoleMapping (child)
3. UserTenantMapping (child)
4. Users (parent)

**Script 2 — Shiksha Reports DB:**
1. RegistrationTracker (child)
2. Users — central report record (parent)

### Completion
- Writes JSON log to `logs/deletion-{db}-YYYY-MM-DD.json` with: mode, timestamps, totalUsersInCsv, preflightCounts, totalRowsAffected, per-batch detail.
- Runs `VACUUM ANALYZE` on all affected tables (live mode only).
- Prints summary to console.

### Re-run Safety
Re-running after a crash is safe — already-deleted IDs produce 0 rows affected. The script processes all IDs in the CSV every time.

---

## DB Configuration

Uses existing `db.js` config:
- Script 1: `dbConfig.user_source` (env vars: `USER_SOURCE_DB_*`)
- Script 2: `dbConfig.destination` (env vars: `DEST_DB_*`)

---

## HTML Runbook

Single self-contained `deletion-runbook.html` (no external dependencies). Sections:
1. Overview + scale
2. Prerequisites checklist (interactive checkboxes)
3. Step-by-step execution with exact commands
4. FK dependency diagram
5. Log file field reference
6. Environment variables table
7. Rollback path
8. QA vs Production checklist

---

## Cautions

- Always run dry-run first. Verify pre-flight counts before live run.
- Run Script 1 completely and verify log before starting Script 2.
- Schedule during off-peak hours (night or weekend).
- DBA must monitor CPU, WAL, I/O during live run.
- Archive log files to S3 after completion for compliance.
