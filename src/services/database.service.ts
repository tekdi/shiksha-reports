import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserProfileReport } from '../entities/user-profile.entity';
import { CohortSummaryReport } from 'src/entities/cohort-summary.entity';
import { UserCourseCertificate } from 'src/entities/user-course-data.entity';
import { Course } from 'src/entities/course.entity';
import { AssessmentTrackingScoreDetail } from 'src/entities/assessment-tracking-score-detail.entity';
import { AssessmentTracking } from 'src/entities/assessment-tracking.entity';
import { DailyAttendanceReport } from 'src/entities/daily-attendance-report.entity';
import { Event } from 'src/entities/event.entity';
import { EventDetails } from 'src/entities/event-details.entity';
import { EventRepetition } from 'src/entities/event-repetition.entity';

@Injectable()
export class DatabaseService {
  constructor(
    @InjectRepository(UserProfileReport)
    private userRepo: Repository<UserProfileReport>,
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
}
