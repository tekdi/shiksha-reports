-- Shiksha Reports Database Schema
-- Generated from TypeORM entities

-- User Profile Report Table
CREATE TABLE "UserProfileReport" (
    "userId" uuid PRIMARY KEY,
    "username" varchar,
    "fullName" varchar,
    "email" varchar,
    "mobile" varchar,
    "dob" varchar,
    "gender" varchar,
    "tenantId" uuid,
    "tenantName" varchar,
    "status" varchar,
    "createdAt" timestamp,
    "updatedAt" timestamp,
    "createdBy" uuid,
    "updatedBy" uuid,
    "roleId" uuid,
    "roleName" varchar,
    "customFields" jsonb,
    "cohorts" jsonb,
    "automaticMember" boolean,
    "state" varchar,
    "district" varchar,
    "block" varchar,
    "village" varchar
);

-- Course Table
CREATE TABLE "course" (
    "courseId" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "course_do_id" varchar(255),
    "course_name" varchar(1000),
    "channel" varchar(255),
    "language" json,
    "program" json,
    "primary_user" json,
    "target_age_group" json,
    "keywords" json,
    "details" json
);

-- User Course Data Table
CREATE TABLE "user_course_data" (
    "usercertificateId" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" uuid NOT NULL,
    "courseId" varchar NOT NULL,
    "tenantId" uuid NOT NULL,
    "certificateId" varchar NOT NULL,
    "status" varchar NOT NULL,
    "issuedOn" timestamptz,
    "createdOn" timestamptz NOT NULL DEFAULT now(),
    "updatedOn" timestamptz NOT NULL DEFAULT now(),
    "createdBy" text,
    "completedOn" timestamptz,
    "completionPercentage" integer,
    "lastReadContentId" text,
    "lastReadContentStatus" integer,
    "progress" integer
);

-- Assessment Tracking Table
CREATE TABLE "assessment_tracking" (
    "assessmentTrackingId" varchar PRIMARY KEY,
    "userId" varchar,
    "courseId" varchar,
    "contentId" varchar,
    "attemptId" varchar,
    "createdOn" timestamptz DEFAULT now(),
    "lastAttemptedOn" timestamptz DEFAULT now(),
    "assessmentSummary" jsonb,
    "totalMaxScore" float8,
    "totalScore" float8,
    "updatedOn" timestamptz DEFAULT now(),
    "timeSpent" numeric,
    "unitId" varchar,
    "name" varchar,
    "description" text,
    "subject" varchar,
    "domain" varchar,
    "subDomain" varchar,
    "channel" varchar,
    "assessmentType" varchar,
    "program" varchar,
    "targetAgeGroup" varchar,
    "assessmentName" varchar,
    "contentLanguage" varchar,
    "status" varchar,
    "framework" varchar,
    "summaryType" varchar
);

-- Assessment Tracking Score Detail Table
CREATE TABLE "assessment_tracking_score_detail" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" uuid NOT NULL,
    "assessmentTrackingId" uuid NOT NULL,
    "questionId" text,
    "pass" text,
    "sectionId" text,
    "resValue" text,
    "duration" integer,
    "score" integer,
    "maxScore" integer,
    "queTitle" text
);

-- Event Details Table
CREATE TABLE "EventDetails" (
    "eventDetailId" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "title" varchar NOT NULL,
    "shortDescription" varchar NOT NULL,
    "eventType" varchar NOT NULL,
    "isRestricted" boolean DEFAULT false,
    "location" varchar,
    "longitude" float,
    "latitude" float,
    "onlineProvider" varchar,
    "maxAttendees" integer DEFAULT 0,
    "recordings" jsonb,
    "status" varchar NOT NULL,
    "description" text NOT NULL,
    "createdAt" timestamp NOT NULL DEFAULT now(),
    "updatedAt" timestamp NOT NULL DEFAULT now(),
    "meetingDetails" jsonb,
    "createdBy" uuid,
    "updatedBy" uuid,
    "idealTime" integer,
    "metadata" jsonb,
    "attendees" text[]
);

CREATE TABLE "Events" (
    id SERIAL PRIMARY KEY,
    "eventDetailId" VARCHAR(100) NOT NULL,
    title VARCHAR(255),
    "shortDescription" TEXT,
    "eventType" VARCHAR(100),
    "isRestricted" BOOLEAN DEFAULT FALSE,
    location VARCHAR(255),
    longitude DECIMAL(10, 7),
    latitude DECIMAL(10, 7),
    "onlineProvider" VARCHAR(100),
    "maxAttendees" INT,
    recordings JSONB,
    status VARCHAR(50),
    description TEXT,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW(),
    "meetingDetails" JSONB,
    "createdBy" VARCHAR(100),
    "updatedBy" VARCHAR(100),
    "idealTime" VARCHAR(50),
    metadata JSONB,
    attendees JSONB,
    "eventId" VARCHAR(100),
    "startDateTime" TIMESTAMP,
    "endDateTime" TIMESTAMP,
    "onlineDetails" JSONB,
    "isRecurring" BOOLEAN DEFAULT FALSE,
    "recurrenceEndDate" timestamptz,
    "recurrencePattern" jsonb,
    "autoEnroll" BOOLEAN DEFAULT FALSE,
    "registrationStartDate" timestamptz,
    "registrationEndDate" timestamptz,
    extra JSONB
);

-- Event Repetition Table
CREATE TABLE "EventRepetition" (
    "eventRepetitionId" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "eventId" uuid,
    "eventDetailId" uuid,
    "onlineDetails" jsonb,
    "startDateTime" timestamptz DEFAULT timezone('utc'::text, now()),
    "endDateTime" timestamptz DEFAULT timezone('utc'::text, now()),
    "createdAt" timestamp NOT NULL DEFAULT now(),
    "updatedAt" timestamp NOT NULL DEFAULT now(),
    "createdBy" uuid,
    "updatedBy" uuid,
    "erMetaData" jsonb DEFAULT '{}',
    CONSTRAINT "FK_EventRepetition_Events" FOREIGN KEY ("eventId") REFERENCES "Events"("eventId"),
    CONSTRAINT "FK_EventRepetition_EventDetails" FOREIGN KEY ("eventDetailId") REFERENCES "EventDetails"("eventDetailId")
);

-- Daily Attendance Report Table
CREATE TABLE "dailyattendancereport" (
    "attendanceId" uuid PRIMARY KEY,
    "userId" uuid,
    "cohortId" uuid,
    "context" varchar,
    "date" date,
    "status" varchar,
    "metadata" varchar,
    "createdAt" timestamp,
    "updatedAt" timestamp,
    "createdBy" uuid,
    "updatedBy" uuid
);

-- Cohort Summary Report Table
CREATE TABLE "CohortSummaryReport" (
    "cohortId" uuid PRIMARY KEY,
    "name" varchar,
    "type" varchar,
    "tenantId" uuid,
    "tenantName" varchar,
    "academicYear" varchar,
    "memberCount" integer,
    "customFields" jsonb,
    "createdAt" timestamp,
    "updatedAt" timestamp,
    "state" varchar,
    "district" varchar,
    "block" varchar,
    "village" varchar
);

-- Recommended Indexes for Performance
CREATE INDEX idx_user_course_user_id ON "user_course_data"("userId");
CREATE INDEX idx_user_course_course_id ON "user_course_data"("courseId");
CREATE INDEX idx_assessment_user_id ON "assessment_tracking"("userId");
CREATE INDEX idx_assessment_course_id ON "assessment_tracking"("courseId");
CREATE INDEX idx_assessment_score_user_id ON "assessment_tracking_score_detail"("userId");
CREATE INDEX idx_assessment_score_tracking_id ON "assessment_tracking_score_detail"("assessmentTrackingId");
CREATE INDEX idx_attendance_user_date ON "dailyattendancereport"("userId", "date");
CREATE INDEX idx_attendance_cohort_date ON "dailyattendancereport"("cohortId", "date");
CREATE INDEX idx_events_tenant ON "Events"("createdBy");
CREATE INDEX idx_event_repetition_event_id ON "EventRepetition"("eventId");
CREATE INDEX idx_user_profile_tenant ON "UserProfileReport"("tenantId");
CREATE INDEX idx_cohort_summary_tenant ON "CohortSummaryReport"("tenantId");

-- Comments for Documentation
COMMENT ON TABLE "UserProfileReport" IS 'Central user management and demographic data';
COMMENT ON TABLE "course" IS 'Course catalog and metadata management';
COMMENT ON TABLE "user_course_data" IS 'User enrollment and progress tracking';
COMMENT ON TABLE "assessment_tracking" IS 'Assessment attempts and scores';
COMMENT ON TABLE "assessment_tracking_score_detail" IS 'Detailed question-level assessment responses';
COMMENT ON TABLE "EventDetails" IS 'Event information and metadata';
COMMENT ON TABLE "Events" IS 'Event management with recurring patterns';
COMMENT ON TABLE "EventRepetition" IS 'Specific instances of recurring events';
COMMENT ON TABLE "dailyattendancereport" IS 'Daily attendance tracking';
COMMENT ON TABLE "CohortSummaryReport" IS 'Cohort analytics and reporting'; 