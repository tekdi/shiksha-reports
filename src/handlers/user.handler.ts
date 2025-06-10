import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../services/database.service';
import { TransformService } from 'src/constants/transformation/transform-service';

@Injectable()
export class UserHandler {
  constructor(private readonly dbService: DatabaseService,private transformService: TransformService) {}

  async handleUserUpsert(data: any) {
    const trandFormedData = await this.transformService.transformUserData(data);
    return this.dbService.saveUserProfileData(trandFormedData);
  }

  async handleUserDelete(data: any) {
    return this.dbService.deleteUserProfileData(data);
  }

  async handleCohortUpsert(data: any) {
    const trandFormedData = await this.transformService.transformUserData(data);
    return this.dbService.saveUserProfileData(trandFormedData);
  }

  async handleCohortDelete(data: any) {
    return this.dbService.deleteUserProfileData(data);
  }
}
