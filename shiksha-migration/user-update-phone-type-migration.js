const { Client } = require('pg');
const dbConfig = require('./db');

console.log('=== Loading user-update-phone-type-migration.js ===');

/**
 * Field ID for UserPhoneType field
 */
const USER_PHONE_TYPE_FIELD_ID = 'da594b2e-c645-4a96-af15-6e2d24587c9a';

/**
 * Gets the first value from a text array, handling various formats
 * @param {any} values - The values field from FieldValues table
 * @returns {string|null} - The converted value or null
 */
function getFirstValue(values) {
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
  
  return value;
}

/**
 * Main function to update UserPhoneType for users where it is null
 */
async function updateUserPhoneType() {
  console.log('=== STARTING USER PHONE TYPE UPDATE MIGRATION ===');
  const sourceClient = new Client(dbConfig.source);
  const destClient = new Client(dbConfig.destination);

  try {
    await connectToDBs(sourceClient, destClient);

    // Step 1: Fetch users from destination where UserPhoneType is null
    const usersWithNullPhoneType = await fetchUsersWithNullPhoneType(destClient);
    
    if (usersWithNullPhoneType.length === 0) {
      console.log('[PHONE TYPE UPDATE] No users found with null UserPhoneType. Migration complete.');
      return;
    }

    console.log(`[PHONE TYPE UPDATE] Found ${usersWithNullPhoneType.length} users with null UserPhoneType.`);

    // Step 2: For each user, fetch and update UserPhoneType from source
    let successCount = 0;
    let skipCount = 0;
    let errorCount = 0;

    for (const user of usersWithNullPhoneType) {
      const result = await updatePhoneTypeForUser(sourceClient, destClient, user.UserID);
      
      if (result === 'success') successCount++;
      else if (result === 'skip') skipCount++;
      else errorCount++;
    }

    console.log('[PHONE TYPE UPDATE] ============================================');
    console.log(`[PHONE TYPE UPDATE] Migration Summary:`);
    console.log(`[PHONE TYPE UPDATE]   Total users processed: ${usersWithNullPhoneType.length}`);
    console.log(`[PHONE TYPE UPDATE]   Successfully updated: ${successCount}`);
    console.log(`[PHONE TYPE UPDATE]   Skipped (no value): ${skipCount}`);
    console.log(`[PHONE TYPE UPDATE]   Errors: ${errorCount}`);
    console.log('[PHONE TYPE UPDATE] ============================================');
    console.log('[PHONE TYPE UPDATE] User phone type update migration completed successfully');

  } catch (error) {
    console.error('[PHONE TYPE UPDATE] Error during user phone type update migration:', error);
  } finally {
    await closeDBs(sourceClient, destClient);
  }
  console.log('=== COMPLETED USER PHONE TYPE UPDATE MIGRATION ===');
}

/**
 * Connect to both source and destination databases
 */
async function connectToDBs(sourceClient, destClient) {
  await sourceClient.connect();
  console.log('[PHONE TYPE UPDATE] Connected to source database');
  
  await destClient.connect();
  console.log('[PHONE TYPE UPDATE] Connected to destination database');
}

/**
 * Close connections to both databases
 */
async function closeDBs(sourceClient, destClient) {
  await sourceClient.end();
  console.log('[PHONE TYPE UPDATE] Disconnected from source database');
  
  await destClient.end();
  console.log('[PHONE TYPE UPDATE] Disconnected from destination database');
}

/**
 * Fetch all users from destination where UserPhoneType is null
 * @param {Client} destClient - The client for the destination database
 * @returns {Array} - Array of user objects with null UserPhoneType
 */
async function fetchUsersWithNullPhoneType(destClient) {
  console.log('[PHONE TYPE UPDATE] Fetching users with null UserPhoneType from destination database...');
  
  const query = `
    SELECT "UserID"
    FROM public."Users"
    WHERE "UserPhoneType" IS NULL
    ORDER BY "UserID"
  `;
  
  const result = await destClient.query(query);
  console.log(`[PHONE TYPE UPDATE] Found ${result.rows.length} users with null UserPhoneType.`);
  
  return result.rows;
}

/**
 * Update UserPhoneType for a specific user
 * @param {Client} sourceClient - The client for the source database
 * @param {Client} destClient - The client for the destination database
 * @param {string} userId - The user ID to update
 * @returns {string} - Status: 'success', 'skip', or 'error'
 */
async function updatePhoneTypeForUser(sourceClient, destClient, userId) {
  try {
    console.log(`[PHONE TYPE UPDATE] Processing user: ${userId}`);
    
    // Fetch UserPhoneType value from source FieldValues table
    const fieldValueQuery = `
      SELECT fv.value
      FROM public."FieldValues" fv
      WHERE fv."itemId" = $1 AND fv."fieldId" = $2
    `;
    
    const fieldValueResult = await sourceClient.query(fieldValueQuery, [userId, USER_PHONE_TYPE_FIELD_ID]);
    
    if (fieldValueResult.rows.length === 0) {
      console.log(`[PHONE TYPE UPDATE] ⚠️ No UserPhoneType field value found for user ${userId} in source database. Skipping.`);
      return 'skip';
    }
    
    const phoneTypeValue = getFirstValue(fieldValueResult.rows[0].value);
    
    if (phoneTypeValue === null || phoneTypeValue === undefined) {
      console.log(`[PHONE TYPE UPDATE] ⚠️ UserPhoneType value is null/undefined for user ${userId}. Skipping.`);
      return 'skip';
    }
    
    // Update UserPhoneType in destination database
    const updateQuery = `
      UPDATE public."Users" 
      SET "UserPhoneType" = $1
      WHERE "UserID" = $2
    `;
    
    const updateResult = await destClient.query(updateQuery, [phoneTypeValue, userId]);
    
    if (updateResult.rowCount > 0) {
      console.log(`[PHONE TYPE UPDATE] ✅ Successfully updated UserPhoneType for user ${userId} with value: ${phoneTypeValue}`);
      return 'success';
    } else {
      console.warn(`[PHONE TYPE UPDATE] ⚠️ No user found with UserID: ${userId} in destination database`);
      return 'skip';
    }
    
  } catch (error) {
    console.error(`[PHONE TYPE UPDATE] ❌ Error processing user ${userId}:`, error);
    return 'error';
  }
}

// Run the migration only if this script is run directly (not imported)
if (require.main === module) {
  console.log('Running user-update-phone-type-migration.js directly');
  updateUserPhoneType().catch(err => {
    console.error('User phone type update migration failed:', err);
    process.exit(1);
  });
} else {
  console.log('user-update-phone-type-migration.js loaded as a module');
}

module.exports = {
  updateUserPhoneType
};

