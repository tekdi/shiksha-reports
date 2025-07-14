import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../services/database.service';
import { TransformService } from 'src/constants/transformation/transform-service';

@Injectable()
export class UserHandler {
  constructor(private readonly dbService: DatabaseService,private transformService: TransformService) {}

  async handleUserUpsert(data: any) {
    try {
      // transformUserData now returns an array of user profile objects
      // (one for each active cohort)
      const transformedDataArray = await this.transformService.transformUserData(data);
      
      // Save all transformed user profile entries
      return this.dbService.saveUserProfileData(transformedDataArray);
    } catch (error) {
      console.error('Error handling user upsert:', error);
      throw error;
    }
  }

  async handleUserDelete(data: any) {
    return this.dbService.deleteUserProfileData(data);
  }
}
