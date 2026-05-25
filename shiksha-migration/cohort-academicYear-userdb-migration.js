const axios = require('axios');
const { Client } = require('pg');
const dbConfig = require('./db');

console.log('=== Loading cohort-academic-year-migration.js ===');

async function migrateCohortAcademicYear() {
  console.log('=== STARTING COHORT ACADEMIC YEAR MIGRATION ===');

  const destClient = new Client(dbConfig.source);

  try {
    /**
     * CONNECT DESTINATION DB
     */
    await destClient.connect();

    console.log(
      '[COHORT_ACADEMIC_YEAR] Connected to destination database'
    );

    const tenantId = 'ef99949b-7f3a-4a5f-806a-e67e683e38f3';
    const adminUserId = '8058c0e1-8c78-4483-8add-495bbe774823';
    const apiBaseUrl = 'http://localhost:3000';
    const bearerToken = 'eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJPc3NtSUhXaW1NMDN2MUxsVnFvNHBqaS0ydEMwTGhLY0o5dmtwQTlJZV9zIn0.eyJleHAiOjE3Nzk2MzQxNjAsImlhdCI6MTc3OTU0Nzc2MCwianRpIjoiMDhmYWQ2OTEtMWIzMC00MGE5LTliMjItMjQwMTY5NDQ1MTFhIiwiaXNzIjoiaHR0cHM6Ly9kZXYtbG1wLnByYXRoYW1kaWdpdGFsLm9yZy9hdXRoL3JlYWxtcy9wcmF0aGFtIiwiYXVkIjoiYWNjb3VudCIsInN1YiI6IjgwNThjMGUxLThjNzgtNDQ4My04YWRkLTQ5NWJiZTc3NDgyMyIsInR5cCI6IkJlYXJlciIsImF6cCI6InByYXRoYW0iLCJzZXNzaW9uX3N0YXRlIjoiMzk4ODMzMWYtNjJkOC00MDVkLWI2ZjYtNmVhMzkxYzk2NjQ1IiwiYWNyIjoiMSIsImFsbG93ZWQtb3JpZ2lucyI6WyIvKiJdLCJyZWFsbV9hY2Nlc3MiOnsicm9sZXMiOlsib2ZmbGluZV9hY2Nlc3MiLCJ1bWFfYXV0aG9yaXphdGlvbiIsImRlZmF1bHQtcm9sZXMtcHJhdGhhbSJdfSwicmVzb3VyY2VfYWNjZXNzIjp7ImFjY291bnQiOnsicm9sZXMiOlsibWFuYWdlLWFjY291bnQiLCJtYW5hZ2UtYWNjb3VudC1saW5rcyIsInZpZXctcHJvZmlsZSJdfX0sInNjb3BlIjoiZW1haWwgcHJvZmlsZSBwcmF0aGFtLXJvbGUiLCJzaWQiOiIzOTg4MzMxZi02MmQ4LTQwNWQtYjZmNi02ZWEzOTFjOTY2NDUiLCJlbWFpbF92ZXJpZmllZCI6ZmFsc2UsIm5hbWUiOiJ0ZXN0IGthZmthIDYiLCJwcmVmZXJyZWRfdXNlcm5hbWUiOiJzYW1wbGVrYWZrYXRlc3QzMSIsInVzZXJfcm9sZXMiOiJTdXBlciBBZG1pbiIsImdpdmVuX25hbWUiOiJ0ZXN0IiwiZmFtaWx5X25hbWUiOiJrYWZrYSA2In0.xgvo1rnQ28cJkfc9_8c5eiN5nc1NhaEInnK80IZGRN14z62uPrfvTU3elb93xK9MRh9n2HBf4jQvnwgS8E0l6bMOllXXAyg5eHQFaAgH-t9ayvfj1stxFIDvUENB9bWSH8aq7GFmhYtViUK30iT5PJx8lZ17tw0BRmaA4yXnVsANNe2ezMGNd5vJLnYIhntF0AQAp8xgu39o059eGPVl2KITrulEdm4qs5lJVZ46qO_KvQql6_fHJ_Unqisoca4c_gofK5go8pnyJhDI6z7633LY0swBFWxWmOj-xwYpghDwwkw68_16uXpeyAVoVKMcX0jXrmtAkLm8EQnqgWQpmg'
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

    const academicYearRes = await destClient.query(
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
        AND type IN ('BATCH', 'CENTER')
    `;

    const cohortRes = await destClient.query(
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

        const existingRes = await destClient.query(
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

    await destClient.end();

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