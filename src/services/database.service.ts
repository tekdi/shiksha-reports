import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserProfileReport } from '../entities/user-profile.entity';
import { CohortSummaryReport } from 'src/entities/cohort-summary.entity';


@Injectable()
export class DatabaseService {
  constructor(
    @InjectRepository(UserProfileReport) private userRepo: Repository<UserProfileReport>,
    @InjectRepository(CohortSummaryReport) private cohortRepo: Repository<CohortSummaryReport>,
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

}
