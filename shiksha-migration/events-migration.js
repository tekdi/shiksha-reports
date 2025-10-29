/*
  Events Migration Script
  - Reads from legacy event tables in source DB: "Events", "EventDetails", "EventRepetition"
  - Flattens and writes to reporting DB table: "Events" (new schema)
  - One row per repetition in destination
*/

const { Client } = require('pg');
const dbConfig = require('./db');

console.log('=== Loading events-migration.js ===');

function coerceString(v) {
  return v === undefined || v === null ? null : String(v);
}
function coerceDecimal(v) {
  return v === undefined || v === null || v === '' ? null : String(v);
}
function coerceDate(v) {
  return v ? new Date(v) : null;
}
// Always return a JSON TEXT representation (or null) for binding with ::jsonb
function coerceJson(v) {
  if (v === undefined || v === null) return null;
  // Buffer -> try parse, else stringify text
  if (Buffer.isBuffer(v)) {
    const s = v.toString('utf8').trim();
    if (!s || s.toLowerCase() === 'null') return null;
    try {
      JSON.parse(s);
      return s; // already JSON text
    } catch {
      return JSON.stringify(s);
    }
  }
  // Numbers/booleans
  if (typeof v === 'number' || typeof v === 'boolean') {
    return JSON.stringify(v);
  }
  // Objects/arrays
  if (typeof v === 'object') {
    try {
      return JSON.stringify(v);
    } catch {
      return JSON.stringify(String(v));
    }
  }
  // Strings
  if (typeof v === 'string') {
    const s = v.trim();
    if (!s || s.toLowerCase() === 'null') return null;
    try {
      JSON.parse(s);
      return s; // valid JSON text
    } catch {
      // not JSON => store as JSON string value
      return JSON.stringify(s);
    }
  }
  // Fallback
  return JSON.stringify(String(v));
}

async function migrateEvents({ limit = 10000, offset = 0 } = {}) {
  console.log('=== STARTING EVENTS MIGRATION ===');

  const sourceClient = new Client(dbConfig.event_source);
  const destClient = new Client(dbConfig.event_destination);

  try {
    await sourceClient.connect();
    console.log('[EVENTS] Connected to source database');
    await destClient.connect();
    console.log('[EVENTS] Connected to destination database');

    // Join legacy tables; one row per repetition via LEFT JOIN
    const sql = `
      SELECT 
        e."eventId"               AS event_id,
        e."isRecurring"           AS is_recurring,
        e."recurrenceEndDate"     AS recurrence_end_date,
        e."recurrencePattern"     AS recurrence_pattern,
        e."autoEnroll"            AS auto_enroll,
        e."registrationStartDate" AS reg_start,
        e."registrationEndDate"   AS reg_end,
        e."createdBy"             AS created_by,
        e."updatedBy"             AS updated_by,
        ed."eventDetailId"        AS event_detail_id,
        ed."title"                AS title,
        ed."shortDescription"     AS short_description,
        ed."eventType"            AS event_type,
        ed."isRestricted"         AS is_restricted,
        ed."location"             AS location,
        ed."longitude"            AS longitude,
        ed."latitude"             AS latitude,
        ed."onlineProvider"       AS online_provider,
        ed."maxAttendees"         AS max_attendees,
        ed."recordings"           AS recordings,
        ed."status"               AS status,
        ed."description"          AS description,
        ed."meetingDetails"       AS meeting_details,
        ed."idealTime"            AS ideal_time,
        ed."metadata"             AS metadata,
        ed."attendees"            AS attendees,
        er."startDateTime"        AS start_dt,
        er."endDateTime"          AS end_dt,
        er."onlineDetails"        AS online_details
      FROM public."Events" e
      JOIN public."EventDetails" ed ON ed."eventDetailId" = e."eventDetailId"
      LEFT JOIN public."EventRepetition" er ON er."eventId" = e."eventId"
      ORDER BY e."eventId"
      LIMIT $1 OFFSET $2
    `;

    const res = await sourceClient.query(sql, [limit, offset]);
    console.log(`[EVENTS] Fetched ${res.rows.length} rows to migrate`);

    const insertSql = `
      INSERT INTO public."Events" (
        "eventDetailId", title, "shortDescription", "eventType", "isRestricted",
        location, longitude, latitude, "onlineProvider", "maxAttendees",
        recordings, status, description, "meetingDetails", "createdBy", "updatedBy",
        "idealTime", metadata, attendees, "eventId",
        "startDateTime", "endDateTime", "onlineDetails",
        "isRecurring", "recurrenceEndDate", "recurrencePattern", "autoEnroll",
        "registrationStartDate", "registrationEndDate", extra
      ) VALUES (
        $1,$2,$3,$4,$5,
        $6,$7,$8,$9,$10,
        $11::jsonb,$12,$13,$14::jsonb,$15,$16,
        $17,$18::jsonb,$19::jsonb,$20,
        $21,$22,$23::jsonb,
        $24,$25,$26::jsonb,$27,
        $28,$29,$30::jsonb
      )
    `;

    for (const r of res.rows) {
      const params = [
        coerceString(r.event_detail_id),
        coerceString(r.title),
        coerceString(r.short_description),
        coerceString(r.event_type),
        !!r.is_restricted,
        coerceString(r.location),
        coerceDecimal(r.longitude),
        coerceDecimal(r.latitude),
        coerceString(r.online_provider),
        r.max_attendees ?? null,
        coerceJson(r.recordings),
        coerceString(r.status),
        coerceString(r.description),
        coerceJson(r.meeting_details),
        coerceString(r.created_by),
        coerceString(r.updated_by),
        coerceString(r.ideal_time),
        coerceJson(r.metadata),
        coerceJson(r.attendees),
        coerceString(r.event_id),
        coerceDate(r.start_dt),
        coerceDate(r.end_dt),
        coerceJson(r.online_details),
        !!r.is_recurring,
        coerceDate(r.recurrence_end_date),
        coerceJson(r.recurrence_pattern),
        !!r.auto_enroll,
        coerceDate(r.reg_start),
        coerceDate(r.reg_end),
        coerceJson(null),
      ];

      try {
        await destClient.query(insertSql, params);
      } catch (e) {
        console.error('[EVENTS] Insert error for eventId:', r.event_id, e.message);
      }
    }

    console.log('[EVENTS] Migration batch completed');
  } catch (err) {
    console.error('[EVENTS] Critical error:', err);
  } finally {
    await sourceClient.end();
    await destClient.end();
    console.log('[EVENTS] Disconnected from databases');
  }
}

if (require.main === module) {
  console.log('Running events-migration.js directly');
  migrateEvents().catch((err) => {
    console.error('Events migration failed with unhandled error:', err);
    process.exit(1);
  });
}

module.exports = { migrateEvents };

