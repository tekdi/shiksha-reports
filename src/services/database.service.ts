import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserProfileReport } from '../entities/user-profile.entity';
import { CohortSummaryReport } from 'src/entities/cohort-summary.entity';
import { UserCourseCertificate } from 'src/entities/user-course-data.entity';
import { Course } from 'src/entities/course.entity';

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
    const { userId, courseId } = data.data;
    return this.userCourseRepo.update({ userId, courseId }, { ...data.data });
  }
}
