const { Client } = require('pg');
const dbConfig = require('./db');

const WORKING_VILLAGE_FIELD_ID = 'd2d3e5a1-db20-4083-aed6-faa3a4d88489';

async function migrateUserWorkingVillage() {
  console.log('=== STARTING UserWorkingVillage MIGRATION ===');

  const sourceClient = new Client(dbConfig.source);
  const destClient = new Client(dbConfig.destination);

  try {
    await sourceClient.connect();
    console.log('[WORKING-VILLAGE] Connected to source database');

    await destClient.connect();
    console.log('[WORKING-VILLAGE] Connected to destination database');

    // Fetch all users who have a WorkingVillage value set in source FieldValues
    const fieldValuesResult = await sourceClient.query(
      `SELECT "itemId" AS "userId", value
       FROM public."FieldValues"
       WHERE "fieldId" = $1`,
      [WORKING_VILLAGE_FIELD_ID]
    );
    console.log(`[WORKING-VILLAGE] Found ${fieldValuesResult.rows.length} WorkingVillage records in source DB`);
    let updated = 0;
    let skipped = 0;

    for (const row of fieldValuesResult.rows) {
      const { userId, value } = row;

      const workingVillage = extractValue(value);

      if (workingVillage === null || workingVillage === undefined) {
        console.log(`[WORKING-VILLAGE] ⚠️ Skipping user ${userId} — empty or null value`);
        skipped++;
        continue;
      }

      try {
        const result = await destClient.query(
          `UPDATE public."Users"
           SET "UserWorkingVillage" = $1
           WHERE "UserID" = $2`,
          [workingVillage, userId]
        );

        if (result.rowCount > 0) {
          console.log(`[WORKING-VILLAGE] ✅ Updated UserWorkingVillage for user ${userId}: ${workingVillage}`);
          updated++;
        } else {
          console.warn(`[WORKING-VILLAGE] ⚠️ User ${userId} not found in destination DB`);
          skipped++;
        }
      } catch (err) {
        console.error(`[WORKING-VILLAGE] ❌ Error updating user ${userId}:`, err.message);
        skipped++;
      }
    }

    console.log(`\n[WORKING-VILLAGE] === MIGRATION COMPLETE ===`);
    console.log(`[WORKING-VILLAGE] ✅ Updated : ${updated}`);
    console.log(`[WORKING-VILLAGE] ⚠️ Skipped : ${skipped}`);
    console.log(`[WORKING-VILLAGE] Total processed: ${fieldValuesResult.rows.length}`);

  } catch (error) {
    console.error('[WORKING-VILLAGE] Fatal error during migration:', error);
  } finally {
    await sourceClient.end();
    await destClient.end();
    console.log('[WORKING-VILLAGE] Disconnected from both databases');
  }

  console.log('=== COMPLETED UserWorkingVillage MIGRATION ===');
}

/**
 * Extracts the first value from a FieldValues value field.
 * Handles string, array, or null formats.
 */
function extractValue(value) {
  if (value === null || value === undefined) return null;
  if (typeof value === 'string') return value.trim() || null;
  if (Array.isArray(value) && value.length > 0) {
    const ids = value.map(v => String(v).trim()).filter(Boolean);
    return ids.length > 0 ? ids.join(',') : null;
  }
  return null;
}

if (require.main === module) {
  migrateUserWorkingVillage().catch(err => {
    console.error('Migration failed:', err);
    process.exit(1);
  });
}

module.exports = { migrateUserWorkingVillage };
