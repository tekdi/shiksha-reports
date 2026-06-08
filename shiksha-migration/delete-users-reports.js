/**
 * delete-users-reports.js
 *
 * Deletes inactive user records from the Shiksha Reports (Central) DB.
 * Tables (in FK-safe order): RegistrationTracker → Users
 *
 * Usage:
 *   node delete-users-reports.js --dry-run    (count only, no deletes)
 *   node delete-users-reports.js --live       (actual deletion)
 *
 * Input:  shiksha-migration/users-to-delete.csv  (header: userId, one UUID per row)
 * Output: shiksha-migration/logs/deletion-reports-YYYY-MM-DD.json
 */

require('dotenv').config();
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
const dbConfig = require('./db');

// ── Config ────────────────────────────────────────────────────────────────────
const BATCH_SIZE = 5000;
const BATCH_PAUSE_MS = 100;
const CSV_PATH = path.join(__dirname, 'User-Data.csv');
const LOGS_DIR = path.join(__dirname, 'logs');
const CHECKPOINT_PATH = path.join(LOGS_DIR, 'checkpoint-reports.json');

// Deletion order respects FK constraints: child first, parent last
const TABLE_ORDER = [
  { name: 'RegistrationTracker', column: 'UserID' },
  { name: 'Users',               column: 'UserID' },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
function parseFlag() {
  const args = process.argv.slice(2);
  if (args.includes('--dry-run')) return 'dry-run';
  if (args.includes('--live'))    return 'live';
  console.error('ERROR: You must pass --dry-run or --live');
  console.error('  node delete-users-reports.js --dry-run');
  console.error('  node delete-users-reports.js --live');
  process.exit(1);
}

function loadUserIds() {
  if (!fs.existsSync(CSV_PATH)) {
    console.error(`ERROR: CSV file not found at ${CSV_PATH}`);
    process.exit(1);
  }
  const lines = fs.readFileSync(CSV_PATH, 'utf8')
    .split('\n')
    .map(l => l.trim().replace(/^"|"$/g, ''))
    .filter(l => l && l.toLowerCase() !== 'userid');

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  const valid = lines.filter(l => uuidRegex.test(l));
  const invalid = lines.length - valid.length;
  if (invalid > 0) console.warn(`WARN: Skipped ${invalid} non-UUID rows from CSV`);
  return valid;
}

function chunkArray(arr, size) {
  const chunks = [];
  for (let i = 0; i < arr.length; i += size) chunks.push(arr.slice(i, i + size));
  return chunks;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function writeLog(logObj) {
  if (!fs.existsSync(LOGS_DIR)) fs.mkdirSync(LOGS_DIR, { recursive: true });
  const filePath = path.join(LOGS_DIR, `deletion-reports-${todayStr()}.json`);
  fs.writeFileSync(filePath, JSON.stringify(logObj, null, 2), 'utf8');
  return filePath;
}

function loadCheckpoint() {
  if (!fs.existsSync(CHECKPOINT_PATH)) return 0;
  try {
    const data = JSON.parse(fs.readFileSync(CHECKPOINT_PATH, 'utf8'));
    return typeof data.lastCompletedBatch === 'number' ? data.lastCompletedBatch : 0;
  } catch { return 0; }
}

function saveCheckpoint(lastCompletedBatch) {
  if (!fs.existsSync(LOGS_DIR)) fs.mkdirSync(LOGS_DIR, { recursive: true });
  fs.writeFileSync(CHECKPOINT_PATH, JSON.stringify({ lastCompletedBatch }, null, 2), 'utf8');
}

function clearCheckpoint() {
  if (fs.existsSync(CHECKPOINT_PATH)) fs.unlinkSync(CHECKPOINT_PATH);
}

// ── Pre-flight count ──────────────────────────────────────────────────────────
async function preflightCounts(client, userIds) {
  console.log('\n── Pre-flight row counts ──────────────────────────────────');
  const counts = {};
  for (const { name, column } of TABLE_ORDER) {
    const res = await client.query(
      `SELECT COUNT(*) AS cnt FROM "${name}" WHERE "${column}" = ANY($1::uuid[])`,
      [userIds]
    );
    counts[name] = parseInt(res.rows[0].cnt, 10);
    console.log(`  ${name.padEnd(22)} ${counts[name].toLocaleString()} rows`);
  }
  console.log('───────────────────────────────────────────────────────────\n');
  return counts;
}

// ── Per-batch operation ───────────────────────────────────────────────────────
async function processBatch(client, batchIds, batchNum, mode) {
  const result = { batch: batchNum, size: batchIds.length, tables: {}, error: null };
  try {
    await client.query('BEGIN');
    for (const { name, column } of TABLE_ORDER) {
      if (mode === 'dry-run') {
        const res = await client.query(
          `SELECT COUNT(*) AS cnt FROM "${name}" WHERE "${column}" = ANY($1::uuid[])`,
          [batchIds]
        );
        result.tables[name] = { rowsAffected: parseInt(res.rows[0].cnt, 10), mode: 'dry-run' };
      } else {
        const res = await client.query(
          `DELETE FROM "${name}" WHERE "${column}" = ANY($1::uuid[])`,
          [batchIds]
        );
        result.tables[name] = { rowsAffected: res.rowCount, mode: 'live' };
      }
    }
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    result.error = err.message;
    console.error(`  ERROR in batch ${batchNum}: ${err.message}`);
  }
  return result;
}

// ── VACUUM ────────────────────────────────────────────────────────────────────
async function runVacuum(client) {
  console.log('\n── Running VACUUM ANALYZE ─────────────────────────────────');
  for (const { name } of TABLE_ORDER) {
    console.log(`  VACUUM ANALYZE "${name}"...`);
    await client.query(`VACUUM ANALYZE "${name}"`);
    console.log(`  done.`);
  }
  console.log('───────────────────────────────────────────────────────────\n');
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  const mode = parseFlag();
  console.log(`\n${'='.repeat(60)}`);
  console.log(`  DELETE-USERS-REPORTS  [${mode.toUpperCase()}]`);
  console.log(`  DB: ${dbConfig.destination.database} @ ${dbConfig.destination.host}`);
  console.log(`${'='.repeat(60)}\n`);

  const userIds = loadUserIds();
  console.log(`Loaded ${userIds.length.toLocaleString()} user IDs from CSV`);
  if (userIds.length === 0) { console.log('Nothing to process. Exiting.'); process.exit(0); }

  const client = new Client(dbConfig.destination);
  await client.connect();
  console.log('Connected to Shiksha Reports DB\n');

  const startedAt = new Date().toISOString();
  const preflightData = await preflightCounts(client, userIds);

  const batches = chunkArray(userIds, BATCH_SIZE);

  const resumeFrom = mode === 'live' ? loadCheckpoint() : 0;
  if (resumeFrom > 0) {
    console.log(`CHECKPOINT: Resuming from batch ${resumeFrom + 1} (${resumeFrom} batches already done)\n`);
  }
  console.log(`Processing ${batches.length} batches of up to ${BATCH_SIZE.toLocaleString()} users...\n`);

  const batchResults = [];
  const totals = {};
  TABLE_ORDER.forEach(({ name }) => { totals[name] = 0; });

  for (let i = 0; i < batches.length; i++) {
    const batchNum = i + 1;
    if (i < resumeFrom) {
      console.log(`  Batch ${batchNum}/${batches.length} — skipped (already completed)`);
      continue;
    }
    process.stdout.write(`  Batch ${batchNum}/${batches.length} (${batches[i].length} users)... `);
    const result = await processBatch(client, batches[i], batchNum, mode);
    batchResults.push(result);
    if (!result.error) {
      TABLE_ORDER.forEach(({ name }) => {
        totals[name] += result.tables[name]?.rowsAffected || 0;
      });
      console.log(`OK — ${Object.entries(result.tables).map(([t, v]) => `${t}: ${v.rowsAffected}`).join(', ')}`);
      if (mode === 'live') saveCheckpoint(batchNum);
    } else {
      console.error(`  Batch ${batchNum} failed. Re-run the script to resume from this batch.`);
    }
    if (i < batches.length - 1) await sleep(BATCH_PAUSE_MS);
  }

  if (mode === 'live') {
    await runVacuum(client);
    clearCheckpoint();
    console.log('Checkpoint cleared.\n');
  }
  await client.end();

  const finishedAt = new Date().toISOString();
  const logObj = {
    script: 'delete-users-reports.js',
    mode,
    database: dbConfig.destination.database,
    host: dbConfig.destination.host,
    startedAt,
    finishedAt,
    totalUsersInCsv: userIds.length,
    preflightCounts: preflightData,
    totalRowsAffected: totals,
    batches: batchResults,
  };

  const logPath = writeLog(logObj);

  console.log(`\n${'='.repeat(60)}`);
  console.log('  SUMMARY');
  console.log(`${'='.repeat(60)}`);
  TABLE_ORDER.forEach(({ name }) => {
    console.log(`  ${name.padEnd(22)} ${totals[name].toLocaleString()} rows ${mode === 'dry-run' ? 'would be deleted' : 'deleted'}`);
  });
  console.log(`  Log written to: ${logPath}`);
  console.log(`${'='.repeat(60)}\n`);

  if (mode === 'dry-run') {
    console.log('DRY RUN complete. Verify the counts above, then run with --live to execute.\n');
  } else {
    console.log('LIVE deletion complete. Verify log file and monitor DB health.\n');
  }
}

main().catch(err => {
  console.error('FATAL:', err.message);
  process.exit(1);
});
