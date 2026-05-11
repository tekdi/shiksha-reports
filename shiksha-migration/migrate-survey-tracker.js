const { Client } = require('pg');
const dbConfig = require('./db');

async function migrateSurveyTracker() {
  console.log('=== STARTING SurveyTracker MIGRATION ===');

  const sourceClient = new Client(dbConfig.source);
  const destClient = new Client(dbConfig.destination);

  try {
    await sourceClient.connect();
    console.log('[SURVEY-TRACKER] Connected to source database');

    await destClient.connect();
    console.log('[SURVEY-TRACKER] Connected to destination database');

    // NOTE: pg driver lowercases all column names in row objects regardless of
    // how they are aliased in SQL. Use lowercase keys when reading from `row`.
    const responsesResult = await sourceClient.query(`
      SELECT
        r."responseId"      AS surveytrackingid,
        r."surveyId"        AS surveyid,
        r."tenantId"        AS tenantid,
        r."respondentId"    AS targetroleuserid,
        r."contextType"     AS context,
        r."contextId"       AS contextid,
        r."responseData"    AS surveysummary,
        r."status"          AS surveyresponsestatusindividual,
        COALESCE(r."createdAt", NOW()) AS createdat,
        COALESCE(r."updatedAt", NOW()) AS updatedat
      FROM public."SurveyResponses" r
      ORDER BY r."createdAt" ASC
    `);

    console.log(`[SURVEY-TRACKER] Found ${responsesResult.rows.length} responses in source DB`);

    let inserted = 0;
    let skipped = 0;

    for (const row of responsesResult.rows) {
      try {
        // Only populate SurveySummary for submitted responses — same behaviour as Kafka consumer
        const surveySummary = row.surveyresponsestatusindividual === 'submitted'
          ? JSON.stringify(row.surveysummary || {})
          : null;

        // Verify parent survey exists in destination before inserting
        const surveyExists = await destClient.query(
          `SELECT 1 FROM public."SurveyList" WHERE "SurveyID" = $1`,
          [row.surveyid]
        );

        if (surveyExists.rowCount === 0) {
          console.warn(`[SURVEY-TRACKER] ⚠️  Skipping response ${row.surveytrackingid} — parent SurveyID ${row.surveyid} not found in SurveyList. Run migrate-survey-list first.`);
          skipped++;
          continue;
        }

        await destClient.query(
          `INSERT INTO public."SurveyTracker" (
            "SurveyTrackingID",
            "SurveyID",
            "TenantID",
            "TargetRoleUserId",
            "Context",
            "ContextId",
            "SurveySummary",
            "SurveyResponseStatusIndividual",
            "CreatedAt",
            "UpdatedAt"
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
          ON CONFLICT ("SurveyTrackingID") DO UPDATE SET
            "SurveyResponseStatusIndividual" = EXCLUDED."SurveyResponseStatusIndividual",
            "SurveySummary"                  = EXCLUDED."SurveySummary",
            "Context"                        = EXCLUDED."Context",
            "ContextId"                      = EXCLUDED."ContextId",
            "UpdatedAt"                      = EXCLUDED."UpdatedAt"`,
          [
            row.surveytrackingid,
            row.surveyid,
            row.tenantid,
            row.targetroleuserid || null,
            row.context || null,
            row.contextid || null,
            surveySummary,
            row.surveyresponsestatusindividual,
            row.createdat,
            row.updatedat,
          ]
        );

        console.log(`[SURVEY-TRACKER] ✅ Upserted response ${row.surveytrackingid} — status: ${row.surveyresponsestatusindividual}`);
        inserted++;

      } catch (err) {
        console.error(`[SURVEY-TRACKER] ❌ Error upserting response ${row.surveytrackingid}:`, err.message);
        skipped++;
      }
    }

    console.log(`\n[SURVEY-TRACKER] === MIGRATION COMPLETE ===`);
    console.log(`[SURVEY-TRACKER] ✅ Upserted : ${inserted}`);
    console.log(`[SURVEY-TRACKER] ⚠️  Skipped  : ${skipped}`);
    console.log(`[SURVEY-TRACKER] Total processed: ${responsesResult.rows.length}`);

  } catch (error) {
    console.error('[SURVEY-TRACKER] Fatal error during migration:', error);
    throw error;
  } finally {
    await sourceClient.end();
    await destClient.end();
    console.log('[SURVEY-TRACKER] Disconnected from both databases');
  }

  console.log('=== COMPLETED SurveyTracker MIGRATION ===');
}

if (require.main === module) {
  migrateSurveyTracker().catch(err => {
    console.error('Migration failed:', err);
    process.exit(1);
  });
}

module.exports = { migrateSurveyTracker };
