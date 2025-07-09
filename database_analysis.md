# Shiksha Reports Database Analysis

## Database Overview

This is an educational platform database designed for comprehensive reporting and analytics. The system tracks user progress, course enrollments, assessments, events, and attendance across multiple cohorts and geographic regions.

## Entity Analysis

### 1. UserProfileReport
**Purpose**: Central user management and demographic data
**Key Features**:
- Multi-tenant support (tenantId, tenantName)
- Geographic hierarchy (state → district → block → village)
- Role-based access control
- Flexible custom fields and cohort assignments
- Automatic member flagging

**Relationships**:
- One-to-Many with UserCourseCertificate
- One-to-Many with AssessmentTracking
- One-to-Many with DailyAttendanceReport

### 2. Course
**Purpose**: Course catalog and metadata management
**Key Features**:
- Multi-language support (language array)
- Program categorization
- Target age group specification
- Keyword tagging
- Flexible details storage

**Relationships**:
- One-to-Many with UserCourseCertificate
- One-to-Many with AssessmentTracking

### 3. UserCourseCertificate
**Purpose**: Track user enrollment and progress in courses
**Key Features**:
- Certificate management
- Progress tracking (completionPercentage, progress)
- Content tracking (lastReadContentId, lastReadContentStatus)
- Completion timestamps

**Relationships**:
- Many-to-One with UserProfileReport
- Many-to-One with Course

### 4. AssessmentTracking
**Purpose**: Comprehensive assessment attempt tracking
**Key Features**:
- Score tracking (totalScore, totalMaxScore)
- Time tracking (timeSpent)
- Detailed metadata (subject, domain, framework)
- Assessment categorization

**Relationships**:
- Many-to-One with UserProfileReport
- Many-to-One with Course
- One-to-Many with AssessmentTrackingScoreDetail

### 5. AssessmentTrackingScoreDetail
**Purpose**: Detailed question-level assessment responses
**Key Features**:
- Question-specific scoring
- Duration tracking per question
- Section-based organization
- Response value storage

**Relationships**:
- Many-to-One with UserProfileReport
- Many-to-One with AssessmentTracking

### 6. Event Management System
**Three related entities**:

#### Event
- Recurring event patterns
- Registration management
- Auto-enrollment capabilities

#### EventDetails
- Event metadata and information
- Geographic coordinates
- Attendee management
- Meeting details

#### EventRepetition
- Specific instances of recurring events
- Schedule management
- Online meeting details

### 7. DailyAttendanceReport
**Purpose**: Daily attendance tracking
**Key Features**:
- Context-aware attendance
- Cohort-based tracking
- Metadata storage for additional context

**Relationships**:
- Many-to-One with UserProfileReport
- Many-to-One with CohortSummaryReport

### 8. CohortSummaryReport
**Purpose**: Cohort analytics and reporting
**Key Features**:
- Member count tracking
- Geographic hierarchy
- Academic year organization
- Custom fields for flexibility

## Data Architecture Patterns

### 1. Multi-Tenancy
- TenantId fields across multiple entities
- Tenant-based data segregation

### 2. Geographic Hierarchy
- State → District → Block → Village pattern
- Enables location-based reporting

### 3. Flexible Metadata
- JSONB fields for custom data
- Extensible without schema changes

### 4. Audit Trail
- Created/Updated timestamps
- CreatedBy/UpdatedBy tracking

### 5. UUID Primary Keys
- Consistent identifier strategy
- Enables distributed systems

## Potential Improvements

### 1. Indexing Strategy
```sql
-- Recommended indexes for performance
CREATE INDEX idx_user_course_user_id ON user_course_data(userId);
CREATE INDEX idx_assessment_user_id ON assessment_tracking(userId);
CREATE INDEX idx_attendance_user_date ON dailyattendancereport(userId, date);
CREATE INDEX idx_events_tenant ON "Events"(tenantId);
```

### 2. Data Consistency
- Consider adding foreign key constraints
- Implement referential integrity checks

### 3. Performance Optimization
- Partition large tables by date
- Consider materialized views for complex reports

### 4. Security Considerations
- Implement row-level security (RLS)
- Encrypt sensitive data fields

## Reporting Capabilities

### 1. User Analytics
- Progress tracking across courses
- Assessment performance analysis
- Attendance patterns

### 2. Course Analytics
- Enrollment trends
- Completion rates
- Assessment performance by course

### 3. Geographic Reporting
- Regional performance analysis
- Location-based attendance tracking

### 4. Cohort Analysis
- Member engagement metrics
- Cohort-based performance comparison

### 5. Event Analytics
- Attendance tracking
- Engagement patterns
- Recurring event analysis

## Technology Stack Compatibility

- **ORM**: TypeORM (as evidenced by decorators)
- **Database**: PostgreSQL (JSONB, timestamptz support)
- **Framework**: NestJS (based on project structure)

## Migration Considerations

When making schema changes:
1. Use TypeORM migrations
2. Consider data migration scripts
3. Test with production-like data volumes
4. Plan for zero-downtime deployments 