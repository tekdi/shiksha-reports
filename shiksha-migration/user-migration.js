const { Client } = require('pg');
const dbConfig = require('./db');

console.log('=== Loading user-migration.js ===');

/**
 * Mapping of fieldId (UUIDs) to column names in the centralised_report.users table
 * Based on the actual fieldId UUIDs from your database
 */
const FIELD_ID_TO_COLUMN_MAPPING = {
  // Location hierarchy fields (based on CohortSummaryReport.js)
  '6469c3ac-8c46-49d7-852a-00f9589737c5': 'UserStateID',        // State (value: '27')
  'b61edfc6-3787-4079-86d3-37262bf23a9e': 'UserDistrictID',     // District (value: '515') 
  '4aab68ae-8382-43aa-a45a-e9b239319857': 'UserBlockID',        // Block (value: '7081')
  '8e9bb321-ff99-4e2e-9269-61e863dd0c54': 'UserVillageID',      // Village (value: '648170')
  
  // User profile fields (matching exact column names from destination table DDL)
	'7b43db0a-f4c3-4c77-919f-622509ca7add':'UserPreferredModeOfLearning', 
	'60f48fbf-d5e9-4a85-aa84-0739e727153c':'UserMotherName',
	'2914814c-2a0f-4422-aff8-6bd3b09d3069':'UserWorkDomain',
	'f3fac0c3-bc8b-4260-8b56-1608fd31c237':'UserFatherName',
	'0dd4cf0b-b774-439a-9997-5437cd78bfcd':'UserSpouseName',
	'a8d3d878-9b92-4231-b25c-b22726985238':'UserWhatDoYouWantToBecome',
	'9a4ad601-023b-467f-bbbe-bda1885f87c7':'UserClass',
	'4b9d798d-e8f2-4ae5-b177-a57655aa5d1c':'UserPreferredLanguage',
	'7ecaa845-901a-4ac7-a136-eed087f3b85b':'UserParentPhone',
	'3a7bf305-6bac-4377-bf09-f38af866105c':'UserGuardianRelation',
	'abb7f3fe-f7fa-47be-9d28-5747dd3159f2':'UserSubjectTaught',
	'ff472647-6c40-42e6-b200-dc74b241e915':'UserMaritalStatus',
	'5a2dbb89-bbe6-4aa8-b541-93e01ab07b70':'UserGrade',
	'0be5a8c6-92e9-4b7c-ac01-345131b06118':'UserTrainingCheck',
	'4f48571b-88fd-43b9-acb3-91afda7901ac':'UserDropOutReason',
	'd119d92f-fab7-4c7d-8370-8b40b5ed23dc':'UserOwnPhoneCheck',
	'e2f1fcbc-a76a-4b51-a092-ae4823bc45fd':'UserEnrollmentNumber',
	'4fc098c5-bec5-4afc-a15d-093805b05119':'UserDesignation',
	'f93c0ac3-f827-4794-9457-441fa1057b42':'UserBoard',
	'69a9dba2-e05e-40cd-a39c-047b9b676b5c':'UserSubject',
	'935bfb34-9be7-4676-b9cc-cec1ec4c0a2c':'UserMainSubject',
  '7b214a17-5a07-4ee0-bedc-271429862d30':'UserMedium',
  '5a2dbb89-bbe6-4aa8-b541-93e01ab07b70':'UserGuardianName',
  
  // New field mappings added as requested
  'da594b2e-c645-4a96-af15-6e2d24587c9a':'UserPhoneType',                    // phone_type_accessible
  'a4c2dace-e052-4e78-b6ad-9ffcc035c578':'UserNumOfChildrenWorkingWith'      // number_of_children_in_your_group
};

/**
 * Mapping of field IDs to field names for UserCustomField column
 * These fields will be stored in Users.UserCustomField column as JSON array
 * Format: [{"fieldId": "...", "fieldName": "...", "filedValue": "..."}]
 */
const CUSTOM_FIELD_ID_TO_NAME_MAPPING = {
  'a736e2f0-4f9b-4249-8fe5-1ff36754dc97': 'JobFamily',
  '432eb6dd-a92b-444f-ae75-42f604ad9a18': 'PSU',
  '29c36dd1-315c-46d9-bf6a-f1858ae71c33': 'GroupMembership'
};

/**
 * Mapping of FieldName (original names) to destination column names
 * Allows mapping even if we only know the field names
 */

// Boolean destination columns we should coerce "yes/no" to true/false
const BOOLEAN_DEST_COLUMNS = new Set([
  'UserOwnPhoneCheck',
  'UserTrainingCheck',
]);

async function migrateUsers() {
  console.log('=== STARTING USER MIGRATION ===');
  const sourceClient = new Client(dbConfig.source);
  const destClient = new Client(dbConfig.destination);

  try {
    await connectToDBs(sourceClient, destClient);

    // Step 1: Migrate core user data
    await migrateCoreUserData(sourceClient, destClient);
    
    // Step 2: Migrate field values to custom columns
    await migrateFieldValues(sourceClient, destClient);

    console.log('[USER MIGRATION] User migration completed successfully');
  } catch (error) {
    console.error('[USER MIGRATION] Error during user migration:', error);
  } finally {
    await closeDBs(sourceClient, destClient);
  }
  console.log('=== COMPLETED USER MIGRATION ===');
}

async function connectToDBs(sourceClient, destClient) {
  await sourceClient.connect();
  console.log('[USER MIGRATION] Connected to source database');
  
  await destClient.connect();
  console.log('[USER MIGRATION] Connected to destination database');
}

async function closeDBs(sourceClient, destClient) {
  await sourceClient.end();
  console.log('[USER MIGRATION] Disconnected from source database');
  
  await destClient.end();
  console.log('[USER MIGRATION] Disconnected from destination database');
}

/**
 * Gets the first value from a text array, handling various formats and data type conversion
 * @param {any} values - The values field from FieldValues table
 * @param {string} columnName - The destination column name for type conversion
 * @returns {string|boolean|number|null} - The converted value or null
 */
function getFirstValue(values, columnName = null) {
  if (!values) return null;
  
  let value;
  // If it's already a string, use it
  if (typeof values === 'string') {
    value = values;
  }
  // If it's an array, get the first element
  else if (Array.isArray(values) && values.length > 0) {
    value = values[0];
  } else {
    return null;
  }
  
  // Handle boolean fields
  if (columnName && BOOLEAN_DEST_COLUMNS.has(columnName)) {
    const normalized = String(value).toLowerCase();
    if (['yes','true','1'].includes(normalized)) return true;
    if (['no','false','0'].includes(normalized)) return false;
    return null;
  }
  
  // Handle numeric fields for location IDs
  if (columnName && (columnName.includes('StateID') || columnName.includes('DistrictID') || columnName.includes('BlockID') || columnName.includes('VillageID'))) {
    const numValue = parseInt(value);
    return isNaN(numValue) ? null : numValue;
  }
  
  return value;
}

/**
 * Migrates core user data from source Users table to destination users table
 * @param {Client} sourceClient - The client for the source database
 * @param {Client} destClient - The client for the destination database
 */
async function migrateCoreUserData(sourceClient, destClient) {
  console.log('[USER MIGRATION] Starting core user data migration...');
  
  // Get all users excluding the specified tenantId (using UserTenantMapping table)
  const usersQuery = `
    SELECT u."userId", u.username, u."name", u.email, u.mobile, u.dob, u."createdAt", u."updatedAt", u."createdBy", u."updatedBy", u.status,
           u.district, u.state, u."firstName", u."middleName", u."lastName", u.gender, u."enrollmentId"
    FROM public."Users" u
    LEFT JOIN public."UserTenantMapping" utm ON u."userId" = utm."userId" WHERE utm."tenantId" = '914ca990-9b45-4385-a06b-05054f35d0b9';
    ;
  `;
  console.log(usersQuery);
  
  const usersResult = await sourceClient.query(usersQuery);
  console.log(`[USER MIGRATION] Found ${usersResult.rows.length} users to migrate.`);
  
  for (const user of usersResult.rows) {
    await processCoreUser(destClient, user);
    // After processing core user, migrate their field values
    await migrateUserFieldValues(sourceClient, destClient, user.userId);
    console.log('[USER MIGRATION] 🛑 STOPPING AFTER ONE USER FOR TESTING');
    // break; // Stop after first user for testing
  }
  
  console.log('[USER MIGRATION] ✅ Finished core user data migration.');
}

async function processCoreUser(destClient, user) {
  try {
    console.log(`[USER MIGRATION] Processing core user: ${user.userId}`);
    
    const insertQuery = `
      INSERT INTO public."Users"(
        "UserID", "UserName", "UserFullName", "UserEmail", "UserDoB", "UserGender",
        "CreatedAt", "UpdatedAt", "CreatedBy", "UpdatedBy", "UserEnrollmentNumber"
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      ON CONFLICT ("UserID") DO UPDATE SET
        "UserName" = EXCLUDED."UserName",
        "UserFullName" = EXCLUDED."UserFullName",
        "UserEmail" = EXCLUDED."UserEmail",
        "UserDoB" = EXCLUDED."UserDoB",
        "UserGender" = EXCLUDED."UserGender",
        "UpdatedAt" = EXCLUDED."UpdatedAt",
        "UpdatedBy" = EXCLUDED."UpdatedBy",
        "UserEnrollmentNumber" = EXCLUDED."UserEnrollmentNumber"
      RETURNING "UserID"
    `;
    
    // Map source fields to destination fields
    const fullName = `${user.firstName || ''} ${user.middleName || ''} ${user.lastName || ''}`.trim() || user.name;
    
    const values = [
      user.userId,           // UserID
      user.username,         // UserName  
      fullName,              // UserFullName (combination of firstName, middleName, lastName or fallback to name)
      user.email,            // UserEmail
      user.dob,              // UserDoB
      user.gender,           // UserGender
      user.createdAt,        // CreatedAt
      user.updatedAt,        // UpdatedAt
      user.createdBy,        // CreatedBy
      user.updatedBy,        // UpdatedBy
      user.enrollmentId      // UserEnrollmentNumber
    ];
    
    const result = await destClient.query(insertQuery, values);
    if (result.rows && result.rows.length > 0) {
      console.log(`[USER MIGRATION] ✅ Successfully inserted/updated core user: ${result.rows[0].UserID}`);
    }
    
  } catch (error) {
    console.error(`[USER MIGRATION] Error processing core user ${user.userId}:`, error);
  }
}

/**
 * Fetch a map of fieldId -> fieldName for a set of fieldIds
 */
async function fetchFieldNamesByIds(sourceClient, fieldIds) {
  const idArray = Array.from(new Set(fieldIds));
  if (idArray.length === 0) return {};

  // Try common table/column names
  const candidateQueries = [
    'SELECT "fieldId", "name" as "fieldName" FROM public."Fields" WHERE "fieldId" = ANY($1::uuid[])',
    'SELECT "fieldId", "fieldName" FROM public."Fields" WHERE "fieldId" = ANY($1::uuid[])',
    'SELECT "fieldId", "name" as "fieldName" FROM public."Field" WHERE "fieldId" = ANY($1::uuid[])',
  ];

  for (const sql of candidateQueries) {
    try {
      const res = await sourceClient.query(sql, [idArray]);
      if (res.rows && res.rows.length > 0) {
        const map = {};
        for (const r of res.rows) {
          if (r.fieldid && r.fieldname) {
            map[r.fieldid] = r.fieldname;
          } else if (r.fieldId && r.fieldName) {
            map[r.fieldId] = r.fieldName;
          }
        }
        if (Object.keys(map).length > 0) return map;
      }
    } catch (e) {
      // ignore and try next
    }
  }
  return {};
}

/**
 * Migrates field values for a specific user from source FieldValues table to centralised_report.users columns
 * @param {Client} sourceClient - The client for the source database
 * @param {Client} destClient - The client for the destination database
 * @param {string} userId - The specific user ID to migrate field values for
 */
async function migrateUserFieldValues(sourceClient, destClient, userId) {
  console.log(`[USER MIGRATION] Starting field values migration for user: ${userId}...`);
  
  // Get field values for this specific user
  const fieldValuesQuery = `
    SELECT fv."itemId" as "userId", fv."fieldId", fv.value
    FROM public."FieldValues" fv
    WHERE fv."itemId" = $1
  `;
  
  const fieldValuesResult = await sourceClient.query(fieldValuesQuery, [userId]);
  console.log(`[USER MIGRATION] Found ${fieldValuesResult.rows.length} field value records for user ${userId}.`);
  
  if (fieldValuesResult.rows.length === 0) {
    console.log(`[USER MIGRATION] No field values found for user ${userId}, skipping field values migration.`);
    return;
  }

  // Process field values strictly by fieldId mapping
  const userFieldValues = {};
  const userCustomFields = []; // Array to store custom field objects
  
  for (const row of fieldValuesResult.rows) {
    const { fieldId, value } = row;
    
    // Check if this fieldId should go to UserCustomField column
    const customFieldName = CUSTOM_FIELD_ID_TO_NAME_MAPPING[fieldId];
    if (customFieldName) {
      const convertedValue = getFirstValue(value);
      // Only add to custom fields if value is not null
      if (convertedValue !== null && convertedValue !== undefined) {
        // Store as array of objects with fieldId, fieldName, and filedValue
        userCustomFields.push({
          fieldId: fieldId,
          fieldName: customFieldName,
          filedValue: convertedValue
        });
      }
      continue; // Skip regular column mapping for custom fields
    }
    
    // Regular column mapping
    const columnName = FIELD_ID_TO_COLUMN_MAPPING[fieldId];
    if (!columnName) continue;
    const convertedValue = getFirstValue(value, columnName);
    userFieldValues[columnName] = convertedValue;
  }
  
  // Add UserCustomField to the update if there are custom fields
  if (userCustomFields.length > 0) {
    userFieldValues['UserCustomField'] = JSON.stringify(userCustomFields);
  }
  
  // Update this user's record in the destination database
  if (Object.keys(userFieldValues).length > 0) {
    await processUser(destClient, userId, userFieldValues);
  } else {
    console.log(`[USER MIGRATION] No mappable field values found for user ${userId}.`);
  }
}

/**
 * Migrates field values from source FieldValues table to centralised_report.users columns
 * @param {Client} sourceClient - The client for the source database
 * @param {Client} destClient - The client for the destination database
 */
async function migrateFieldValues(sourceClient, destClient) {
  console.log('[USER MIGRATION] Field values migration will be handled per user during core user processing.');
}

async function processUser(destClient, userId, fieldData) {
  try {
    if (Object.keys(fieldData).length === 0) {
      return; // Skip if no mapped fields for this user
    }
    
    console.log(`[USER MIGRATION] Processing user: ${userId}`);
    
    // Build dynamic UPDATE query
    const setClause = [];
    const values = [userId]; // userId is always the first parameter
    let paramIndex = 2;
    
    for (const [columnName, value] of Object.entries(fieldData)) {
      // For UserCustomField, cast to JSONB since it contains JSON string
      if (columnName === 'UserCustomField') {
        setClause.push(`"${columnName}" = $${paramIndex}::jsonb`);
      } else {
        setClause.push(`"${columnName}" = $${paramIndex}`);
      }
      values.push(value);
      paramIndex++;
    }
    
    const updateQuery = `
      UPDATE public."Users" 
      SET ${setClause.join(', ')}
      WHERE "UserID" = $1
    `;

    const result = await destClient.query(updateQuery, values);
    if (result.rowCount > 0) {
      console.log(`[USER MIGRATION] ✅ Updated user ${userId} with ${Object.keys(fieldData).length} field values`);
    } else {
      console.warn(`[USER MIGRATION] ⚠️ No user found with UserID: ${userId} in destination database`);
    }
    
    console.log(`[USER MIGRATION] Completed processing user: ${userId}`);
  } catch (error) {
    console.error(`[USER MIGRATION] Error processing user ${userId}:`, error);
  }
}

/**
 * NOTE: insertUserMeta function removed
 * Custom fields (JobFamily, PSU, GroupMembership) are now stored in the 
 * Users.UserCustomField column instead of a separate UserMeta table.
 * See migrateUserFieldValues function for the implementation.
 */

// Run the migration only if this script is run directly (not imported)
if (require.main === module) {
  console.log('Running user-migration.js directly');
  migrateUsers().catch(err => {
    console.error('User migration failed:', err);
    process.exit(1);
  });
} else {
  console.log('user-migration.js loaded as a module');
}

module.exports = {
  migrateUsers
};