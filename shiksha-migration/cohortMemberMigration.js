const { Client } = require('pg');
const dbConfig = require('./db');

console.log('=== Loading cohort-members-migration.js ===');


async function migrateCohortMembers() {
  console.log('=== STARTING COHORT MEMBERS MIGRATION ===');
  const sourceClient = new Client(dbConfig.source);
  const destClient = new Client(dbConfig.destination);

  try {
    await sourceClient.connect();
    console.log('[COHORT MEMBERS] Connected to source database');
    await destClient.connect();
    console.log('[COHORT MEMBERS] Connected to destination database');

    const query = `
      SELECT 
        cm."cohortMembershipId",
        cm."cohortId",
        cm."userId",
        cm.status,
        cm."statusReason",
        cm."cohortAcademicYearId",
        cm."createdAt",
        cm."updatedAt",
        cay."academicYearId"
      FROM public."CohortMembers" cm
      LEFT JOIN public."CohortAcademicYear" cay
        ON cm."cohortAcademicYearId" = cay."cohortAcademicYearId"
      WHERE cm."statusReason" is not null
    `;

    const res = await sourceClient.query(query);
    console.log(`[COHORT MEMBERS] Found ${res.rows.length} cohort member records to migrate.`);
    for (const row of res.rows) {
      await upsertCohortMember(destClient, row);
    }

    console.log('[COHORT MEMBERS] Migration completed successfully');
  } catch (err) {
    console.error('[COHORT MEMBERS] Critical error:', err);
  } finally {
    await sourceClient.end();
    await destClient.end();
    console.log('[COHORT MEMBERS] Disconnected from databases');
  }
}

async function upsertCohortMember(destClient, row) {
  try {
    const upsert = `
  UPDATE public."CohortMember"
  SET "StatusReason" = $2
  WHERE "CohortMemberID" = $1;
`;
    const values = [
      row.cohortMembershipId,
      row.statusReason || null
    ];
    await destClient.query(upsert, values);
  } catch (e) {
    console.error(`[COHORT MEMBERS] Error upserting CohortMemberID=${row.cohortMembershipId}:`, e.message);
  }
}

if (require.main === module) {
  console.log('Running cohort-members-migration.js directly');
  migrateCohortMembers().catch(err => {
    console.error('CohortMembers migration failed with unhandled error:', err);
    process.exit(1);
  });
}

module.exports = { migrateCohortMembers };