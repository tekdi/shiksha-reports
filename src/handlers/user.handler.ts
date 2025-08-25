import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../services/database.service';
import { TransformService } from 'src/constants/transformation/transform-service';

@Injectable()
export class UserHandler {
  constructor(private readonly dbService: DatabaseService,private transformService: TransformService) {}

  async handleUserUpsert(data: any) {
    // Transform and save user data
    const transformedUserData = await this.transformService.transformUserData(data);
    const savedUser = await this.dbService.saveUserProfileData(transformedUserData);

    // Transform and save cohort member data if cohorts exist
    if (data.cohorts && Array.isArray(data.cohorts) && data.cohorts.length > 0) {
      const cohortMemberData = await this.transformService.transformCohortMemberData(data);
      
      // Save each cohort member relationship
      for (const cohortMember of cohortMemberData) {
        await this.dbService.saveCohortMemberData(cohortMember);
      }
    }

    return savedUser;
  }

  async handleUserDelete(data: any) {
    return this.dbService.deleteUserProfileData(data);
  }

  async handleCohortUpsert(data: any) {
    const transformedCohortData = await this.transformService.transformCohortData(data);
    return this.dbService.saveCohortData(transformedCohortData);
  }

  async handleCohortDelete(data: any) {
    return this.dbService.deleteCohortData(data);
  }
}
