const axios = require('axios');
const { Client } = require('pg');
const dbConfig = require('./db');

console.log('=== Loading cohort-members-academicYear-migration.js ===');

async function migrateCohortMembersAcademicYear() {
  console.log('=== STARTING COHORT MEMBERS ACADEMIC YEAR MIGRATION ===');

  const dbclient = new Client(dbConfig.source);

  try {
    /**
     * CONNECT TO DATABASE
     */
    await dbclient.connect();

    console.log(
      '[COHORT_MEMBERS_ACADEMIC_YEAR] Connected to database'
    );

    const tenantId = 'ef99949b-7f3a-4a5f-806a-e67e683e38f3';
    const apiBaseUrl = 'http://localhost:3000';
    const bearerToken = process.env.BEARER_TOKEN;
    /**
  * FETCH ACTIVE ACADEMIC YEAR FROM DB
  */
    const activeYearQuery = `
      SELECT id
      FROM public."AcademicYears"
      WHERE "isActive" = true
        AND "tenantId" = $1
      LIMIT 1
    `;

    const activeYearRes = await destClient.query(
      activeYearQuery,
      [tenantId]
    );

    if (!activeYearRes.rows.length) {
      throw new Error('Active academic year not found for tenant');
    }

    const academicYearId = activeYearRes.rows[0].id;

    console.log(
      `[COHORT_MEMBERS_ACADEMIC_YEAR] Active Academic Year: ${academicYearId}`
    );

    /**
     * FETCH ACTIVE Lead/Instructor MEMBERS FROM THE ACTIVE ACADEMIC YEAR
     */
    const membersQuery = `
      SELECT cm."userId", cm."cohortId", cay."cohortAcademicYearId"
      FROM public."CohortMembers" cm
      JOIN public."UserRolesMapping" urm ON cm."userId" = urm."userId"
      JOIN public."Roles" r ON urm."roleId" = r."roleId" AND r."name" IN ('Lead', 'Instructor')
      JOIN public."CohortAcademicYear" cay ON cm."cohortId" = cay."cohortId"
      JOIN public."Cohort" c ON c."cohortId" = cm."cohortId"
      WHERE c."tenantId" = $1
        AND cay."academicYearId" = $2
      GROUP BY cm."userId", cm."cohortId", cay."cohortAcademicYearId"
    `;

    const membersRes = await destClient.query(
      membersQuery,
      [tenantId, academicYearId]
    );

    const members = membersRes.rows;

    console.log(
      `[COHORT_MEMBERS_ACADEMIC_YEAR] Found ${members.length} active Lead/Instructor members from previous year`
    );

    let inserted = 0;
    let skipped = 0;
    let failed = 0;

    for (const member of members) {
      try {
        /**
         * CHECK EXISTING ACTIVE MAPPING IN NEW ACADEMIC YEAR
         */
        const existingQuery = `
          SELECT 1
          FROM public."CohortMembers" cm
          JOIN public."CohortAcademicYear" cay ON cm."cohortAcademicYearId" = cay."cohortAcademicYearId"
          WHERE cm."userId" = $1
            AND cm."cohortId" = $2
            AND cay."academicYearId" = $3
            AND cm.status = 'active'
          LIMIT 1
        `;

        const existingRes = await destClient.query(
          existingQuery,
          [
            member.userId,
            member.cohortId,
            academicYearId,
          ]
        );

        /**
         * SKIP IF ALREADY MAPPED
         */
        if (existingRes.rows.length) {
          skipped++;

          console.log(
            `[COHORT_MEMBERS_ACADEMIC_YEAR] Skipped ${member.userId} for cohort ${member.cohortId} - already mapped`
          );

          continue;
        }


        await axios.post(
          `${apiBaseUrl}/user/v1/cohortmember/create`,
          {
            userId: member.userId,
            cohortId: member.cohortId,
            cohortAcademicYearId: member.cohortAcademicYearId,
          },
          {
            headers: {
              'accept': '*/*',
              'academicyearid': academicYearId,
              'tenantid': tenantId,
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${bearerToken}`,
            },
          }
        );

        inserted++;

        console.log(
          `[COHORT_MEMBERS_ACADEMIC_YEAR] Inserted ${member.userId} for cohort ${member.cohortId}`
        );
      } catch (error) {
        failed++;

        console.error(
          `[COHORT_MEMBERS_ACADEMIC_YEAR] Failed ${member.userId}:`,
          error.response?.data || error.message
        );
      }
    }

    /**
     * FINAL SUMMARY
     */
    console.log('\n=== MIGRATION SUMMARY ===');

    console.log({
      total: members.length,
      inserted,
      skipped,
      failed,
    });

    console.log(
      '[COHORT_MEMBERS_ACADEMIC_YEAR] Migration completed successfully'
    );

  } catch (err) {

    console.error(
      '[COHORT_MEMBERS_ACADEMIC_YEAR] Critical Error:',
      err.response?.data || err.message
    );

  } finally {

    await destClient.end();

    console.log(
      '[COHORT_MEMBERS_ACADEMIC_YEAR] Disconnected from database'
    );
  }
}

if (require.main === module) {
  console.log('Running cohort-members-academicYear-migration.js directly');
  migrateCohortMembersAcademicYear().catch((err) => {
    console.error('Migration failed with unhandled error:', err);
    process.exit(1);
  });
}

module.exports = migrateCohortMembersAcademicYear;
