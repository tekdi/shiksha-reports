import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserProfileReport } from '../entities/user-profile.entity';
import { CohortSummaryReport } from 'src/entities/cohort-summary.entity';
import { DailyAttendanceReport } from 'src/entities/daily-attendance-report.entity';
import { AssessmentTracking } from 'src/entities/assessment-tracking.entity';
import { AssessmentTrackingScoreDetail } from 'src/entities/assessment-tracking-score-detail.entity';


@Injectable()
export class DatabaseService {
  constructor(
    @InjectRepository(UserProfileReport) private userRepo: Repository<UserProfileReport>,
    @InjectRepository(CohortSummaryReport) private cohortRepo: Repository<CohortSummaryReport>,
    @InjectRepository(DailyAttendanceReport) private dailyAttendanceRepo: Repository<DailyAttendanceReport>,
    @InjectRepository(AssessmentTracking) private assessmentTrackingRepo: Repository<AssessmentTracking>,
    @InjectRepository(AssessmentTrackingScoreDetail) private assessmentTrackingScoreDetailRepo: Repository<AssessmentTrackingScoreDetail>,
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
}
