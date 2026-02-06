const { Client } = require('pg');
const axios = require('axios');
const dbConfig = require('./db');

console.log('=== Loading content-migration.js ===');

const API_URL = 'https://interface.prathamdigital.org/interface/v1/action/composite/v3/search';
const LIMIT = 1000;

// Define which fields should be stored as arrays
const ARRAY_FIELDS = [
  'se_domains',
  'se_subdomains',
  'se_subjects',
  'targetAgeGroup',
  'audience',
  'program',
  'keywords',
  'contentLanguage'
];

// Generate array of dates between start and end date
function getDateRange(startDateStr, endDateStr) {
  const dates = [];
  const startDate = new Date(startDateStr);
  const endDate = new Date(endDateStr);
  
  const currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    // Format as YYYY-MM-DD
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const day = String(currentDate.getDate()).padStart(2, '0');
    dates.push(`${year}-${month}-${day}`);
    
    // Move to next day
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return dates;
}

// Fetch data from API with pagination and date filter
async function fetchDataFromAPI(offset = 0, createdOnDate = null) {
  const headers = {
    'Content-Type': 'application/json',
    'User-Agent': 'Shiksha-Reports-Cron/1.0',
    'Cookie': 'AWSALB=AexPo8Pmp6oMCH3rjxzJLf4yo+LvQLlq+eal+Hr8XngG57iNuDahB+T7tcxcrBvMa6eURBlRJjjG9vrRIYdF++asDMxFA95NkXfwLSL5YYfwo3heTwT8xiE3Byb2; AWSALBCORS=AexPo8Pmp6oMCH3rjxzJLf4yo+LvQLlq+eal+Hr8XngG57iNuDahB+T7tcxcrBvMa6eURBlRJjjG9vrRIYdF++asDMxFA95NkXfwLSL5YYfwo3heTwT8xiE3Byb2'
  };

  const filters = {
    status: ["Retired","Unlisted"],
    primaryCategory: ["Learning Resource", "Story", "Activity", "Interactive"]
  };

  // Add lastUpdatedOn filter if date is provided
  if (createdOnDate) {
    filters.lastUpdatedOn = createdOnDate;
  }

  const payload = {
    request: {
      filters: filters,
      fields: [
        "identifier", "name", "author", "primaryCategory", "channel", "status",
        "contentType", "contentLanguage", "se_domains", "se_subdomains", "se_subjects",
        "targetAgeGroup", "audience", "program", "keywords", "description",
        "createdBy", "lastPublishedOn", "createdOn"
      ],
      limit: LIMIT,
      offset: offset
    }
  };

  const dateInfo = createdOnDate ? ` for date: ${createdOnDate}` : '';
  console.log(`[API MIGRATION] Fetching data with offset: ${offset}, limit: ${LIMIT}${dateInfo}`);
  const res = await axios.post(API_URL, payload, { headers });
  return res.data;
}

// Process field value - convert arrays to JSON strings for text columns
function processFieldValue(fieldName, value) {
  // If the field should be an array
  if (ARRAY_FIELDS.includes(fieldName)) {
    // If value is already an array, convert to JSON string
    if (Array.isArray(value)) {
      return JSON.stringify(value);
    }
    // If value is null or undefined, return null
    if (value == null) {
      return null;
    }
    // If it's a string, wrap it in an array and convert to JSON
    if (typeof value === 'string') {
      return JSON.stringify([value]);
    }
    // Otherwise return null for safety
    return null;
  }
  
  // For non-array fields, return value as is
  return value;
}

// Insert data into database
async function insertDataToDatabase(destClient, data) {
  console.log(`[API MIGRATION] Inserting ${data.length} records to database`);
  
  for (const record of data) {
  const insertQuery = `
    INSERT INTO public."Content"(
      "identifier", "name", "author", "primaryCategory", "channel", "status",
      "contentType", "contentLanguage", "domains", "subdomains", "subjects",
      "targetAgeGroup", "audience", "program", "keywords", "description",
      "createdBy", "lastPublishedOn", "createdOn"
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
    ON CONFLICT ("identifier") DO UPDATE SET
      "name" = EXCLUDED."name",
      "author" = EXCLUDED."author",
      "primaryCategory" = EXCLUDED."primaryCategory",
      "channel" = EXCLUDED."channel",
      "status" = EXCLUDED."status",
      "contentType" = EXCLUDED."contentType",
      "contentLanguage" = EXCLUDED."contentLanguage",
      "domains" = EXCLUDED."domains",
      "subdomains" = EXCLUDED."subdomains",
      "subjects" = EXCLUDED."subjects",
      "targetAgeGroup" = EXCLUDED."targetAgeGroup",
      "audience" = EXCLUDED."audience",
      "program" = EXCLUDED."program",
      "keywords" = EXCLUDED."keywords",
      "description" = EXCLUDED."description",
      "createdBy" = EXCLUDED."createdBy",
      "lastPublishedOn" = EXCLUDED."lastPublishedOn",
      "createdOn" = EXCLUDED."createdOn"
    RETURNING "identifier"
  `;

  const values = [
    record.identifier,
    record.name,
    record.author,
    record.primaryCategory,
    record.channel,
    record.status,
    record.contentType,
    processFieldValue('contentLanguage', record.contentLanguage),
    processFieldValue('se_domains', record.se_domains),
    processFieldValue('se_subdomains', record.se_subdomains),
    processFieldValue('se_subjects', record.se_subjects),
    processFieldValue('targetAgeGroup', record.targetAgeGroup),
    processFieldValue('audience', record.audience),
    processFieldValue('program', record.program),
    processFieldValue('keywords', record.keywords),
    record.description,
    record.createdBy,
    record.lastPublishedOn,
    record.createdOn
  ];

  const result = await destClient.query(insertQuery, values);
  console.log(`[API MIGRATION] ✅ Inserted/updated record: ${result.rows[0].identifier}`);
}

  console.log(`[API MIGRATION] ✅ Successfully processed ${data.length} records`);
}

// Process migration for a specific date with pagination
async function processDailyMigration(destClient, date) {
  console.log(`\n[API MIGRATION] 📅 Processing date: ${date}`);
  
  let offset = 0;
  let dateRecords = 0;
  let hasMoreData = true;

  while (hasMoreData) {
    console.log(`[API MIGRATION] Fetching batch starting at offset: ${offset} for date: ${date}`);
    
    const response = await fetchDataFromAPI(offset, date);
    
    // Extract content from response
    const apiData = response?.result?.content || [];
    
    if (!apiData || apiData.length === 0) {
      console.log(`[API MIGRATION] No more data for date: ${date}`);
      hasMoreData = false;
      break;
    }
    
    console.log(`[API MIGRATION] Received ${apiData.length} records from API for date: ${date}`);

    // Insert data into database
    await insertDataToDatabase(destClient, apiData);

    dateRecords += apiData.length;
    console.log(`[API MIGRATION] 📊 Date Progress: Processed ${dateRecords} records for ${date} (current offset: ${offset})`);
    
    // If we got less than LIMIT records, we've reached the end for this date
    if (apiData.length < LIMIT) {
      console.log(`[API MIGRATION] Reached end of data for date: ${date} (received less than limit)`);
      hasMoreData = false;
    } else {
      offset += LIMIT;
      console.log(`[API MIGRATION] ✅ Batch completed for ${date}. Next offset will be: ${offset}`);
    }
  }

  console.log(`[API MIGRATION] ✅ Completed processing for ${date}: ${dateRecords} records`);
  return dateRecords;
}

// Main migration function with date range (January 15, 2026 to February 5, 2026)
async function migrateFromAPI(startDate = '2026-01-15', endDate = '2026-02-05') {
  console.log('=== STARTING API MIGRATION WITH DATE RANGE ===');
  console.log(`[API MIGRATION] Date Range: ${startDate} to ${endDate}`);
  
  const destClient = new Client(dbConfig.destination);

  try {
    await destClient.connect();
    console.log('[API MIGRATION] Connected to destination database');

    // Generate array of dates to process
    const dates = getDateRange(startDate, endDate);
    console.log(`[API MIGRATION] Total dates to process: ${dates.length}`);
    console.log(`[API MIGRATION] Dates: ${dates.join(', ')}`);

    let totalRecords = 0;
    let processedDates = 0;

    // Process each date
    for (const date of dates) {
      console.log(`\n[API MIGRATION] ============================================`);
      console.log(`[API MIGRATION] Processing ${processedDates + 1}/${dates.length}: ${date}`);
      console.log(`[API MIGRATION] ============================================`);
      
      try {
        const dateRecords = await processDailyMigration(destClient, date);
        totalRecords += dateRecords;
        processedDates++;
        
        console.log(`[API MIGRATION] ✅ Date ${date} completed: ${dateRecords} records`);
        console.log(`[API MIGRATION] 📊 Overall Progress: ${processedDates}/${dates.length} dates, ${totalRecords} total records`);
      } catch (error) {
        console.error(`[API MIGRATION] ❌ Error processing date ${date}:`, error.message);
        console.error(`[API MIGRATION] ⚠️ Continuing with next date...`);
        // Continue with next date instead of stopping
      }
    }

    console.log(`\n[API MIGRATION] ✅ API migration completed successfully`);
    console.log(`[API MIGRATION] Total dates processed: ${processedDates}/${dates.length}`);
    console.log(`[API MIGRATION] Total records processed: ${totalRecords}`);
  } catch (error) {
    console.error('[API MIGRATION] ❌ Error during API migration:', error);
    throw error;
  } finally {
    await destClient.end();
    console.log('[API MIGRATION] Disconnected from database');
  }
  console.log('=== COMPLETED API MIGRATION ===');
}

// Run the migration only if this script is run directly
if (require.main === module) {
  console.log('Running content-migration.js directly');
  
  // Get date range from command line arguments
  // Usage: node content-migration.js [startDate] [endDate]
  // Example: node content-migration.js 2026-01-15 2026-02-05
  const startDate = process.argv[2] || '2026-01-15';
  const endDate = process.argv[3] || '2026-02-05';
  
  console.log(`📍 Starting migration with date range: ${startDate} to ${endDate}`);
  
  migrateFromAPI(startDate, endDate).catch(err => {
    console.error('API migration failed:', err);
    process.exit(1);
  });
} else {
  console.log('content-migration.js loaded as a module');
}

module.exports = {
  migrateFromAPI,
  fetchDataFromAPI,
  insertDataToDatabase,
  processDailyMigration,
  getDateRange
};