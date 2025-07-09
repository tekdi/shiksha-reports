# Shiksha Reports Database Schema

## Entity Relationship Diagram

```mermaid
erDiagram
    UserProfileReport {
        uuid userId PK
        varchar username
        varchar fullName
        varchar email
        varchar mobile
        varchar dob
        varchar gender
        uuid tenantId
        varchar tenantName
        varchar status
        timestamp createdAt
        timestamp updatedAt
        uuid createdBy
        uuid updatedBy
        uuid roleId
        varchar roleName
        jsonb customFields
        jsonb cohorts
        boolean automaticMember
        varchar state
        varchar district
        varchar block
        varchar village
    }

    Course {
        uuid courseId PK
        varchar courseDoId
        varchar courseName
        varchar channel
        json language
        json program
        json primaryUser
        json targetAgeGroup
        json keywords
        json details
    }

    UserCourseCertificate {
        uuid usercertificateId PK
        uuid userId FK
        uuid courseId FK
        uuid tenantId
        varchar certificateId
        varchar status
        timestamptz issuedOn
        timestamptz createdOn
        timestamptz updatedOn
        text createdBy
        timestamptz completedOn
        integer completionPercentage
        text lastReadContentId
        integer lastReadContentStatus
        integer progress
    }

    AssessmentTracking {
        uuid assessmentTrackingId PK
        uuid userId FK
        uuid courseId FK
        varchar contentId
        varchar attemptId
        timestamptz createdOn
        timestamptz lastAttemptedOn
        jsonb assessmentSummary
        float8 totalMaxScore
        float8 totalScore
        timestamptz updatedOn
        numeric timeSpent
        varchar unitId
        varchar name
        text description
        varchar subject
        varchar domain
        varchar subDomain
        varchar channel
        varchar assessmentType
        varchar program
        varchar targetAgeGroup
        varchar assessmentName
        varchar contentLanguage
        varchar status
        varchar framework
        varchar summaryType
    }

    AssessmentTrackingScoreDetail {
        uuid id PK
        uuid userId FK
        uuid assessmentTrackingId FK
        text questionId
        text pass
        text sectionId
        text resValue
        integer duration
        integer score
        integer maxScore
        text queTitle
    }

    Event {
        uuid eventId PK
        boolean isRecurring
        timestamptz recurrenceEndDate
        jsonb recurrencePattern
        timestamp createdAt
        timestamp updatedAt
        boolean autoEnroll
        timestamptz registrationStartDate
        timestamptz registrationEndDate
        uuid createdBy
        uuid updatedBy
        uuid eventDetailId FK
    }

    EventDetails {
        uuid eventDetailId PK
        varchar title
        varchar shortDescription
        varchar eventType
        boolean isRestricted
        varchar location
        float longitude
        float latitude
        varchar onlineProvider
        integer maxAttendees
        jsonb recordings
        varchar status
        text description
        timestamp createdAt
        timestamp updatedAt
        jsonb meetingDetails
        uuid createdBy
        uuid updatedBy
        integer idealTime
        jsonb metadata
        text[] attendees
    }

    EventRepetition {
        uuid eventRepetitionId PK
        uuid eventId FK
        uuid eventDetailId FK
        jsonb onlineDetails
        timestamptz startDateTime
        timestamptz endDateTime
        timestamp createdAt
        timestamp updatedAt
        uuid createdBy
        uuid updatedBy
        jsonb erMetaData
    }

    DailyAttendanceReport {
        uuid attendanceId PK
        uuid userId FK
        uuid cohortId FK
        varchar context
        date date
        varchar status
        varchar metadata
        timestamp createdAt
        timestamp updatedAt
        uuid createdBy
        uuid updatedBy
    }

    CohortSummaryReport {
        uuid cohortId PK
        varchar name
        varchar type
        uuid tenantId
        varchar tenantName
        varchar academicYear
        integer memberCount
        jsonb customFields
        timestamp createdAt
        timestamp updatedAt
        varchar state
        varchar district
        varchar block
        varchar village
    }

    %% Relationships
    UserProfileReport ||--o{ UserCourseCertificate : "has"
    UserProfileReport ||--o{ AssessmentTracking : "takes"
    UserProfileReport ||--o{ AssessmentTrackingScoreDetail : "scores"
    UserProfileReport ||--o{ DailyAttendanceReport : "attends"
    
    Course ||--o{ UserCourseCertificate : "enrolled_in"
    Course ||--o{ AssessmentTracking : "assessed_in"
    
    AssessmentTracking ||--o{ AssessmentTrackingScoreDetail : "contains"
    
    Event ||--o{ EventRepetition : "repeats"
    EventDetails ||--|| Event : "details"
    EventDetails ||--o{ EventRepetition : "scheduled"
    
    CohortSummaryReport ||--o{ DailyAttendanceReport : "tracks"
```

## Key Relationships

### User-Centric Relationships
- **UserProfileReport** is the central entity for user data
- Users can enroll in multiple courses (`UserCourseCertificate`)
- Users can take multiple assessments (`AssessmentTracking`)
- Users can attend events and have attendance tracked (`DailyAttendanceReport`)

### Course Management
- **Course** contains course metadata and catalog information
- Users enroll in courses through `UserCourseCertificate`
- Course progress and completion are tracked

### Assessment System
- **AssessmentTracking** tracks overall assessment attempts
- **AssessmentTrackingScoreDetail** stores detailed question responses
- Assessments are linked to courses and users

### Event Management
- **Event** manages recurring event patterns
- **EventDetails** contains event information and metadata
- **EventRepetition** handles specific instances of recurring events

### Attendance & Cohort Management
- **DailyAttendanceReport** tracks daily attendance
- **CohortSummaryReport** provides cohort analytics
- Both link to users and cohorts for reporting

## Data Types Summary

- **UUID**: Primary keys and foreign keys
- **Timestamptz**: Timestamps with timezone for events and tracking
- **JSONB**: Flexible data storage for metadata and custom fields
- **JSON**: Array storage for tags, languages, programs
- **Text**: Long-form content and descriptions
- **Varchar**: Standard string fields with length limits
- **Numeric/Float**: Score calculations and measurements
- **Boolean**: Flags and status indicators

## Reporting Focus

This database is designed for educational reporting with:
- User progress tracking across courses
- Assessment performance analytics
- Event attendance and engagement
- Cohort-based reporting and analytics
- Geographic and demographic segmentation 