import { Injectable } from '@nestjs/common';
import { UserProfileReport } from '../../entities/user-profile.entity';
import { DailyAttendanceReport } from '../../entities/daily-attendance-report.entity';
import { AssessmentTracking } from '../../entities/assessment-tracking.entity';
import { AssessmentTrackingScoreDetail } from '../../entities/assessment-tracking-score-detail.entity';
import { Course } from 'src/entities/course.entity';
import { CohortSummaryReport } from 'src/entities/cohort-summary.entity';

@Injectable()
export class TransformService {
  constructor() {}

  async transformUserData(data: any) {
    try {
      const tenant = data.tenantData?.[0] ?? {};

      // Extract custom field values
      const extractField = (label: string) =>
        data.customFields?.find((f: any) => f.label === label)
          ?.selectedValues?.[0]?.value ?? null;

      const transformedData: Partial<UserProfileReport> = {
        userId: data.userId,
        username: data.username,
        fullName: data.fullName,
        email: data.email,
        mobile: data.mobile,
        dob: data.dob,
        gender: data.gender,
        status: data.status,
        createdAt: data.createdAt ? new Date(data.createdAt) : undefined,
        updatedAt: data.updatedAt ? new Date(data.updatedAt) : undefined,
        createdBy: data.createdBy,
        updatedBy: data.updatedBy,
        tenantId: tenant.tenantId,
        tenantName: tenant.tenantName,
        roleId: tenant.roleId,
        roleName: tenant.roleName,
        customFields: data.customFields ?? [],
        cohorts: data.cohorts ?? [],
        automaticMember: data.automaticMember ?? false,
        state: extractField('STATE'),
        district: extractField('DISTRICT'),
        block: extractField('BLOCK'),
        village: extractField('VILLAGE'),
      };
      return transformedData;
    } catch (error) {
      return error;
    }
  }
  async transformCourseData(data: any) {
    return data;
  }
  mapContentToCourseEntity(content: any): Partial<Course> {
    return {
      courseDoId: content.identifier,
      courseName: content.name,
      channel: content.channel,
      language: content.language || [],
      program: content.program || [],
      primaryUser: content.primaryUser || [],
      targetAgeGroup: content.targetAgeGroup || [],
      keywords: content.keywords || [],
      details: content, // save full original JSON here
    };
  }

  async transformDailyAttendanceData(data: any) {
    try {
      const transformedData: Partial<DailyAttendanceReport> = {
        attendanceId: data.attendanceId,
        userId: data.userId,
        cohortId: data.contextId || data.cohortId,
        context: data.context,
        date: data.attendanceDate ? new Date(data.attendanceDate) : new Date(),
        status: data.attendance || data.status,
        metadata: data.metaData || data.metadata,
        createdAt: data.createdAt ? new Date(data.createdAt) : undefined,
        updatedAt: data.updatedAt ? new Date(data.updatedAt) : undefined,
        createdBy: data.createdBy,
        updatedBy: data.updatedBy,
      };
      return transformedData;
    } catch (error) {
      console.error('Error transforming daily attendance data:', error);
      throw error;
    }
  }

  async transformAssessmentData(data: any) {
    try {
      const transformedData: Partial<AssessmentTracking> = {
        assessmentTrackingId: data.assessmentTrackingId,
        userId: data.userId,
        courseId: data.courseId,
        contentId: data.contentId,
        attemptId: data.attemptId,
        createdOn: data.createdOn ? new Date(data.createdOn) : new Date(),
        lastAttemptedOn: data.lastAttemptedOn
          ? new Date(data.lastAttemptedOn)
          : new Date(),
        assessmentSummary: data.assessmentSummary,
        totalMaxScore: data.totalMaxScore,
        totalScore: data.totalScore,
        updatedOn: data.updatedOn ? new Date(data.updatedOn) : new Date(),
        timeSpent: data.timeSpent,
        unitId: data.unitId,
        name: data.name,
        description: data.description,
        subject: data.subject,
        domain: data.domain,
        subDomain: data.subDomain,
        channel: data.channel,
        assessmentType: data.assessmentType,
        program: data.program,
        targetAgeGroup: data.targetAgeGroup,
        assessmentName: data.assessmentName,
        contentLanguage: data.contentLanguage,
        status: data.status,
        framework: data.framework,
        summaryType: data.summaryType,
      };
      return transformedData;
    } catch (error) {
      return error;
    }
  }

  async transformAssessmentScoreData(
    data: any,
  ): Promise<Partial<AssessmentTrackingScoreDetail>> {
    try {
      const transformedData: Partial<AssessmentTrackingScoreDetail> = {
        id: data.id,
        userId: data.userId,
        assessmentTrackingId: data.assessmentTrackingId,
        questionId: data.questionId,
        pass: data.pass,
        sectionId: data.sectionId,
        resValue: data.resValue,
        duration: data.duration ? Number(data.duration) : undefined,
        score: data.score ? Number(data.score) : undefined,
        maxScore: data.maxScore ? Number(data.maxScore) : undefined,
        queTitle: data.queTitle,
      };
      return transformedData;
    } catch (error) {
      console.error('Error transforming assessment score data:', error);
      throw error;
    }
  }

  async transformCohortData(data: any): Promise<Partial<CohortSummaryReport>> {
    try {
      const tenant = data.tenantData?.[0] ?? {};

      // Extract custom field values for SDBV data
      const extractField = (label: string) =>
        data.customFields?.find((f: any) => f.label === label)
          ?.selectedValues?.[0]?.value ?? null;

      const transformedData: Partial<CohortSummaryReport> = {
        cohortId: data.cohortId,
        parentId : data .parentId,
        name: data.name,
        type: data.type,
        tenantId: tenant.tenantId || data.tenantId,
        tenantName: tenant.tenantName || data.tenantName,
        academicYear: data.academicYearId,
        memberCount: data.memberCount ? Number(data.memberCount) : undefined,
        customFields: data.customFields || {},
        createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
        updatedAt: data.updatedAt ? new Date(data.updatedAt) : new Date(),
        state: extractField('STATE') || data.state,
        district: extractField('DISTRICT') || data.district,
        block: extractField('BLOCK') || data.block,
        village: extractField('VILLAGE') || data.village,
      };
      return transformedData;
    } catch (error) {
      console.error('Error transforming cohort data:', error);
      throw error;
    }
  }
}
