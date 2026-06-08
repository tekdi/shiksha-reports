const axios = require('axios');
const { Client } = require('pg');
const dbConfig = require('./db');

console.log('=== Loading cohort-academic-year-migration.js ===');

async function migrateCohortAcademicYear() {
  console.log('=== STARTING COHORT ACADEMIC YEAR MIGRATION ===');

  const dbclient = new Client(dbConfig.source);

  try {

    await dbclient.connect();

    console.log(
      '[COHORT_ACADEMIC_YEAR] Connected to database'
    );

    const tenantId = 'ef99949b-7f3a-4a5f-806a-e67e683e38f3';
    const adminUserId = '8058c0e1-8c78-4483-8add-495bbe774823';
    const apiBaseUrl = 'http://localhost:3000';
    const bearerToken = process.env.BEARER_TOKEN;
    /**
     * FETCH ACTIVE ACADEMIC YEAR FROM DB
     */
    const academicYearQuery = `
      SELECT id
      FROM public."AcademicYears"
      WHERE "isActive" = true
        AND "tenantId" = $1
      LIMIT 1
    `;

    const academicYearRes = await dbclient.query(
      academicYearQuery,
      [tenantId]
    );

    if (!academicYearRes.rows.length) {
      throw new Error('Active academic year not found');
    }

    const academicYearId = academicYearRes.rows[0].id;

    console.log(
      `[COHORT_ACADEMIC_YEAR] Active Academic Year: ${academicYearId}`
    );

    /**
     * FETCH ACTIVE COHORTS FROM DB
     */
    const cohortQuery = `
      SELECT "cohortId"
      FROM public."Cohort"
      WHERE status = 'active'
        AND "tenantId" = $1
        AND type IN ('BATCH', 'COHORT')
    `;

    const cohortRes = await dbclient.query(
      cohortQuery,
      [tenantId]
    );

    const cohorts = cohortRes.rows;

    console.log(
      `[COHORT_ACADEMIC_YEAR] Found ${cohorts.length} cohorts`
    );

    let inserted = 0;
    let skipped = 0;
    let failed = 0;

    for (const cohort of cohorts) {
      try {
        /**
         * CHECK EXISTING MAPPING
         */
        const existingQuery = `
          SELECT 1
          FROM public."CohortAcademicYear"
          WHERE "cohortId" = $1
            AND "academicYearId" = $2
          LIMIT 1
        `;

        const existingRes = await dbclient.query(
          existingQuery,
          [
            cohort.cohortId,
            academicYearId,
          ]
        );

        /**
         * SKIP IF ALREADY EXISTS
         */
        if (existingRes.rows.length) {
          skipped++;

          console.log(
            `[COHORT_ACADEMIC_YEAR] Skipped ${cohort.cohortId} - already mapped`
          );

          continue;
        }

        /**
         * CREATE MAPPING VIA API
         */
        await axios.post(
          `${apiBaseUrl}/user/v1/cohort-academic-year/create`,
          {
            cohortId: cohort.cohortId,
            academicYearId: academicYearId,
            createdBy: adminUserId,
            updatedBy: adminUserId,
          },
          {
            headers: {
              tenantId: tenantId,
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${bearerToken}`,
            },
          }
        );

        inserted++;

        console.log(
          `[COHORT_ACADEMIC_YEAR] Inserted ${cohort.cohortId}`
        );
      } catch (error) {
        failed++;

        console.error(
          `[COHORT_ACADEMIC_YEAR] Failed ${cohort.cohortId}:`,
          error.message
        );
      }
    }

    /**
     * FINAL SUMMARY
     */
    console.log('\n=== MIGRATION SUMMARY ===');

    console.log({
      total: cohorts.length,
      inserted,
      skipped,
      failed,
    });

    console.log(
      '[COHORT_ACADEMIC_YEAR] Migration completed successfully'
    );

  } catch (err) {

    console.error(
      '[COHORT_ACADEMIC_YEAR] Critical Error:',
      err.response?.data || err.message
    );

  } finally {

    await dbclient.end();

    console.log(
      '[COHORT_ACADEMIC_YEAR] Disconnected from database'
    );
  }
}
if (require.main === module) {
  console.log('Running cohort-academic-year-migration.js directly');
  migrateCohortAcademicYear().catch((err) => {
    console.error('Migration failed with unhandled error:', err);
    process.exit(1);
  });
}

module.exports = migrateCohortAcademicYear;