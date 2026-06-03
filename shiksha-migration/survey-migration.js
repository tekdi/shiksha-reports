const { MongoClient, ObjectId } = require('mongodb');
const ExcelJS = require('exceljs');
const path = require('path');
require('dotenv').config();

console.log('=== Loading survey-migration.js ===');

/*
 * SURVEY MIGRATION: MongoDB observationSubmissions → Excel
 *
 * Source: MongoDB - observationSubmissions collection
 * Output: Excel file with survey responses
 *
 * Query Conditions:
 * - solutionId: 68a83da32414d190a3c82b53
 * - status: "completed"
 *
 * Excel Headers: UserId, Question Name, Answer, File Name
 * - UserId = entityId from document
 * - Question: Consent taken? (from answers key 68a83da32414d190a3c82b4c)
 */

const SOLUTION_ID = '68a83da32414d190a3c82b53';
const CONSENT_QUESTION_KEY = '68a83da32414d190a3c82b4c';
const QUESTION_NAME = 'Consent taken?';

// Map raw answer codes to display values for consent question
const ANSWER_MAP = { R1: 'Yes', R2: 'No' };

/**
 * Map raw answer (R1/R2) to display value (Yes/No)
 */
function mapAnswerDisplay(rawAnswer) {
  if (!rawAnswer) return '';
  const mapped = ANSWER_MAP[rawAnswer];
  return mapped != null ? mapped : rawAnswer;
}

/**
 * Parse value - handle JSON string from MongoDB
 */
function parseValue(val) {
  if (val == null) return val;
  if (typeof val === 'string' && (val.trim().startsWith('[') || val.trim().startsWith('{'))) {
    try {
      return JSON.parse(val);
    } catch (_) {
      return val;
    }
  }
  return val;
}

/**
 * Recursively find previewUrl or url in any nested structure
 */
function findFileUrl(obj, depth = 0) {
  if (!obj || depth > 10) return '';
  const parsed = parseValue(obj);
  if (parsed !== obj) obj = parsed;

  if (typeof obj === 'string') {
    if (obj.startsWith('http://') || obj.startsWith('https://')) return obj;
    return '';
  }
  if (typeof obj !== 'object') return '';

  // Direct previewUrl/url on object
  if (obj.previewUrl) return obj.previewUrl;
  if (obj.url && (obj.url.startsWith('http://') || obj.url.startsWith('https://'))) return obj.url;

  // Recurse into array
  if (Array.isArray(obj)) {
    for (const item of obj) {
      const found = findFileUrl(item, depth + 1);
      if (found) return found;
    }
    return '';
  }

  // Recurse into object properties (payload, files, value, data, etc.)
  for (const key of Object.keys(obj)) {
    const found = findFileUrl(obj[key], depth + 1);
    if (found) return found;
  }
  return '';
}

/**
 * Extract answer value and file name from the consent question answer
 */
function extractAnswerAndFile(answerValue) {
  let answer = '';
  let fileName = '';

  if (answerValue == null || answerValue === '') {
    return { answer: '', fileName: '' };
  }

  const parsed = parseValue(answerValue);
  const val = parsed !== answerValue ? parsed : answerValue;

  // Get fileName from anywhere in the structure
  fileName = findFileUrl(val);

  // Get answer (R1/R2 for Yes/No)
  if (typeof val === 'string' && !val.startsWith('http')) {
    answer = val;
  } else if (val && typeof val === 'object') {
    if (val.value != null) answer = String(val.value);
    else if (Array.isArray(val) && val[0] && val[0].value != null) answer = String(val[0].value);
  }

  return { answer, fileName };
}

/**
 * Get value from answers - handles both plain object and Map
 */
function getAnswer(answers, key) {
  if (!answers) return undefined;
  if (answers.get && typeof answers.get === 'function') return answers.get(key);
  return answers[key];
}

/**
 * Transform observationSubmission document to Excel row
 */
function transformToRow(submission) {
  const entityId = submission.entityId || submission.entity_id || '';
  const answers = submission.answers || {};

  // Only extract the consent question (68a83da32414d190a3c82b4c)
  const consentAnswer = getAnswer(answers, CONSENT_QUESTION_KEY);
  let { answer, fileName } = extractAnswerAndFile(consentAnswer);

  // Fallback: search evidences if file not found in answers (Sunbird/Elevate schema)
  if (!fileName && submission.evidences) {
    const evidence = getAnswer(submission.evidences, CONSENT_QUESTION_KEY);
    fileName = findFileUrl(evidence);
  }
  if (!fileName && submission.criteria) {
    for (const c of submission.criteria || []) {
      const ev = getAnswer(c.evidences || c.evidence || {}, CONSENT_QUESTION_KEY);
      fileName = findFileUrl(ev);
      if (!fileName && (c.criteriaId === CONSENT_QUESTION_KEY || c.criteriaId?.[0] === CONSENT_QUESTION_KEY)) {
        fileName = findFileUrl(c);
      }
      if (fileName) break;
    }
  }

  return {
    UserId: entityId,
    'Question Name': QUESTION_NAME,
    Answer: mapAnswerDisplay(answer),
    'File Name': fileName,
  };
}

/**
 * Main migration function - fetches from MongoDB and exports to Excel
 */
async function migrateSurveys() {
  console.log('=== STARTING SURVEY MIGRATION ===');

  let mongoClient;

  try {
    const mongoUrl = process.env.MONGO_URL || 'mongodb://localhost:27017';
    const mongoDbName = process.env.MONGO_DB_NAME || 'elevate-samiksha';

    console.log(`[SURVEY MIGRATION] Connecting to MongoDB: ${mongoUrl}`);
    mongoClient = new MongoClient(mongoUrl);
    await mongoClient.connect();
    console.log('[SURVEY MIGRATION] Connected to MongoDB');

    const db = mongoClient.db(mongoDbName);
    const collection = db.collection('observationSubmissions');

    // Query: solutionId + status completed
    // Handle both ObjectId and string formats for solutionId
    const solutionIdFilter = { $in: [new ObjectId(SOLUTION_ID), SOLUTION_ID] };
    const query = {
      solutionId: solutionIdFilter,
      status: 'completed',
    };

    console.log('[SURVEY MIGRATION] Fetching observationSubmissions...');
    const submissions = await collection.find(query).toArray();

    console.log(`[SURVEY MIGRATION] Found ${submissions.length} completed submissions`);

    // Build rows for Excel
    const rows = submissions.map(transformToRow);

    // Create Excel workbook
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Survey Migration';
    workbook.created = new Date();

    const worksheet = workbook.addWorksheet('Survey Responses', {
      headerFooter: { firstHeader: 'Survey Data Export' },
    });

    // Define columns
    worksheet.columns = [
      { header: 'UserId', key: 'UserId', width: 40 },
      { header: 'Question Name', key: 'Question Name', width: 20 },
      { header: 'Answer', key: 'Answer', width: 30 },
      { header: 'File Name', key: 'File Name', width: 80 },
    ];

    // Style header row
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' },
    };

    // Add data rows
    rows.forEach((row) => worksheet.addRow(row));

    // Output file path
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const outputPath = path.join(
      process.cwd(),
      `survey-migration-${SOLUTION_ID}-${timestamp}.xlsx`
    );

    await workbook.xlsx.writeFile(outputPath);

    console.log('=== SURVEY MIGRATION COMPLETE ===');
    console.log(`Total records: ${submissions.length}`);
    console.log(`Excel file saved: ${outputPath}`);
  } catch (error) {
    console.error('[SURVEY MIGRATION] Critical error:', error);
    throw error;
  } finally {
    if (mongoClient) {
      await mongoClient.close();
      console.log('[SURVEY MIGRATION] Disconnected from MongoDB');
    }
  }
}

// Run migration if executed directly
if (require.main === module) {
  console.log('Running survey-migration.js directly');
  migrateSurveys().catch((err) => {
    console.error('Survey migration failed with unhandled error:', err);
    process.exit(1);
  });
}

module.exports = { migrateSurveys };
