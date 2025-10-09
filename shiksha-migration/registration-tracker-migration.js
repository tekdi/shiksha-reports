const { Client } = require('pg');
const dbConfig = require('./db');

console.log('=== Loading registration-tracker-migration.js ===');

function isUUID(value) {
  return typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

async function migrateRegistrationTracker() {
  console.log('=== STARTING REGISTRATION TRACKER MIGRATION ===');
  const sourceClient = new Client(dbConfig.source);
  const destClient = new Client(dbConfig.destination);

  try {
    await sourceClient.connect();
    console.log('[REG TRACKER] Connected to source database');
    await destClient.connect();
    console.log('[REG TRACKER] Connected to destination database');

    // Join UserTenantMapping with UserRolesMapping to get complete registration data
    const query = `
      SELECT 
        utm."userId",
        utm."tenantId",
        utm."createdAt" AS tenant_regn_date,
        urm."roleId",
        urm."createdAt" AS role_assigned_date
      FROM public."UserTenantMapping" utm
      INNER JOIN public."UserRolesMapping" urm 
        ON utm."userId" = urm."userId" 
        AND utm."tenantId" = urm."tenantId"
      WHERE utm."userId" IS NOT NULL 
        AND utm."tenantId" IS NOT NULL
        AND urm."roleId" IS NOT NULL
        AND utm."Id" IN (
'349ef422-f331-4ca7-8f63-62b519c06a6b',
'e227c8b8-beaa-47ee-b8d8-c9b803edc93f',
'0a60b671-d28f-4d22-8163-42c98ee1e589',
'341252bc-73fe-4e1e-acc1-1fd5529f21d5',
'928f9e50-438f-499e-9e1c-745cd4c1bfa7',
'a009b53a-c3f3-4708-aa04-a808796800d0',
'b16ca678-6957-4b97-aa38-39e2614dd500',
'58a76c08-9dcd-457d-bfb0-8d51f9ca1f4b',
'd29727d8-6ace-4cb4-8027-22210cade0d0',
'28469745-e336-4c88-a0e3-f30b212b34a6',
'83b25f0e-89a9-4881-ae6e-41a09430da23',
'bac23b4f-e15c-44e4-9aa8-6f829ea3aef6',
'83984a53-2cff-4ebf-a581-7791ae0a0bca',
'3d50ee68-0414-4633-bce8-89d9d0c7d48f',
'e73902f7-d992-40fc-a95b-fbdd7c9718b7',
'08963fbc-6ee9-4965-9bae-f02f5e26fbc4',
'2ba40c57-f891-4493-a83a-7842d8bd7a5b',
'83ace739-454a-489d-b32b-f5d38f83a370',
'817ce1a1-4bd9-4923-80ce-f9303ddd376b',
'ddbbe334-de2a-45db-a536-e1367e375354'
);
    `;

    const res = await sourceClient.query(query);
    console.log(`[REG TRACKER] Found ${res.rows.length} registration records.`);

    let processed = 0;
    for (const row of res.rows) {
      await upsertRegistrationTracker(destClient, row);
      processed += 1;
      console.log(`[REG TRACKER] Processed ${processed}/${res.rows.length} - User: ${row.userId}, Role: ${row.roleId}, Tenant: ${row.tenantId}`);
      // For testing one item, uncomment below
      // break;
    }

    console.log(`[REG TRACKER] ✅ REGISTRATION DATA UPDATED SUCCESSFULLY! Processed ${processed} records`);
  } catch (err) {
    console.error('[REG TRACKER] Critical error:', err);
  } finally {
    await sourceClient.end();
    await destClient.end();
    console.log('[REG TRACKER] Disconnected from databases');
  }
}

async function upsertRegistrationTracker(destClient, row) {
  const userId = row.userId;
  const roleId = row.roleId;
  const tenantId = row.tenantId;

  if (!userId || !roleId || !tenantId) {
    console.warn('[REG TRACKER] Skipping row due to missing required fields', { userId, roleId, tenantId });
    return;
  }

  // Use the earliest date as platform registration date (could be tenant or role assignment)
  const platformRegnDate = row.tenant_regn_date || row.role_assigned_date || null;
  const tenantRegnDate = row.tenant_regn_date || null;
  const isActive = true; // Default to active

  // Check if record exists based on (UserID, RoleID, TenantID)
  const existing = await destClient.query(
    'SELECT "REGID" FROM public."RegistrationTracker" WHERE "UserID"=$1 AND "RoleID"=$2 AND "TenantID"=$3 LIMIT 1',
    [userId, roleId, tenantId]
  );

  if (existing.rows.length > 0) {
    // Update existing record
    const updateSql = `
      UPDATE public."RegistrationTracker"
      SET "PlatformRegnDate"=$4,
          "TenantRegnDate"=$5,
          "IsActive"=$6
      WHERE "UserID"=$1 AND "RoleID"=$2 AND "TenantID"=$3
    `;
    await destClient.query(updateSql, [userId, roleId, tenantId, platformRegnDate, tenantRegnDate, isActive]);
    return;
  }

  // Insert new record
  const insertSql = `
    INSERT INTO public."RegistrationTracker" (
      "UserID", "RoleID", "TenantID", "PlatformRegnDate", "TenantRegnDate", "IsActive"
    ) VALUES ($1, $2, $3, $4, $5, $6)
  `;
  await destClient.query(insertSql, [userId, roleId, tenantId, platformRegnDate, tenantRegnDate, isActive]);
}

if (require.main === module) {
  console.log('Running registration-tracker-migration.js directly');
  migrateRegistrationTracker().catch(err => {
    console.error('RegistrationTracker migration failed with unhandled error:', err);
    process.exit(1);
  });
}

module.exports = { migrateRegistrationTracker };