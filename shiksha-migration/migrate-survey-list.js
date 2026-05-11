const { Client } = require('pg');
const dbConfig = require('./db');

/**
 * Transforms raw SurveyForm JSON (sections + fields) into a clean,
 * report-friendly structure. Strips all technical config fields and
 * keeps only what a consumer/report needs to understand the survey.
 *
 * Raw field keys removed: uiConfig, uploadConfig, dataSource, validations,
 *   conditionalLogic, defaultValue, sectionId (kept on section but not field)
 *
 * Output per field:
 *   fieldId       — needed to join against responseData keys in SurveyTracker
 *   fieldName     — internal identifier
 *   label         — human-readable question label (was fieldLabel)
 *   type          — field type (text, select, date, image_upload, etc.)
 *   required      — boolean
 *   helpText      — helper instruction shown to the respondent (nullable)
 *   placeholder   — input hint text (nullable)
 */
function transformSurveyForm(sections) {
  if (!Array.isArray(sections) || sections.length === 0) return [];

  return sections.map((section, sectionIndex) => ({
    sectionId:          section.sectionId,
    sectionTitle:       section.sectionTitle || null,
    sectionDescription: section.sectionDescription || null,
    order:              section.displayOrder ?? sectionIndex,
    fields: Array.isArray(section.fields)
      ? section.fields.map((field, fieldIndex) => ({
          fieldId:     field.fieldId,
          fieldName:   field.fieldName,
          label:       field.fieldLabel,
          type:        field.fieldType,
          required:    field.isRequired ?? false,
          helpText:    field.helpText || null,
          placeholder: field.placeholder || null,
          order:       field.displayOrder ?? fieldIndex,
        }))
      : [],
  }));
}

async function migrateSurveyList() {
  console.log('=== STARTING SurveyList MIGRATION ===');

  const sourceClient = new Client(dbConfig.source);
  const destClient = new Client(dbConfig.destination);

  try {
    await sourceClient.connect();
    console.log('[SURVEY-LIST] Connected to source database');

    await destClient.connect();
    console.log('[SURVEY-LIST] Connected to destination database');

    // Fetch all surveys from source with their sections and fields as JSON.
    // Inner subquery alias renamed to "sn" to avoid collision with outer "sec" alias.
    // All non-aggregated columns in the inner subquery are listed in GROUP BY.
    const surveysResult = await sourceClient.query(`
      SELECT
        s."surveyId"          AS "SurveyID",
        s."surveyTitle"       AS "SurveyName",
        s."tenantId"          AS "TenantID",
        s."targetRoles"       AS "TargetRole",
        s."contextType"       AS "Context",
        s."surveyType"        AS "Type",
        s."createdAt"         AS "CreatedAt",
        s."createdBy"         AS "CreatedBy",
        s."status"            AS "status",
        COALESCE(
          json_agg(
            json_build_object(
              'sectionId',          sec."sectionId",
              'sectionTitle',       sec."sectionTitle",
              'sectionDescription', sec."sectionDescription",
              'displayOrder',       sec."displayOrder",
              'isVisible',          sec."isVisible",
              'conditionalLogic',   sec."conditionalLogic",
              'fields',             COALESCE(sec.fields, '[]'::json)
            ) ORDER BY sec."displayOrder"
          ) FILTER (WHERE sec."sectionId" IS NOT NULL),
          '[]'
        ) AS "SurveyForm"
      FROM public."SurveyMaster" s
      LEFT JOIN LATERAL (
        SELECT
          sn."sectionId",
          sn."sectionTitle",
          sn."sectionDescription",
          sn."displayOrder",
          sn."isVisible",
          sn."conditionalLogic",
          COALESCE(
            json_agg(
              json_build_object(
                'fieldId',          f."fieldId",
                'fieldName',        f."fieldName",
                'fieldLabel',       f."fieldLabel",
                'fieldType',        f."fieldType",
                'isRequired',       f."isRequired",
                'displayOrder',     f."displayOrder",
                'placeholder',      f."placeholder",
                'helpText',         f."helpText",
                'defaultValue',     f."defaultValue",
                'validations',      f."validations",
                'dataSource',       f."dataSource",
                'uploadConfig',     f."uploadConfig",
                'uiConfig',         f."uiConfig",
                'conditionalLogic', f."conditionalLogic"
              ) ORDER BY f."displayOrder"
            ) FILTER (WHERE f."fieldId" IS NOT NULL),
            '[]'
          ) AS fields
        FROM public."SurveySections" sn
        LEFT JOIN public."SurveyFields" f ON f."sectionId" = sn."sectionId"
        WHERE sn."surveyId" = s."surveyId"
        GROUP BY
          sn."sectionId",
          sn."sectionTitle",
          sn."sectionDescription",
          sn."displayOrder",
          sn."isVisible",
          sn."conditionalLogic"
      ) sec ON true
      GROUP BY
        s."surveyId",
        s."surveyTitle",
        s."tenantId",
        s."targetRoles",
        s."contextType",
        s."surveyType",
        s."createdAt",
        s."createdBy",
        s."status"
      ORDER BY s."createdAt" ASC
    `);

    console.log(`[SURVEY-LIST] Found ${surveysResult.rows.length} surveys in source DB`);

    let inserted = 0;
    let skipped = 0;

    for (const row of surveysResult.rows) {
      try {
        const isActive = row.status === 'published';

        await destClient.query(
          `INSERT INTO public."SurveyList" (
            "SurveyID",
            "SurveyName",
            "TenantID",
            "TargetRole",
            "TargetGeo",
            "Context",
            "ContextId",
            "Type",
            "CreatedAt",
            "CreatedBy",
            "SurveyRolloutStartDate",
            "SurveyRolloutEndDate",
            "IsActive",
            "SurveyForm"
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
          ON CONFLICT ("SurveyID") DO UPDATE SET
            "SurveyName"  = EXCLUDED."SurveyName",
            "TargetRole"  = EXCLUDED."TargetRole",
            "Context"     = EXCLUDED."Context",
            "Type"        = EXCLUDED."Type",
            "IsActive"    = EXCLUDED."IsActive",
            "SurveyForm"  = EXCLUDED."SurveyForm"`,
          [
            row.SurveyID,
            row.SurveyName,
            row.TenantID,
            JSON.stringify(row.TargetRole || []),
            null,                                 // TargetGeo — deferred
            row.Context || null,
            null,                                 // ContextId (survey-level) — deferred
            row.Type || null,
            row.CreatedAt,
            row.CreatedBy,
            null,                                 // SurveyRolloutStartDate — deferred
            null,                                 // SurveyRolloutEndDate — deferred
            isActive,
            JSON.stringify(transformSurveyForm(row.SurveyForm)),
          ]
        );

        console.log(`[SURVEY-LIST] ✅ Upserted survey ${row.SurveyID} — "${row.SurveyName}"`);
        inserted++;

      } catch (err) {
        console.error(`[SURVEY-LIST] ❌ Error upserting survey ${row.SurveyID}:`, err.message);
        skipped++;
      }
    }

    console.log(`\n[SURVEY-LIST] === MIGRATION COMPLETE ===`);
    console.log(`[SURVEY-LIST] ✅ Upserted : ${inserted}`);
    console.log(`[SURVEY-LIST] ⚠️  Skipped  : ${skipped}`);
    console.log(`[SURVEY-LIST] Total processed: ${surveysResult.rows.length}`);

  } catch (error) {
    console.error('[SURVEY-LIST] Fatal error during migration:', error);
    throw error;
  } finally {
    await sourceClient.end();
    await destClient.end();
    console.log('[SURVEY-LIST] Disconnected from both databases');
  }

  console.log('=== COMPLETED SurveyList MIGRATION ===');
}

if (require.main === module) {
  migrateSurveyList().catch(err => {
    console.error('Migration failed:', err);
    process.exit(1);
  });
}

module.exports = { migrateSurveyList };
