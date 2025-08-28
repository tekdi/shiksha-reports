// Shiksha Reports Database Schema for dbdiagram.io
// Copy this code and paste it at https://dbdiagram.io/d

Table UserProfileReport {
  userId uuid [pk]
  username varchar
  fullName varchar
  email varchar
  mobile varchar
  dob varchar
  gender varchar
  tenantId uuid
  tenantName varchar
  status varchar
  createdAt timestamp
  updatedAt timestamp
  createdBy uuid
  updatedBy uuid
  roleId uuid
  roleName varchar
  customFields jsonb
  cohorts jsonb
  automaticMember boolean
  state varchar
  district varchar
  block varchar
  village varchar
}

Table Course {
  courseId uuid [pk]
  courseDoId varchar
  courseName varchar
  channel varchar
  language json
  program json
  primaryUser json
  targetAgeGroup json
  keywords json
  details json
}

Table UserCourseCertificate {
  usercertificateId uuid [pk]
  userId uuid [ref: > UserProfileReport.userId]
  courseId varchar [ref: > Course.courseId]
  tenantId uuid
  certificateId varchar
  status varchar
  issuedOn timestamptz
  createdOn timestamptz
  updatedOn timestamptz
  createdBy text
  completedOn timestamptz
  completionPercentage integer
  lastReadContentId text
  lastReadContentStatus integer
  progress integer
}

Table AssessmentTracking {
  assessmentTrackingId varchar [pk]
  userId varchar [ref: > UserProfileReport.userId]
  courseId varchar [ref: > Course.courseId]
  contentId varchar
  attemptId varchar
  createdOn timestamptz
  lastAttemptedOn timestamptz
  assessmentSummary jsonb
  totalMaxScore float8
  totalScore float8
  updatedOn timestamptz
  timeSpent numeric
  unitId varchar
  name varchar
  description text
  subject varchar
  domain varchar
  subDomain varchar
  channel varchar
  assessmentType varchar
  program varchar
  targetAgeGroup varchar
  assessmentName varchar
  contentLanguage varchar
  status varchar
  framework varchar
  summaryType varchar
}

Table AssessmentTrackingScoreDetail {
  id uuid [pk]
  userId uuid [ref: > UserProfileReport.userId]
  assessmentTrackingId uuid [ref: > AssessmentTracking.assessmentTrackingId]
  questionId text
  pass text
  sectionId text
  resValue text
  duration integer
  score integer
  maxScore integer
  queTitle text
}

Table EventDetails {
  eventDetailId uuid [pk]
  title varchar
  shortDescription varchar
  eventType varchar
  isRestricted boolean
  location varchar
  longitude float
  latitude float
  onlineProvider varchar
  maxAttendees integer
  recordings jsonb
  status varchar
  description text
  createdAt timestamp
  updatedAt timestamp
  meetingDetails jsonb
  createdBy uuid
  updatedBy uuid
  idealTime integer
  metadata jsonb
  attendees text[]
}

Table Events {
  eventId uuid [pk]
  isRecurring boolean
  recurrenceEndDate timestamptz
  recurrencePattern jsonb
  createdAt timestamp
  updatedAt timestamp
  autoEnroll boolean
  registrationStartDate timestamptz
  registrationEndDate timestamptz
  createdBy uuid
  updatedBy uuid
  eventDetailId uuid [ref: > EventDetails.eventDetailId]
}

Table EventRepetition {
  eventRepetitionId uuid [pk]
  eventId uuid [ref: > Events.eventId]
  eventDetailId uuid [ref: > EventDetails.eventDetailId]
  onlineDetails jsonb
  startDateTime timestamptz
  endDateTime timestamptz
  createdAt timestamp
  updatedAt timestamp
  createdBy uuid
  updatedBy uuid
  erMetaData jsonb
}

Table DailyAttendanceReport {
  attendanceId uuid [pk]
  userId uuid [ref: > UserProfileReport.userId]
  cohortId uuid [ref: > CohortSummaryReport.cohortId]
  context varchar
  date date
  status varchar
  metadata varchar
  createdAt timestamp
  updatedAt timestamp
  createdBy uuid
  updatedBy uuid
}

Table CohortSummaryReport {
  cohortId uuid [pk]
  name varchar
  type varchar
  tenantId uuid
  tenantName varchar
  academicYear varchar
  memberCount integer
  customFields jsonb
  createdAt timestamp
  updatedAt timestamp
  state varchar
  district varchar
  block varchar
  village varchar
} 