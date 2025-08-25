import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { CohortSummaryReport } from 'src/entities/cohort-summary.entity';
import { UserCourseCertificate } from 'src/entities/user-course-data.entity';
import { Course } from 'src/entities/course.entity';
import { AssessmentTrackingScoreDetail } from 'src/entities/assessment-tracking-score-detail.entity';
import { AssessmentTracking } from 'src/entities/assessment-tracking.entity';
import { DailyAttendanceReport } from 'src/entities/daily-attendance-report.entity';
import { Event } from 'src/entities/event.entity';
import { EventDetails } from 'src/entities/event-details.entity';
import { EventRepetition } from 'src/entities/event-repetition.entity';
import { CohortMember } from 'src/entities/cohort-member.entity';
import { Cohort } from 'src/entities/cohort.entity';
import { AttendanceTracker } from 'src/entities/attendance-tracker.entity';
import { AssessmentTracker } from 'src/entities/assessment-tracker.entity';

@Injectable()
export class DatabaseService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(CohortSummaryReport)
    private cohortRepo: Repository<CohortSummaryReport>,
    @InjectRepository(Course)
    private courseRepo: Repository<Course>,
    @InjectRepository(UserCourseCertificate)
    private userCourseRepo: Repository<UserCourseCertificate>,
    @InjectRepository(DailyAttendanceReport)
    private dailyAttendanceRepo: Repository<DailyAttendanceReport>,
    @InjectRepository(AssessmentTracking)
    private assessmentTrackingRepo: Repository<AssessmentTracking>,
    @InjectRepository(AssessmentTrackingScoreDetail)
    private assessmentTrackingScoreDetailRepo: Repository<AssessmentTrackingScoreDetail>,
    @InjectRepository(Event)
    private eventRepo: Repository<Event>,
    @InjectRepository(EventDetails)
    private eventDetailsRepo: Repository<EventDetails>,
    @InjectRepository(EventRepetition)
    private eventRepetitionRepo: Repository<EventRepetition>,
    @InjectRepository(CohortMember)
    private cohortMemberRepo: Repository<CohortMember>,
    @InjectRepository(Cohort)
    private cohortNewRepo: Repository<Cohort>,
    @InjectRepository(AttendanceTracker)
    private attendanceTrackerRepo: Repository<AttendanceTracker>,
    @InjectRepository(AssessmentTracker)
    private assessmentTrackerRepo: Repository<AssessmentTracker>,
  ) {}

  async saveUserProfileData(data: any) {
    return this.userRepo.save(data);
  }

  async deleteUserProfileData(data: any) {
    return this.userRepo.delete(data);
  }

  async saveCohortSummaryData(data: any) {
    return this.cohortRepo.save(data);
  }

  async deleteCohortSummaryData(data: any) {
    return this.cohortRepo.delete(data);
  }
  async saveUserCourseCertificate(data: any) {
    console.log('Saving user course certificate data:', data);
    return this.userCourseRepo.save(data);
  }
  async saveCourse(data: any) {
    console.log('Saving course data:', data);
    return this.courseRepo.save(data);
  }
  async updateUserCourseCertificate(data: any) {
    //update record by where condition of userId and courseId
    console.log('Updating user course certificate data:', data);
    const { userId, courseId } = data;
    return this.userCourseRepo.update({ userId, courseId }, { ...data });
  }

  async saveDailyAttendanceData(data: any) {
    return this.dailyAttendanceRepo.save(data);
  }

  async deleteDailyAttendanceData(data: any) {
    return this.dailyAttendanceRepo.delete(data);
  }

  async saveAssessmentData(data: any) {
    return this.assessmentTrackingRepo.save(data);
  }

  async deleteAssessmentData(data: any) {
    return this.assessmentTrackingRepo.delete(data);
  }

  async saveAssessmentScoreData(data: any) {
    return this.assessmentTrackingScoreDetailRepo.save(data);
  }

  async deleteAssessmentScoreData(data: any) {
    return this.assessmentTrackingScoreDetailRepo.delete(data);
  }

  async saveEventDetailsData(data: any) {
    return this.eventDetailsRepo.save(data);
  }

  async saveEventData(data: any) {
    return this.eventRepo.save(data);
  }

  async saveEventRepetitionData(data: any) {
    return this.eventRepetitionRepo.save(data);
  }

  async deleteEventData(data: { eventDetailId: string }) {
    const { eventDetailId } = data;
    await this.eventRepetitionRepo.delete({ eventDetailId });
    return this.eventDetailsRepo.delete({ eventDetailId });
  }

  async saveCohortMemberData(data: any) {
    return this.cohortMemberRepo.save(data);
  }

  async deleteCohortMemberData(data: any) {
    return this.cohortMemberRepo.delete(data);
  }

  async findCohortMember(userId: string, cohortId: string) {
    return this.cohortMemberRepo.findOne({
      where: { UserID: userId, CohortID: cohortId }
    });
  }

  async updateCohortMemberStatus(userId: string, cohortId: string, status: string) {
    return this.cohortMemberRepo.update(
      { UserID: userId, CohortID: cohortId },
      { MemberStatus: status }
    );
  }

  async saveCohortData(data: any) {
    return this.cohortNewRepo.save(data);
  }

  async deleteCohortData(data: any) {
    return this.cohortNewRepo.delete(data);
  }

  async findCohort(cohortId: string) {
    return this.cohortNewRepo.findOne({
      where: { cohortId }
    });
  }

  async upsertAttendanceTracker(
    attendanceData: Partial<AttendanceTracker>,
    dayColumn: string,
    attendanceValue: string
  ) {
    // Find existing record for the user, tenant, year, and month
    const existingRecord = await this.attendanceTrackerRepo.findOne({
      where: {
        tenantId: attendanceData.tenantId,
        userId: attendanceData.userId,
        year: attendanceData.year,
        month: attendanceData.month,
        ...(attendanceData.contextId && { contextId: attendanceData.contextId }),
      }
    });

    if (existingRecord) {
      // Update the specific day column
      const updateData = {
        [dayColumn]: attendanceValue,
      };
      
      return this.attendanceTrackerRepo.update(existingRecord.atndId, updateData);
    } else {
      // Create new record with the day column set
      const newRecord = {
        ...attendanceData,
        [dayColumn]: attendanceValue,
      };
      
      return this.attendanceTrackerRepo.save(newRecord);
    }
  }

  async findAttendanceTracker(tenantId: string, userId: string, year: number, month: number, contextId?: string) {
    const whereCondition: any = {
      tenantId,
      userId,
      year,
      month,
    };
    
    if (contextId) {
      whereCondition.contextId = contextId;
    }

    return this.attendanceTrackerRepo.findOne({
      where: whereCondition
    });
  }

  async saveAttendanceTrackerData(data: any) {
    return this.attendanceTrackerRepo.save(data);
  }

  async deleteAttendanceTrackerData(data: any) {
    return this.attendanceTrackerRepo.delete(data);
  }

  async saveAssessmentTrackerData(data: any) {
    return this.assessmentTrackerRepo.save(data);
  }

  async deleteAssessmentTrackerData(data: any) {
    return this.assessmentTrackerRepo.delete(data);
  }

  async findAssessmentTracker(assessTrackingId: string) {
    return this.assessmentTrackerRepo.findOne({
      where: { assessTrackingId }
    });
  }

  async upsertAssessmentTracker(assessmentData: Partial<AssessmentTracker>) {
    // Check if assessment already exists
    const existingAssessment = await this.assessmentTrackerRepo.findOne({
      where: { 
        assessTrackingId: assessmentData.assessTrackingId 
      }
    });

    if (existingAssessment) {
      // Update existing assessment
      return this.assessmentTrackerRepo.update(
        { assessTrackingId: assessmentData.assessTrackingId },
        assessmentData
      );
    } else {
      // Create new assessment
      return this.assessmentTrackerRepo.save(assessmentData);
    }
  }
}
