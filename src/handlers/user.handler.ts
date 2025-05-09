import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../services/database.service';
import { TranformService } from 'src/constants/transformation/transform-service';

@Injectable()
export class UserHandler {
  constructor(private readonly dbService: DatabaseService,private tranformServie: TranformService) {}

  async handleUserUpsert(data: any) {
    const trandFormedData = await this.tranformServie.transformUserData(data);
    console.log(trandFormedData);
    return this.dbService.saveUserProfileData(trandFormedData);
  }

  async handleUserDelete(data: any) {
    return this.dbService.deleteUserProfileData(data);
  }

  async handleCohortUpsert(data: any) {
    const trandFormedData = await this.tranformServie.transformUserData(data);
    console.log(trandFormedData);
    return this.dbService.saveUserProfileData(trandFormedData);
  }

  async handleCohortDelete(data: any) {
    return this.dbService.deleteUserProfileData(data);
  }
}
